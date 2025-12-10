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
  console.log('👤 [RSO DEBUG] getRiotIdentityFromToken 호출');

  // 1) userinfo
  const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = userInfoRes.data;
  console.log('🧾 [RSO DEBUG] userinfo:', JSON.stringify(data, null, 2));

  let gameName = null;
  let tagLine = null;
  let puuid = data.sub || null;
  const country = data.country || null;

  // 2) account-v1 /accounts/me (백업)
  try {
    console.log('🌍 [RSO DEBUG] account-v1 /accounts/me 호출 시도');
    const accountRes = await axios.get(
      'https://asia.api.riotgames.com/riot/account/v1/accounts/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const acc = accountRes.data;
    console.log(
      '✅ [RSO DEBUG] account-v1 /accounts/me 응답:',
      JSON.stringify(acc, null, 2)
    );

    if (acc.gameName) gameName = acc.gameName;
    if (acc.tagLine) tagLine = acc.tagLine;
    if (acc.puuid) puuid = acc.puuid;
  } catch (e) {
    console.error('❌ [RSO DEBUG] account-v1 에러:', e.response?.data || e.message);
  }

  // 3) userinfo.acct 보조
  const acct = data.acct || {};
  if (!gameName && acct.game_name) gameName = acct.game_name;
  if (!tagLine && acct.tag_line) tagLine = acct.tag_line;

  // 4) preferred_username: "name#tag"
  if (!gameName && typeof data.preferred_username === 'string') {
    const [gn, tl] = data.preferred_username.split('#');
    if (gn) gameName = gn;
    if (tl) tagLine = tl;
  }

  // 5) 기타 필드
  if (!gameName && data.game_name) gameName = data.game_name;
  if (!tagLine && data.tag_line) tagLine = data.tag_line;
  if (!gameName && data.name) gameName = data.name;

  return { gameName, tagLine, puuid, country };
}

// --------------------------------------------------
// 1️⃣ 로그인 페이지로 이동
// --------------------------------------------------
router.get('/login', (req, res) => {
  const authorizeUrl = `https://auth.riotgames.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid+offline_access`;

  console.log('🧭 [RSO DEBUG] 로그인 요청:', authorizeUrl);
  res.redirect(authorizeUrl);
});

// --------------------------------------------------
// 2️⃣ Riot 로그인 콜백
// --------------------------------------------------
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not found');

  try {
    console.log('🧾 [RSO DEBUG] 콜백 code:', code);

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

    res.redirect(`${FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (err) {
    console.error('❌ [RSO DEBUG] OAuth 에러:', err.response?.data || err.message);
    res.status(500).send('OAuth 처리 중 오류가 발생했습니다.');
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
    const { gameName, tagLine, puuid, country } =
      await getRiotIdentityFromToken(accessToken);

    const profile = {
      gameName: gameName || null,
      tagLine: tagLine || null,
      puuid: puuid || null,
      country: country || null,
    };

    console.log('✅ [RSO DEBUG] /auth/profile 응답:', profile);
    res.json(profile);
  } catch (err) {
    console.error('❌ [RSO DEBUG] /auth/profile 에러:', err.response?.data || err.message);
    const status =
      err.response?.status &&
      err.response.status >= 400 &&
      err.response.status < 600
        ? err.response.status
        : 500;

    res.status(status).json({
      error: 'Failed to fetch profile from Riot',
      detail: err.response?.data || err.message,
    });
  }
});

// --------------------------------------------------
// 4️⃣ Henrik 요약 스탯 (/api/auth/stats)
//   - 시즌별 최고 티어(peak tier)까지 계산
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
    const { gameName, tagLine, country } =
      await getRiotIdentityFromToken(accessToken);

    if (!gameName || !tagLine) {
      console.log('❌ [Henrik DEBUG] gameName 또는 tagLine 없음');
      return res.status(400).json({
        error: 'Missing Riot ID',
        detail: 'gameName or tagLine not found from Riot userinfo',
      });
    }

    // 1) Henrik account v2
    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    console.log('🌐 [Henrik DEBUG] account v2 호출:', accountUrl);

    const accountRes = await axios.get(accountUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const acc = accountRes.data?.data;
    console.log(
      '✅ [Henrik DEBUG] account v2 응답:',
      JSON.stringify(acc, null, 2)
    );

    const region = resolveHenrikRegion(country, acc?.region);

    // 2) MMR v3
    const mmrUrl = `https://api.henrikdev.xyz/valorant/v3/mmr/${region}/pc/${encodeURIComponent(
      acc.name
    )}/${encodeURIComponent(acc.tag)}`;

    console.log('🌐 [Henrik DEBUG] mmr v3 호출:', mmrUrl);

    const mmrRes = await axios.get(mmrUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const mmrData = mmrRes.data?.data || {};
    console.log(
      '✅ [Henrik DEBUG] mmr v3 data:',
      JSON.stringify(mmrData, null, 2)
    );

    // ---------------------------
    // 시즌 배열 준비 (seasonal / by_season 둘 다 대응)
    // ---------------------------
    let seasonal = [];

    if (Array.isArray(mmrData.seasonal)) {
      seasonal = mmrData.seasonal;
    } else if (mmrData.by_season && typeof mmrData.by_season === 'object') {
      seasonal = Object.entries(mmrData.by_season).map(([seasonId, s]) => ({
        seasonId,
        ...s,
      }));
    }

    // 최신 시즌이 앞으로 오도록 역순
    const seasonalDesc = [...seasonal].reverse();
    const latest = seasonalDesc[0];

    // ---------------------------
    // 최신 시즌 승률 계산
    // ---------------------------
    let wins = null;
    let losses = null;
    let winRate = null;

    if (latest && typeof latest.games === 'number') {
      wins = typeof latest.wins === 'number' ? latest.wins : null;
      const games = latest.games;
      if (wins != null) {
        losses = games - wins;
        winRate = games > 0 ? Math.round((wins / games) * 100) : null;
      }
    }

    // ------------------------------------------------
    // 시즌별 최고 티어 찾기 (peak tier)
// ------------------------------------------------
    const seasonHistory = seasonalDesc
      .map((s) => {
        // 시즌 이름/코드
        let seasonName =
          (s.season && typeof s.season === 'object'
            ? s.season.short || s.season.id
            : s.season) ||
          s.seasonId ||
          s.seasonID ||
          s.id ||
          null;

        if (!seasonName) return null;

        // 후보가 될 수 있는 배열 타입들: tiers, ranks, rank_history 등
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

        // id가 가장 높은 티어 선택
        let peakTier = null;
        tierCandidates.forEach((t) => {
          if (!t || typeof t.id !== 'number') return;
          if (!peakTier || t.id > peakTier.id) peakTier = t;
        });

        let tierName = peakTier?.name || null;

        // fallback: patched / rank / tier 등
        if (!tierName) {
          tierName =
            s.final_rank_patched ||
            s.final_tier_patched ||
            s.finaltier_patched ||
            s.currenttier_patched ||
            s.currenttierpatched ||
            (s.rank && (s.rank.patched || s.rank.name)) ||
            (s.tier && (s.tier.patched || s.tier.name)) ||
            (typeof s.final_rank === 'string' && s.final_rank) ||
            (typeof s.rank === 'string' && s.rank) ||
            (typeof s.tier === 'string' && s.tier) ||
            null;
        }

        return {
          season: seasonName,
          tier: tierName,
        };
      })
      .filter(Boolean);

    const summary = {
      accountLevel: acc.account_level ?? null,
      currentTier: mmrData.current?.tier?.name ?? null,
      rr: mmrData.current?.rr ?? null,
      wins,
      losses,
      winRate,
      seasonHistory,
    };

    console.log('✅ [Henrik DEBUG] /auth/stats 응답:', summary);
    res.json(summary);
  } catch (err) {
    console.error('❌ [Henrik DEBUG] /auth/stats 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status &&
      err.response.status >= 400 &&
      err.response.status < 600
        ? err.response.status
        : 500;

    res.status(status).json({
      error: 'Failed to fetch stats from Henrik',
      detail: err.response?.data || err.message,
    });
  }
});

// --------------------------------------------------
// 5️⃣ 최근 경기 정보 반환 (/api/auth/matches)
//   - K/D/A, ACS, HS%, 스코어, 승패, 라운드 스코어 등
// --------------------------------------------------
// --------------------------------------------------
// 5️⃣ 최근 경기 정보 반환 (/api/auth/matches)
//   - K/D/A, ACS, HS%, 스코어, 승패, 라운드 스코어
//   - + 전체 플레이어 리스트 (ally/enemy)
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

    // 2) Henrik account v2 → puuid, region
    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    console.log('🌐 [Henrik DEBUG] account v2 호출:', accountUrl);

    const accountRes = await axios.get(accountUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const accountData = accountRes.data?.data;
    console.log(
      '✅ [Henrik DEBUG] account v2 응답:',
      JSON.stringify(accountData, null, 2)
    );

    const regionFromHenrik = accountData?.region || null;
    const region = resolveHenrikRegion(country, regionFromHenrik);
    const henrikPuuid = accountData?.puuid || null;

    // 팀 문자열 정규화 헬퍼 (blue/red/attacking/defending 등)
    const normalizeTeam = (raw) => {
      const t = (raw || '').toLowerCase();
      if (t === 'blue' || t === 'red') return t;
      if (t === 'defense') return 'defending';
      if (t === 'attack') return 'attacking';
      if (t === 'defending' || t === 'attacking') return t;
      return '';
    };

    // 3) v4 matches
    const matchesUrl = `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(
      accountData.name
    )}/${encodeURIComponent(accountData.tag)}`;

    console.log('🌐 [Henrik DEBUG] matches v4 호출:', matchesUrl);

    const matchesRes = await axios.get(matchesUrl, {
      headers: { Authorization: HENRIK_API_KEY },
      params: { size: 8 }, // 최근 8게임
    });

    const rawMatches = matchesRes.data?.data || [];
    console.log(
      '✅ [Henrik DEBUG] matches v4 응답 개수:',
      rawMatches.length
    );

    const mapped = rawMatches.map((m, idx) => {
      const meta = m.metadata || {};

      // --- players 구조 통합 (새/구 버전 모두 대응) ---
      const playersRaw = m.players || {};
      let allPlayers = [];

      if (Array.isArray(playersRaw)) {
        allPlayers = playersRaw;
      } else if (Array.isArray(playersRaw.all)) {
        allPlayers = playersRaw.all;
      } else {
        const teamKeys = [
          'blue',
          'red',
          'other',
          'neutral',
          'defending',
          'attacking',
        ];
        teamKeys.forEach((key) => {
          const team = playersRaw[key];
          if (team && Array.isArray(team.players)) {
            allPlayers = allPlayers.concat(team.players);
          }
        });
      }

      console.log(
        `🎯 [Henrik DEBUG] match[${idx}] allPlayers 길이:`,
        allPlayers.length
      );

      // --- 내 플레이어 찾기 ---
      let selfPlayer = null;

      if (henrikPuuid && allPlayers.length > 0) {
        selfPlayer = allPlayers.find((p) => p.puuid === henrikPuuid) || null;
      }
      if (!selfPlayer && allPlayers.length > 0) {
        selfPlayer =
          allPlayers.find(
            (p) => p.name === accountData.name && p.tag === accountData.tag
          ) || null;
      }
      if (!selfPlayer && allPlayers.length > 0) {
        console.log(
          `⚠️ [Henrik DEBUG] match[${idx}] selfPlayer 찾기 실패, 0번 플레이어 사용`
        );
        selfPlayer = allPlayers[0];
      }

      const selfTeamIdRaw =
        selfPlayer?.team || selfPlayer?.player_team || selfPlayer?.team_id || '';
      const myTeamKey = normalizeTeam(selfTeamIdRaw);

      // 적 팀 키
      let enemyTeamKey = null;
      if (myTeamKey === 'blue') enemyTeamKey = 'red';
      else if (myTeamKey === 'red') enemyTeamKey = 'blue';
      else if (myTeamKey === 'defending') enemyTeamKey = 'attacking';
      else if (myTeamKey === 'attacking') enemyTeamKey = 'defending';

      // --- 팀 정보 / 스코어 ---
      const teams = m.teams || {};
      let myTeam = teams[myTeamKey] || {};
      let enemyTeam = {};

      if (myTeamKey === 'blue') {
        enemyTeam = teams.red || {};
      } else if (myTeamKey === 'red') {
        enemyTeam = teams.blue || {};
      } else if (myTeamKey === 'defending') {
        enemyTeam = teams.attacking || {};
      } else if (myTeamKey === 'attacking') {
        enemyTeam = teams.defending || {};
      }

      let roundsWon =
        myTeam.rounds_won ??
        myTeam.roundsWon ??
        (myTeam.rounds && myTeam.rounds.won) ??
        myTeam.score ??
        null;

      let roundsLost =
        myTeam.rounds_lost ??
        myTeam.roundsLost ??
        (myTeam.rounds && myTeam.rounds.lost) ??
        enemyTeam.score ??
        null;

      let hasWonRaw =
        myTeam.has_won ??
        myTeam.hasWon ??
        myTeam.won ??
        null;

      // 🔹 그래도 null이면, rounds 배열에서 blue/red 승수 직접 세기
      if (
        (roundsWon == null || roundsLost == null) &&
        Array.isArray(m.rounds) &&
        m.rounds.length > 0
      ) {
        const roundsArr = m.rounds;
        let blueWins = 0;
        let redWins = 0;

        roundsArr.forEach((r) => {
          const winTeam = (r.winning_team || r.winningTeam || '').toLowerCase();
          if (winTeam === 'blue') blueWins += 1;
          else if (winTeam === 'red') redWins += 1;
        });

        // 내 색깔 결정
        let colorKey = myTeamKey;
        if (!colorKey) {
          if (teams.blue && myTeam === teams.blue) colorKey = 'blue';
          else if (teams.red && myTeam === teams.red) colorKey = 'red';
        }

        if (colorKey === 'blue') {
          roundsWon = blueWins;
          roundsLost = redWins;
        } else if (colorKey === 'red') {
          roundsWon = redWins;
          roundsLost = blueWins;
        }
      }

      const hasWon =
        typeof hasWonRaw === 'boolean'
          ? hasWonRaw
          : (typeof roundsWon === 'number' &&
             typeof roundsLost === 'number'
            ? roundsWon > roundsLost
            : null);

      // --- 개별 플레이어 정보 매핑 (팀원/상대 모두) ---
      const mapPlayerStats = (p) => {
        const rawStats = p.stats || {};
        const coreStats = rawStats.core || rawStats;

        const kills = coreStats.kills ?? rawStats.kills ?? 0;
        const deaths = coreStats.deaths ?? rawStats.deaths ?? 0;
        const assists = coreStats.assists ?? rawStats.assists ?? 0;

        const kdRaw = deaths > 0 ? kills / deaths : kills;
        const kd = Number.isFinite(kdRaw) ? kdRaw : null;

        let score =
          coreStats.score ??
          coreStats.average_score ??
          coreStats.combat_score ??
          rawStats.score ??
          rawStats.average_score ??
          rawStats.combat_score ??
          null;

        if (typeof score === 'string') {
          const parsed = Number(score);
          score = Number.isNaN(parsed) ? null : parsed;
        }

        let headshots =
          coreStats.headshots ??
          rawStats.headshots ??
          null;
        let bodyshots =
          coreStats.bodyshots ??
          rawStats.bodyshots ??
          null;
        let legshots =
          coreStats.legshots ??
          rawStats.legshots ??
          null;

        const shots = coreStats.shots || rawStats.shots;
        if (shots) {
          if (headshots == null)
            headshots = shots.head ?? shots.headshots ?? null;
          if (bodyshots == null)
            bodyshots = shots.body ?? shots.bodyshots ?? null;
          if (legshots == null)
            legshots = shots.leg ?? shots.legshots ?? null;
        }

        const totalShots =
          (headshots || 0) + (bodyshots || 0) + (legshots || 0);
        const hsPercent =
          totalShots > 0
            ? Math.round(((headshots || 0) / totalShots) * 100)
            : null;

        const tKey = normalizeTeam(
          p.team || p.player_team || p.team_id || ''
        );

        const assets = p.assets || {};
        const agentAssets = assets.agent || {};
        const agentName =
          p.character ||
          p.agent?.name ||
          p.agent ||
          'Unknown';

        return {
          name: p.name,
          tag: p.tag,
          puuid: p.puuid,
          team: tKey,           // 'blue', 'red', 'defending', 'attacking' 등
          isSelf: henrikPuuid && p.puuid === henrikPuuid,
          agent: agentName,
          agentIcon:
            agentAssets.small ||
            agentAssets.bust ||
            agentAssets.full ||
            null,
          kills,
          deaths,
          assists,
          kd,
          acs: score,
          adr: null,            // Henrik 쪽에 ADR 없으면 null
          hsPercent,
        };
      };

      const players = allPlayers.map(mapPlayerStats);

      // --- 내 플레이 요약 (기존 카드용 정보) ---
      const selfStats = mapPlayerStats(selfPlayer);

      return {
        matchId:
          meta.matchid || meta.match_id || meta.id || meta.matchId || '',
        map: meta.map?.name || meta.map || 'Unknown Map',
        queue: meta.queue?.name || meta.mode || meta.queue || 'Mode',
        timeAgo: meta.started_at || meta.startedAt || '',

        // 카드 상단 요약용 (내 전적)
        agent: selfStats.agent,
        agentIcon: selfStats.agentIcon,
        teamScore: roundsWon,
        enemyScore: roundsLost,
        rankTier: selfPlayer?.currenttier_patched || null,
        rr: null,
        kills: selfStats.kills,
        deaths: selfStats.deaths,
        assists: selfStats.assists,
        kd: selfStats.kd,
        acs: selfStats.acs,
        adr: selfStats.adr,
        hsPercent: selfStats.hsPercent,
        win: hasWon,
        placement: null,

        // 🔥 새로 추가된 필드들
        myTeam: myTeamKey,
        enemyTeam: enemyTeamKey,
        players,    // 전체 플레이어 리스트 (팀원 + 상대)
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('❌ [Henrik DEBUG] /auth/matches 에러:');
    console.error(err.response?.data || err.message);

    const status =
      err.response?.status &&
      err.response.status >= 400 &&
      err.response.status < 600
        ? err.response.status
        : 500;

    res.status(status).json({
      error: 'Failed to fetch matches',
      detail: err.response?.data || err.message,
    });
  }
});


module.exports = router;
