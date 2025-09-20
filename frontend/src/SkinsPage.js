import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

const editions = [
  { icon: '/icons/SE.png', name: '875 VP', short: 'SE' },
  { icon: '/icons/DE.png', name: '1,275 VP', short: 'DE' },
  { icon: '/icons/PE.png', name: '1,775 VP', short: 'PE' },
  { icon: '/icons/UE.png', name: '9,900 VP~', short: 'UE' },
  { icon: '/icons/XE.png', name: '8,600 VP~', short: 'XE' },
];

function SkinPage() {
  const navigate = useNavigate();
  const [skinSets, setSkinSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEditions, setSelectedEditions] = useState(editions.map(e => e.short));
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 햄버거 메뉴 상태
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 열릴 때 바디 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    axios.get('/data/skins.json')
      .then(res => {
        const parsed = [];
        Object.entries(res.data).forEach(([setName, details]) => {
          if (details.skins && details.skins.length > 0) {
            parsed.push({
              setName,
              edition: details.edition,
              coverImage: details.coverImage,
            });
          }
        });
        setSkinSets(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching skin sets:', err);
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

  const filteredSkinSets = skinSets.filter(skin =>
    selectedEditions.includes(skin.edition)
  );

  return (
    <div style={styles.pageWrapper}>
      {/* 네비게이션 바 */}
      <nav style={styles.navbar} className="navbar">
        {/* 좌측 로고 (고정 크기) */}
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
          <span style={styles.navItem} className="nav-item" onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold' }} className="nav-item active">스킨</span>
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
          <button className="active">스킨</button>
          <button onClick={() => go('/rank')}>랭킹</button>
          <button onClick={() => go('/esports')}>E-Sports</button>
        </div>
      </div>
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* 에디션 필터 */}
      <div style={styles.filterTypeBar}>
        {editions.map(({ icon, short, name }) => (
          <button
            key={short}
            style={{
              ...styles.editionButton,
              borderColor: selectedEditions.includes(short) ? '#4A90E2' : '#555',
            }}
            onClick={() =>
              setSelectedEditions(prev =>
                prev.includes(short) ? prev.filter(e => e !== short) : [...prev, short]
              )
            }
          >
            <img src={icon} alt={name} style={styles.editionIcon} />
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* 스킨 카드 또는 로딩 스피너 */}
      <div style={styles.grid}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '80px' }}>
            <ClipLoader size={50} color="#007bff" />
            <p style={{ marginTop: 10, color: '#aaa' }}>스킨 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          filteredSkinSets.map((set, idx) => (
            <div
              key={idx}
              style={styles.card}
              onClick={() => navigate(`/skins/${encodeURIComponent(set.setName)}`)}
            >
              <img
                src={set.coverImage}
                alt={set.setName}
                style={styles.image}
                onError={(e) => { e.currentTarget.src = '/default-skin.png'; }}
              />
              <div style={styles.label}>{set.setName}</div>
            </div>
          ))
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
    // 버튼 줄바꿈 방지 & 영역 고정
    whiteSpace: 'nowrap',
    flex: 'none',
    flexWrap: 'nowrap',
    paddingRight: '50px',
  },
  logoImage: {
    height: '80px',
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
    // 아주 좁은 폭에서도 버튼이 밀리지 않게 최소 폭
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
  filterTypeBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '60px',
    marginBottom: '20px',
  },
  editionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '2px solid #555',
    background: '#1e1e1e',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '12px',
  },
  editionIcon: { width: '20px', height: '20px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
    padding: '40px',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(255,255,255,0.05)',
    textAlign: 'center',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
  },
  label: {
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#fff',
  },
};

export default SkinPage;
