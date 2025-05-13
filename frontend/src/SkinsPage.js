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

  useEffect(() => {
    axios.get('/data/skins.json')
      .then(res => {
        const raw = res.data;
        const parsed = [];

        Object.entries(raw).forEach(([setName, details]) => {
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

  const filteredSkinSets = skinSets.filter(skin => {
    return selectedEditions.includes(skin.edition);
  });

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
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold' }}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.filterTypeBar}>
        {editions.map(({ icon, short, name }) => (
          <button
            key={short}
            style={{
              ...styles.editionButton,
              borderColor: selectedEditions.includes(short) ? '#4A90E2' : '#ddd',
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
  pageWrapper: { backgroundColor: '#f9f9f9', minHeight: '100vh' },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px',
    padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #ddd', position: 'relative'
  },
  logo: { position: 'absolute', left: '40px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' },
  navItems: { display: 'flex', gap: '30px' },
  navItem: { fontSize: '18px', cursor: 'pointer', color: '#333' },
  filterTypeBar: {
    display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap',
    marginTop: '20px', marginBottom: '20px'
  },
  editionButton: {
    display: 'flex', alignItems: 'center', gap: '6px',
    border: '2px solid #ddd', background: '#fff',
    borderRadius: '8px', cursor: 'pointer', padding: '4px 8px',
    fontSize: '12px'
  },
  editionIcon: { width: '20px', height: '20px' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px', padding: '40px'
  },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer'
  },
  image: { width: '100%', height: '140px', objectFit: 'cover' },
  label: { padding: '12px', fontWeight: 'bold', fontSize: '16px' }
};

export default SkinPage;
