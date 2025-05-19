import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SearchResultPage() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const gameName = query.get('name');
  const tagLine = query.get('tag');

  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    const [name, tag] = riotId.split('#');
    if (!name || !tag) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }
    setIsLoading(true);
    navigate(`/search-result?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
    setIsLoading(false);
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:5050/api/auth/login';
  };

  return (
    <div style={styles.pageWrapper}>
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
        </div>

        <div style={styles.right}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
          />
          <button style={styles.searchButton} onClick={handleSearch} disabled={isLoading}>
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.message}>
          "{gameName}#{tagLine}" 전적 정보가 없습니다.
        </h2>
        <p style={styles.subText}>로그인을 통해 전적을 확인해보세요!</p>
        <button style={styles.button} onClick={handleLogin}>
          로그인 하기
        </button>
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
  left: { flex: '1 1 auto', display: 'flex', alignItems: 'center' },
  center: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  right: {
    flex: 1.5,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    paddingRight: '50px',
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
  topSearchInput: {
    height: '34px',
    fontSize: '14px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  searchButton: {
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: '#E63946',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  content: {
    marginTop: '160px',
    textAlign: 'center',
    padding: '40px 20px',
  },
  message: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  subText: {
    fontSize: '16px',
    color: '#aaa',
    marginBottom: '30px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '18px',
    backgroundColor: '#4A90E2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default SearchResultPage;
