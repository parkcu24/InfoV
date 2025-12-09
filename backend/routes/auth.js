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
// 헬퍼: 국가 → Henrik 지역 매핑
// --------------------------------------------------
function resolveHenrikRegion(country, fallbackRegion) {
  if (fallbackRegion) return fallbackRegion;
  if (!country) return 'ap';

  const c = country.toUpperCase();

  if (['KR'].includes(c)) return 'kr';
  if (['US', 'CA', 'MX'].includes(c)) return 'na';
  if (['BR'].includes(c)) return 'br';

  if (['AR', 'CL', 'PE', 'CO', 'VE', 'UY', 'PY', 'BO', 'EC'].includes(c))
    return 'latam';

  if (
    ['FR', 'DE', 'ES', 'IT', 'GB', 'UK', 'NL', 'SE', 'NO', 'FI', 'PL', 'CZ'].includes(c)
  )
    return 'eu';

  return 'ap';
}

// --------------------------------------------------
// RSO AccessToken → Riot 계정 정보(gameName, tagLine, puuid, country)
// --------------------------------------------------
async function getRiotIdentityFromToken(accessToken) {
  const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = userInfoRes.data;

  let gameName = null;
  let tagLine = null;
  let puuid = data.sub || null;
  const country = data.country || null;

  // account-v1 backup
  try {
    const accountRes = await axios.get(
      'https://asia.api.riotgames.com/riot/account/v1/accounts/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const acc = accountRes.data;
    if (acc.gameName) gameName = acc.gameName;
    if (acc.tagLine) tagLine = acc.tagLine;
    if (acc.puuid) puuid = acc.puuid;
  } catch (e) {
    console.error('❌ account-v1 error', e.response?.data);
  }

  // fallback
  const acct = data.acct || {};
  if (!gameName && acct.game_name) gameName = acct.game_name;
  if (!tagLine && acct.tag_line) tagLine = acct.tag_line;

  if (!gameName && typeof data.preferred_username === 'string') {
    const [gn, tl] = data.preferred_username.split('#');
    if (gn) gameName = gn;
    if (tl) tagLine = tl;
  }

  if (!gameName && data.game_name) gameName = data.game_name;
  if (!tagLine && data.tag_line) tagLine = data.tag_line;

  return { gameName, tagLine, puuid, country };
}

// --------------------------------------------------
// 1️⃣ 로그인 페이지로 이동
// --------------------------------------------------
router.get('/login', (req, res) => {
  const authorizeUrl = `https://auth.riotgames.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid+offline_access`;

  res.redirect(authorizeUrl);
});

// --------------------------------------------------
// 2️⃣ Riot 로그인 콜백
// --------------------------------------------------
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not found');

  try {
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

    res.redirect(`${FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (err) {
    res.status(500).send('OAuth 처리 중 오류가 발생했습니다.');
  }
});

// --------------------------------------------------
// 3️⃣ 프로필 정보 반환
// --------------------------------------------------
router.get('/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: "No Token" });

  const accessToken = auth.split(' ')[1];

  try {
    const profile = await getRiotIdentityFromToken(accessToken);
    res.json(profile);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch profile',
      detail: err.response?.data || err.message,
    });
  }
});

// --------------------------------------------------
// 4️⃣ Henrik 요약 스탯 (/stats)
//   → 시즌별 최고 티어 포함 버전!!
// --------------------------------------------------
router.get('/stats', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: "No Token" });

  const accessToken = auth.split(' ')[1];

  try {
    const { gameName, tagLine, country } = await getRiotIdentityFromToken(accessToken);

    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    const accountRes = await axios.get(accountUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const acc = accountRes.data?.data;
    const region = resolveHenrikRegion(country, acc?.region);

    // 🔥 v3 MMR
    const mmrUrl = `https://api.henrikdev.xyz/valorant/v3/mmr/${region}/pc/${encodeURIComponent(
      acc.name
    )}/${encodeURIComponent(acc.tag)}`;

    const mmrRes = await axios.get(mmrUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const mmrData = mmrRes.data?.data || {};

    // ---------------------------
    // 시즌 배열 준비
    // ---------------------------
    let seasonal = [];

    if (Array.isArray(mmrData.seasonal)) {
      seasonal = mmrData.seasonal;
    } else if (mmrData.by_season) {
      seasonal = Object.entries(mmrData.by_season).map(([id, s]) => ({
        seasonId: id,
        ...s,
      }));
    }

    const seasonalDesc = [...seasonal].reverse();
    const latest = seasonalDesc[0];

    // ---------------------------
    // 최신 시즌 승률
    // ---------------------------
    let wins = null;
    let losses = null;
    let winRate = null;

    if (latest?.games) {
      wins = latest.wins ?? null;
      losses = latest.games - (latest.wins ?? 0);
      winRate = latest.games > 0 ? Math.round((wins / latest.games) * 100) : null;
    }

    // ------------------------------------------------
    // 시즌별 최고 티어 찾기
    // ------------------------------------------------
    const seasonHistory = seasonalDesc
      .map((s) => {
        let seasonName =
          s.season?.short ||
          s.season?.id ||
          s.seasonId ||
          s.season ||
          s.id ||
          null;

        if (!seasonName) return null;

        // 🟣 후보가 될 수 있는 모든 배열 타입 확인
        const tierCandidates = [];
        const possibleArrays = [
          s.tiers,
          s.ranks,
          s.rank_history,
          s.rankHistory,
          s.highest_rank,
          s.peak_rank,
        ];

        possibleArrays.forEach((arr) => {
          if (Array.isArray(arr)) tierCandidates.push(...arr);
        });

        // 🟣 id 가장 높은 티어 = peak tier
        let peakTier = null;
        tierCandidates.forEach((t) => {
          if (!t?.id) return;
          if (!peakTier || t.id > peakTier.id) peakTier = t;
        });

        let tierName = peakTier?.name || null;

        // fallback
        if (!tierName) {
          tierName =
            s.final_rank_patched ||
            s.final_tier_patched ||
            s.currenttier_patched ||
            s.rank?.patched ||
            s.rank?.name ||
            s.tier?.name ||
            s.tier?.patched ||
            null;
        }

        return {
          season: seasonName,
          tier: tierName,
        };
      })
      .filter(Boolean);

    res.json({
      accountLevel: acc.account_level ?? null,
      currentTier: mmrData.current?.tier?.name ?? null,
      rr: mmrData.current?.rr ?? null,
      wins,
      losses,
      winRate,
      seasonHistory,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch stats',
      detail: err.response?.data || err.message,
    });
  }
});

// --------------------------------------------------
// 5️⃣ 경기 정보 (/matches)
// --------------------------------------------------
router.get('/matches', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: "No Token" });

  const accessToken = auth.split(' ')[1];

  try {
    const { gameName, tagLine, country } = await getRiotIdentityFromToken(accessToken);

    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    const accRes = await axios.get(accountUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const acc = accRes.data?.data;
    const region = resolveHenrikRegion(country, acc?.region);
    const puuid = acc.puuid;

    // v4 matches
    const matchesUrl = `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(
      acc.name
    )}/${encodeURIComponent(acc.tag)}`;

    const matchesRes = await axios.get(matchesUrl, {
      headers: { Authorization: HENRIK_API_KEY },
      params: { size: 8 },
    });

    const raw = matchesRes.data?.data || [];

    const mapped = raw.map((m) => {
      const meta = m.metadata || {};

      let players = [];
      if (Array.isArray(m.players)) players = m.players;
      else if (Array.isArray(m.players?.all)) players = m.players.all;

      const me =
        players.find((p) => p.puuid === puuid) ||
        players.find((p) => p.name === acc.name && p.tag === acc.tag) ||
        players[0];

      const stats = me?.stats?.core || me?.stats || {};

      return {
        matchId: meta.id || meta.matchid,
        map: meta.map?.name || meta.map,
        queue: meta.queue?.name || meta.queue,
        timeAgo: meta.started_at,

        agent: me?.character || me?.agent?.name,
        agentIcon: me?.assets?.agent?.small,

        kills: stats.kills,
        deaths: stats.deaths,
        assists: stats.assists,
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch matches',
      detail: err.response?.data || err.message,
    });
  }
});

module.exports = router;
