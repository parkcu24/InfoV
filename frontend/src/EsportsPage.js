// src/pages/EsportsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EsportsPage.css';

const tournaments = [
  { name: '킥오프', city: '온라인', date: '1월 11일 ~ 2월 7일', path: '/leagues', color: '#E63946', images: ['/esports/kickoff_1.jpg', '/esports/kickoff_2.jpg', '/esports/kickoff_3.jpg', '/esports/kickoff_4.jpg', '/esports/kickoff_5.jpg'] },
  { name: '발로란트 마스터즈 방콕', city: '방콕', date: '2월 20일 ~ 3월 2일', path: '/leagues', color: '#6A0DAD', images: ['/esports/masters-bkk1.jpg', '/esports/masters-bkk2.jpg', '/esports/masters-bkk3.jpg', '/esports/masters-bkk4.jpg', '/esports/masters-bkk5.jpg', '/esports/masters-bkk6.jpg'] },
  { name: '스테이지 1', city: '온라인', date: '3월 22일 ~ 4월 25일', path: '/leagues', color: '#FF4500', images: ['/esports/stage1_1.jpg', '/esports/stage1_2.jpg', '/esports/stage1_3.jpg', '/esports/stage1_4.jpg', '/esports/stage1_5.jpg'] },
  { name: '발로란트 마스터즈 토론토', city: '토론토', date: '6월 7일 ~ 6월 22일', path: '/leagues', color: '#1E90FF', images: ['/esports/masters-toronto1.jpg', '/esports/masters-toronto2.jpg'] },
  { name: '스테이지 2', city: '온라인', date: '7월 12일 ~ 8월 15일', path: '/leagues', color: '#FFD700', images: ['/esports/stage2.jpg'] },
  { name: '챔피언스', city: '상하이', date: '9월 12일 ~ 10월 5일', path: '/schedule', color: '#00CED1', images: ['/esports/champions1.jpg'] },
];

function EsportsPage() {
  const navigate = useNavigate();
  const [riotId, setRiotId] = useState('');
  const [randomImages, setRandomImages] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [region, setRegion] = useState('kr');

  useEffect(() => {
    const newRandoms = {};
    tournaments.forEach(t => {
      const randomIndex = Math.floor(Math.random() * t.images.length);
      newRandoms[t.name] = t.images[randomIndex];
    });
    setRandomImages(newRandoms);
  }, []);

  // 모바일 드로어 열릴 때 바디 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(region)}`);
    setMenuOpen(false);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 네비게이션 — Privacy와 동일 레이아웃/스타일 */}
      <nav style={styles.navbar} className="navbar">
        {/* 좌측 로고 */}
        <div style={styles.left} className="nav-left" onClick={() => go('/')}>
          <img src="/InfoV_logo.png" alt="INFOV Logo" style={styles.logoImage} />
        </div>

        {/* 중앙 메뉴 (데스크톱) */}
        <div style={styles.center} className="nav-center desktop-nav">
          <span style={styles.navItem} onClick={() => go('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => go('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => go('/rank')}>랭킹</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>E-Sports</span>
        </div>

        {/* 우측 검색 */}
        <form style={styles.right} className="nav-right" onSubmit={handleSearch}>
          {/* 필요하다면 region 셀렉트 노출 */}
          {/* <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.regionSelect}>
            <option value="kr">한국</option>
            <option value="asia">아시아</option>
            <option value="na">북미</option>
            <option value="eu">유럽</option>
          </select> */}
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
            aria-label="Riot ID"
          />
          <button type="submit" style={styles.searchButton}>검색</button>
        </form>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="menu-toggle"
          aria-label="메뉴 열기"
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen(v => !v)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
            <rect x="3" y="5" width="18" height="2" rx="1"></rect>
            <rect x="3" y="11" width="18" height="2" rx="1"></rect>
            <rect x="3" y="17" width="18" height="2" rx="1"></rect>
          </svg>
        </button>
      </nav>

      {/* 모바일 드로어 */}
      <div id="mobile-drawer" className={`mobile-drawer ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">×</button>
        <div className="drawer-links">
          <button onClick={() => go('/agents')}>요원</button>
          <button onClick={() => go('/maps')}>맵 로테이션</button>
          <button onClick={() => go('/skins')}>스킨</button>
          <button onClick={() => go('/rank')}>랭킹</button>
          <button className="active">E-Sports</button>
        </div>

        {/* 드로어 내 검색 */}
        <form onSubmit={handleSearch} style={{ padding: 12 }}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={{ ...styles.topSearchInput, width: '100%' }}
          />
          <button type="submit" style={{ ...styles.searchButton, width: '100%', marginTop: 8 }}>
            검색
          </button>
        </form>
      </div>
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* 본문 (기존 CSS 유지) */}
      <div className="content">
        <h1 className="esports-title">2025 VCT 대회 일정</h1>

        <div className="card-container">
          {tournaments.map((t, idx) => (
            <div
              key={idx}
              className="tournament-card"
              onClick={() => go(t.path)}
              style={{
                backgroundImage: `url(${randomImages[t.name]})`,
                borderColor: t.color,
              }}
            >
              <div className="card-overlay">
                <h2 className="card-title">{t.name}</h2>
                <p className="card-city">{t.city}</p>
                <p className="card-date">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 (기존 CSS 유지) */}
      <footer className="footer">
        <span onClick={() => go('/privacy')} className="footer-link">개인정보 처리방침</span>
        <span className="footer-divider">|</span>
        <span onClick={() => go('/terms')} className="footer-link">서비스 이용약관</span>
      </footer>
    </div>
  );
}

/* 인라인 스타일 — Privacy 네비게이션과 동일 값 */
const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: 'Black Han Sans, sans-serif',
    paddingTop: '72px',           // 고정 네비 높이 보정
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
    overflow: 'visible',          // 큰 로고가 자연스럽게 노출
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
    paddingRight: '50px',
  },
  logoImage: {
    height: '200px',              // 큰 로고
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
  // 필요 시 region 셀렉트를 쓸 때
  regionSelect: {
    height: '34px',
    fontSize: '14px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    marginRight: '8px',
  },
};

export default EsportsPage;
