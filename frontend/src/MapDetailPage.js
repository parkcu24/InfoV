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

  const maps = rotationByMode?.[selectedMode] || [];

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 메뉴바 */}
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      {/* 본문 */}
      <div style={styles.content}>
        <h1 style={styles.seasonTitle}>
          {loading ? '시즌 정보 불러오는 중...' : seasonTitle || '시즌 정보 없음'}
        </h1>

        {/* 모드 선택 버튼 */}
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

        {/* 맵 리스트 */}
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
                onClick={() => navigate(`/maps/${map}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <img
                  src={`/maps/${mapImageMap[map] || 'unknown'}.jpg`}
                  alt={map}
                  style={styles.mapImage}
                  onError={(e) => {
                    e.currentTarget.src = '/maps/unknown.jpg';
                  }}
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
  pageWrapper: { backgroundColor: '#f5f5f5', minHeight: '100vh' },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ddd',
    position: 'relative',
  },
  logo: {
    position: 'absolute',
    left: '40px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
    cursor: 'pointer',
  },
  navItems: { display: 'flex', gap: '30px' },
  navItem: { fontSize: '18px', color: '#333', cursor: 'pointer' },
  content: { padding: '100px 40px 40px 40px' },
  seasonTitle: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' },
  modeContainer: {
    display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap'
  },
  modeItem: { fontSize: '16px', color: '#222', cursor: 'pointer' },
  mapGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  mapCard: {
    backgroundColor: '#fff',
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
  mapName: {
    marginTop: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default MapRotationPage;
