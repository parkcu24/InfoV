import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState('kr');
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }

    setIsLoading(true);
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}`);
    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* 상단 네비게이션 */}
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

      {/* 메인 콘텐츠 */}
      <div style={styles.main}>
        <img src="/InfoV_logo.png" alt="Main INFOV Logo" style={styles.mainLogo} />

        <div style={styles.searchSection}>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.select}>
            <option value="asia">아시아 서버</option>
            <option value="kr">한국 서버</option>
            <option value="na">미국 서버</option>
            <option value="eu">유럽 서버</option>
          </select>

          <input
            type="text"
            placeholder="아이디를 입력해주세요 ex.) CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button} onClick={handleSearch} disabled={isLoading}>
            {isLoading ? '검색 중...' : '전적 검색'}
          </button>
        </div>
      </div>

      {/* 하단 개인정보 처리방침 & 이용약관 링크 */}
      <div style={styles.footer}>
        <span onClick={() => navigate('/privacy')} style={styles.footerLink}>
          개인정보 처리방침
        </span>
        <span style={styles.footerDivider}>|</span>
        <span onClick={() => navigate('/terms')} style={styles.footerLink}>
          서비스 이용약관
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontFamily: 'Black Han Sans, sans-serif',
    minHeight: '100vh',
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
    zIndex: 1000,
    height: '72px',
    overflow: 'visible',
  },
  left: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
  },
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
    flexWrap: 'wrap',
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
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '120px',
  },
  mainLogo: {
    width: '400px',
    marginBottom: '-100px',
  },
  searchSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  select: {
    height: '40px',
    fontSize: '16px',
    padding: '0 10px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  input: {
    width: '300px',
    height: '40px',
    fontSize: '16px',
    padding: '0 10px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  button: {
    height: '40px',
    padding: '0 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#E63946',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '120px',
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #333',
    color: '#888',
    fontSize: '14px',
  },
  footerLink: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#aaa',
    margin: '0 8px',
  },
  footerDivider: {
    color: '#555',
    margin: '0 4px',
  },
};

export default HomePage;
