import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

function SkinDetailPage() {
  const { setName } = useParams();
  const navigate = useNavigate();
  const [skinList, setSkinList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/data/skins.json')
      .then(res => {
        const data = res.data[setName];
        if (data && data.skins) {
          setSkinList(data.skins);
        } else {
          console.warn('스킨 세트 데이터가 없습니다.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching skin detail:', err);
        setLoading(false);
      });
  }, [setName]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '80px' }}>
        <ClipLoader size={50} color="#007bff" />
        <p style={{ marginTop: 10, color: '#555' }}>스킨 정보를 불러오는 중입니다...</p>
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
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.header}>
        <h1>{setName} 스킨 목록</h1>
        <button style={styles.backButton} onClick={() => navigate(-1)}>← 뒤로가기</button>
      </div>

      <div style={styles.grid}>
        {skinList.map((skin, idx) => (
          <div key={idx} style={styles.card}>
            <img
              src={skin.displayIcon}
              alt={skin.displayName}
              style={styles.image}
              onError={(e) => e.target.src = '/default-skin.png'}
            />
            <div style={styles.label}>{skin.displayName}</div>
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
  header: {
    padding: '40px 20px 20px 20px',
    textAlign: 'center',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    left: '20px',
    top: '40px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px', padding: '40px'
  },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'
  },
  image: { width: '100%', height: '140px', objectFit: 'cover' },
  label: { padding: '12px', fontWeight: 'bold', fontSize: '16px' }
};

export default SkinDetailPage;
