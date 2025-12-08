// 📁 src/MatchHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Render 백엔드 주소
const API_BASE_URL = 'https://infov.onrender.com';

function MatchHistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [queueFilter, setQueueFilter] = useState('all');

  // ⭐ 에이전트 이름을 파일명 규칙에 맞게 자동 변환하는 함수
  const getAgentImageSrc = (agent) => {
    const defaultSrc = '/agents/default.png';

    if (!agent) return defaultSrc;

    // agent가 객체로 올 수도 있음 (예: { name: 'Omen', id: 'omen' ... })
    let agentName = agent;

    if (typeof agent === 'object') {
      agentName =
        agent.displayName ||
        agent.name ||
        agent.id ||
        ''; // 그래도 없으면 빈 문자열
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

  // ⭐ 플레이어 카드 이미지 (현재는 기본값만 사용)
  const getPlayerCardSrc = () => {
    // 나중에 summary.playerCardUrl 이 생기면 그걸 우선 사용
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
    if (s.includes('brawl') || s.includes('mayhem') || s.includes('swiftpush')) return 'brawl';

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
          Array.isArray(matchesData)
            ? matchesData
            : matchesData.matches || []
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
          <span style={styles.navItem} onClick={() => navigate('/matches')}>
            전적
          </span>
        </div>

        <div style={styles.right}>
          {profile ? (
            <div style={styles.profileBoxTopRight}>
              <span style={styles.profileNameTopRight}>
                {getDisplayName(profile)}
              </span>
              <button
                style={styles.logoutButton}
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              style={styles.loginButton}
              onClick={() => navigate('/')}
            >
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

                {/* 오른쪽: 닉네임/태그 + 현재 티어/승률 + 시즌 히스토리 */}
                <div style={styles.profileRight}>
                  {/* 닉네임 박스 */}
                  <div style={styles.nameCard}>
                    <div style={styles.nameRow}>
                      <span style={styles.nicknameText}>
                        {profile.gameName}
                      </span>
                      {profile.tagLine && (
                        <span style={styles.tagText}>
                          #{profile.tagLine}
                        </span>
                      )}
                    </div>
                    {summary && (
                      <div style={styles.tierRow}>
                        <span style={styles.tierText}>
                          {summary.currentTier
                            ? summary.currentTier
                            : '티어 정보 없음'}
                        </span>
                        {typeof summary.rr === 'number' && (
                          <span style={styles.rrText}>
                            {summary.rr} RR
                          </span>
                        )}

                        {typeof summary.winRate === 'number' && (
                          <span style={styles.winrateText}>
                            · 시즌 전적 {summary.wins ?? '-'}승{' '}
                            {summary.losses ?? '-'}패 (
                            {summary.winRate}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 시즌 히스토리 박스들 */}
                  {summary?.seasonHistory && summary.seasonHistory.length > 0 && (
                    <div style={styles.seasonHistoryWrapper}>
                      {summary.seasonHistory.map((s, idx) => (
                        <div key={`${s.season}-${idx}`} style={styles.seasonBox}>
                          <div style={styles.seasonName}>
                            {s.season}
                          </div>
                          <div style={styles.seasonTier}>
                            {s.tier}
                          </div>
                        </div>
                      ))}
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
                    <div key={match.matchId} style={styles.matchRowCard}>
                      <div style={styles.matchLeft}>
                        <img
                          src={getAgentImageSrc(match.agent)}
                          alt={match.agent}
                          style={styles.agentImage}
                          onError={(e) => {
                            if (
                              e.currentTarget.dataset.errorHandled === '1'
                            ) {
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
                            {match.hsPercent ? `${match.hsPercent}%` : '-'}
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

  /* 상단 프로필 카드를 좀 더 멋지게 */
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

  /* 시즌 히스토리 */
  seasonHistoryWrapper: {
    marginTop: '4px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  seasonBox: {
    padding: '6px 10px',
    borderRadius: '10px',
    backgroundColor: '#151515',
    border: '1px solid #2d2d2d',
    minWidth: '120px',
    maxWidth: '160px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  seasonName: {
    fontSize: '12px',
    color: '#999',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  seasonTier: {
    fontSize: '13px',
    color: '#fff',
    fontWeight: 600,
    wordBreak: 'keep-all',
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
};

export default MatchHistoryPage;
