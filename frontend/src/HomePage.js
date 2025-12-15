import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState('kr');
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [menuOpen]);

  // ✅ 일반 전적 검색 (캐시 기반)
  const handleSearch = (e) => {
    e.preventDefault();

    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }

    setIsLoading(true);
    navigate(
      `/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(
        tagLine
      )}&region=${encodeURIComponent(region)}`
    );
    setIsLoading(false);
    setMenuOpen(false);
  };

  // ✅ Riot 계정 연동 로그인
  const handleRiotLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
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
            onClick={() => go('/')}
          />
        </div>

        <div style={styles.center} className="desktop-nav">
          <span style={styles.navItem} onClick={() => go('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => go('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => go('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => go('/esports')}>E-Sports</span>
        </div>

        {/* 우측 상단 검색 (일반 검색만) */}
        <form style={styles.right} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
          />
          <button type="submit" style={styles.searchButton}>
            검색
          </button>
        </form>
      </nav>

      {/* 메인 */}
      <main style={styles.main}>
        <img src="/InfoV_logo.png" alt="Main INFOV Logo" style={styles.mainLogo} />

        <form style={styles.searchSection} onSubmit={handleSearch}>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.select}>
            <option value="asia">아시아 서버</option>
            <option value="kr">한국 서버</option>
            <option value="na">미국 서버</option>
            <option value="eu">유럽 서버</option>
          </select>

          <input
            type="text"
            placeholder="아이디 입력 ex) CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.input}
          />

          {/* 🔥 버튼 2개 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={styles.button}>
              전적 검색
            </button>

            <button
              type="button"
              onClick={handleRiotLogin}
              style={{ ...styles.button, backgroundColor: '#457B9D' }}
            >
              Riot 계정 연동
            </button>
          </div>
        </form>
      </main>

      <footer style={styles.footer}>
        <span onClick={() => go('/privacy')} style={styles.footerLink}>개인정보 처리방침</span>
        <span style={styles.footerDivider}>|</span>
        <span onClick={() => go('/terms')} style={styles.footerLink}>서비스 이용약관</span>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#121212',
    color: '#FFFFFF',
    fontFamily: 'Black Han Sans, sans-serif',
    minHeight: '100vh',
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
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px 0',
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
