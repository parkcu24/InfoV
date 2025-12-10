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
// 헬퍼: RSO AccessToken → Riot 계정 정보
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

  // 2) account-v1 /accounts/me
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
// 헬퍼: 날짜 포맷 & "몇 시간 전" 계산
// --------------------------------------------------
function to2(n) {
  return n < 10 ? `0${n}` : String(n);
}

function parseMatchStart(meta) {
  // Henrik 메타데이터에서 가능한 필드들을 최대한 다 시도
  const raw =
    meta.started_at ||
    meta.startedAt ||
    meta.game_start ||
    meta.gameStart ||
    meta.game_start_patched ||
    meta.gameStartPatched ||
    null;

  if (!raw) return null;

  // 숫자(타임스탬프)인지 체크
  const num = Number(raw);
  if (!Number.isNaN(num) && num > 100000000000) {
    const d = new Date(num);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // ISO 문자열로 가정
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;

  return null;
}

function formatGameDate(d) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = to2(d.getMonth() + 1);
  const day = to2(d.getDate());
  return `${y}-${m}-${day}`;
}

function formatKoreanTimeAgo(d) {
  if (!d) return null;
  const now = Date.now();
  const diffMs = now - d.getTime();

  if (diffMs < 0) return '방금 전';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffHour < 1) return `${diffMin}분 전`;
  if (diffDay < 1) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}개월 전`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}년 전`;
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
//   - playerCardUrl 포함
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
    // 시즌 배열 준비
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
        let seasonName =
          (s.season && typeof s.season === 'object'
            ? s.season.short || s.season.id
            : s.season) ||
          s.seasonId ||
          s.seasonID ||
          s.id ||
          null;

        if (!seasonName) return null;

        let peakId = null;
        let peakName = null;

        // end_tier 우선
        if (s.end_tier && typeof s.end_tier === 'object') {
          if (typeof s.end_tier.id === 'number') peakId = s.end_tier.id;
          if (typeof s.end_tier.name === 'string') peakName = s.end_tier.name;
        }

        // act_wins 에서 최고 티어
        if ((!peakId || !peakName) && Array.isArray(s.act_wins)) {
          s.act_wins.forEach((t) => {
            if (!t || typeof t.id !== 'number') return;
            if (peakId == null || t.id > peakId) {
              peakId = t.id;
              peakName = t.name || peakName;
            }
          });
        }

        // tiers, ranks, rank_history 등에서 후보 찾기
        if (!peakId && !peakName) {
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

          let tmpPeak = null;
          tierCandidates.forEach((t) => {
            if (!t || typeof t.id !== 'number') return;
            if (!tmpPeak || t.id > tmpPeak.id) tmpPeak = t;
          });

          if (tmpPeak) {
            peakId = tmpPeak.id;
            peakName = tmpPeak.name || peakName;
          }
        }

        if (!peakName) {
          peakName =
            s.end_tier?.name ||
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

        if (!peakName) return null;

        return {
          season: seasonName,
          tier: peakName,
        };
      })
      .filter(Boolean);

    const playerCardUrl =
      acc?.card?.wide || acc?.card?.large || acc?.card?.small || null;

    const summary = {
      accountLevel: acc.account_level ?? null,
      currentTier: mmrData.current?.tier?.name ?? null,
      rr: mmrData.current?.rr ?? null,
      wins,
      losses,
      winRate,
      seasonHistory,
      playerCardUrl,
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
//   - 최대 100판까지 가져와서 프론트에서 10개씩 "더보기"
//   - K/D/A, ACS, ADR, HS%, 승패, 팀 스코어, 전체 플레이어 정보 등
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

    const accountData = accountRes.data?.data;
    console.log(
      '✅ [Henrik DEBUG] account v2 응답:',
      JSON.stringify(accountData, null, 2)
    );

    const regionFromHenrik = accountData?.region || null;
    const region = resolveHenrikRegion(country, regionFromHenrik);
    const henrikPuuid = accountData?.puuid || null;

    // 2) v4 matches - 최대 100판
    const matchesUrl = `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(
      accountData.name
    )}/${encodeURIComponent(accountData.tag)}`;

    console.log('🌐 [Henrik DEBUG] matches v4 호출:', matchesUrl);

    const matchesRes = await axios.get(matchesUrl, {
      headers: { Authorization: HENRIK_API_KEY },
      params: { size: 100 }, // ✅ 최대 100판
    });

    const rawMatches = matchesRes.data?.data || [];
    console.log('✅ [Henrik DEBUG] matches v4 응답 개수:', rawMatches.length);

    const mapped = rawMatches.map((m, idx) => {
      const meta = m.metadata || {};

      // --- players 통합 ---
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

      const rawStatsSelf = selfPlayer?.stats || {};
      const coreSelf = rawStatsSelf.core || rawStatsSelf;

      const kills =
        coreSelf.kills ??
        rawStatsSelf.kills ??
        0;
      const deaths =
        coreSelf.deaths ??
        rawStatsSelf.deaths ??
        0;
      const assists =
        coreSelf.assists ??
        rawStatsSelf.assists ??
        0;

      const kdRaw = deaths > 0 ? kills / deaths : kills;
      const kd = Number.isFinite(kdRaw) ? kdRaw : null;

      let score =
        coreSelf.score ??
        coreSelf.average_score ??
        coreSelf.combat_score ??
        rawStatsSelf.score ??
        rawStatsSelf.average_score ??
        rawStatsSelf.combat_score ??
        null;

      if (typeof score === 'string') {
        const parsed = Number(score);
        score = Number.isNaN(parsed) ? null : parsed;
      }

      // HS% (내 기준)
      let headshots =
        coreSelf.headshots ??
        rawStatsSelf.headshots ??
        null;
      let bodyshots =
        coreSelf.bodyshots ??
        rawStatsSelf.bodyshots ??
        null;
      let legshots =
        coreSelf.legshots ??
        rawStatsSelf.legshots ??
        null;

      const shotsSelf = coreSelf.shots || rawStatsSelf.shots;
      if (shotsSelf) {
        if (headshots == null)
          headshots = shotsSelf.head ?? shotsSelf.headshots ?? null;
        if (bodyshots == null)
          bodyshots = shotsSelf.body ?? shotsSelf.bodyshots ?? null;
        if (legshots == null)
          legshots = shotsSelf.leg ?? shotsSelf.legshots ?? null;
      }

      const totalShotsSelf =
        (headshots || 0) + (bodyshots || 0) + (legshots || 0);
      const hsPercentSelf =
        totalShotsSelf > 0
          ? Math.round(((headshots || 0) / totalShotsSelf) * 100)
          : null;

      // --- 팀 정보 / 스코어 ---
      const teams = m.teams || {};
      const teamIdRaw = (
        selfPlayer?.team ||
        selfPlayer?.player_team ||
        selfPlayer?.team_id ||
        ''
      ).toLowerCase();

      let myTeamKey = null;
      if (teamIdRaw === 'blue' || teamIdRaw === 'red') {
        myTeamKey = teamIdRaw;
      } else if (teamIdRaw === 'defending' || teamIdRaw === 'defense') {
        myTeamKey = 'defending';
      } else if (teamIdRaw === 'attacking' || teamIdRaw === 'attack') {
        myTeamKey = 'attacking';
      } else {
        myTeamKey = 'blue';
      }

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

      // 라운드 배열에서 blue/red 승수 계산 (fallback)
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

        let colorKey = null;
        if (teamIdRaw === 'blue' || teamIdRaw === 'red') {
          colorKey = teamIdRaw;
        } else if (teams.blue && myTeam === teams.blue) {
          colorKey = 'blue';
        } else if (teams.red && myTeam === teams.red) {
          colorKey = 'red';
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

      // 🔢 총 라운드 수 (ACS, ADR 계산용)
      let totalRounds = Array.isArray(m.rounds) ? m.rounds.length : null;
      if (
        (totalRounds == null || totalRounds === 0) &&
        typeof roundsWon === 'number' &&
        typeof roundsLost === 'number'
      ) {
        totalRounds = roundsWon + roundsLost;
      }

      // 🔥 내 ACS = score / 라운드 수
      let acsSelf = null;
      if (score != null) {
        const roundsSelf =
          coreSelf.rounds_played ??
          rawStatsSelf.rounds_played ??
          totalRounds;

        if (roundsSelf && roundsSelf > 0) {
          acsSelf = Math.round(score / roundsSelf);
        } else {
          acsSelf = Math.round(score);
        }
      }

      // 🔥 ADR 계산용 총 데미지 추정
      let totalDamageSelf =
        coreSelf.damage ??
        coreSelf.total_damage ??
        coreSelf.damage_made ??
        coreSelf.damageMade ??
        rawStatsSelf.damage ??
        rawStatsSelf.total_damage ??
        rawStatsSelf.damage_made ??
        rawStatsSelf.damageMade ??
        null;

      // 만약 위 필드들에 없다면 라운드 데이터에서 합산 시도
      if (totalDamageSelf == null && Array.isArray(m.rounds)) {
        let dmgSum = 0;
        let found = false;

        m.rounds.forEach((r) => {
          const scoreboard = r?.players || r?.player_stats || r?.playerStats;
          if (!Array.isArray(scoreboard)) return;

          scoreboard.forEach((ps) => {
            if (ps.puuid && ps.puuid === henrikPuuid) {
              const s = ps.stats || {};
              const dmg =
                s.damage ??
                s.damage_made ??
                s.damageMade ??
                s.total_damage ??
                null;
              if (typeof dmg === 'number') {
                dmgSum += dmg;
                found = true;
              }
            }
          });
        });

        if (found) totalDamageSelf = dmgSum;
      }

      let adrSelf = null;
      if (totalDamageSelf != null) {
        const roundsSelf =
          coreSelf.rounds_played ??
          rawStatsSelf.rounds_played ??
          totalRounds;

        if (roundsSelf && roundsSelf > 0) {
          adrSelf = Math.round(totalDamageSelf / roundsSelf);
        } else {
          adrSelf = Math.round(totalDamageSelf);
        }
      }

      const assetsSelf = selfPlayer?.assets || {};
      const agentAssetsSelf = assetsSelf.agent || {};
      const agentNameSelf =
        selfPlayer?.character ||
        selfPlayer?.agent?.name ||
        selfPlayer?.agent ||
        'Unknown';

      // 🔥 각 플레이어 전체 스코어보드용 매핑
      const playersMapped = allPlayers.map((p) => {
        const ps = p.stats || {};
        const pc = ps.core || ps;

        const pk = pc.kills ?? ps.kills ?? 0;
        const pd = pc.deaths ?? ps.deaths ?? 0;
        const pa = pc.assists ?? ps.assists ?? 0;
        const pkdRaw = pd > 0 ? pk / pd : pk;
        const pkd = Number.isFinite(pkdRaw) ? pkdRaw : null;

        let pscore =
          pc.score ??
          pc.average_score ??
          pc.combat_score ??
          ps.score ??
          ps.average_score ??
          ps.combat_score ??
          null;

        if (typeof pscore === 'string') {
          const parsed = Number(pscore);
          pscore = Number.isNaN(parsed) ? null : parsed;
        }

        let ph = pc.headshots ?? ps.headshots ?? null;
        let pb = pc.bodyshots ?? ps.bodyshots ?? null;
        let pl = pc.legshots ?? ps.legshots ?? null;

        const pshots = pc.shots || ps.shots;
        if (pshots) {
          if (ph == null) ph = pshots.head ?? pshots.headshots ?? null;
          if (pb == null) pb = pshots.body ?? pshots.bodyshots ?? null;
          if (pl == null) pl = pshots.leg ?? pshots.legshots ?? null;
        }

        const pTotal = (ph || 0) + (pb || 0) + (pl || 0);
        const phsPercent =
          pTotal > 0 ? Math.round(((ph || 0) / pTotal) * 100) : null;

        const pAssets = p.assets || {};
        const pAgentAssets = pAssets.agent || {};
        const pAgentName =
          p.character || p.agent?.name || p.agent || 'Unknown';

        const pRounds =
          pc.rounds_played ??
          ps.rounds_played ??
          totalRounds;

        let pAcs = null;
        if (pscore != null) {
          if (pRounds && pRounds > 0) {
            pAcs = Math.round(pscore / pRounds);
          } else {
            pAcs = Math.round(pscore);
          }
        }

        const tierNumber =
          p.currenttier ??
          p.current_tier ??
          (p.rank && p.rank.id) ??
          (p.tier && p.tier.id) ??
          null;

        const tierName =
          p.currenttier_patched ||
          p.currenttierpatched ||
          (p.rank && (p.rank.patched || p.rank.name)) ||
          (p.tier && (p.tier.patched || p.tier.name)) ||
          null;

        return {
          puuid: p.puuid,
          name: p.name,
          tag: p.tag,
          team:
            (p.team || p.player_team || p.team_id || '').toLowerCase(),
          agent: pAgentName,
          agentIcon:
            pAgentAssets.small ||
            pAgentAssets.bust ||
            pAgentAssets.full ||
            null,
          kills: pk,
          deaths: pd,
          assists: pa,
          kd: pkd,
          acs: pAcs,
          hsPercent: phsPercent,
          tierNumber,
          tierName,
          isSelf: p.puuid === henrikPuuid,
        };
      });

      // 📅 날짜/시간 포맷
      const startedAtDate = parseMatchStart(meta);
      const gameDate = formatGameDate(startedAtDate);   // 예: 2025-12-04
      const timeAgo = formatKoreanTimeAgo(startedAtDate); // 예: 4시간 전

      return {
        matchId:
          meta.matchid || meta.match_id || meta.id || meta.matchId || '',
        map: meta.map?.name || meta.map || 'Unknown Map',
        queue: meta.queue?.name || meta.mode || meta.queue || 'Mode',

        gameDate: gameDate || null,
        timeAgo: timeAgo || null,

        agent: agentNameSelf,
        agentIcon:
          agentAssetsSelf.small ||
          agentAssetsSelf.bust ||
          agentAssetsSelf.full ||
          null,

        teamScore: roundsWon,
        enemyScore: roundsLost,
        rankTier: selfPlayer?.currenttier_patched || null,
        rr: null,

        kills,
        deaths,
        assists,
        kd,
        acs: acsSelf,
        adr: adrSelf,
        hsPercent: hsPercentSelf,
        win: hasWon,
        placement: null,

        players: playersMapped,
        myTeam: myTeamKey,
        enemyTeam:
          myTeamKey === 'blue'
            ? 'red'
            : myTeamKey === 'red'
            ? 'blue'
            : null,
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
