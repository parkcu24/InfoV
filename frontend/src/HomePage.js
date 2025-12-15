import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const navigate = useNavigate();

  const [region, setRegion] = useState('kr');
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 열렸을 때 바디 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [menuOpen]);

  // ✅ 일반 검색 (DB 캐시 기반)
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
    setMenuOpen(false);
    setIsLoading(false);
  };

  // ✅ Riot 계정 연동 로그인 검색
  const handleRiotLogin = () => {
    setIsLoading(true);
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
        {/* 좌측 로고 */}
        <div style={styles.left}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            onClick={() => go('/')}
          />
        </div>

        {/* 중앙 메뉴 */}
        <div style={styles.center} className="desktop-nav">
          <span style={styles.navItem} onClick={() => go('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => go('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => go('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => go('/esports')}>E-Sports</span>
        </div>

        {/* 우측 검색 */}
        <form style={styles.right} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
          />
          <button
            type="submit"
            style={styles.searchButton}
            disabled={isLoading}
          >
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </form>
      </nav>

      {/* 메인 콘텐츠 */}
      <main style={styles.main}>
        <img src="/InfoV_logo.png" alt="Main Logo" style={styles.mainLogo} />

        <form style={styles.searchSection} onSubmit={handleSearch}>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={styles.select}
          >
            <option value="asia">아시아 서버</option>
            <option value="kr">한국 서버</option>
            <option value="na">미국 서버</option>
            <option value="eu">유럽 서버</option>
          </select>

          <input
            type="text"
            placeholder="아이디 입력 (예: CU24#KR)"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.input}
          />

          {/* ✅ 버튼 2개 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? '검색 중...' : '일반 검색'}
            </button>

            <button
              type="button"
              onClick={handleRiotLogin}
              disabled={isLoading}
              style={{
                ...styles.button,
                backgroundColor: '#457B9D',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              Riot 계정 연동
            </button>
          </div>
        </form>
      </main>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <span onClick={() => go('/privacy')} style={styles.footerLink}>
          개인정보 처리방침
        </span>
        <span style={styles.footerDivider}>|</span>
        <span onClick={() => go('/terms')} style={styles.footerLink}>
          서비스 이용약관
        </span>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#121212',
    color: '#fff',
    fontFamily: 'Black Han Sans, sans-serif',
    minHeight: '100vh',
    paddingTop: '72px',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: '20px 40px',
    borderBottom: '1px solid #333',
    zIndex: 1000,
  },
  left: { display: 'flex', alignItems: 'center' },
  center: { display: 'flex', gap: '30px' },
  right: { display: 'flex', gap: '8px' },
  logoImage: { height: '200px', cursor: 'pointer', marginTop: '-8px' },
  navItem: { cursor: 'pointer', color: '#ddd' },
  topSearchInput: {
    height: '34px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  searchButton: {
    padding: '6px 12px',
    backgroundColor: '#E63946',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  main: { textAlign: 'center', marginTop: '40px' },
  mainLogo: { width: '400px', marginBottom: '-80px' },
  searchSection: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' },
  select: {
    height: '40px',
    width: '300px',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    border: '1px solid #555',
  },
  input: {
    width: '300px',
    height: '40px',
    padding: '0 10px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  button: {
    height: '40px',
    padding: '0 20px',
    backgroundColor: '#E63946',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '120px',
    padding: '20px',
    textAlign: 'center',
    color: '#888',
    borderTop: '1px solid #333',
  },
  footerLink: { cursor: 'pointer', textDecoration: 'underline', margin: '0 8px' },
  footerDivider: { margin: '0 4px' },
};

export default HomePage;
