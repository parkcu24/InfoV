// src/pages/EsportsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EsportsPage.css';
import { ReactComponent as WorldMap } from './assets/world.svg'; // ✅ 경로 수정

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

  useEffect(() => {
    const newRandoms = {};
    tournaments.forEach(t => {
      const randomIndex = Math.floor(Math.random() * t.images.length);
      newRandoms[t.name] = t.images[randomIndex];
    });
    setRandomImages(newRandoms);
  }, []);

  const handleClick = (path) => {
    navigate(path);
  };

  const handleSearch = () => {
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}`);
  };

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <img src="/InfoV_logo.png" alt="INFOV Logo" style={styles.logoImage} onClick={() => navigate('/')} />
        </div>
        <div style={styles.center}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>E-Sports</span>
        </div>
        <div style={styles.right}>
          <input type="text" placeholder="예: CU24#KR" value={riotId} onChange={(e) => setRiotId(e.target.value)} style={styles.topSearchInput} />
          <button style={styles.searchButton} onClick={handleSearch}>검색</button>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 className="esports-title">2025 VCT 대회 일정</h1>
        <div className="card-container">
          {tournaments.map((t, idx) => (
            <div
              key={idx}
              className="tournament-card"
              onClick={() => handleClick(t.path)}
              style={{
                backgroundImage: `url(${randomImages[t.name]})`,
                border: `2px solid ${t.color}`,
              }}
            >
              <div className="card-overlay">
                <h2 className="card-title">{t.name}</h2>
                <p className="card-city">{t.city}</p>
                <p>{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: '#121212', minHeight: '100vh', color: '#fff', fontFamily: 'Black Han Sans, sans-serif' },
  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', backgroundColor: '#1E1E1E', borderBottom: '1px solid #333', position: 'fixed', top: 0, width: '100%', zIndex: 1000, height: '72px' },
  left: { flex: '1 1 auto', display: 'flex', alignItems: 'center' },
  center: { flex: '1 1 auto', display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' },
  right: { flex: 1.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingRight: '50px' },
  logoImage: { height: '200px', marginTop: '-8px', cursor: 'pointer' },
  navItem: { fontSize: '18px', color: '#DDD', cursor: 'pointer' },
  topSearchInput: { height: '34px', fontSize: '14px', padding: '0 10px', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#1e1e1e', color: '#fff' },
  searchButton: { padding: '6px 12px', fontSize: '14px', backgroundColor: '#E63946', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  content: { paddingTop: '140px', textAlign: 'center' },
};

export default EsportsPage;
