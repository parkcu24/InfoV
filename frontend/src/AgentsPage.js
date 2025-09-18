import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const agentImageMap = {
  네온: "neon", 레이나: "reyna", 레이즈: "raze", 아이소: "iso", 요루: "yoru", 웨이레이: "wayray",
  제트: "jett", 피닉스: "phoenix", 게코: "geko", 브리치: "breach", 소바: "sova", 스카이: "skye",
  케이오: "kayo", 테호: "tejo", 페이드: "fade", 데드록: "deadlock", 바이스: "vyse", 사이퍼: "cypher",
  세이지: "sage", 체임버: "chamber", 킬조이: "killjoy", 바이퍼: "viper", 브림스톤: "brimstone",
  아스트라: "astra", 오멘: "omen", 클로브: "clove", 하버: "haver"
};

const agentData = {
  "타격대": ["네온", "레이나", "레이즈", "아이소", "요루", "웨이레이", "제트", "피닉스"],
  "척후대": ["게코", "브리치", "소바", "스카이", "케이오", "테호", "페이드"],
  "감시자": ["데드록", "바이스", "사이퍼", "세이지", "체임버", "킬조이"],
  "전략가": ["바이퍼", "브림스톤", "아스트라", "오멘", "클로브", "하버"]
};

function AgentsPage() {
  const navigate = useNavigate();
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 햄버거 메뉴
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // 공통 이동 헬퍼
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

  return (
    <div style={styles.pageWrapper}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        {/* 좌측 로고 */}
        <div style={styles.left} onClick={() => go('/')}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
          />
        </div>

        {/* 데스크톱 메뉴 */}
        <div style={styles.center} className="nav-center desktop-nav">
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>요원</span>
          <span style={styles.navItem} onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => go('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => go('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => go('/esports')}>E-Sports</span>
        </div>

        {/* 검색 영역 (줄바꿈 방지) */}
        <form style={styles.right} className="nav-right" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
            aria-label="Riot ID"
          />
          <button type="submit" style={styles.searchButton} disabled={isLoading}>
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </form>

        {/* 햄버거 버튼 */}
        <button
          aria-label="메뉴 열기"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
          style={styles.menuToggle}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
            <rect x="3" y="5" width="18" height="2" rx="1"></rect>
            <rect x="3" y="11" width="18" height="2" rx="1"></rect>
            <rect x="3" y="17" width="18" height="2" rx="1"></rect>
          </svg>
        </button>
      </nav>

      {/* 모바일 드로어 */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          ...drawerStyles.drawer,
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <button style={drawerStyles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">×</button>
        <div style={drawerStyles.links}>
          <button style={drawerStyles.linkActive}>요원</button>
          <button style={drawerStyles.link} onClick={() => go('/maps')}>맵 로테이션</button>
          <button style={drawerStyles.link} onClick={() => go('/skins')}>스킨</button>
          <button style={drawerStyles.link} onClick={() => go('/rank')}>랭킹</button>
          <button style={drawerStyles.link} onClick={() => go('/esports')}>E-Sports</button>
        </div>

        {/* 드로어 내 검색 */}
        <form onSubmit={handleSearch} style={{ padding: '12px' }}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={{ ...styles.topSearchInput, width: '100%' }}
          />
          <button type="submit" style={{ ...styles.searchButton, width: '100%', marginTop: 8 }}>
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </form>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={drawerStyles.backdrop} />}

      {/* CONTENT */}
      <div style={styles.pageContent}>
        <div style={styles.leftColumn}>
          {Object.entries(agentData).map(([role, agents]) => (
            <div key={role}>
              <h2 style={styles.roleTitle}>{role}</h2>
              <div style={styles.grid}>
                {agents.map((name) => (
                  <div
                    key={name}
                    style={styles.card}
                    onClick={() => go(`/agents/${name}`)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/agents/${agentImageMap[name]}.png`}
                      alt={name}
                      style={styles.image}
                    />
                    <div style={styles.name}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.rightColumn}>
          <h2 style={styles.rankingTitle}>요원 랭킹</h2>
          <div style={styles.rankingBox}>
            <p>이곳에 요원 랭킹이 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: 'Black Han Sans, sans-serif',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #333',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
    height: '64px',
  },
  left: { display: 'flex', alignItems: 'center' },
  center: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',   // ✅ 버튼 줄바꿈 방지
    flex: 'none',           // ✅ 영역 고정
  },
  logoImage: { height: '56px', cursor: 'pointer' },
  navItem: { fontSize: '16px', color: '#DDD', cursor: 'pointer' },
  topSearchInput: {
    height: '34px', fontSize: '14px', padding: '0 10px',
    borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1e1e1e', color: '#fff',
  },
  searchButton: {
    padding: '6px 12px', fontSize: '14px', backgroundColor: '#E63946', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  menuToggle: {
    background: 'transparent', color: '#fff', border: 'none',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },

  pageContent: { display: 'flex', padding: '100px 40px 40px', gap: '40px' },
  leftColumn: { flex: 3 },
  rightColumn: {
    flex: 1, backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', height: 'fit-content', position: 'sticky', top: '100px',
  },
  roleTitle: { fontSize: '24px', margin: '30px 0 15px', color: '#E63946', fontWeight: 'bold' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  card: {
    backgroundColor: '#1e1e1e', borderRadius: '10px', padding: '6px', width: '90px',
    boxShadow: '0 2px 10px rgba(255,255,255,0.05)', textAlign: 'center',
    transition: 'transform 0.2s ease-in-out', cursor: 'pointer',
  },
  image: { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' },
  name: { marginTop: '6px', fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  rankingTitle: { fontSize: '20px', marginBottom: '20px', color: '#E63946', fontWeight: 'bold' },
  rankingBox: { fontSize: '16px', color: '#ccc', lineHeight: '1.6' },
};

/* 드로어 인라인 스타일 */
const drawerStyles = {
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '78%',
    maxWidth: 360,
    height: '100vh',
    background: '#1E1E1E',
    color: '#fff',
    boxShadow: '0 0 0 9999px rgba(0,0,0,.4)',
    transform: 'translateX(100%)',
    transition: 'transform .2s ease-out',
    zIndex: 1100,
    display: 'flex',
    flexDirection: 'column',
  },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#fff',
    fontSize: 28, padding: 12, alignSelf: 'flex-end', cursor: 'pointer',
  },
  links: {
    display: 'flex', flexDirection: 'column', gap: 10, padding: '0 12px 12px',
  },
  link: {
    padding: '12px 14px', borderRadius: 10, border: '1px solid #444',
    background: '#1e1e1e', color: '#fff', textAlign: 'left', cursor: 'pointer',
  },
  linkActive: {
    padding: '12px 14px', borderRadius: 10, border: '2px solid #E63946',
    background: '#2a2a2a', color: '#fff', textAlign: 'left', cursor: 'default', fontWeight: 700,
  },
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1005,
  },
};

export default AgentsPage;
