// 📁 src/MatchHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Render 백엔드 주소
const API_BASE_URL = 'https://infov.onrender.com';

function MatchHistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState(null); // ⭐ Henrik 요약 스탯
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('riot_access_token');

    if (!token) {
      setHasToken(false);
      setError('로그인이 필요합니다. Riot 계정으로 먼저 로그인해 주세요.');
      setLoading(false);
      return;
    }

    setHasToken(true);

    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);

        // 1) 프로필 정보
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileRes.ok) {
          const errText = await profileRes.text();
          console.error(
            '[DEBUG] /api/auth/profile 실패',
            profileRes.status,
            errText
          );
          throw new Error(
            `프로필 정보를 불러오지 못했습니다. (status ${profileRes.status})`
          );
        }

        const profileData = await profileRes.json();
        console.log('[DEBUG] profileData:', profileData);
        setProfile(profileData);

        // 2) Henrik 기반 요약 스탯
        try {
          const statsRes = await fetch(`${API_BASE_URL}/api/auth/stats`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!statsRes.ok) {
            const errText = await statsRes.text();
            console.error(
              '[DEBUG] /api/auth/stats 실패',
              statsRes.status,
              errText
            );
          } else {
            const statsData = await statsRes.json();
            console.log('[DEBUG] statsData:', statsData);
            setSummary(statsData);
          }
        } catch (statsErr) {
          console.error('[DEBUG] /api/auth/stats 호출 중 에러:', statsErr);
          // stats 실패해도 전적은 계속 불러오도록 함
        }

        // 3) 전적 정보
        const matchesRes = await fetch(`${API_BASE_URL}/api/auth/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!matchesRes.ok) {
          const errText = await matchesRes.text();
          console.error(
            '[DEBUG] /api/auth/matches 실패',
            matchesRes.status,
            errText
          );
          throw new Error(
            `전적 정보를 불러오지 못했습니다. (status ${matchesRes.status})`
          );
        }

        const matchesData = await matchesRes.json();
        console.log('[DEBUG] matchesData:', matchesData);
        setMatches(matchesData.matches || matchesData);
      } catch (err) {
        console.error(err);
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
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
    if (p.gameName) return p.gameName;
    return '닉네임 정보를 불러오지 못했습니다.';
  };

  // 🔁 에이전트 이미지: Henrik → 없으면 로컬 → 그래도 없으면 default
  const getAgentImageSrc = (match) => {
    // 1) 백엔드에서 내려준 Henrik 이미지
    if (match?.agentImage) {
      return match.agentImage;
    }

    // 2) 로컬 /agents 폴더
    const agentName = match?.agent;
    if (!agentName) return '/agents/default.png';

    const file = agentName
      .toLowerCase()
      .replace(/\s+/g, '') // 공백 제거
      .replace(/[^\w]/g, ''); // 특수문자 제거(KAY/O → kayo)

    return `/agents/${file}.png`;
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
          <span style={styles.navItem} onClick={() => navigate('/matches')}>
            전적
          </span>
        </div>

        <div style={styles.right}>
          {profile ? (
            <div style={styles.profileBox}>
              <span style={styles.profileName}>{getDisplayName(profile)}</span>
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
            {/* 프로필 카드 */}
            {profile && (
              <div style={styles.profileCard}>
                <div>
                  <h2 style={styles.profileTitle}>{getDisplayName(profile)}</h2>
                  {profile.puuid && (
                    <p style={styles.profileSub}>PUUID: {profile.puuid}</p>
                  )}
                </div>

                {/* ⭐ Henrik 요약 스탯 */}
                {summary && (
                  <div style={styles.summaryRow}>
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>계정 레벨 </span>
                      <span style={styles.summaryValue}>
                        {summary.accountLevel ?? '-'}
                      </span>
                    </div>
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>현재 티어 </span>
                      <span style={styles.summaryValue}>
                        {summary.currentTier || 'Unrated'}
                        {summary.rr != null ? ` (${summary.rr} RR)` : ''}
                      </span>
                    </div>
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>시즌 전적 </span>
                      <span style={styles.summaryValue}>
                        {summary.wins ?? 0}승 {summary.losses ?? 0}패
                        {summary.winRate != null
                          ? ` (${summary.winRate}%)`
                          : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <h3 style={styles.sectionTitle}>최근 경기 전적</h3>

            {matches.length === 0 ? (
              <p style={styles.message}>전적이 없습니다.</p>
            ) : (
              <div style={styles.matchList}>
                {matches.map((match) => {
                  const k = match.kills ?? 0;
                  const d = match.deaths ?? 0;
                  const a = match.assists ?? 0;

                  const kdRaw =
                    match.kd != null
                      ? match.kd
                      : d > 0
                      ? k / d
                      : k;
                  const kd =
                    typeof kdRaw === 'number'
                      ? kdRaw.toFixed(2)
                      : kdRaw;

                  const acs = match.acs != null ? match.acs : '-';
                  const adr = match.adr != null ? match.adr : '-';
                  const hs =
                    match.hsPercent != null ? `${match.hsPercent}%` : '-';

                  const scoreText =
                    match.teamScore != null && match.enemyScore != null
                      ? `${match.teamScore} : ${match.enemyScore}`
                      : match.win
                      ? '승리'
                      : '패배';

                  const isWin =
                    typeof match.win === 'boolean'
                      ? match.win
                      : match.teamScore > match.enemyScore;

                  return (
                    <div key={match.matchId} style={styles.matchRowCard}>
                      {/* 왼쪽: 에이전트 + 맵/큐 */}
                      <div style={styles.matchLeft}>
                        <img
                          src={getAgentImageSrc(match)}
                          alt={match.agent || 'Agent'}
                          style={styles.agentImage}
                          onError={(e) => {
                            console.warn(
                              '[AgentImageError] 이미지 로드 실패:',
                              match.agent,
                              match.agentImage,
                              e.currentTarget.src
                            );
                            // 실패하면 기본 이미지로 교체
                            e.currentTarget.src = '/agents/default.png';
                          }}
                        />
                        <div style={styles.matchLeftText}>
                          <div style={styles.mapName}>
                            {match.map || 'Unknown Map'}
                          </div>
                          <div style={styles.queueText}>
                            {match.queue || 'Mode'} · {match.timeAgo || ''}
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
                            {match.placement && (
                              <span style={styles.placementBadge}>
                                {match.placement}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 스탯 라인 */}
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
                              color:
                                parseFloat(kd) >= 1 ? '#4CAF50' : '#F44336',
                            }}
                          >
                            {kd}
                          </span>
                        </div>
                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>ACS</span>
                          <span style={styles.statValue}>{acs}</span>
                        </div>
                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>ADR</span>
                          <span style={styles.statValue}>{adr}</span>
                        </div>
                        <div style={styles.statBlock}>
                          <span style={styles.statLabel}>HS%</span>
                          <span style={styles.statValue}>{hs}</span>
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

const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#eee',
    fontFamily: 'Black Han Sans, sans-serif',
    paddingTop: '72px',
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
    color: '#bbb',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#2b1b1b',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #ff4d4f',
    textAlign: 'center',
  },
  errorText: { color: '#ff8888' },
  primaryButton: {
    padding: '8px 16px',
    marginTop: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff4655',
    color: '#fff',
    cursor: 'pointer',
  },
  profileCard: {
    backgroundColor: '#1b1b1b',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #333',
  },
  profileTitle: {
    fontSize: '24px',
    margin: 0,
  },
  profileSub: {
    fontSize: '14px',
    color: '#aaa',
  },
  sectionTitle: {
    marginTop: '20px',
    marginBottom: '10px',
    fontSize: '20px',
  },
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  matchRowCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #303030',
  },
  matchLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '2px',
  },
  scoreText: {
    fontSize: '14px',
    fontWeight: '600',
  },
  placementBadge: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '999px',
    backgroundColor: '#262626',
    color: '#ccc',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    fontSize: '12px',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '60px',
  },
  statLabel: {
    color: '#777',
    fontSize: '11px',
  },
  statValue: {
    color: '#eee',
    fontSize: '13px',
    fontWeight: '500',
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  profileName: {
    fontSize: '14px',
    color: '#ddd',
  },
  loginButton: {
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid #555',
    backgroundColor: 'transparent',
    color: '#eee',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutButton: {
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid #555',
    backgroundColor: 'transparent',
    color: '#eee',
    cursor: 'pointer',
    fontSize: '12px',
  },
  summaryRow: {
    marginTop: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '14px',
  },
  summaryItem: {
    display: 'flex',
    gap: '4px',
  },
  summaryLabel: {
    color: '#888',
  },
  summaryValue: {
    color: '#f5f5f5',
  },
};

export default MatchHistoryPage;
