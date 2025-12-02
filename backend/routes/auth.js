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
const HENRIK_REGION_ENV = process.env.HENRIK_REGION || null; // 강제 region 설정시 사용

// 나라 코드 → Henrik region 대략 매핑
function resolveHenrikRegion(countryCodeRaw) {
  if (HENRIK_REGION_ENV) return HENRIK_REGION_ENV; // 환경변수 우선(ap, kr 등)

  const country = (countryCodeRaw || '').toUpperCase();

  // 한국
  if (country === 'KR') return 'kr';

  // 북미
  if (['US', 'CA'].includes(country)) return 'na';

  // 남미
  if (['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'VE', 'UY', 'PY', 'EC', 'BO'].includes(country)) {
    return 'latam';
  }

  // 유럽
  if (
    [
      'DE', 'FR', 'GB', 'ES', 'IT', 'PL', 'SE', 'NO', 'FI', 'DK',
      'NL', 'BE', 'PT', 'RU', 'TR', 'CZ', 'AT', 'GR', 'HU',
    ].includes(country)
  ) {
    return 'eu';
  }

  // 그 외 아시아/오세아니아
  return 'ap';
}

// unix 초 → "17h ago" 같은 포맷
function formatTimeAgo(unixSeconds) {
  if (!unixSeconds) return '';
  const nowMs = Date.now();
  const tsMs = unixSeconds * 1000;
  const diffSec = Math.floor((nowMs - tsMs) / 1000);

  const min = Math.floor(diffSec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (day > 0) return `${day}d ago`;
  if (hour > 0) return `${hour}h ago`;
  if (min > 0) return `${min}m ago`;
  return '방금 전';
}

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

// 🔐 공통: Authorization 헤더에서 토큰 꺼내기
function getAccessTokenFromHeader(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RSO DEBUG] Authorization 헤더 없음');
    res.status(401).json({ error: 'No access token provided' });
    return null;
  }
  return authHeader.split(' ')[1];
}

// 3️⃣ 프로필 정보 반환 (/api/auth/profile)
router.get('/profile', async (req, res) => {
  const accessToken = getAccessTokenFromHeader(req, res);
  if (!accessToken) return;

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

// 4️⃣ 요약 스탯 (계정 레벨 / 현재 티어 / 시즌 승률) - Henrik 사용
router.get('/stats', async (req, res) => {
  const accessToken = getAccessTokenFromHeader(req, res);
  if (!accessToken) return;

  if (!HENRIK_API_KEY) {
    return res.status(500).json({
      error: 'Henrik API key not configured',
    });
  }

  try {
    console.log('📊 [RSO DEBUG] /auth/stats 호출');

    // 4-1) RSO userinfo → puuid / country
    const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const ui = userInfoRes.data;
    const puuid = ui.sub;
    const country = ui.country;

    if (!puuid) {
      return res.status(400).json({ error: 'No puuid in userinfo' });
    }

    const region = resolveHenrikRegion(country);
    console.log('🌎 [RSO DEBUG] Henrik region:', region, 'country:', country);

    // 4-2) Henrik 계정 정보 (레벨 / name / tag / region)
    const accRes = await axios.get(
      `https://api.henrikdev.xyz/valorant/v2/by-puuid/account/${puuid}`,
      {
        headers: {
          Authorization: HENRIK_API_KEY,
        },
      }
    );

    const accBody = accRes.data;
    const acc = accBody.data || {};
    const accountLevel = acc.account_level ?? null;
    const name = acc.name || null;
    const tag = acc.tag || null;

    // 4-3) Henrik MMR (현재 티어 / RR / 시즌 전적)
    const mmrRes = await axios.get(
      `https://api.henrikdev.xyz/valorant/v3/by-puuid/mmr/${region}/pc/${puuid}`,
      {
        headers: {
          Authorization: HENRIK_API_KEY,
        },
      }
    );

    const mmrBody = mmrRes.data;
    const mmr = mmrBody.data || {};

    const currentTier = mmr.current?.tier?.name || null;
    const rr = mmr.current?.rr ?? null;

    let wins = null;
    let games = null;

    if (Array.isArray(mmr.seasonal) && mmr.seasonal.length > 0) {
      const latest = mmr.seasonal[0]; // 가장 최근 시즌 하나 사용
      wins = latest.wins ?? null;
      games = latest.games ?? null;
    }

    const losses =
      wins != null && games != null ? Math.max(games - wins, 0) : null;
    const winRate =
      wins != null && games > 0 ? Math.round((wins * 100) / games) : null;

    const result = {
      gameName: name,
      tagLine: tag,
      accountLevel,
      currentTier,
      rr,
      wins,
      losses,
      winRate,
    };

    console.log('✅ [RSO DEBUG] /auth/stats 응답:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/stats 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status && err.response.status >= 400 && err.response.status < 600
        ? err.response.status
        : 500;

    res.status(status).json({
      error: 'Failed to fetch stats from Henrik',
      detail: err.response?.data || err.message,
    });
  }
});

// 5️⃣ 전적 정보 반환 (/api/auth/matches) – Henrik v3 matches 사용
router.get('/matches', async (req, res) => {
  const accessToken = getAccessTokenFromHeader(req, res);
  if (!accessToken) return;

  if (!HENRIK_API_KEY) {
    return res.status(500).json({
      error: 'Henrik API key not configured',
    });
  }

  try {
    console.log('🎮 [RSO DEBUG] /auth/matches 호출');

    // 5-1) userinfo → puuid
    const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const ui = userInfoRes.data;
    const puuid = ui.sub;

    if (!puuid) {
      return res.status(400).json({ error: 'No puuid in userinfo' });
    }

    // 5-2) Henrik 계정 정보 (puuid → region / name / tag)
    const accountRes = await axios.get(
      `https://api.henrikdev.xyz/valorant/v2/by-puuid/account/${puuid}`,
      {
        headers: {
          Authorization: HENRIK_API_KEY,
        },
      }
    );

    const account = accountRes.data?.data;
    if (!account) {
      console.error('❌ [HENRIK DEBUG] 계정 정보를 찾지 못했습니다:', accountRes.data);
      return res
        .status(404)
        .json({ error: 'Account not found on Henrik API' });
    }

    const region = account.region; // eu / na / ap / kr ...
    const name = account.name;
    const tag = account.tag;

    console.log('✅ [HENRIK DEBUG] account data:', {
      region,
      name,
      tag,
      account_level: account.account_level,
    });

    // 5-3) Henrik 매치 리스트 (v3 matches/{region}/{name}/{tag})
    const matchesRes = await axios.get(
      `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${encodeURIComponent(
        name
      )}/${encodeURIComponent(tag)}`,
      {
        headers: {
          Authorization: HENRIK_API_KEY,
        },
        params: {
          size: 8, // 최근 8경기
          mode: 'competitive',
        },
      }
    );

    if (matchesRes.data?.status !== 200) {
      console.error(
        '❌ [HENRIK DEBUG] matches 응답 status != 200:',
        matchesRes.data
      );
      return res.status(500).json({
        error: 'Unexpected response from Henrik matches endpoint',
        detail: matchesRes.data,
      });
    }

    const henrikMatches = matchesRes.data.data || [];
    console.log(
      `✅ [HENRIK DEBUG] matches ${henrikMatches.length}개 수신 완료`
    );

    // 5-4) 프론트용 형태로 매핑
    const normalizedMatches = henrikMatches.map((m) => {
      const meta = m.metadata || {};
      const allPlayers = m.players?.all_players || [];

      // 현재 유저(나) 찾기
      const selfPlayer =
        allPlayers.find((p) => p.puuid === puuid) ||
        allPlayers.find(
          (p) => `${p.name}#${p.tag}` === `${name}#${tag}`
        ) ||
        allPlayers[0];

      const stats = selfPlayer?.stats || {};
      const damageMade = selfPlayer?.damage_made ?? 0;
      const damageReceived = selfPlayer?.damage_received ?? 0;

      const kills = stats.kills ?? 0;
      const deaths = stats.deaths ?? 0;
      const assists = stats.assists ?? 0;

      const kd = deaths > 0 ? kills / deaths : kills;

      const totalShots =
        (stats.headshots ?? 0) +
        (stats.bodyshots ?? 0) +
        (stats.legshots ?? 0);
      const hsPercent =
        totalShots > 0
          ? Math.round(((stats.headshots ?? 0) / totalShots) * 100)
          : null;

      const roundsPlayed = meta.rounds_played || 0;
      const acs =
        roundsPlayed > 0 && stats.score != null
          ? Math.round(stats.score / roundsPlayed)
          : null;
      const adr =
        roundsPlayed > 0 && damageMade > 0
          ? Math.round(damageMade / roundsPlayed)
          : null;

      // 팀/스코어/승패 계산
      const myTeam = selfPlayer?.team; // 'Red' or 'Blue'
      const red = m.teams?.red || {};
      const blue = m.teams?.blue || {};
      let teamScore = null;
      let enemyScore = null;
      let win = null;

      if (myTeam === 'Red') {
        teamScore = red.rounds_won ?? null;
        enemyScore = blue.rounds_won ?? null;
        win = !!red.has_won;
      } else if (myTeam === 'Blue') {
        teamScore = blue.rounds_won ?? null;
        enemyScore = red.rounds_won ?? null;
        win = !!blue.has_won;
      }

      const agentImage =
        selfPlayer?.assets?.agent?.bust ||
        selfPlayer?.assets?.agent?.small ||
        null;

      return {
        matchId: meta.matchid,
        map: meta.map,
        queue: meta.mode || meta.queue,
        timeAgo: formatTimeAgo(meta.game_start),
        agent: selfPlayer?.character || null,
        agentImage, // ⭐ 프론트에서 바로 사용
        teamScore,
        enemyScore,
        kills,
        deaths,
        assists,
        kd: Number.isFinite(kd) ? Number(kd.toFixed(2)) : null,
        acs,
        adr,
        hsPercent,
        ddDelta: damageMade - damageReceived,
        win,
        placement: null, // Henrik v3에는 순위 정보 없음
      };
    });

    // 에이전트 이미지 디버그용 로그 하나만
    if (normalizedMatches[0]) {
      console.log('🧪 [RSO DEBUG] 첫 경기 agent 디버그:', {
        agent: normalizedMatches[0].agent,
        agentImage: normalizedMatches[0].agentImage,
      });
    }

    return res.json({ matches: normalizedMatches });
  } catch (err) {
    console.error('❌ [RSO/HENRIK DEBUG] /auth/matches 에러:');
    console.error('status:', err.response?.status);
    console.error('data:', err.response?.data || err.message);

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
