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
  const [filterType, setFilterType] = useState('edition');
  const [selectedEditions, setSelectedEditions] = useState(editions.map(e => e.short));
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const filteredSkinSets = skinSets.filter(skin =>
    selectedEditions.includes(skin.edition)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '80px' }}>
        <ClipLoader size={50} color="#007bff" />
        <p style={{ marginTop: 10, color: '#555' }}>스킨 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

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
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold' }}>스킨</span>
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

      <div style={styles.grid}>
        {filteredSkinSets.map((set, idx) => (
          <div key={idx} style={styles.card} onClick={() => navigate(`/skins/${set.setName}`)}>
            <img
              src={set.coverImage}
              alt={set.setName}
              style={styles.image}
              onError={(e) => e.target.src = '/default-skin.png'}
            />
            <div style={styles.label}>{set.setName}</div>
          </div>
        ))}
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
    paddingTop: '72px', // ✅ navbar 높이만큼 확보
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
  filterTypeBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '60px', // ✅ 기존 40px → 60px (살짝만 띄움)
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
  editionIcon: {
    width: '20px',
    height: '20px',
  },
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
