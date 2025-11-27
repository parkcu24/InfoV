// 📁 routes/auth.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.RIOT_CLIENT_ID;
const CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.RIOT_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://infov.vercel.app';

// ⚠️ 한국 기준으로 ASIA 클러스터 사용 (VALORANT 계정용)
const ACCOUNT_API_BASE = 'https://asia.api.riotgames.com';

// ------------------------------------------------------
// 1️⃣ Riot 로그인 페이지로 이동
// ------------------------------------------------------
router.get('/login', (req, res) => {
  // 문서 기준: scope=openid+offline_access 권장
  const authorizeUrl = `https://auth.riotgames.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid%20offline_access`;

  console.log('------------------------------------------');
  console.log('🧭 [RSO DEBUG] 로그인 요청 발생');
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('🔗 Redirecting to Riot URL:');
  console.log(authorizeUrl);
  console.log('------------------------------------------');

  res.redirect(authorizeUrl);
});

// ------------------------------------------------------
// 2️⃣ Riot 로그인 성공 후 콜백
// ------------------------------------------------------
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not found');

  try {
    console.log('🧾 [RSO DEBUG] 콜백 호출됨, code:', code);

    const tokenResponse = await axios.post('https://auth.riotgames.com/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, token_type } = tokenResponse.data;
    console.log('✅ [RSO DEBUG] Access Token 획득 완료:', (token_type || 'Bearer'), access_token.slice(0, 20) + '...');

    // (선택) userinfo 바로 확인 로그
    const userInfo = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log('✅ [RSO DEBUG] userinfo (callback 단계):', JSON.stringify(userInfo.data, null, 2));

    // 프론트엔드로 토큰 전달
    res.redirect(`${FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (err) {
    console.error('❌ [RSO DEBUG] OAuth 처리 중 오류 발생:');
    console.error(err.response?.data || err.message);
    res.status(500).send('로그인 중 오류가 발생했습니다.');
  }
});

// ------------------------------------------------------
// 3️⃣ 프로필 정보 반환 (/api/auth/profile)
// ------------------------------------------------------
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    console.log('👤 [RSO DEBUG] /auth/profile 호출');
    console.log('🔑 Access Token 앞자리:', accessToken.slice(0, 20), '...');

    // 1) RSO userinfo에서 PUUID / country 등 가져오기
    const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = userInfoRes.data;
    console.log('🧾 [RSO DEBUG] raw userinfo:', JSON.stringify(userInfo, null, 2));

    // 2) account-v1 /accounts/me 에서 gameName / tagLine 가져오기
    //    문서: https://developer.riotgames.com/apis#account-v1/GET_getByAccessToken
    let gameName = null;
    let tagLine = null;
    let puuidFromAccount = null;

    try {
      const accountRes = await axios.get(
        `${ACCOUNT_API_BASE}/riot/account/v1/accounts/me`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const acc = accountRes.data;
      console.log('🧾 [RSO DEBUG] account-v1 /accounts/me:', JSON.stringify(acc, null, 2));

      gameName = acc.gameName || null;
      tagLine = acc.tagLine || null;
      puuidFromAccount = acc.puuid || null;
    } catch (accountErr) {
      console.error('⚠️ [RSO DEBUG] /accounts/me 호출 실패 (닉네임은 null 일 수 있음):');
      console.error(accountErr.response?.data || accountErr.message);
    }

    const profile = {
      gameName: gameName,
      tagLine: tagLine,
      // userinfo.sub 와 account.puuid 둘 다 있으면 account 쪽 우선 사용
      puuid: puuidFromAccount || userInfo.sub || null,
      country: userInfo.country || null,
    };

    console.log('✅ [RSO DEBUG] /auth/profile 응답:', profile);
    res.json(profile);
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/profile 에러:');
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch profile from Riot' });
  }
});

// ------------------------------------------------------
// 4️⃣ 전적 정보 반환 (/api/auth/matches) — 지금은 더미 데이터
// ------------------------------------------------------
router.get('/matches', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.split(' ')[1];
  console.log('🎮 [RSO DEBUG] /auth/matches 호출, 토큰 앞 10자리:', accessToken.slice(0, 10), '...');

  try {
    // TODO: 나중에 진짜 VALORANT 매치 API 붙이기
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
