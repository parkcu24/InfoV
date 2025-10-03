import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState('kr');
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 열렸을 때 바디 스크롤 잠금(모바일 UX)
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => (document.body.style.overflow = '');
  }, [menuOpen]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
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

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div style={styles.container}>
      {/* 상단 네비게이션 */}
      <nav style={styles.navbar} className="navbar">
        {/* 좌측 로고 */}
        <div style={styles.left}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            onClick={() => go('/')}
          />
        </div>

        {/* 데스크톱 가로 메뉴 */}
        <div style={styles.center} className="nav-center desktop-nav">
          <span style={styles.navItem} onClick={() => go('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => go('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => go('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => go('/esports')}>E-Sports</span>
        </div>

        {/* 우측 검색 */}
        <form style={styles.right} className="nav-right" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
            aria-label="Riot ID"
          />
          <button
            type="submit"
            style={styles.searchButton}
            disabled={isLoading}
          >
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </form>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="menu-toggle"
          aria-label="메뉴 열기"
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {/* 심플한 햄버거 아이콘 (SVG) */}
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <rect x="3" y="5" width="18" height="2" rx="1"></rect>
            <rect x="3" y="11" width="18" height="2" rx="1"></rect>
            <rect x="3" y="17" width="18" height="2" rx="1"></rect>
          </svg>
        </button>
      </nav>

      {/* 모바일 드로어 */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer ${menuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">×</button>
        <div className="drawer-links">
          <button onClick={() => go('/agents')}>요원</button>
          <button onClick={() => go('/maps')}>맵 로테이션</button>
          <button onClick={() => go('/skins')}>스킨</button>
          <button onClick={() => go('/rank')}>랭킹</button>
          <button onClick={() => go('/esports')}>E-Sports</button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main style={styles.main} className="main">
        <img
          src="/InfoV_logo.png"
          alt="Main INFOV Logo"
          style={styles.mainLogo}
        />

        <form style={styles.searchSection} className="search-section" onSubmit={handleSearch}>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={styles.select}
            aria-label="지역 선택"
          >
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
            aria-label="Riot ID 메인"
          />

          <button
            type="submit"
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? '검색 중...' : '전적 검색'}
          </button>
        </form>
      </main>

      {/* 하단 개인정보 처리방침 & 이용약관 */}
      <footer style={styles.footer} className="footer">
        <span onClick={() => go('/privacy')} style={styles.footerLink}>
          개인정보 처리방침
        </span>
        <span style={styles.footerDivider}>|</span>
        <span onClick={() => go('/terms')} style={styles.footerLink}>
          서비스 이용약관
        </span>
      </footer>

      {/* 햄버거 오픈 시 어두운 배경 */}
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}
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
    padding: '16px 40px',
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #333',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
    height: '120px',      // ⬅️ 네비게이션 바 높이 증가
    overflow: 'visible',
  },
  left: {
    flex: '0 0 auto',
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
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  logoImage: {
    height: '200px',      // ⬅️ 로고 크게
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
    paddingTop: '180px',   // ⬅️ navbar 높아진 만큼 여백도 늘림
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
