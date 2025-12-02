// 📁 backend/routes/auth.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.RIOT_CLIENT_ID;
const CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.RIOT_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://infov.vercel.app';

// ⭐ Henrik API
const HENRIK_API_KEY = process.env.HENRIK_API_KEY;
const HENRIK_BASE = 'https://api.henrikdev.xyz';

// 1️⃣ 로그인 페이지로 이동
router.get('/login', (req, res) => {
  const authorizeUrl = `https://auth.riotgames.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid+offline_access`;

  console.log('------------------------------------------');
  console.log('🧭 [RSO DEBUG] 로그인 요청 발생');
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('🔗 Redirecting to Riot URL:');
  console.log(authorizeUrl);
  console.log('------------------------------------------');

  res.redirect(authorizeUrl);
});

// 2️⃣ Riot 로그인 성공 후 콜백
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not found');

  try {
    console.log('🧾 [RSO DEBUG] 콜백 호출됨, code:', code);

    const tokenResponse = await axios.post(
      'https://auth.riotgames.com/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token } = tokenResponse.data;
    console.log('✅ [RSO DEBUG] Access Token 획득 완료');

    const userInfo = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log('✅ [RSO DEBUG] 로그인 성공 (userinfo 일부):', {
      sub: userInfo.data.sub,
      jti: userInfo.data.jti,
    });

    res.redirect(`${FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (err) {
    console.error('❌ [RSO DEBUG] OAuth 처리 중 오류 발생:');
    console.error(err.response?.data || err.message);
    res.status(500).send('로그인 중 오류가 발생했습니다.');
  }
});

// 3️⃣ 프로필 정보 반환 (/api/auth/profile)
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RSO DEBUG] Authorization 헤더 없음');
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    console.log('👤 [RSO DEBUG] /auth/profile 호출');
    console.log('🔑 Access Token 앞자리:', accessToken.slice(0, 20), '...');

    // 3-1) 기본 userinfo
    const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = userInfoRes.data;
    console.log('🧾 [RSO DEBUG] raw userinfo:', JSON.stringify(data, null, 2));

    let gameName = null;
    let tagLine = null;
    let puuid = data.sub || null;

    // 3-2) account-v1 /accounts/me (실패해도 전체 흐름은 계속)
    try {
      console.log('🌍 [RSO DEBUG] account-v1 /accounts/me 호출 시도');
      const accountRes = await axios.get(
        'https://asia.api.riotgames.com/riot/account/v1/accounts/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const accountData = accountRes.data;
      console.log(
        '✅ [RSO DEBUG] account-v1 /accounts/me 응답:',
        JSON.stringify(accountData, null, 2)
      );

      gameName = accountData.gameName || null;
      tagLine = accountData.tagLine || null;
      if (accountData.puuid) puuid = accountData.puuid;
    } catch (accountErr) {
      console.error('❌ [RSO DEBUG] account-v1 /accounts/me 에러:');
      console.error(accountErr.response?.data || accountErr.message);
    }

    // 3-3) userinfo에서 보조로 gameName/tagLine 채우기
    const acct = data.acct || {};
    if (!gameName && acct.game_name) gameName = acct.game_name;
    if (!tagLine && acct.tag_line) tagLine = acct.tag_line;

    if (!gameName && typeof data.preferred_username === 'string') {
      const [gn, tl] = data.preferred_username.split('#');
      if (!gameName && gn) gameName = gn;
      if (!tagLine && tl) tagLine = tl;
    }

    if (!gameName && typeof data.game_name === 'string') gameName = data.game_name;
    if (!tagLine && typeof data.tag_line === 'string') tagLine = data.tag_line;
    if (!gameName && typeof data.name === 'string') gameName = data.name;

    const profile = {
      gameName: gameName || null,
      tagLine: tagLine || null,
      puuid,
      country: data.country,
    };

    console.log('✅ [RSO DEBUG] /auth/profile 응답:', profile);
    return res.json(profile);
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/profile 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status && err.response.status >= 400 && err.response.status < 600
        ? err.response.status
        : 500;

    return res.status(status).json({
      error: 'Failed to fetch profile from Riot',
      detail: err.response?.data || err.message,
    });
  }
});

// 4️⃣ Henrik API 기반 요약 스탯 (/api/auth/stats)
router.get('/stats', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RSO+Henrik] Authorization 헤더 없음');
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];

  if (!HENRIK_API_KEY) {
    console.error('❌ [RSO+Henrik] HENRIK_API_KEY 미설정');
    return res.status(500).json({
      error: 'Henrik API key not configured',
    });
  }

  try {
    console.log('🎯 [RSO+Henrik] /auth/stats 호출');
    console.log('🔑 Access Token 앞자리:', accessToken.slice(0, 20), '...');

    // 4-1) Riot userinfo + accounts/me 로 gameName, tagLine, puuid 확보
    const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = userInfoRes.data;

    let gameName = null;
    let tagLine = null;
    let puuid = data.sub || null;

    try {
      console.log('🌍 [RSO+Henrik] account-v1 /accounts/me 호출 시도');
      const accountRes = await axios.get(
        'https://asia.api.riotgames.com/riot/account/v1/accounts/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const accountData = accountRes.data;
      console.log(
        '✅ [RSO+Henrik] account-v1 /accounts/me 응답:',
        JSON.stringify(accountData, null, 2)
      );

      gameName = accountData.gameName || null;
      tagLine = accountData.tagLine || null;
      if (accountData.puuid) puuid = accountData.puuid;
    } catch (accountErr) {
      console.error('❌ [RSO+Henrik] account-v1 /accounts/me 에러:');
      console.error(accountErr.response?.data || accountErr.message);
    }

    // userinfo 보조로 채우기
    const acct = data.acct || {};
    if (!gameName && acct.game_name) gameName = acct.game_name;
    if (!tagLine && acct.tag_line) tagLine = acct.tag_line;

    if (!gameName && typeof data.preferred_username === 'string') {
      const [gn, tl] = data.preferred_username.split('#');
      if (!gameName && gn) gameName = gn;
      if (!tagLine && tl) tagLine = tl;
    }

    if (!gameName && typeof data.game_name === 'string') gameName = data.game_name;
    if (!tagLine && typeof data.tag_line === 'string') tagLine = data.tag_line;
    if (!gameName && typeof data.name === 'string') gameName = data.name;

    if (!gameName || !tagLine) {
      console.error('❌ [RSO+Henrik] gameName/tagLine 결정 실패');
      return res.status(400).json({
        error: 'Could not resolve Riot gameName/tagLine from RSO token',
      });
    }

    console.log('👤 [RSO+Henrik] Riot 계정:', `${gameName}#${tagLine}`);

    // 4-2) Henrik 계정 정보 (region + account_level)
    const henrikAccountRes = await axios.get(
      `${HENRIK_BASE}/valorant/v2/account/${encodeURIComponent(
        gameName
      )}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          Authorization: HENRIK_API_KEY,
        },
      }
    );

    const accData = henrikAccountRes.data.data;
    console.log(
      '✅ [RSO+Henrik] Henrik account 응답:',
      JSON.stringify(accData, null, 2)
    );

    const region = accData.region; // ex) 'ap', 'kr', 'eu'
    const accountLevel = accData.account_level;

    // 4-3) Henrik MMR (현재 티어 + 시즌별 승/패)
    const mmrRes = await axios.get(
      `${HENRIK_BASE}/valorant/v3/mmr/${region}/pc/${encodeURIComponent(
        gameName
      )}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          Authorization: HENRIK_API_KEY,
        },
      }
    );

    const mmrData = mmrRes.data.data;
    console.log(
      '✅ [RSO+Henrik] Henrik mmr 응답:',
      JSON.stringify(mmrData, null, 2)
    );

    const currentTierName = mmrData.current?.tier?.name || null; // 예: "Diamond 1"
    const currentRR = mmrData.current?.rr ?? null;               // 예: 38

    const seasonal = Array.isArray(mmrData.seasonal) ? mmrData.seasonal : [];
    const latestSeason = seasonal[seasonal.length - 1] || null;

    const games = latestSeason?.games ?? 0;
    const wins = latestSeason?.wins ?? 0;
    const losses = Math.max(games - wins, 0);
    const winRate = games > 0 ? Math.round((wins / games) * 100) : null;

    // 4-4) 프론트로 내려줄 요약 데이터
    const summary = {
      gameName,
      tagLine,
      puuid,
      region,
      accountLevel,
      currentTier: currentTierName,
      rr: currentRR,
      games,
      wins,
      losses,
      winRate,
    };

    console.log('✅ [RSO+Henrik] /auth/stats 응답:', summary);
    return res.json(summary);
  } catch (err) {
    console.error('❌ [RSO+Henrik] /auth/stats 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status && err.response.status >= 400 && err.response.status < 600
        ? err.response.status
        : 500;

    return res.status(status).json({
      error: 'Failed to fetch stats from Henrik API',
      detail: err.response?.data || err.message,
    });
  }
});

// 5️⃣ 전적 정보 반환 (/api/auth/matches) – 현재는 더미 데이터
router.get('/matches', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];
  console.log(
    '🎮 [RSO DEBUG] /auth/matches 호출, 토큰 앞 10자리:',
    accessToken.slice(0, 10),
    '...'
  );

  try {
    const dummyMatches = [
      {
        matchId: 'm1',
        map: 'Split',
        queue: 'Competitive',
        timeAgo: '17h ago',
        agent: 'Raze',
        teamScore: 13,
        enemyScore: 4,
        rankTier: 'Emerald',
        rr: 473,
        placement: '6th',
        kills: 12,
        deaths: 11,
        assists: 2,
        kd: 1.1,
        acs: 180,
        adr: 108,
        hsPercent: 36,
        ddDelta: -11,
        win: true,
      },
      {
        matchId: 'm2',
        map: 'Split',
        queue: 'Competitive',
        timeAgo: '20h ago',
        agent: 'Jett',
        teamScore: 5,
        enemyScore: 13,
        rankTier: 'Emerald',
        rr: 719,
        placement: '2nd',
        kills: 17,
        deaths: 16,
        assists: 5,
        kd: 1.1,
        acs: 293,
        adr: 174,
        hsPercent: 25,
        ddDelta: 15,
        win: false,
      },
      {
        matchId: 'm3',
        map: 'Abyss',
        queue: 'Competitive',
        timeAgo: '21h ago',
        agent: 'Phoenix',
        teamScore: 13,
        enemyScore: 15,
        rankTier: 'Emerald',
        rr: 410,
        placement: '7th',
        kills: 17,
        deaths: 22,
        assists: 8,
        kd: 0.8,
        acs: 175,
        adr: 108,
        hsPercent: 38,
        ddDelta: -27,
        win: false,
      },
      {
        matchId: 'm4',
        map: 'Haven',
        queue: 'Competitive',
        timeAgo: '22h ago',
        agent: 'Omen',
        teamScore: 13,
        enemyScore: 7,
        rankTier: 'Emerald',
        rr: 724,
        placement: '6th',
        kills: 14,
        deaths: 14,
        assists: 9,
        kd: 1.0,
        acs: 209,
        adr: 140,
        hsPercent: 28,
        ddDelta: 20,
        win: true,
      },
      {
        matchId: 'm5',
        map: 'Corrode',
        queue: 'Competitive',
        timeAgo: '1d ago',
        agent: 'Harbor',
        teamScore: 13,
        enemyScore: 10,
        rankTier: 'Emerald',
        rr: 573,
        placement: '9th',
        kills: 15,
        deaths: 15,
        assists: 5,
        kd: 1.0,
        acs: 178,
        adr: 122,
        hsPercent: 18,
        ddDelta: -16,
        win: true,
      },
      {
        matchId: 'm6',
        map: 'Bind',
        queue: 'Competitive',
        timeAgo: '1d ago',
        agent: 'Sova',
        teamScore: 13,
        enemyScore: 11,
        rankTier: 'Emerald',
        rr: 507,
        placement: '6th',
        kills: 16,
        deaths: 20,
        assists: 6,
        kd: 0.8,
        acs: 204,
        adr: 135,
        hsPercent: 37,
        ddDelta: -6,
        win: true,
      },
      {
        matchId: 'm7',
        map: 'Bind',
        queue: 'Competitive',
        timeAgo: '2d ago',
        agent: 'Skye',
        teamScore: 13,
        enemyScore: 10,
        rankTier: 'Emerald',
        rr: 647,
        placement: '6th',
        kills: 19,
        deaths: 14,
        assists: 3,
        kd: 1.4,
        acs: 225,
        adr: 140,
        hsPercent: 32,
        ddDelta: 18,
        win: true,
      },
      {
        matchId: 'm8',
        map: 'Abyss',
        queue: 'Competitive',
        timeAgo: '3d ago',
        agent: 'Viper',
        teamScore: 9,
        enemyScore: 13,
        rankTier: 'Emerald',
        rr: 345,
        placement: '7th',
        kills: 14,
        deaths: 15,
        assists: 3,
        kd: 0.9,
        acs: 190,
        adr: 124,
        hsPercent: 52,
        ddDelta: -9,
        win: false,
      },
    ];

    res.json(dummyMatches);
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/matches 에러:');
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

module.exports = router;
