import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const mapImageMap = {
  어센트: "ascent",
  로터스: "lotus",
  헤이븐: "haven",
  펄: "pearl",
  프랙처: "fracture",
  스플릿: "split",
  아이스박스: "icebox",
  바인드: "bind",
  선셋: "sunset",
  브리즈: "breeze"
};

function MapRotationPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('경쟁전');
  const [seasonTitle, setSeasonTitle] = useState('');
  const [rotationByMode, setRotationByMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    axios.get('/api/rotation')
      .then(res => {
        setSeasonTitle(res.data.seasonTitle);
        setRotationByMode(res.data.rotationByMode);
        setLoading(false);
      })
      .catch(err => {
        console.error('맵 로테이션 불러오기 실패:', err);
        setErrorMsg('맵 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      });
  }, []);

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
    setIsLoading(true);
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}`);
    setIsLoading(false);
    setMenuOpen(false);
  };

  const maps = rotationByMode?.[selectedMode] || [];

  return (
    <div style={styles.pageWrapper}>
      {/* 네비게이션 바 */}
      <nav style={styles.navbar} className="navbar">
        {/* 좌측 로고 */}
        <div style={styles.left} className="nav-left" onClick={() => go('/')}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            className="logo-img"
          />
        </div>

        {/* 데스크톱 가로 메뉴 */}
        <div style={styles.center} className="nav-center desktop-nav">
          <span style={styles.navItem} className="nav-item" onClick={() => go('/agents')}>요원</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }} className="nav-item active">맵 로테이션</span>
          <span style={styles.navItem} className="nav-item" onClick={() => go('/skins')}>스킨</span>
          <span style={styles.navItem} className="nav-item" onClick={() => go('/rank')}>랭킹</span>
          <span style={styles.navItem} className="nav-item" onClick={() => go('/esports')}>E-Sports</span>
        </div>

        {/* 우측 검색 (줄바꿈 방지 적용) */}
        <form style={styles.right} className="nav-right" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
            className="top-search-input"
            aria-label="Riot ID"
          />
          <button
            type="submit"
            style={styles.searchButton}
            className="search-button"
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
          onClick={() => setMenuOpen(v => !v)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <rect x="3" y="5" width="18" height="2" rx="1"></rect>
            <rect x="3" y="11" width="18" height="2" rx="1"></rect>
            <rect x="3" y="17" width="18" height="2" rx="1"></rect>
          </svg>
        </button>
      </nav>

      {/* 모바일 드로어 */}
      <div id="mobile-drawer" className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setMenuOpen(false)}>×</button>
        <div className="drawer-links">
          <button onClick={() => go('/agents')}>요원</button>
          <button className="active">맵 로테이션</button>
          <button onClick={() => go('/skins')}>스킨</button>
          <button onClick={() => go('/rank')}>랭킹</button>
          <button onClick={() => go('/esports')}>E-Sports</button>
        </div>
      </div>
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* 본문 */}
      <div style={styles.content}>
        <h1 style={styles.seasonTitle}>
          {loading ? '시즌 정보 불러오는 중...' : seasonTitle || '시즌 정보 없음'}
        </h1>

        {!loading && rotationByMode && (
          <div style={styles.modeContainer}>
            {Object.keys(rotationByMode).map((mode) => (
              <span
                key={mode}
                onClick={() => setSelectedMode(mode)}
                style={{
                  ...styles.modeItem,
                  fontWeight: selectedMode === mode ? 'bold' : 'normal',
                  textDecoration: selectedMode === mode ? 'underline' : 'none'
                }}
              >
                {mode}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <p>맵 로테이션 정보를 불러오는 중입니다...</p>
        ) : errorMsg ? (
          <p style={{ color: 'red' }}>{errorMsg}</p>
        ) : (
          <div style={styles.mapGrid}>
            {maps.map((map) => (
              <div
                key={map}
                style={styles.mapCard}
                onClick={() => navigate(`/maps/${encodeURIComponent(map)}`)}
              >
                <img
                  src={`/maps/${mapImageMap[map] || 'unknown'}.jpg`}
                  alt={map}
                  style={styles.mapImage}
                  onError={(e) => { e.currentTarget.src = '/maps/unknown.jpg'; }}
                />
                <div style={styles.mapName}>{map}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#fff',
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
    zIndex: 1000,
    height: '72px',
  },
  left: { display: 'flex', alignItems: 'center' },
  center: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    // ✅ 버튼 줄바꿈 방지 & 영역 고정
    whiteSpace: 'nowrap',
    flex: 'none',
    flexWrap: 'nowrap',
  },
  logoImage: {
    height: '80px',
    cursor: 'pointer',
  },
  navItem: { fontSize: '18px', color: '#DDD', cursor: 'pointer' },
  topSearchInput: {
    height: '34px',
    fontSize: '14px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    // ✅ 아주 좁은 폭에서도 버튼이 밀리지 않게 최소 폭
    width: 150,
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
  content: { padding: '40px' },
  seasonTitle: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' },
  modeContainer: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  modeItem: { fontSize: '16px', color: '#ccc', cursor: 'pointer' },
  mapGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  mapCard: {
    backgroundColor: '#1e1e1e',
    padding: '10px',
    borderRadius: '10px',
    width: '180px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  mapImage: {
    width: '180px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  mapName: { marginTop: '10px', fontSize: '16px', fontWeight: 'bold', color: '#fff' },
};

export default MapRotationPage;
