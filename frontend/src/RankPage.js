import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

function RankPage() {
  const navigate = useNavigate();
  const [acts, setActs] = useState([]);
  const [selectedActId, setSelectedActId] = useState('');
  const [rankings, setRankings] = useState([]);
  const [server, setServer] = useState('kr');
  const [isLoading, setIsLoading] = useState(false);
  const [startRank, setStartRank] = useState(1);
  const [endRank, setEndRank] = useState(50);
  const [riotId, setRiotId] = useState('');

  // 햄버거 메뉴
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const API_BASE_URL = 'https://infov.onrender.com';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/acts`)
      .then(response => {
        if (!response.data || !Array.isArray(response.data.acts)) return;

        const episodes = {};
        response.data.acts.forEach(act => {
          if (act.type === 'episode') episodes[act.id] = act.name;
        });

        const fullActs = response.data.acts
          .filter(act => act.type === 'act')
          .map(act => ({
            id: act.id,
            name: `${episodes[act.parentId] || ''} ${act.name}`,
            isActive: act.isActive,
          }));

        const startIndex = fullActs.findIndex(act => act.name === 'EPISODE 2 ACT I');
        const lastActiveIndex = fullActs.reduce((acc, act, idx) => act.isActive ? idx : acc, -1);
        const slicedActs = fullActs.slice(startIndex, lastActiveIndex + 1);

        setActs(slicedActs);
        if (slicedActs.length > 0) {
          setSelectedActId(slicedActs[slicedActs.length - 1].id);
        }
      })
      .catch(err => console.error('액트 가져오기 실패:', err));
  }, []);

  const fetchRanking = () => {
    if (!selectedActId || !server) return;

    const start = Math.max(0, startRank - 1);
    const size = endRank - startRank + 1;

    if (size > 200) {
      alert('❗ 한 번에 최대 200명까지 조회할 수 있습니다.');
      return;
    }
    if (start < 0 || size < 1 || endRank > 1000 || start >= 1000) {
      alert('⚠️ 랭킹은 1위부터 1000위까지만 조회 가능합니다.');
      return;
    }

    setIsLoading(true);
    axios
      .get(`${API_BASE_URL}/api/rankings?actId=${selectedActId}&server=${server}&start=${start}&size=${size}`)
      .then(res => {
        setRankings(res.data.players || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}`);
    setMenuOpen(false);
  };

  const go = (path) => {
    navigate(path);
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
        <div style={styles.center} className="nav-center">
          <span style={styles.navItem} onClick={() => go('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => go('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => go('/skins')}>스킨</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>랭킹</span>
          <span style={styles.navItem} onClick={() => go('/esports')}>E-Sports</span>
        </div>

        {/* 검색 */}
        <form style={styles.right} onSubmit={handleSearch}>
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

      {/* 모바일 드로어 (인라인 스타일로 구현) */}
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
          <button style={drawerStyles.linkActive}>랭킹</button>
          <button style={drawerStyles.link} onClick={() => go('/agents')}>요원</button>
          <button style={drawerStyles.link} onClick={() => go('/maps')}>맵 로테이션</button>
          <button style={drawerStyles.link} onClick={() => go('/skins')}>스킨</button>
          <button style={drawerStyles.link} onClick={() => go('/esports')}>E-Sports</button>
        </div>
        <form onSubmit={handleSearch} style={{ padding: '12px' }}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={{ ...styles.topSearchInput, width: '100%' }}
          />
          <button type="submit" style={{ ...styles.searchButton, width: '100%', marginTop: 8 }}>검색</button>
        </form>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={drawerStyles.backdrop} />}

      {/* CONTENT */}
      <div style={styles.content}>
        <h1 style={styles.heroTitle}>
          Who is the <span style={styles.highlight}>Best</span> VALORANT Player?
        </h1>

        <div style={styles.selectRow}>
          <select value={server} onChange={e => setServer(e.target.value)} style={styles.select}>
            <option value="kr">한국</option>
            <option value="asia">아시아</option>
            <option value="na">북미</option>
            <option value="eu">유럽</option>
          </select>

          <select value={selectedActId} onChange={e => setSelectedActId(e.target.value)} style={styles.select}>
            {acts.map(act => (
              <option key={act.id} value={act.id}>{act.name}</option>
            ))}
          </select>

          <input
            type="number"
            value={startRank}
            onChange={e => setStartRank(Number(e.target.value))}
            min="1" max="1000" placeholder="시작 순위"
            style={styles.input}
          />

          <input
            type="number"
            value={endRank}
            onChange={e => setEndRank(Number(e.target.value))}
            min={startRank} max="1000" placeholder="끝 순위"
            style={styles.input}
          />

          <button onClick={fetchRanking} style={styles.searchBtn}>검색</button>
        </div>

        <p style={styles.noticeText}>
          ※ 랭킹은 1위부터 1000위까지 제공되며, <b>한 번의 검색으로 최대 200명</b>까지 조회할 수 있습니다.
        </p>

        {isLoading ? (
          <div style={{ marginTop: 60 }}>
            <ClipLoader size={50} color="#fff" />
            <p style={{ marginTop: 10, color: '#aaa' }}>랭킹 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div style={styles.rankList}>
            {rankings.map((player, idx) => {
              const tier = player.competitiveTier;
              const playerName = player.gameName && player.tagLine ? `${player.gameName}#${player.tagLine}` : '비공개';
              return (
                <div key={`${player.puuid}-${idx}`} style={styles.rankItem}>
                  <span style={styles.rankNumber}>#{player.leaderboardRank}</span>
                  <span style={styles.playerName}>{playerName}</span>
                  <div style={styles.tierBox}>
                    {tier && <img src={`/tiers/${tier}.png`} alt="tier" style={styles.tierImage} />}
                  </div>
                  <span style={styles.rankRating}>{player.rankedRating} RR</span>
                  <span style={styles.wins}>{player.numberOfWins}승</span>
                </div>
              );
            })}
          </div>
        )}
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
    whiteSpace: 'nowrap',   // 버튼 밀림 방지
    flex: 'none',           // 영역 고정
  },
  logoImage: {
    height: '56px',
    cursor: 'pointer',
  },
  navItem: {
    fontSize: '16px',
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
  menuToggle: {
    background: 'transparent',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  content: {
    paddingTop: '100px',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#fff',
  },
  highlight: { color: '#E63946' },

  selectRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  input: {
    width: '120px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  searchBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  noticeText: { fontSize: '12px', color: '#aaa', marginTop: '-5px', marginBottom: '15px' },

  rankList: { maxWidth: '900px', margin: '0 auto', textAlign: 'left' },
  rankItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', borderBottom: '1px solid #333',
    backgroundColor: '#1e1e1e', marginBottom: '5px', borderRadius: '5px',
  },
  rankNumber: { fontWeight: 'bold', width: '60px' },
  playerName: { flexGrow: 1 },
  tierBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px' },
  tierImage: { width: '30px', height: '30px', objectFit: 'contain' },
  rankRating: { width: '100px', textAlign: 'right', color: '#4af' },
  wins: { width: '80px', textAlign: 'right', color: '#4f4' },
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
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 28,
    padding: 12,
    alignSelf: 'flex-end',
    cursor: 'pointer',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '0 12px 12px',
  },
  link: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #444',
    background: '#1e1e1e',
    color: '#fff',
    textAlign: 'left',
    cursor: 'pointer',
  },
  linkActive: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '2px solid #E63946',
    background: '#2a2a2a',
    color: '#fff',
    textAlign: 'left',
    cursor: 'default',
    fontWeight: 700,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.4)',
    zIndex: 1005,
  },
};

export default RankPage;
