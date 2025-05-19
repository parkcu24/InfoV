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

  const handleSearch = () => {
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }
    setIsLoading(true);
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}`);
    setIsLoading(false);
  };

  const maps = rotationByMode?.[selectedMode] || [];

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            onClick={() => navigate('/')}
          />
        </div>

        <div style={styles.center}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>

        <div style={styles.right}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
          />
          <button style={styles.searchButton} onClick={handleSearch} disabled={isLoading}>
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>
      </nav>

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
    overflow: 'visible',
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
    flexWrap: 'wrap',
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
  content: {
    padding: '40px',
  },
  seasonTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
  },
  modeContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  modeItem: {
    fontSize: '16px',
    color: '#ccc',
    cursor: 'pointer',
  },
  mapGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
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
  mapName: {
    marginTop: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
  },
};

export default MapRotationPage;
