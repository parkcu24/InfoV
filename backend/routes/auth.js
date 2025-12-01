// 📁 backend/routes/auth.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.RIOT_CLIENT_ID;
const CLIENT_SECRET = process.env.RIOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.RIOT_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://infov.vercel.app';

const HENRIK_BASE_URL = 'https://api.henrikdev.xyz/valorant';

// -----------------------------------------------------
// 1️⃣ 로그인 페이지로 이동 (기존 그대로)
// -----------------------------------------------------
router.get('/login', (req, res) => {
  const authorizeUrl = `https://auth.riotgames.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid`;

  console.log('------------------------------------------');
  console.log('🧭 [RSO DEBUG] 로그인 요청 발생');
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('🔗 Redirecting to Riot URL:');
  console.log(authorizeUrl);
  console.log('------------------------------------------');

  res.redirect(authorizeUrl);
});

// -----------------------------------------------------
// 2️⃣ Riot 로그인 성공 후 콜백 (기존 그대로)
// -----------------------------------------------------
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

    console.log('✅ [RSO DEBUG] 로그인 성공 (RSO userinfo):', userInfo.data);

    // 👉 여기서 userInfo.data 안에 acct.game_name, acct.tag_line 이 들어올 수도 있음
    // 다만 scope를 openid만 줘서, 안 올 가능성도 있음.
    // 일단은 access_token만 프론트로 넘기고, 이름/태그는 프론트에서 입력받아 사용하는 방식으로 시작하자.

    res.redirect(`${FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (err) {
    console.error('❌ [RSO DEBUG] OAuth 처리 중 오류 발생:');
    console.error(err.response?.data || err.message);
    res.status(500).send('로그인 중 오류가 발생했습니다.');
  }
});

// -----------------------------------------------------
// 🔧 공통: Henrik API 호출 헬퍼
// -----------------------------------------------------
async function callHenrik(path) {
  const url = `${HENRIK_BASE_URL}${path}`;
  console.log('🌐 [HENRIK] GET', url);
  const res = await axios.get(url, {
    headers: {
      // Henrik는 기본적으로 토큰 필요 없음, 그래도 UA 정도는 깔끔하게
      'User-Agent': 'InfoV-Valorant-App',
    },
  });
  return res.data; // { status, data, ... }
}

// -----------------------------------------------------
// 3️⃣ /auth/profile
//    - 쿼리: name, tag (예: ?name=요원&tag=KR1)
//    - 응답: 티어, 레벨, 카드, 지역 등 요약 정보
// -----------------------------------------------------
router.get('/profile', async (req, res) => {
  const { name, tag } = req.query;

  if (!name || !tag) {
    return res.status(400).json({
      error: '쿼리 파라미터 name, tag가 필요합니다. 예: /auth/profile?name=닉네임&tag=KR1',
    });
  }

  try {
    // 1) 계정 정보 (이름/태그/레벨/카드/지역 등)
    const accountRes = await callHenrik(
      `/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );

    if (!accountRes || !accountRes.data) {
      return res.status(404).json({ error: '계정 정보를 찾을 수 없습니다.' });
    }

    const account = accountRes.data;
    const region = account.region || 'ap';

    // 2) MMR / 티어 정보
    const mmrRes = await callHenrik(
      `/v1/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );

    const mmr = mmrRes?.data || {};

    // 🔹 여기서는 승/패/승률은 제외하고,
    //     티어, 레벨, 카드, MMR 위주로 반환.
    //     승률은 /auth/matches 결과로 프론트에서 계산하는 걸 추천.

    const profile = {
      gameName: account.name,
      tagLine: account.tag,
      region,
      accountLevel: account.account_level,
      // 카드 이미지들
      cardSmall: account.card?.small,
      cardLarge: account.card?.large,
      cardWide: account.card?.wide,

      // 티어/랭크 정보
      competitiveTier: mmr.currenttier ?? null,          // 숫자 (3~27)
      currentTierPatched: mmr.currenttierpatched ?? '',  // 예: "Ascendant 1"
      rankedRating: mmr.elo ?? null,                     // MMR 점수
      rankingInTier: mmr.ranking_in_tier ?? null,        // 티어 내 순위
    };

    res.json(profile);
  } catch (err) {
    console.error('❌ [AUTH /profile] 오류:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Henrik API에서 프로필을 불러오는 중 오류가 발생했습니다.',
    });
  }
});

// -----------------------------------------------------
// 4️⃣ /auth/matches
//    - 쿼리: name, tag, size (기본 10)
//    - 응답: Henrik v3 matches 결과 그대로 or 필요한 필드만 추려서
// -----------------------------------------------------
router.get('/matches', async (req, res) => {
  const { name, tag, size = 10 } = req.query;

  if (!name || !tag) {
    return res.status(400).json({
      error: '쿼리 파라미터 name, tag가 필요합니다. 예: /auth/matches?name=닉네임&tag=KR1',
    });
  }

  try {
    // 1) 먼저 계정 정보에서 region 얻기
    const accountRes = await callHenrik(
      `/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    );

    if (!accountRes || !accountRes.data) {
      return res.status(404).json({ error: '계정 정보를 찾을 수 없습니다.' });
    }

    const account = accountRes.data;
    const region = account.region || 'ap';

    // 2) 최근 경기 목록
    const matchesRes = await callHenrik(
      `/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(
        tag
      )}?size=${size}`
    );

    // Henrik v3/matches 응답 구조:
    // { status: 200, data: [ ...매치들... ], ... }
    // 일단은 data 배열을 그대로 프론트로 보내주자.
    res.json(matchesRes);
  } catch (err) {
    console.error('❌ [AUTH /matches] 오류:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Henrik API에서 매치를 불러오는 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
