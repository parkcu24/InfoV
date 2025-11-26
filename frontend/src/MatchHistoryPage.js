// 📁 src/MatchHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5050';

function MatchHistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);     // 소환사 / 플레이어 정보
  const [matches, setMatches] = useState([]);       // 전적 리스트
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('riot_access_token');

    // 토큰 없으면 로그인 페이지로
    if (!token) {
      setError('로그인이 필요합니다. Riot 계정으로 먼저 로그인해 주세요.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // ✅ 1) 프로필 정보 요청 (예: /auth/profile)
        const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!profileRes.ok) {
          throw new Error('프로필 정보를 불러오지 못했습니다.');
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        // ✅ 2) 전적 정보 요청 (예: /auth/matches)
        const matchesRes = await fetch(`${API_BASE_URL}/auth/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!matchesRes.ok) {
          throw new Error('전적 정보를 불러오지 못했습니다.');
        }

        const matchesData = await matchesRes.json();
        // 백엔드 구조에 맞게 수정 (예: matchesData.matches 등)
        setMatches(matchesData.matches || matchesData);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('riot_access_token');
    navigate('/login');
  };

  return (
    <div style={styles.pageWrapper}>
      {/* ✅ 상단 네비게이션바 (CallbackPage랑 통일) */}
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
              <span style={styles.profileName}>
                {profile.gameName || profile.name}
                {profile.tagLine ? `#${profile.tagLine}` : ''}
              </span>
              <button style={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button
              style={styles.loginButton}
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
          )}
        </div>
      </nav>

      {/* ✅ 메인 컨텐츠 영역 */}
      <div style={styles.content}>
        {loading && (
          <p style={styles.message}>전적을 불러오는 중입니다...</p>
        )}

        {!loading && error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
            {!localStorage.getItem('riot_access_token') && (
              <button
                style={styles.primaryButton}
                onClick={() => navigate('/login')}
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
                <div style={styles.profileInfo}>
                  <h2 style={styles.profileTitle}>
                    {profile.gameName || profile.name}
                    {profile.tagLine ? `#${profile.tagLine}` : ''}
                  </h2>
                  <p style={styles.profileSub}>
                    레벨 {profile.accountLevel || profile.level || '-'} ·{' '}
                    {profile.region || '지역 정보 없음'}
                  </p>
                </div>
                {profile.cardSmall || profile.cardIcon ? (
                  <img
                    src={profile.cardSmall || profile.cardIcon}
                    alt="Player Card"
                    style={styles.playerCardImg}
                  />
                ) : null}
              </div>
            )}

            {/* 전적 리스트 */}
            <h3 style={styles.sectionTitle}>최근 경기 전적</h3>

            {matches.length === 0 ? (
              <p style={styles.message}>표시할 전적이 없습니다.</p>
            ) : (
              <div style={styles.matchList}>
                {matches.map((match) => {
                  // 백엔드에서 내려주는 필드 이름에 맞게 사용해줘!
                  const id = match.matchId || match.gameId || match.id;
                  const mapName = match.map || match.mapName || '알 수 없는 맵';
                  const mode = match.mode || match.queueId || '모드 정보 없음';
                  const startedAt = match.startedAt || match.gameStartTime;
                  const result =
                    match.result || match.outcome || match.win ? '승리' : '패배';
                  const kills =
                    match.kills ??
                    match.stats?.kills ??
                    match.playerStats?.kills ??
                    '-';
                  const deaths =
                    match.deaths ??
                    match.stats?.deaths ??
                    match.playerStats?.deaths ??
                    '-';
                  const assists =
                    match.assists ??
                    match.stats?.assists ??
                    match.playerStats?.assists ??
                    '-';

                  const dateText = startedAt
                    ? new Date(startedAt).toLocaleString('ko-KR')
                    : '';

                  return (
                    <div key={id || Math.random()} style={styles.matchCard}>
                      <div style={styles.matchHeader}>
                        <span style={styles.matchMap}>{mapName}</span>
                        <span
                          style={{
                            ...styles.matchResult,
                            color:
                              result === '승리'
                                ? '#4CAF50'
                                : result === '패배'
                                ? '#F44336'
                                : '#FFC107',
                          }}
                        >
                          {result}
                        </span>
                      </div>
                      <div style={styles.matchBody}>
                        <div style={styles.matchRow}>
                          <span style={styles.matchLabel}>모드</span>
                          <span style={styles.matchValue}>{mode}</span>
                        </div>
                        <div style={styles.matchRow}>
                          <span style={styles.matchLabel}>K / D / A</span>
                          <span style={styles.matchValue}>
                            {kills} / {deaths} / {assists}
                          </span>
                        </div>
                        {dateText && (
                          <div style={styles.matchRow}>
                            <span style={styles.matchLabel}>경기 시간</span>
                            <span style={styles.matchValue}>{dateText}</span>
                          </div>
                        )}
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
    overflow: 'visible',
  },
  left: { flex: '1 1 auto', display: 'flex', alignItems: 'center' },
  center: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  right: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
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
    padding: '100px 40px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  message: {
    fontSize: '18px',
    color: '#bbb',
    lineHeight: 1.6,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#2b1b1b',
    border: '1px solid #ff4d4f',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginTop: '40px',
  },
  errorText: {
    color: '#ff8888',
    marginBottom: '12px',
  },
  primaryButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff4655',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
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
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  profileName: {
    fontSize: '14px',
    color: '#ddd',
  },
  profileCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1E1E1E, #26273a)',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '30px',
    border: '1px solid #333',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileTitle: {
    fontSize: '24px',
    margin: 0,
  },
  profileSub: {
    fontSize: '14px',
    color: '#aaa',
    margin: 0,
  },
  playerCardImg: {
    width: '80px',
    height: '120px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '16px',
  },
  matchList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  matchCard: {
    backgroundColor: '#1b1b1b',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid #333',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  matchMap: {
    fontSize: '16px',
  },
  matchResult: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  matchBody: {
    marginTop: '4px',
  },
  matchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginTop: '4px',
  },
  matchLabel: {
    color: '#888',
  },
  matchValue: {
    color: '#eee',
  },
};

export default MatchHistoryPage;
