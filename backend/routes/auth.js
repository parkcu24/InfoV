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
    ['FR', 'DE', 'ES', 'IT', 'GB', 'UK', 'NL', 'SE', 'NO', 'FI', 'PL', 'CZ'].includes(
      c
    )
  )
    return 'eu';

  return 'ap';
}

// --------------------------------------------------
// 헬퍼: RSO AccessToken → Riot 계정 정보
// --------------------------------------------------
async function getRiotIdentityFromToken(accessToken) {
  console.log('👤 [RSO DEBUG] getRiotIdentityFromToken 호출');

  const userInfoRes = await axios.get('https://auth.riotgames.com/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = userInfoRes.data;
  console.log('🧾 [RSO DEBUG] userinfo:', JSON.stringify(data, null, 2));

  let gameName = null;
  let tagLine = null;
  let puuid = data.sub || null;
  const country = data.country || null;

  try {
    console.log('🌍 [RSO DEBUG] account-v1 /accounts/me 호출 시도');
    const accountRes = await axios.get(
      'https://asia.api.riotgames.com/riot/account/v1/accounts/me',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const acc = accountRes.data;
    console.log('✅ [RSO DEBUG] account-v1 /accounts/me 응답:', JSON.stringify(acc, null, 2));

    if (acc.gameName) gameName = acc.gameName;
    if (acc.tagLine) tagLine = acc.tagLine;
    if (acc.puuid) puuid = acc.puuid;
  } catch (e) {
    console.error('❌ [RSO DEBUG] account-v1 에러:', e.response?.data || e.message);
  }

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
async function getUserFromSession(req) {
  const sessionId = req.cookies?.infov_session;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  return session.user;
}

async function requireAuth(req, res, next) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    req.user = user;
    next();
  } catch (e) {
    console.error('❌ [AUTH] 세션 확인 중 오류:', e);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

// ✅ 프론트에서 로그인 상태 확인용(선택)
router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    ok: true,
    user: { puuid: u.puuid, gameName: u.gameName, tagLine: u.tagLine, region: u.region },
  });
});

// --------------------------------------------------
// 1️⃣ Riot 로그인 페이지로 이동
// --------------------------------------------------
router.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid offline_access',
    state,
  });

  const authUrl = `https://auth.riotgames.com/authorize?${params.toString()}`;
  return res.redirect(authUrl);
});

// --------------------------------------------------
// 2️⃣ Riot 로그인 콜백
// --------------------------------------------------
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    console.error('❌ RSO 코드 없음');
    return res.redirect(`${FRONTEND_URL}/?login=failed`);
  }

  try {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', REDIRECT_URI);
    body.append('client_id', CLIENT_ID);
    body.append('client_secret', CLIENT_SECRET);

    const tokenRes = await axios.post(
      'https://auth.riotgames.com/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenRes.data;
    console.log('✅ [RSO DEBUG] access_token 발급 성공');

    const identity = await getRiotIdentityFromToken(access_token);
    if (!identity.puuid) throw new Error('RSO에서 puuid를 가져오지 못했습니다.');

    const region = resolveHenrikRegion(identity.country, null);

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

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { id: sessionId, userId: user.id, expiresAt },
    });

    res.cookie('infov_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: expiresAt,
      path: '/',
    });

    console.log('✅ [AUTH] 세션 쿠키 발급 완료');

    return res.redirect(`${FRONTEND_URL}/matches`);
  } catch (err) {
    console.error('❌ [RSO DEBUG] OAuth 에러:', err.response?.data || err.message);
    return res.redirect(`${FRONTEND_URL}/?login=failed`);
  }
});

// --------------------------------------------------
// 3️⃣ 프로필 정보 반환 (/api/auth/profile)
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
// --------------------------------------------------
router.post('/logout', async (req, res) => {
  const sessionId = req.cookies?.infov_session;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  res.clearCookie('infov_session', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  res.json({ ok: true });
});

// --------------------------------------------------
// ✅ 공통: Henrik /auth/matches 매핑을 함수로 빼서 재사용 (캐시 저장에도 사용)
// --------------------------------------------------
async function fetchHenrikMatchesMapped({ gameName, tagLine, regionFromUser, start = 0, size = 10 }) {
  // 1) Henrik account v2
  const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}`;

  console.log('🌐 [Henrik DEBUG] account v2 호출:', accountUrl);

  const accountRes = await axios.get(accountUrl, {
    headers: { Authorization: HENRIK_API_KEY },
  });

  const accountData = accountRes.data?.data;

  const region = resolveHenrikRegion(null, accountData?.region || regionFromUser);
  const henrikPuuid = accountData?.puuid || null;

  // 2) matches v4
  const matchesUrl = `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(
    accountData.name
  )}/${encodeURIComponent(accountData.tag)}`;

  console.log('🌐 [Henrik DEBUG] matches v4 호출:', matchesUrl);

  const matchesRes = await axios.get(matchesUrl, {
    headers: { Authorization: HENRIK_API_KEY },
    params: { size, start },
  });

  const rawMatches = matchesRes.data?.data || [];

  // ⬇⬇⬇ 너 기존 매핑 로직 그대로(필요 부분만 최소 수정)
  const mapped = rawMatches.map((m, idx) => {
    const meta = m.metadata || {};

    const playersRaw = m.players || {};
    let allPlayers = [];

    if (Array.isArray(playersRaw)) {
      allPlayers = playersRaw;
    } else if (Array.isArray(playersRaw.all)) {
      allPlayers = playersRaw.all;
    } else {
      const teamKeys = ['blue', 'red', 'other', 'neutral', 'defending', 'attacking'];
      teamKeys.forEach((key) => {
        const team = playersRaw[key];
        if (team && Array.isArray(team.players)) {
          allPlayers = allPlayers.concat(team.players);
        }
      });
    }

    let selfPlayer = null;
    if (henrikPuuid && allPlayers.length > 0) {
      selfPlayer = allPlayers.find((p) => p.puuid === henrikPuuid) || null;
    }
    if (!selfPlayer && allPlayers.length > 0) {
      selfPlayer =
        allPlayers.find((p) => p.name === accountData.name && p.tag === accountData.tag) || null;
    }
    if (!selfPlayer && allPlayers.length > 0) selfPlayer = allPlayers[0];

    const rawStatsSelf = selfPlayer?.stats || {};
    const coreSelf = rawStatsSelf.core || rawStatsSelf;

    const kills = coreSelf.kills ?? rawStatsSelf.kills ?? 0;
    const deaths = coreSelf.deaths ?? rawStatsSelf.deaths ?? 0;
    const assists = coreSelf.assists ?? rawStatsSelf.assists ?? 0;

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

    let headshots = coreSelf.headshots ?? rawStatsSelf.headshots ?? null;
    let bodyshots = coreSelf.bodyshots ?? rawStatsSelf.bodyshots ?? null;
    let legshots = coreSelf.legshots ?? rawStatsSelf.legshots ?? null;

    const shotsSelf = coreSelf.shots || rawStatsSelf.shots;
    if (shotsSelf) {
      if (headshots == null) headshots = shotsSelf.head ?? shotsSelf.headshots ?? null;
      if (bodyshots == null) bodyshots = shotsSelf.body ?? shotsSelf.bodyshots ?? null;
      if (legshots == null) legshots = shotsSelf.leg ?? shotsSelf.legshots ?? null;
    }

    const totalShotsSelf = (headshots || 0) + (bodyshots || 0) + (legshots || 0);
    const hsPercentSelf =
      totalShotsSelf > 0 ? Math.round(((headshots || 0) / totalShotsSelf) * 100) : null;

    const teams = m.teams || {};
    const teamIdRaw = (selfPlayer?.team || selfPlayer?.player_team || selfPlayer?.team_id || '').toLowerCase();

    let myTeamKey = null;
    if (teamIdRaw === 'blue' || teamIdRaw === 'red') myTeamKey = teamIdRaw;
    else if (teamIdRaw === 'defending' || teamIdRaw === 'defense') myTeamKey = 'defending';
    else if (teamIdRaw === 'attacking' || teamIdRaw === 'attack') myTeamKey = 'attacking';
    else myTeamKey = 'blue';

    let myTeam = teams[myTeamKey] || {};
    let enemyTeam = {};
    if (myTeamKey === 'blue') enemyTeam = teams.red || {};
    else if (myTeamKey === 'red') enemyTeam = teams.blue || {};
    else if (myTeamKey === 'defending') enemyTeam = teams.attacking || {};
    else if (myTeamKey === 'attacking') enemyTeam = teams.defending || {};

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

    let hasWonRaw = myTeam.has_won ?? myTeam.hasWon ?? myTeam.won ?? null;

    if (
      (roundsWon == null || roundsLost == null) &&
      Array.isArray(m.rounds) &&
      m.rounds.length > 0
    ) {
      let blueWins = 0;
      let redWins = 0;

      m.rounds.forEach((r) => {
        const winTeam = (r.winning_team || r.winningTeam || '').toLowerCase();
        if (winTeam === 'blue') blueWins += 1;
        else if (winTeam === 'red') redWins += 1;
      });

      const colorKey = teamIdRaw === 'blue' || teamIdRaw === 'red' ? teamIdRaw : 'blue';
      if (colorKey === 'blue') {
        roundsWon = blueWins;
        roundsLost = redWins;
      } else {
        roundsWon = redWins;
        roundsLost = blueWins;
      }
    }

    const hasWon =
      typeof hasWonRaw === 'boolean'
        ? hasWonRaw
        : typeof roundsWon === 'number' && typeof roundsLost === 'number'
        ? roundsWon > roundsLost
        : null;

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
      const roundsSelf = coreSelf.rounds_played ?? rawStatsSelf.rounds_played ?? totalRounds;
      acsSelf = roundsSelf && roundsSelf > 0 ? Math.round(score / roundsSelf) : Math.round(score);
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

    let adrSelf = null;
    if (totalDamageSelf != null) {
      const roundsSelf = coreSelf.rounds_played ?? rawStatsSelf.rounds_played ?? totalRounds;
      adrSelf = roundsSelf && roundsSelf > 0 ? Math.round(totalDamageSelf / roundsSelf) : Math.round(totalDamageSelf);
    }

    const assetsSelf = selfPlayer?.assets || {};
    const agentAssetsSelf = assetsSelf.agent || {};
    const agentNameSelf =
      selfPlayer?.character || selfPlayer?.agent?.name || selfPlayer?.agent || 'Unknown';

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
      const phsPercent = pTotal > 0 ? Math.round(((ph || 0) / pTotal) * 100) : null;

      const pAssets = p.assets || {};
      const pAgentAssets = pAssets.agent || {};
      const pAgentName = p.character || p.agent?.name || p.agent || 'Unknown';

      const pRounds = pc.rounds_played ?? ps.rounds_played ?? totalRounds;

      let pAcs = null;
      if (pscore != null) {
        pAcs = pRounds && pRounds > 0 ? Math.round(pscore / pRounds) : Math.round(pscore);
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
        team: (p.team || p.player_team || p.team_id || '').toLowerCase(),
        agent: pAgentName,
        agentIcon: pAgentAssets.small || pAgentAssets.bust || pAgentAssets.full || null,
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
      matchId: meta.matchid || meta.match_id || meta.id || meta.matchId || '',
      map: meta.map?.name || meta.map || 'Unknown Map',
      queue: meta.queue?.name || meta.mode || meta.queue || 'Mode',
      gameDate: gameDate || null,
      timeAgo: timeAgo || null,
      agent: agentNameSelf,
      agentIcon: agentAssetsSelf.small || agentAssetsSelf.bust || agentAssetsSelf.full || null,
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
      enemyTeam: myTeamKey === 'blue' ? 'red' : myTeamKey === 'red' ? 'blue' : null,
    };
  });

  return {
    accountData,
    region,
    mappedMatches: mapped,
  };
}

// --------------------------------------------------
// ✅ (추가) 7️⃣ 최신 전적을 DB 캐시에 저장 (/api/auth/sync-latest)
//     - 로그인한 본인 계정만 가능
// --------------------------------------------------
router.post('/sync-latest', requireAuth, async (req, res) => {
  const user = req.user;

  // 프론트에서 보내는 값(선택): { name, tag, region }
  const { name, tag, region } = req.body || {};

  // ✅ 본인 계정만 갱신(안전장치)
  if (
    (name && name !== user.gameName) ||
    (tag && tag !== user.tagLine) ||
    (region && String(region).toLowerCase() !== String(user.region || '').toLowerCase())
  ) {
    return res.status(403).json({
      error: 'You can only sync latest matches for the logged-in account.',
    });
  }

  try {
    // 1) matches(최신 10개) 가져오기
    const result = await fetchHenrikMatchesMapped({
      gameName: user.gameName,
      tagLine: user.tagLine,
      regionFromUser: user.region || 'ap',
      start: 0,
      size: 10,
    });

    // 2) 캐시 저장 (profile은 최소한만 넣어도 OK)
    const cachedProfile = {
      puuid: user.puuid,
      gameName: user.gameName,
      tagLine: user.tagLine,
      region: user.region,
      henrikRegion: result.region,
      accountLevel: result.accountData?.account_level ?? null,
      playerCardUrl:
        result.accountData?.card?.wide ||
        result.accountData?.card?.large ||
        result.accountData?.card?.small ||
        null,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: {
        cachedProfile,
        cachedMatches: result.mappedMatches,
        cacheUpdatedAt: new Date(),
      },
    });

    return res.json({
      ok: true,
      saved: {
        matches: result.mappedMatches.length,
      },
    });
  } catch (err) {
    console.error('❌ [CACHE] /auth/sync-latest 에러:', err.response?.data || err.message);
    const status =
      err.response?.status &&
      err.response.status >= 400 &&
      err.response.status < 600
        ? err.response.status
        : 500;

    return res.status(status).json({
      error: 'Failed to sync latest matches',
      detail: err.response?.data || err.message,
    });
  }
});

// --------------------------------------------------
// 5️⃣ Henrik 요약 스탯 (/api/auth/stats)
// --------------------------------------------------
router.get('/stats', requireAuth, async (req, res) => {
  // ✅ 너 기존 코드 그대로 (변경 없음)
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
    const accountUrl = `https://api.henrikdev.xyz/valorant/v2/account/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    console.log('🌐 [Henrik DEBUG] account v2 호출:', accountUrl);

    const accountRes = await axios.get(accountUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const acc = accountRes.data?.data;
    console.log('✅ [Henrik DEBUG] account v2 응답:', JSON.stringify(acc, null, 2));

    const region = resolveHenrikRegion(null, acc?.region || regionFromUser);

    const mmrUrl = `https://api.henrikdev.xyz/valorant/v3/mmr/${region}/pc/${encodeURIComponent(
      acc.name
    )}/${encodeURIComponent(acc.tag)}`;

    console.log('🌐 [Henrik DEBUG] mmr v3 호출:', mmrUrl);

    const mmrRes = await axios.get(mmrUrl, {
      headers: { Authorization: HENRIK_API_KEY },
    });

    const mmrData = mmrRes.data?.data || {};
    console.log('✅ [Henrik DEBUG] mmr v3 data:', JSON.stringify(mmrData, null, 2));

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

    const playerCardUrl = acc?.card?.wide || acc?.card?.large || acc?.card?.small || null;

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
      err.response?.status && err.response.status >= 400 && err.response.status < 600
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
  // ✅ 너 기존 코드 그대로 (변경 없음)
  const user = req.user;

  let { start, size } = req.query;

  start = Number(start);
  if (Number.isNaN(start) || start < 0) start = 0;

  size = Number(size);
  if (Number.isNaN(size) || size <= 0) size = 10;
  if (size > 10) size = 10;

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
    const result = await fetchHenrikMatchesMapped({
      gameName,
      tagLine,
      regionFromUser,
      start,
      size,
    });

    return res.json(result.mappedMatches);
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
