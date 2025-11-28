// 📁 routes/auth.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.RIOT_CLIENT_ID;
const CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.RIOT_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://infov.vercel.app';

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

    // userinfo는 여기서 굳이 쓰지 않아도 됨 (디버그용으로만 사용 가능)
    const userInfo = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log('✅ [RSO DEBUG] 로그인 성공 (userinfo 일부):', {
      sub: userInfo.data.sub,
      jti: userInfo.data.jti,
    });

    // ✅ access_token 프론트로 전달
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
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    console.log('👤 [RSO DEBUG] /auth/profile 호출');
    console.log('🔑 Access Token 앞자리:', accessToken.slice(0, 20), '...');

    // 3-1) 기본 userinfo (sub, jti 등)
    const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = userInfoRes.data;
    console.log('🧾 [RSO DEBUG] raw userinfo:', JSON.stringify(data, null, 2));

    // 3-2) RSO 공식 문서에서 안내하는 account-v1 /accounts/me 호출
    //     여기서 gameName, tagLine, puuid 를 얻는 게 목표
    let gameName = null;
    let tagLine = null;
    let puuid = data.sub || null;

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
      // 보통 puuid도 여기에서 함께 넘겨줌
      if (accountData.puuid) puuid = accountData.puuid;
    } catch (accountErr) {
      console.error('❌ [RSO DEBUG] account-v1 /accounts/me 에러:');
      console.error(accountErr.response?.data || accountErr.message);
      // 실패해도 전체 /profile 은 계속 진행 (최악의 경우 PUUID만 돌려줌)
    }

    // 3-3) 그래도 gameName / tagLine 이 없으면 userinfo 에서 한 번 더 시도
    const acct = data.acct || {};
    if (!gameName && acct.game_name) gameName = acct.game_name;
    if (!tagLine && acct.tag_line) tagLine = acct.tag_line;

    if (!gameName && typeof data.preferred_username === 'string') {
      const [gn, tl] = data.preferred_username.split('#');
      if (!gameName && gn) gameName = gn;
      if (!tagLine && tl) tagLine = tl;
    }

    if (!gameName && typeof data.game_name === 'string') {
      gameName = data.game_name;
    }
    if (!tagLine && typeof data.tag_line === 'string') {
      tagLine = data.tag_line;
    }
    if (!gameName && typeof data.name === 'string') {
      gameName = data.name;
    }

    const profile = {
      gameName: gameName || null,
      tagLine: tagLine || null,
      puuid,
      country: data.country,
    };

    console.log('✅ [RSO DEBUG] /auth/profile 응답:', profile);
    res.json(profile);
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/profile 에러:');
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch profile from Riot' });
  }
});

// 4️⃣ 전적 정보 반환 (/api/auth/matches) – 현재는 더미 데이터
router.get('/matches', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];
  console.log('🎮 [RSO DEBUG] /auth/matches 호출, 토큰 앞 10자리:', accessToken.slice(0, 10), '...');

  try {
    // TODO: 나중에 VAL-MATCH-V1 붙이기
    const dummyMatches = [
      {
        matchId: 'dummy-1',
        map: 'Ascent',
        win: true,
        kills: 20,
        deaths: 15,
        assists: 5,
      },
      {
        matchId: 'dummy-2',
        map: 'Bind',
        win: false,
        kills: 12,
        deaths: 17,
        assists: 7,
      },
    ];

    res.json({ matches: dummyMatches });
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/matches 에러:');
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

module.exports = router;
