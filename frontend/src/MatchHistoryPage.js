// 📁 src/MatchHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Render 백엔드 주소
const API_BASE_URL = 'https://infov.onrender.com';

// 🔢 티어 이름 → 번호 매핑 (아이언1=3 ... 레디언트=27)
const TIER_NAME_MAP = {
  iron1: 3,
  iron2: 4,
  iron3: 5,
  bronze1: 6,
  bronze2: 7,
  bronze3: 8,
  silver1: 9,
  silver2: 10,
  silver3: 11,
  gold1: 12,
  gold2: 13,
  gold3: 14,
  platinum1: 15,
  platinum2: 16,
  platinum3: 17,
  diamond1: 18,
  diamond2: 19,
  diamond3: 20,
  ascendant1: 21,
  ascendant2: 22,
  ascendant3: 23,
  immortal1: 24,
  immortal2: 25,
  immortal3: 26,
  radiant: 27,
};

function tierNameToNumber(tierName) {
  if (!tierName) return null;
  const key = tierName.toLowerCase().replace(/\s+/g, '');
  return TIER_NAME_MAP[key] || null;
}

// ⭐ 영어 티어 이름 → 한국어 변환
function toKoreanTierName(tierName) {
  if (!tierName || typeof tierName !== 'string') return tierName;

  const raw = tierName.trim();
  const lower = raw.toLowerCase();

  // 예: "Iron 3", "diamond2", "ASCENDANT 1" 등
  const match = lower.match(
    /(iron|bronze|silver|gold|platinum|diamond|ascendant|immortal|radiant)\s*(\d)?/
  );

  if (!match) return tierName; // 예외적인 포맷은 원문 그대로

  const baseEn = match[1];
  const num = match[2] || '';

  const baseKoMap = {
    iron: '아이언',
    bronze: '브론즈',
    silver: '실버',
    gold: '골드',
    platinum: '플래티넘',
    diamond: '다이아몬드',
    ascendant: '초월자', // 요청대로 초월자
    immortal: '불멸',
    radiant: '레디언트',
  };

  const baseKo = baseKoMap[baseEn] || baseEn;

  return num ? `${baseKo} ${num}` : baseKo;
}

// 🔹 티어 변화 라인 그래프 컴포넌트
function TierChart({ data }) {
  if (!data || data.length === 0) return null;

  const widthPerPoint = 60;
  const height = 120;
  const paddingX = 20;
  const paddingY = 20;
  const width =
    paddingX * 2 + (data.length > 1 ? (data.length - 1) * widthPerPoint : 0);

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, idx) => {
    const x = paddingX + idx * widthPerPoint;
    const norm = (d.value - minVal) / range; // 0~1
    const y =
      height - paddingY - norm * (height - paddingY * 2); // 위가 높은 티어
    return { x, y };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={width} height={height} style={styles.tierChartSvg}>
      {/* 라인 */}
      <polyline
        points={polyPoints}
        fill="none"
        stroke="#4CAF50"
        strokeWidth="2"
      />
      {/* 점 + 시즌 텍스트 */}
      {points.map((p, idx) => {
        const item = data[idx];
        const seasonLabel =
          typeof item.season === 'string'
            ? item.season.length > 8
              ? item.season.slice(-8)
              : item.season
            : `S${idx + 1}`;

        const tierLabel =
          typeof item.tier === 'string'
            ? toKoreanTierName(item.tier)
            : '';

        return (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" />
            {/* 티어 텍스트 (점 위) */}
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#ffffff"
            >
              {tierLabel}
            </text>
            {/* 시즌 텍스트 (아래 축) */}
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#999999"
            >
              {seasonLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MatchHistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [queueFilter, setQueueFilter] = useState('all');

  // 🔥 클릭된 경기(스코어보드 모달용)
  const [selectedMatch, setSelectedMatch] = useState(null);

  // 🔥 티어 그래프 토글
  const [showTierChart, setShowTierChart] = useState(false);

  // ⭐ 에이전트 이름을 파일명 규칙에 맞게 자동 변환하는 함수
  const getAgentImageSrc = (agent) => {
    const defaultSrc = '/agents/default.png';

    if (!agent) return defaultSrc;

    let agentName = agent;
    if (typeof agent === 'object') {
      agentName =
        agent.displayName ||
        agent.name ||
        agent.id ||
        '';
    }

    if (typeof agentName !== 'string' || agentName.length === 0) {
      return defaultSrc;
    }

    const normalized = agentName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    return normalized ? `/agents/${normalized}.png` : defaultSrc;
  };

  // ⭐ 티어 이미지 (아이언1~레디언트) 경로
  const getTierImageSrc = (tierNumber, tierName) => {
    if (!tierNumber && !tierName) return null;

    let num = tierNumber;

    if (!num && tierName) {
      num = tierNameToNumber(tierName);
    }

    if (!num) return null;
    return `/tiers/${num}.png`; // public/tiers/3.png 이런 식
  };

  // ⭐ 플레이어 카드 이미지 (현재는 기본값만 사용)
  const getPlayerCardSrc = () => {
    if (summary && summary.playerCardUrl) {
      return summary.playerCardUrl;
    }
    return '/playercards/default.png';
  };

  // ⭐ 큐 이름을 영어 키로 정규화 (필터용)
  const normalizeQueueKey = (q) => {
    if (!q) return 'other';
    const s = String(q).toLowerCase();

    if (s.includes('competitive') || s.includes('rank')) return 'competitive';
    if (s.includes('unrated') || s.includes('normal')) return 'unrated';
    if (s.includes('swift') || s.includes('swiftplay')) return 'swiftplay';
    if (s.includes('spike') || s.includes('spikerush')) return 'spikerush';
    if (s.includes('deathmatch') && s.includes('team')) return 'team_deathmatch';
    if (s.includes('deathmatch')) return 'deathmatch';
    if (s.includes('escalation')) return 'escalation';
    if (s.includes('swiftplay')) return 'swiftplay';
    if (s.includes('snowball') || s.includes('sheep')) return 'snowball';
    if (s.includes('custom')) return 'custom';
    if (s.includes('brawl') || s.includes('mayhem') || s.includes('swiftpush'))
      return 'brawl';

    return 'other';
  };

  // ⭐ 큐 이름을 한국어로 표시
  const getQueueDisplayName = (match) => {
    const q = match.queue || match.mode;
    const key = normalizeQueueKey(q);

    switch (key) {
      case 'competitive':
        return '경쟁전';
      case 'unrated':
        return '일반';
      case 'swiftplay':
        return '신속';
      case 'spikerush':
        return '스파이크 돌격';
      case 'custom':
        return '사설';
      case 'deathmatch':
        return '데스매치';
      case 'team_deathmatch':
        return '팀 데스매치';
      case 'brawl':
        return '난투';
      case 'escalation':
        return '에스컬레이션';
      default:
        return typeof q === 'string' ? q : '기타 모드';
    }
  };

  // ⭐ 필터에 맞는 전적만 추리기
  const getFilteredMatches = () => {
    if (queueFilter === 'all') return matches;

    return matches.filter((m) => {
      const key = normalizeQueueKey(m.queue || m.mode);
      return key === queueFilter;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('riot_access_token');

    if (!token) {
      setHasToken(false);
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    setHasToken(true);

    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);

        // 1) 프로필
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          throw new Error(
            `프로필 정보를 불러오지 못했습니다. (status ${profileRes.status})`
          );
        }

        const profileData = await profileRes.json();
        console.log('[DEBUG] profileData:', profileData);
        setProfile(profileData);

        // 2) Henrik 요약 스탯
        try {
          const statsRes = await fetch(`${API_BASE_URL}/api/auth/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            console.log('[DEBUG] statsData:', statsData);
            setSummary(statsData);
          }
        } catch (e) {
          console.error('Stats API 오류:', e);
        }

        // 3) 전적
        const matchesRes = await fetch(`${API_BASE_URL}/api/auth/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!matchesRes.ok) {
          throw new Error(
            `전적 정보를 불러오지 못했습니다. (status ${matchesRes.status})`
          );
        }

        const matchesData = await matchesRes.json();
        console.log('[DEBUG] matchesData:', matchesData);

        setMatches(
          Array.isArray(matchesData) ? matchesData : matchesData.matches || []
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('riot_access_token');
    navigate('/');
  };

  const getDisplayName = (p) => {
    if (!p) return '';
    if (p.gameName && p.tagLine) return `${p.gameName}#${p.tagLine}`;
    return p.gameName || '';
  };

  const getMapName = (match) => {
    const m = match.map;
    if (!m) return 'Unknown Map';
    if (typeof m === 'string') return m;
    if (m.name) return m.name;
    return 'Unknown Map';
  };

  const getQueueName = (match) => {
    return getQueueDisplayName(match);
  };

  const filteredMatches = getFilteredMatches();

  // 📊 최근 전적 기준 요약 스탯(평균 HS, 평균 KD, 평균 ACS)
  let avgStats = null;
  if (matches && matches.length > 0) {
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAcs = 0;
    let countAcs = 0;
    let totalHs = 0;
    let countHs = 0;

    matches.forEach((m) => {
      const k = m.kills ?? 0;
      const d = m.deaths ?? 0;
      totalKills += k;
      totalDeaths += d;

      if (m.acs != null) {
        totalAcs += m.acs;
        countAcs += 1;
      }
      if (m.hsPercent != null) {
        totalHs += m.hsPercent;
        countHs += 1;
      }
    });

    const avgKd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
    const avgAcs = countAcs > 0 ? totalAcs / countAcs : null;
    const avgHs = countHs > 0 ? totalHs / countHs : null;

    avgStats = { avgKd, avgAcs, avgHs };
  }

  // 📈 시즌 히스토리 → 티어 그래프용 데이터
  let tierChartData = [];
  if (summary?.seasonHistory && summary.seasonHistory.length > 0) {
    // backend에서 최신 → 과거 순이라, 다시 뒤집어서 오래된 시즌 → 최신 시즌 순으로
    const chronological = [...summary.seasonHistory].reverse();
    const lastSix = chronological.slice(-6); // 최근 6시즌만

    tierChartData = lastSix
      .map((s) => {
        const value = tierNameToNumber(s.tier);
        if (!value) return null;
        return {
          season: s.season,
          tier: s.tier,
          value,
        };
      })
      .filter(Boolean);
  }

  // 🔥 경기 카드 클릭 시 스코어보드 모달 열기
  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseModal = () => {
    setSelectedMatch(null);
  };

  // 🔥 모달 내부에서 팀 분리
  const getModalTeams = (match) => {
    if (!match || !Array.isArray(match.players)) {
      return { allies: [], enemies: [] };
    }
    const myTeam = match.myTeam || 'blue';
    const enemyTeam = match.enemyTeam || (myTeam === 'blue' ? 'red' : 'blue');

    const allies = match.players.filter((p) => p.team === myTeam);
    const enemies = match.players.filter((p) => p.team === enemyTeam);

    return { allies, enemies, myTeam, enemyTeam };
  };

  const renderScoreboardModal = () => {
    if (!selectedMatch) return null;

    const { allies, enemies } = getModalTeams(selectedMatch);

    return (
      <div style={styles.modalOverlay} onClick={handleCloseModal}>
        <div
          style={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div style={styles.modalHeader}>
            <div>
              <div style={styles.modalTitleRow}>
                <span style={styles.modalMapName}>
                  {getMapName(selectedMatch)}
                </span>
                <span style={styles.modalQueueName}>
                  · {getQueueName(selectedMatch)}
                </span>
              </div>
              <div style={styles.modalSubText}>
                {selectedMatch.timeAgo}
              </div>
            </div>

            <div style={styles.modalScoreBox}>
              <span style={styles.modalScoreText}>
                {selectedMatch.teamScore ?? '-'} :{' '}
                {selectedMatch.enemyScore ?? '-'}
              </span>
              {selectedMatch.win != null && (
                <span
                  style={{
                    ...styles.modalResultBadge,
                    backgroundColor: selectedMatch.win ? '#1b5e20' : '#b71c1c',
                  }}
                >
                  {selectedMatch.win ? 'WIN' : 'LOSS'}
                </span>
              )}
              <button
                style={styles.modalCloseButton}
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
          </div>

          {/* 두 팀 스코어보드 */}
          <div style={styles.scoreboardWrapper}>
            {/* 아군 팀 */}
            <div style={styles.teamColumn}>
              <div style={styles.teamHeader}>
                <span style={styles.teamTitle}>우리 팀</span>
              </div>
              <div style={styles.tableHeaderRow}>
                <span style={styles.thPlayer}>플레이어</span>
                <span style={styles.thTier}>티어</span>
                <span style={styles.thAgent}>요원</span>
                <span style={styles.thStat}>K / D / A</span>
                <span style={styles.thStat}>K/D</span>
                <span style={styles.thStat}>ACS</span>
                <span style={styles.thStat}>HS%</span>
              </div>
              {allies.map((p, idx) => {
                const k = p.kills ?? 0;
                const d = p.deaths ?? 0;
                const a = p.assists ?? 0;
                const kd = d > 0 ? (k / d).toFixed(2) : k;

                const isSelf = !!p.isSelf;

                return (
                  <div
                    key={`${p.puuid || p.name || 'ally'}-${idx}`}
                    style={{
                      ...styles.tableRow,
                      backgroundColor: isSelf
                        ? 'rgba(76, 175, 80, 0.12)'
                        : 'transparent',
                    }}
                  >
                    <span style={styles.tdPlayer}>
                      <span style={styles.playerNameText}>{p.name}</span>
                      {p.tag && (
                        <span style={styles.playerTagText}>#{p.tag}</span>
                      )}
                    </span>

                    {/* 🔥 경기 당시 티어 이미지 */}
                    <span style={styles.tdTier}>
                      {p.tierNumber || p.tierName ? (
                        <img
                          src={getTierImageSrc(p.tierNumber, p.tierName)}
                          alt={
                            p.tierName
                              ? toKoreanTierName(p.tierName)
                              : '티어'
                          }
                          style={styles.tierIcon}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </span>

                    <span style={styles.tdAgent}>
                      <img
                        src={
                          p.agentIcon ||
                          getAgentImageSrc(p.agent || null)
                        }
                        alt={p.agent || 'agent'}
                        style={styles.modalAgentImg}
                        onError={(e) => {
                          if (e.currentTarget.dataset.errorHandled === '1') {
                            e.currentTarget.style.display = 'none';
                            return;
                          }
                          e.currentTarget.dataset.errorHandled = '1';
                          e.currentTarget.src = '/agents/default.png';
                        }}
                      />
                      <span style={styles.agentNameText}>{p.agent}</span>
                    </span>
                    <span style={styles.tdStat}>
                      {k} / {d} / {a}
                    </span>
                    <span
                      style={{
                        ...styles.tdStat,
                        color: kd >= 1 ? '#4CAF50' : '#F44336',
                      }}
                    >
                      {kd}
                    </span>
                    <span style={styles.tdStat}>
                      {p.acs != null ? p.acs : '-'}
                    </span>
                    <span style={styles.tdStat}>
                      {p.hsPercent != null ? `${p.hsPercent}%` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 상대 팀 */}
            <div style={styles.teamColumn}>
              <div style={styles.teamHeader}>
                <span style={styles.teamTitle}>상대 팀</span>
              </div>
              <div style={styles.tableHeaderRow}>
                <span style={styles.thPlayer}>플레이어</span>
                <span style={styles.thTier}>티어</span>
                <span style={styles.thAgent}>요원</span>
                <span style={styles.thStat}>K / D / A</span>
                <span style={styles.thStat}>K/D</span>
                <span style={styles.thStat}>ACS</span>
                <span style={styles.thStat}>HS%</span>
              </div>
              {enemies.map((p, idx) => {
                const k = p.kills ?? 0;
                const d = p.deaths ?? 0;
                const a = p.assists ?? 0;
                const kd = d > 0 ? (k / d).toFixed(2) : k;

                return (
                  <div
                    key={`${p.puuid || p.name || 'enemy'}-${idx}`}
                    style={styles.tableRow}
                  >
                    <span style={styles.tdPlayer}>
                      <span style={styles.playerNameText}>{p.name}</span>
                      {p.tag && (
                        <span style={styles.playerTagText}>#{p.tag}</span>
                      )}
                    </span>

                    {/* 🔥 상대 팀 티어 이미지 */}
                    <span style={styles.tdTier}>
                      {p.tierNumber || p.tierName ? (
                        <img
                          src={getTierImageSrc(p.tierNumber, p.tierName)}
                          alt={
                            p.tierName
                              ? toKoreanTierName(p.tierName)
                              : '티어'
                          }
                          style={styles.tierIcon}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </span>

                    <span style={styles.tdAgent}>
                      <img
                        src={
                          p.agentIcon ||
                          getAgentImageSrc(p.agent || null)
                        }
                        alt={p.agent || 'agent'}
                        style={styles.modalAgentImg}
                        onError={(e) => {
                          if (e.currentTarget.dataset.errorHandled === '1') {
                            e.currentTarget.style.display = 'none';
                            return;
                          }
                          e.currentTarget.dataset.errorHandled = '1';
                          e.currentTarget.src = '/agents/default.png';
                        }}
                      />
                      <span style={styles.agentNameText}>{p.agent}</span>
                    </span>
                    <span style={styles.tdStat}>
                      {k} / {d} / {a}
                    </span>
                    <span
                      style={{
                        ...styles.tdStat,
                        color: kd >= 1 ? '#4CAF50' : '#F44336',
                      }}
                    >
                      {kd}
                    </span>
                    <span style={styles.tdStat}>
                      {p.acs != null ? p.acs : '-'}
                    </span>
                    <span style={styles.tdStat}>
                      {p.hsPercent != null ? `${p.hsPercent}%` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 네비게이션 */}
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            onClick={() => navigate('/')}
          />
        </div>

        <div style={styles.center}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>
            요원
          </span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>
            맵 로테이션
          </span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>
            스킨
          </span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>
            랭킹
          </span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>
            E-Sports
          </span>
        </div>

        <div style={styles.right}>
          {profile ? (
            <div style={styles.profileBoxTopRight}>
              <span style={styles.profileNameTopRight}>
                {getDisplayName(profile)}
              </span>
              <button style={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button style={styles.loginButton} onClick={() => navigate('/')}>
              로그인
            </button>
          )}
        </div>
      </nav>

      {/* 본문 */}
      <div style={styles.content}>
        {loading && <p style={styles.message}>불러오는 중입니다...</p>}

        {!loading && error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
            {!hasToken && (
              <button
                style={styles.primaryButton}
                onClick={() => navigate('/')}
              >
                로그인 하러 가기
              </button>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 상단 프로필 카드 */}
            {profile && (
              <div style={styles.profileCard}>
                {/* 왼쪽: 플레이어 카드 동그라미 + 레벨 박스 */}
                <div style={styles.profileLeft}>
                  <div style={styles.avatarWrapper}>
                    <img
                      src={getPlayerCardSrc()}
                      alt="Player Card"
                      style={styles.playerCardImage}
                      onError={(e) => {
                        if (e.currentTarget.dataset.errorHandled === '1') {
                          return;
                        }
                        e.currentTarget.dataset.errorHandled = '1';
                        e.currentTarget.src = '/playercards/default.png';
                      }}
                    />
                    <div style={styles.profileImageRing} />
                  </div>
                  <div style={styles.levelBadgeWrapper}>
                    <div style={styles.levelBadge}>
                      <span style={styles.levelLabel}>LEVEL</span>
                      <span style={styles.levelValue}>
                        {summary?.accountLevel ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 닉네임/태그 + 현재 티어, 평균값, 티어 그래프 버튼 */}
                <div style={styles.profileRight}>
                  <div style={styles.nameCard}>
                    <div style={styles.nameRow}>
                      <span style={styles.nicknameText}>
                        {profile.gameName}
                      </span>
                      {profile.tagLine && (
                        <span style={styles.tagText}>#{profile.tagLine}</span>
                      )}
                    </div>
                    {summary && (
                      <>
                        <div style={styles.tierRow}>
                          <span style={styles.tierText}>
                            {summary.currentTier
                              ? toKoreanTierName(summary.currentTier)
                              : '티어 정보 없음'}
                          </span>
                          {typeof summary.rr === 'number' && (
                            <span style={styles.rrText}>{summary.rr} RR</span>
                          )}

                          {typeof summary.winRate === 'number' && (
                            <span style={styles.winrateText}>
                              · 시즌 전적 {summary.wins ?? '-'}승{' '}
                              {summary.losses ?? '-'}패 ({summary.winRate}%)
                            </span>
                          )}
                        </div>

                        {/* 🔥 평균 HS / KD / ACS 요약 */}
                        {avgStats && (
                          <div style={styles.overallStatsRow}>
                            <div style={styles.overallStatItem}>
                              <span style={styles.overallStatLabel}>
                                평균 HS
                              </span>
                              <span style={styles.overallStatValue}>
                                {avgStats.avgHs != null
                                  ? `${avgStats.avgHs.toFixed(1)}%`
                                  : '-'}
                              </span>
                            </div>
                            <div style={styles.overallStatItem}>
                              <span style={styles.overallStatLabel}>
                                평균 K/D
                              </span>
                              <span style={styles.overallStatValue}>
                                {avgStats.avgKd != null
                                  ? avgStats.avgKd.toFixed(2)
                                  : '-'}
                              </span>
                            </div>
                            <div style={styles.overallStatItem}>
                              <span style={styles.overallStatLabel}>
                                평균 ACS
                              </span>
                              <span style={styles.overallStatValue}>
                                {avgStats.avgAcs != null
                                  ? Math.round(avgStats.avgAcs)
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 🔘 티어 자세히 보기 버튼 */}
                        <button
                          type="button"
                          style={styles.tierDetailButton}
                          onClick={() =>
                            setShowTierChart((prev) => !prev)
                          }
                        >
                          티어 자세히 보기 {showTierChart ? '▲' : '▼'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* 🔥 티어 그래프 (토글) */}
                  {showTierChart && (
                    <div style={styles.tierChartCard}>
                      {tierChartData.length > 0 ? (
                        <TierChart data={tierChartData} />
                      ) : (
                        <div style={styles.tierChartEmptyText}>
                          티어 기록이 부족합니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 전적 헤더 + 필터 */}
            <div style={styles.matchesHeaderRow}>
              <h3 style={styles.sectionTitle}>최근 경기 전적</h3>

              <div style={styles.filterWrapper}>
                <label style={styles.filterLabel}>모드 선택</label>
                <select
                  style={styles.filterSelect}
                  value={queueFilter}
                  onChange={(e) => setQueueFilter(e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="competitive">경쟁전</option>
                  <option value="unrated">일반</option>
                  <option value="swiftplay">신속</option>
                  <option value="spikerush">스파이크 돌격</option>
                  <option value="custom">사설</option>
                  <option value="deathmatch">데스매치</option>
                  <option value="team_deathmatch">팀 데스매치</option>
                  <option value="brawl">난투</option>
                  <option value="escalation">에스컬레이션</option>
                </select>
              </div>
            </div>

            {/* 전적 리스트 */}
            {filteredMatches.length === 0 ? (
              <p style={styles.message}>해당 모드 전적이 없습니다.</p>
            ) : (
              <div style={styles.matchList}>
                {filteredMatches.map((match) => {
                  const k = match.kills ?? 0;
                  const d = match.deaths ?? 0;
                  const a = match.assists ?? 0;

                  const kd = d > 0 ? (k / d).toFixed(2) : k;

                  const scoreText =
                    match.teamScore !== undefined &&
                    match.teamScore !== null &&
                    match.enemyScore !== undefined &&
                    match.enemyScore !== null
                      ? `${match.teamScore} : ${match.enemyScore}`
                      : match.win === true
                      ? '승리'
                      : match.win === false
                      ? '패배'
                      : '-';

                  const isWin =
                    match.win !== undefined && match.win !== null
                      ? match.win
                      : typeof match.teamScore === 'number' &&
                        typeof match.enemyScore === 'number'
                      ? match.teamScore > match.enemyScore
                      : false;

                  return (
                    <div
                      key={match.matchId}
                      style={{
                        ...styles.matchRowCard,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleMatchClick(match)}
                    >
                      <div style={styles.matchLeft}>
                        <img
                          src={getAgentImageSrc(match.agent)}
                          alt={match.agent}
                          style={styles.agentImage}
                          onError={(e) => {
                            if (e.currentTarget.dataset.errorHandled === '1') {
                              e.currentTarget.style.display = 'none';
                              return;
                            }
                            e.currentTarget.dataset.errorHandled = '1';
                            e.currentTarget.src = '/agents/default.png';
                          }}
                        />

                        <div style={styles.matchLeftText}>
                          <div style={styles.mapName}>
                            {getMapName(match)}
                          </div>
                          <div style={styles.queueText}>
                            {getQueueName(match)} · {match.timeAgo}
                          </div>

                          <div style={styles.scoreBox}>
                            <span
                              style={{
                                ...styles.scoreText,
                                color: isWin ? '#4CAF50' : '#F44336',
                              }}
                            >
                              {scoreText}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={styles.statsRow}>
                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>K / D / A</span>
                          <span style={styles.statValue}>
                            {k} / {d} / {a}
                          </span>
                        </div>

                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>K/D</span>
                          <span
                            style={{
                              ...styles.statValue,
                              color: kd >= 1 ? '#4CAF50' : '#F44336',
                            }}
                          >
                            {kd}
                          </span>
                        </div>

                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>ACS</span>
                          <span style={styles.statValue}>
                            {match.acs ?? '-'}
                          </span>
                        </div>

                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>ADR</span>
                          <span style={styles.statValue}>
                            {match.adr ?? '-'}
                          </span>
                        </div>

                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>HS%</span>
                          <span style={styles.statValue}>
                            {match.hsPercent != null
                              ? `${match.hsPercent}%`
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 🔥 경기 상세 스코어보드 모달 */}
      {renderScoreboardModal()}
    </div>
  );
}

/* ====================== 스타일 ====================== */
const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#eee',
    paddingTop: '72px',
    fontFamily: 'Black Han Sans, sans-serif',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #333',
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '72px',
    zIndex: 1000,
  },
  left: { flex: 1 },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    alignItems: 'center',
  },
  logoImage: {
    height: '200px',
    marginTop: '-8px',
    cursor: 'pointer',
  },
  navItem: {
    fontSize: '18px',
    color: '#DDD',
    cursor: 'pointer',
  },

  content: {
    padding: '100px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  message: {
    textAlign: 'center',
    color: '#bbb',
  },
  errorBox: {
    backgroundColor: '#2b1b1b',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #ff4d4f',
    textAlign: 'center',
  },
  errorText: { color: '#ff8888' },

  /* 우측 상단 간단 프로필 */
  profileBoxTopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  profileNameTopRight: {
    fontSize: '14px',
    color: '#eee',
  },

  /* 상단 프로필 카드 */
  profileCard: {
    backgroundColor: '#181818',
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '24px',
    border: '1px solid #333',
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  profileLeft: {
    width: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 0 12px rgba(0,0,0,0.8)',
  },
  playerCardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profileImageRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.08)',
    pointerEvents: 'none',
  },
  levelBadgeWrapper: {
    marginTop: '4px',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  levelLabel: {
    fontSize: '11px',
    letterSpacing: '0.05em',
    color: '#aaa',
  },
  levelValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },

  profileRight: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
  },
  nameCard: {
    backgroundColor: '#151515',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #303030',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginBottom: '4px',
  },
  nicknameText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
  },
  tagText: {
    fontSize: '14px',
    color: '#888',
  },
  tierRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    fontSize: '13px',
    marginBottom: '6px',
  },
  tierText: {
    color: '#f5f5f5',
  },
  rrText: {
    color: '#d0d0ff',
  },
  winrateText: {
    color: '#9fd39f',
  },

  /* 🔥 상단 평균 스탯 */
  overallStatsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '6px',
  },
  overallStatItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    fontSize: '12px',
  },
  overallStatLabel: {
    color: '#aaaaaa',
  },
  overallStatValue: {
    color: '#ffffff',
    fontWeight: 600,
  },

  tierDetailButton: {
    marginTop: '8px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #444',
    backgroundColor: 'transparent',
    color: '#ddd',
    fontSize: '11px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },

  /* 🔥 티어 그래프 카드 */
  tierChartCard: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#151515',
    border: '1px solid #303030',
  },
  tierChartEmptyText: {
    fontSize: '12px',
    color: '#999',
  },
  tierChartSvg: {
    display: 'block',
  },

  /* 전적 헤더 + 필터 */
  matchesHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '20px',
    margin: 0,
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#aaa',
  },
  filterSelect: {
    backgroundColor: '#181818',
    color: '#eee',
    borderRadius: '999px',
    border: '1px solid #444',
    padding: '4px 10px',
    fontSize: '13px',
    outline: 'none',
  },

  /* 매치 카드 */
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  matchRowCard: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #303030',
    alignItems: 'center',
  },
  matchLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  agentImage: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  matchLeftText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mapName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  queueText: {
    fontSize: '12px',
    color: '#999',
  },
  scoreBox: {
    marginTop: '2px',
  },
  scoreText: {
    fontSize: '14px',
    fontWeight: '600',
  },

  /* 스탯 */
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '60px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#777',
  },
  statValue: {
    fontSize: '13px',
    color: '#fff',
  },

  /* 버튼 */
  loginButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    border: '1px solid #555',
    color: '#eee',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    border: '1px solid #555',
    color: '#eee',
    cursor: 'pointer',
  },

  /* 🔥 모달 스타일 */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    width: '90%',
    maxWidth: '1100px',
    maxHeight: '80vh',
    backgroundColor: '#161616',
    borderRadius: '16px',
    border: '1px solid #333',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  modalTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  modalMapName: {
    fontSize: '18px',
    fontWeight: 700,
  },
  modalQueueName: {
    fontSize: '14px',
    color: '#aaa',
  },
  modalSubText: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#888',
  },
  modalScoreBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modalScoreText: {
    fontSize: '18px',
    fontWeight: 700,
  },
  modalResultBadge: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '999px',
    color: '#fff',
  },
  modalCloseButton: {
    marginLeft: '8px',
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: '18px',
    cursor: 'pointer',
  },

  scoreboardWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    overflow: 'auto',
    paddingTop: '4px',
  },
  teamColumn: {
    backgroundColor: '#151515',
    borderRadius: '12px',
    border: '1px solid #303030',
    padding: '10px',
  },
  teamHeader: {
    marginBottom: '6px',
  },
  teamTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  tableHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 0.7fr 1.4fr 1.2fr 0.8fr 0.9fr 0.9fr',
    //    플레이어 티어  요원  KDA  KD  ACS HS
    fontSize: '11px',
    color: '#999',
    borderBottom: '1px solid #333',
    paddingBottom: '4px',
    marginBottom: '4px',
  },
  thPlayer: { textAlign: 'left' },
  thTier: { textAlign: 'center' },
  thAgent: { textAlign: 'left' },
  thStat: { textAlign: 'right' },

  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 0.7fr 1.4fr 1.2fr 0.8fr 0.9fr 0.9fr',
    fontSize: '12px',
    padding: '4px 0',
    alignItems: 'center',
  },
  tdPlayer: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  tdTier: {
    textAlign: 'center',
  },
  tdAgent: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  tdStat: {
    textAlign: 'right',
  },
  tierIcon: {
    width: 26,
    height: 26,
    objectFit: 'contain',
  },
  playerNameText: {
    fontWeight: 500,
  },
  playerTagText: {
    fontSize: '10px',
    color: '#888',
  },
  modalAgentImg: {
    width: '22px',
    height: '22px',
    borderRadius: '3px',
    objectFit: 'cover',
  },
  agentNameText: {
    fontSize: '11px',
    color: '#ddd',
  },
};

export default MatchHistoryPage;
