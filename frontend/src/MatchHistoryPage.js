// 📁 src/MatchHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Render 백엔드 주소
const API_BASE_URL = 'https://infov.onrender.com';

function MatchHistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
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

        // 1) 프로필 정보 가져오기
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileRes.ok) throw new Error('프로필 정보를 불러오지 못했습니다.');
        const profileData = await profileRes.json();
        setProfile(profileData);

        // 2) 전적 정보 가져오기
        const matchesRes = await fetch(`${API_BASE_URL}/api/auth/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!matchesRes.ok) throw new Error('전적 정보를 불러오지 못했습니다.');
        const matchesData = await matchesRes.json();
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

  // 닉네임 표시용 (gameName/tagLine 없으면 안내 문구)
  const displayName =
    profile?.gameName && profile?.tagLine
      ? `${profile.gameName}#${profile.tagLine}`
      : profile
      ? '닉네임 정보를 불러오지 못했습니다.'
      : '';

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
              <span style={styles.profileName}>{displayName}</span>
              <button style={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button style={styles.loginButton} onClick={() => navigate('/login')}>
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
              <button style={styles.primaryButton} onClick={() => navigate('/login')}>
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
                  <h2 style={styles.profileTitle}>{displayName}</h2>
                  <p style={styles.profileSub}>PUUID: {profile.puuid}</p>
                  {profile.country && (
                    <p style={styles.profileSub}>지역: {profile.country}</p>
                  )}
                </div>
              </div>
            )}

            <h3 style={styles.sectionTitle}>최근 경기 전적</h3>

            {matches.length === 0 ? (
              <p style={styles.message}>전적이 없습니다.</p>
            ) : (
              <div style={styles.matchList}>
                {matches.map((match) => (
                  <div key={match.matchId} style={styles.matchCard}>
                    <div style={styles.matchHeader}>
                      <span style={styles.matchMap}>{match.map || '미확인 맵'}</span>
                      <span
                        style={{
                          ...styles.matchResult,
                          color: match.win ? '#4CAF50' : '#F44336',
                        }}
                      >
                        {match.win ? '승리' : '패배'}
                      </span>
                    </div>
                    <div style={styles.matchBody}>
                      <div style={styles.matchRow}>
                        <span style={styles.matchLabel}>K / D / A</span>
                        <span style={styles.matchValue}>
                          {match.kills} / {match.deaths} / {match.assists}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
  backgroundColor: '#1E1E1E',     // ← ✔ 정상
  borderBottom: '1px solid #333', // ← ✔ 정상
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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  matchCard: {
    backgroundColor: '#1b1b1b',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  matchMap: { fontSize: '16px' },
  matchResult: { fontWeight: 'bold' },
  matchBody: { marginTop: '6px' },
  matchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  matchLabel: { color: '#888' },
  matchValue: { color: '#eee' },
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
};

export default MatchHistoryPage;
