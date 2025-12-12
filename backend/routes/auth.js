// 📁 backend/routes/auth.js
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
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
//   (access_token은 여기에서만 잠깐 쓰고 버린다)
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
// 날짜/시간 헬퍼
// --------------------------------------------------
function to2(n) {
  return n < 10 ? `0${n}` : String(n);
}

function parseMatchStart(meta) {
  const raw =
    meta.started_at ||
    meta.startedAt ||
    meta.game_start ||
    meta.gameStart ||
    meta.game_start_patched ||
    meta.gameStartPatched ||
    null;

  if (!raw) return null;

  const num = Number(raw);
  if (!Number.isNaN(num) && num > 100000000000) {
    const d = new Date(num);
    if (!Number.isNaN(d.getTime())) return d;
  }

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
// 세션 기반 인증 헬퍼
// --------------------------------------------------

// 세션 쿠키에서 유저 불러오기
async function getUserFromSession(req) {
  const sessionId = req.cookies?.infov_session;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    // 만료된 세션 정리
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  return session.user;
}

// 미들웨어: 로그인 필수
async function requireAuth(req, res, next) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = user;
    next();
  } catch (e) {
    console.error('❌ [AUTH] 세션 확인 중 오류:', e);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

// --------------------------------------------------
// 1️⃣ Riot 로그인 페이지로 이동
// --------------------------------------------------
router.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid offline_access',
  });

  const authUrl = `https://auth.riotgames.com/oauth/authorize?${params.toString()}`;
  return res.redirect(authUrl);
});


// --------------------------------------------------
// 2️⃣ Riot 로그인 콜백
//     - code → access_token 교환
//     - Riot ID 조회
//     - User upsert
//     - Session 생성 + 쿠키 발급
// --------------------------------------------------
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    console.error('❌ RSO 코드 없음');
    return res.redirect(`${FRONTEND_URL}/?login=failed`);
  }

  try {
    // 1) 인증 서버로 token 교환
    const tokenRes = await axios.post(
      'https://auth.riotgames.com/oauth/token',
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token } = tokenRes.data;
    console.log('✅ [RSO DEBUG] access_token 발급 성공');

    // 2) 유저 정보 불러오기 (userinfo + accounts/me)
    const identity = await getRiotIdentityFromToken(access_token);
    if (!identity.puuid) {
      throw new Error('RSO에서 puuid를 가져오지 못했습니다.');
    }

    const region = resolveHenrikRegion(identity.country, null);

    // 3) DB 유저 upsert
    const user = await prisma.user.upsert({
      where: { puuid: identity.puuid },
      create: {
        puuid: identity.puuid,
        gameName: identity.gameName,
        tagLine: identity.tagLine,
        region,
      },
      update: {
        gameName: identity.gameName,
        tagLine: identity.tagLine,
        region,
      },
    });

    console.log('✅ [AUTH] User upsert 완료:', {
      id: user.id,
      gameName: user.gameName,
      tagLine: user.tagLine,
      region: user.region,
    });

    // 4) 세션 생성
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt,
      },
    });

    // 5) 세션 쿠키 발급 (크로스 도메인 허용: SameSite=None)
    res.cookie('infov_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: expiresAt,
    });

    console.log('✅ [AUTH] 세션 쿠키 발급 완료');

    // 이제 access_token은 사용 끝 → 저장하지 않고 버림
    // 프론트는 쿠키만 가지고 자동 로그인 상태 유지
    return res.redirect(`${FRONTEND_URL}/matches`);
  } catch (err) {
    console.error('❌ [RSO DEBUG] OAuth 에러:', err.response?.data || err.message);
    return res.redirect(`${FRONTEND_URL}/?login=failed`);
  }
});

// --------------------------------------------------
// 3️⃣ 프로필 정보 반환 (/api/auth/profile)
//     - 세션 쿠키 기반
// --------------------------------------------------
router.get('/profile', requireAuth, async (req, res) => {
  const user = req.user;
  return res.json({
    puuid: user.puuid,
    gameName: user.gameName,
    tagLine: user.tagLine,
  });
});

// --------------------------------------------------
// 4️⃣ 로그아웃 (/api/auth/logout)
//     - 세션 삭제 + 쿠키 삭제
// --------------------------------------------------
router.post('/logout', async (req, res) => {
  const sessionId = req.cookies?.infov_session;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  res.clearCookie('infov_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ ok: true });
});

// --------------------------------------------------
// 5️⃣ Henrik 요약 스탯 (/api/auth/stats)
// --------------------------------------------------
router.get('/stats', requireAuth, async (req, res) => {
  const user = req.user;

  const gameName = user.gameName;
  const tagLine = user.tagLine;
  const regionFromUser = user.region || 'ap';

  console.log('📊 [Henrik DEBUG] /auth/stats 호출:', {
    gameName,
    tagLine,
    regionFromUser,
  });

  try {
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

    const region = resolveHenrikRegion(null, acc?.region || regionFromUser);

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

    // 최신 시즌 승률 계산
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

    // 시즌별 최고 티어 찾기
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

        if (s.end_tier && typeof s.end_tier === 'object') {
          if (typeof s.end_tier.id === 'number') peakId = s.end_tier.id;
          if (typeof s.end_tier.name === 'string') peakName = s.end_tier.name;
        }

        if ((!peakId || !peakName) && Array.isArray(s.act_wins)) {
          s.act_wins.forEach((t) => {
            if (!t || typeof t.id !== 'number') return;
            if (peakId == null || t.id > peakId) {
              peakId = t.id;
              peakName = t.name || peakName;
            }
          });
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
// 6️⃣ 최근 경기 정보 반환 (/api/auth/matches)
// --------------------------------------------------
router.get('/matches', requireAuth, async (req, res) => {
  const user = req.user;

  let { start, size } = req.query;

  start = Number(start);
  if (Number.isNaN(start) || start < 0) start = 0;

  size = Number(size);
  if (Number.isNaN(size) || size <= 0) size = 10;
  if (size > 10) size = 10; // Henrik 제한

  const gameName = user.gameName;
  const tagLine = user.tagLine;
  const regionFromUser = user.region || 'ap';

  console.log(
    '🎮 [Henrik DEBUG] /auth/matches 호출:',
    'start =', start,
    'size =', size,
    'gameName =', gameName,
    'tagLine =', tagLine
  );

  try {
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

    const region = resolveHenrikRegion(null, accountData?.region || regionFromUser);
    const henrikPuuid = accountData?.puuid || null;

    // 2) v4 matches - 페이지네이션(size, start)
    const matchesUrl = `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(
      accountData.name
    )}/${encodeURIComponent(accountData.tag)}`;

    console.log('🌐 [Henrik DEBUG] matches v4 호출:', matchesUrl);

    const matchesRes = await axios.get(matchesUrl, {
      headers: { Authorization: HENRIK_API_KEY },
      params: { size, start },
    });

    const rawMatches = matchesRes.data?.data || [];
    console.log(
      '✅ [Henrik DEBUG] matches v4 응답 개수:',
      rawMatches.length,
      `(start=${start}, size=${size})`
    );

    // ⬇⬇⬇ 아래는 기존 매핑 로직
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
        `🎯 [Henrik DEBUG] match[${start + idx}] allPlayers 길이:`,
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
          `⚠️ [Henrik DEBUG] match[${start + idx}] selfPlayer 찾기 실패, 0번 플레이어 사용`
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

      let totalRounds = Array.isArray(m.rounds) ? m.rounds.length : null;
      if (
        (totalRounds == null || totalRounds === 0) &&
        typeof roundsWon === 'number' &&
        typeof roundsLost === 'number'
      ) {
        totalRounds = roundsWon + roundsLost;
      }

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

      const startedAtDate = parseMatchStart(meta);
      const gameDate = formatGameDate(startedAtDate);
      const timeAgo = formatKoreanTimeAgo(startedAtDate);

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
