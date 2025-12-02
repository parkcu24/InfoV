// 📁 backend/routes/auth.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.RIOT_CLIENT_ID;
const CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.RIOT_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://infov.vercel.app';

// ⭐ Henrik API Key
const HENRIK_API_KEY = process.env.HENRIK_API_KEY;

// --------------------------------------------------
// 헬퍼: 국가 → 대략적인 Henrik 지역 매핑 (fallback 용)
// --------------------------------------------------
function resolveHenrikRegion(country, fallbackRegion) {
  if (fallbackRegion) return fallbackRegion;

  if (!country) return 'ap';

  const c = country.toUpperCase();

  if (['KR'].includes(c)) return 'kr';
  if (['US', 'CA', 'MX'].includes(c)) return 'na';
  if (['BR'].includes(c)) return 'br';
  if (['AR', 'CL', 'PE', 'CO', 'VE', 'UY', 'PY', 'BO', 'EC'].includes(c)) return 'latam';
  if (['FR', 'DE', 'ES', 'IT', 'GB', 'UK', 'NL', 'SE', 'NO', 'FI', 'PL', 'CZ'].includes(c)) return 'eu';

  // 그 외 아시아권은 그냥 ap
  return 'ap';
}

// --------------------------------------------------
// 헬퍼: RSO AccessToken → Riot 계정 정보(gameName, tagLine, puuid, country)
//  /auth/profile, /auth/stats, /auth/matches 에서 공통으로 사용
// --------------------------------------------------
async function getRiotIdentityFromToken(accessToken) {
  console.log('👤 [RSO DEBUG] getRiotIdentityFromToken 호출');

  // 1) 기본 userinfo
  const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = userInfoRes.data;
  console.log('🧾 [RSO DEBUG] userinfo:', JSON.stringify(data, null, 2));

  let gameName = null;
  let tagLine = null;
  let puuid = data.sub || null;
  const country = data.country || null;

  // 2) account-v1 /accounts/me (있으면 여기가 정답)
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

    if (accountData.gameName) gameName = accountData.gameName;
    if (accountData.tagLine) tagLine = accountData.tagLine;
    if (accountData.puuid) puuid = accountData.puuid;
  } catch (accountErr) {
    console.error('❌ [RSO DEBUG] account-v1 /accounts/me 에러:');
    console.error(accountErr.response?.data || accountErr.message);
  }

  // 3) userinfo 안에 acct.* 로 보조
  const acct = data.acct || {};
  if (!gameName && acct.game_name) gameName = acct.game_name;
  if (!tagLine && acct.tag_line) tagLine = acct.tag_line;

  // 4) preferred_username 형식 "name#tag"
  if (!gameName && typeof data.preferred_username === 'string') {
    const [gn, tl] = data.preferred_username.split('#');
    if (!gameName && gn) gameName = gn;
    if (!tagLine && tl) tagLine = tl;
  }

  // 5) 기타 백업 필드
  if (!gameName && typeof data.game_name === 'string') gameName = data.game_name;
  if (!tagLine && typeof data.tag_line === 'string') tagLine = data.tag_line;
  if (!gameName && typeof data.name === 'string') gameName = data.name;

  return { gameName, tagLine, puuid, country };
}

// --------------------------------------------------
// 1️⃣ 로그인 페이지로 이동
// --------------------------------------------------
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

// --------------------------------------------------
// 2️⃣ Riot 로그인 성공 후 콜백
// --------------------------------------------------
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

// --------------------------------------------------
// 3️⃣ 프로필 정보 반환 (/api/auth/profile)
// --------------------------------------------------
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

    const { gameName, tagLine, puuid, country } =
      await getRiotIdentityFromToken(accessToken);

    const profile = {
      gameName: gameName || null,
      tagLine: tagLine || null,
      puuid: puuid || null,
      country: country || null,
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

// --------------------------------------------------
// 4️⃣ Henrik 요약 스탯 (/api/auth/stats)
//     ✅ 여기서는 puuid 안 쓰고 name#tag + region만 사용
// --------------------------------------------------
router.get('/stats', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];
  console.log(
    '📊 [Henrik DEBUG] /auth/stats 호출, 토큰 앞 10자리:',
    accessToken.slice(0, 10),
    '...'
  );

  try {
    // 1) Riot 쪽에서 닉네임, 태그, 국가 가져오기
    const { gameName, tagLine, country } =
      await getRiotIdentityFromToken(accessToken);

    if (!gameName || !tagLine) {
      console.log('❌ [Henrik DEBUG] gameName 또는 tagLine 없음');
      return res.status(400).json({
        error: 'Missing Riot ID',
        detail: 'gameName or tagLine not found from Riot userinfo',
      });
    }

    // 2) Henrik 계정 정보 (여기서 region, account_level, puuid 등 얻음)
    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    console.log('🌐 [Henrik DEBUG] account v2 호출:', accountUrl);

    const accountRes = await axios.get(accountUrl, {
      headers: {
        Authorization: HENRIK_API_KEY,
      },
    });

    const accountData = accountRes.data?.data;
    console.log(
      '✅ [Henrik DEBUG] account v2 응답:',
      JSON.stringify(accountData, null, 2)
    );

    const regionFromHenrik = accountData?.region || null;
    const region = resolveHenrikRegion(country, regionFromHenrik);

    // 3) MMR v3 (name#tag 기반, puuid 사용 ❌)
    const mmrUrl = `https://api.henrikdev.xyz/valorant/v3/mmr/${region}/pc/${encodeURIComponent(
      accountData.name
    )}/${encodeURIComponent(accountData.tag)}`;

    console.log('🌐 [Henrik DEBUG] mmr v3 호출:', mmrUrl);

    const mmrRes = await axios.get(mmrUrl, {
      headers: {
        Authorization: HENRIK_API_KEY,
      },
    });

    const mmrData = mmrRes.data?.data || {};
    console.log(
      '✅ [Henrik DEBUG] mmr v3 응답:',
      JSON.stringify(mmrData, null, 2)
    );

    const seasonal = Array.isArray(mmrData.seasonal) ? mmrData.seasonal : [];
    const latestSeason = seasonal[seasonal.length - 1];

    let wins = null;
    let losses = null;
    let winRate = null;

    if (latestSeason && typeof latestSeason.wins === 'number' && typeof latestSeason.games === 'number') {
      wins = latestSeason.wins;
      const games = latestSeason.games;
      losses = games - wins;
      winRate = games > 0 ? Math.round((wins / games) * 100) : null;
    }

    const summary = {
      accountLevel: accountData.account_level ?? null,
      currentTier: mmrData.current?.tier?.name ?? null,
      rr: mmrData.current?.rr ?? null,
      wins,
      losses,
      winRate,
    };

    console.log('✅ [Henrik DEBUG] /auth/stats 응답:', summary);
    return res.json(summary);
  } catch (err) {
    console.error('❌ [Henrik DEBUG] /auth/stats 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status && err.response.status >= 400 && err.response.status < 600
        ? err.response.status
        : 500;

    return res.status(status).json({
      error: 'Failed to fetch stats from Henrik',
      detail: err.response?.data || err.message,
    });
  }
});

// --------------------------------------------------
// 5️⃣ 최근 경기 정보 반환 (/api/auth/matches)
//     ✅ 여기서도 마찬가지로 name#tag + region 사용 (by-puuid ❌)
// --------------------------------------------------
router.get('/matches', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];
  console.log(
    '🎮 [Henrik DEBUG] /auth/matches 호출, 토큰 앞 10자리:',
    accessToken.slice(0, 10),
    '...'
  );

  try {
    // 1) Riot 계정 → name, tag, country
    const { gameName, tagLine, country } =
      await getRiotIdentityFromToken(accessToken);

    if (!gameName || !tagLine) {
      console.log('❌ [Henrik DEBUG] gameName 또는 tagLine 없음');
      return res.status(400).json({
        error: 'Missing Riot ID',
        detail: 'gameName or tagLine not found from Riot userinfo',
      });
    }

    // 2) Henrik 계정 정보에서 puuid, region 확보
    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    console.log('🌐 [Henrik DEBUG] account v2 호출:', accountUrl);

    const accountRes = await axios.get(accountUrl, {
      headers: {
        Authorization: HENRIK_API_KEY,
      },
    });

    const accountData = accountRes.data?.data;
    console.log(
      '✅ [Henrik DEBUG] account v2 응답:',
      JSON.stringify(accountData, null, 2)
    );

    const regionFromHenrik = accountData?.region || null;
    const region = resolveHenrikRegion(country, regionFromHenrik);
    const henrikPuuid = accountData?.puuid || null;

    // 3) v4 matches (name#tag 기준, puuid는 "내 플레이어" 찾을 때만 사용)
    const matchesUrl = `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(
      accountData.name
    )}/${encodeURIComponent(accountData.tag)}`;

    console.log('🌐 [Henrik DEBUG] matches v4 호출:', matchesUrl);

    const matchesRes = await axios.get(matchesUrl, {
      headers: {
        Authorization: HENRIK_API_KEY,
      },
      params: {
        size: 8, // 최근 8게임 정도
      },
    });

    const rawMatches = matchesRes.data?.data || [];
    console.log(
      '✅ [Henrik DEBUG] matches v4 응답 개수:',
      rawMatches.length
    );

    // 4) 프론트에서 쓰기 편한 형태로 변환
    const mapped = rawMatches.map((m) => {
      const meta = m.metadata || {};
      const players = m.players || {};
      const allPlayers = Array.isArray(players.all) ? players.all : [];

      let selfPlayer = null;
      if (henrikPuuid) {
        selfPlayer =
          allPlayers.find((p) => p.puuid === henrikPuuid) || null;
      }
      if (!selfPlayer && allPlayers.length > 0) {
        selfPlayer = allPlayers[0]; // 못 찾으면 그냥 첫 번째
      }

      const stats = selfPlayer?.stats || {};
      const teamKey =
        (selfPlayer?.team || '').toLowerCase() === 'blue' ? 'blue' : 'red';
      const teams = m.teams || {};
      const myTeam = teams[teamKey] || {};
      const enemyTeam = teams[teamKey === 'blue' ? 'red' : 'blue'] || {};

      const roundsWon = myTeam.rounds_won ?? null;
      const roundsLost = myTeam.rounds_lost ?? null;
      const hasWon = myTeam.has_won === true;

      const kills = stats.kills ?? 0;
      const deaths = stats.deaths ?? 0;
      const assists = stats.assists ?? 0;

      const kdRaw = deaths > 0 ? kills / deaths : kills;
      const kd = Number.isFinite(kdRaw) ? kdRaw : null;

      const headshots = stats.headshots ?? 0;
      const bodyshots = stats.bodyshots ?? 0;
      const legshots = stats.legshots ?? 0;
      const totalShots = headshots + bodyshots + legshots;
      const hsPercent =
        totalShots > 0 ? Math.round((headshots / totalShots) * 100) : null;

      const assets = selfPlayer?.assets || {};
      const agentAssets = assets.agent || {};

      return {
        matchId: meta.matchid || meta.id || '',
        map: meta.map || 'Unknown Map',
        queue: meta.mode || meta.queue || 'Mode',
        timeAgo: meta.started_at || '', // 나중에 백엔드에서 "17h ago" 형식으로 바꿔도 됨

        agent: selfPlayer?.character || 'Unknown',
        agentIcon:
          agentAssets.small ||
          agentAssets.bust ||
          agentAssets.full ||
          null,

        teamScore: roundsWon,
        enemyScore: roundsLost,
        rankTier: selfPlayer?.currenttier_patched || null,
        rr: null, // 여기선 RR까지는 안 넣고 stats에서만 처리

        kills,
        deaths,
        assists,
        kd,
        acs: stats.score ?? null, // 대략적인 값 (ACS랑 다를 수 있음)
        adr: null, // Henrik matches 응답에 데미지 합계 있으면 나중에 추가 가능
        hsPercent,
        win: hasWon,
        placement: null, // 필요하면 나중에 계산
      };
    });

    return res.json(mapped);
  } catch (err) {
    console.error('❌ [Henrik DEBUG] /auth/matches 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status && err.response.status >= 400 && err.response.status < 600
        ? err.response.status
        : 500;

    return res.status(status).json({
      error: 'Failed to fetch matches',
      detail: err.response?.data || err.message,
    });
  }
});

module.exports = router;
