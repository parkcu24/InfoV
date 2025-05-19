// 📁 backend/routes/auth.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.RIOT_CLIENT_ID;
const CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.RIOT_REDIRECT_URI; // http://localhost:5050/api/auth/callback

// 1. 로그인 페이지로 이동
router.get('/login', (req, res) => {
  const authorizeUrl = `https://auth.riotgames.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid`; 
  res.redirect(authorizeUrl);
});

// 2. Riot 로그인 성공 후 콜백
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not found');

  try {
    // 3. 액세스 토큰 요청
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

    const { access_token, id_token } = tokenResponse.data;

    // 4. 사용자 정보 요청
    const userInfo = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // 5. 사용자 정보 전달 또는 저장
    console.log('✅ 사용자 정보:', userInfo.data);
    res.send('로그인 성공! 콘솔에서 사용자 정보를 확인하세요.');
  } catch (err) {
    console.error('OAuth 처리 중 오류:', err.response?.data || err.message);
    res.status(500).send('로그인 중 오류가 발생했습니다.');
  }
});

module.exports = router;
