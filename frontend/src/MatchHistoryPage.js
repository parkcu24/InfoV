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

  // ⭐ 플레이어 카드 이미지 경로 계산
  const getPlayerCardSrc = (profileObj, summaryObj) => {
    const defaultSrc = '/playercards/default.png';
    if (!profileObj && !summaryObj) return defaultSrc;

    const cardId =
      profileObj?.cardId ||
      profileObj?.card ||
      summaryObj?.cardId ||
      null;

    if (!cardId) return defaultSrc;

    // 카드 UUID 그대로 파일명으로 사용한다고 가정
    return `/playercards/${cardId}.png`;
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
          throw new Error(`프로필 정보를 불러오지 못했습니다. (status ${profileRes.status})`);
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
          throw new Error(`전적 정보를 불러오지 못했습니다. (status ${matchesRes.status})`);
        }

        const matchesData = await matchesRes.json();
        console.log('[DEBUG] matchesData:', matchesData);

        setMatches(Array.isArray(matchesData) ? matchesData : matchesData.matches || []);
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
    const q = match.queue || match.mode;
    if (!q) return 'Mode';
    if (typeof q === 'string') return q;
    if (q.name) return q.name;
    return 'Mode';
  };

  const playerCardSrc = getPlayerCardSrc(profile, summary);

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
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
          <span style={styles.navItem} onClick={() => navigate('/matches')}>전적</span>
        </div>

        <div style={styles.right}>
          {profile ? (
            <div style={styles.profileBox}>
              <span style={styles.profileName}>{getDisplayName(profile)}</span>
              <button style={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <button style={styles.loginButton} onClick={() => navigate('/')}>로그인</button>
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
              <button style={styles.primaryButton} onClick={() => navigate('/')}>
                로그인 하러 가기
              </button>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 프로필 카드 */}
            {profile && (
              <div style={styles.profileCard}>
                {/* 왼쪽: 동그란 플레이어 카드 + 레벨 배지 */}
                <div style={styles.profileAvatarSection}>
                  <div style={styles.playerCardCircle}>
                    <img
                      src={playerCardSrc}
                      alt="Player Card"
                      style={styles.playerCardImage}
                      onError={(e) => {
                        if (e.currentTarget.dataset.errorHandled === '1') return;
                        e.currentTarget.dataset.errorHandled = '1';
                        e.currentTarget.src = '/agents/default.png';
                      }}
                    />
                  </div>
                  <div style={styles.levelBadge}>
                    Lv. {summary?.accountLevel ?? '-'}
                  </div>
                </div>

                {/* 오른쪽: 닉네임 + 태그 박스, 아래에 요약 스탯 */}
                <div style={styles.profileInfoSection}>
                  <div style={styles.nameBox}>
                    <span style={styles.nameText}>{profile.gameName}</span>
                    {profile.tagLine && (
                      <span style={styles.tagText}>#{profile.tagLine}</span>
                    )}
                  </div>

                  {summary && (
                    <div style={styles.summaryRow}>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>현재 티어</span>
                        <span style={styles.summaryValue}>
                          {summary.currentTier || '-'} {summary.rr != null ? `(${summary.rr} RR)` : ''}
                        </span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>시즌 전적</span>
                        <span style={styles.summaryValue}>
                          {summary.wins != null ? `${summary.wins}승` : '-'}{' '}
                          {summary.losses != null ? `${summary.losses}패` : ''}{' '}
                          {summary.winRate != null ? `(${summary.winRate}%)` : ''}
                        </span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>PUUID</span>
                        <span style={styles.summaryValueSmall}>
                          {profile.puuid}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 전적 */}
            <h3 style={styles.sectionTitle}>최근 경기 전적</h3>

            {matches.length === 0 ? (
              <p style={styles.message}>전적이 없습니다.</p>
            ) : (
              <div style={styles.matchList}>
                {matches.map((match) => {
                  const k = match.kills ?? 0;
                  const d = match.deaths ?? 0;
                  const a = match.assists ?? 0;

                  const kd = d > 0 ? (k / d).toFixed(2) : k;

                  const scoreText =
                    match.teamScore !== undefined && match.enemyScore !== undefined
                      ? `${match.teamScore} : ${match.enemyScore}`
                      : match.win
                      ? '승리'
                      : '패배';

                  const isWin =
                    match.win !== undefined
                      ? match.win
                      : match.teamScore > match.enemyScore;

                  return (
                    <div key={match.matchId} style={styles.matchRowCard}>
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
                          <div style={styles.mapName}>{getMapName(match)}</div>
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
                          <span style={styles.statLabel}>K/D/A</span>
                          <span style={styles.statValue}>{k} / {d} / {a}</span>
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
                          <span style={styles.statValue}>{match.acs ?? '-'}</span>
                        </div>

                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>ADR</span>
                          <span style={styles.statValue}>{match.adr ?? '-'}</span>
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

  /* 프로필 */
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    backgroundColor: '#1b1b1b',
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '24px',
    border: '1px solid #333',
  },
  profileAvatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    minWidth: '96px',
  },
  playerCardCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #444',
    boxShadow: '0 0 12px rgba(0,0,0,0.6)',
  },
  playerCardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  levelBadge: {
    padding: '2px 10px',
    borderRadius: '8px',
    backgroundColor: '#2b2b2b',
    fontSize: '12px',
    color: '#f5f5f5',
    border: '1px solid #444',
  },
  profileInfoSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  nameBox: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '10px',
    backgroundColor: '#232323',
    border: '1px solid #3a3a3a',
  },
  nameText: {
    fontSize: '22px',
    fontWeight: 700,
  },
  tagText: {
    fontSize: '14px',
    color: '#aaa',
  },
  summaryRow: {
    marginTop: '6px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '140px',
  },
  summaryLabel: {
    color: '#999',
    fontSize: '11px',
  },
  summaryValue: {
    color: '#fff',
    fontSize: '13px',
  },
  summaryValueSmall: {
    color: '#ccc',
    fontSize: '11px',
    wordBreak: 'break-all',
  },

  /* 섹션 타이틀 */
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '12px',
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

  /* 상단 프로필 우측 버튼 */
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  profileName: {
    fontSize: '14px',
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
