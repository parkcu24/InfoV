import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function MapDetailPage() {
  const { mapName } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 메뉴바 */}
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.mapTitle}>{mapName}</h1>
        <img
          src={`/maps/${mapName}.jpg`}
          alt={mapName}
          style={styles.mapImage}
        />
        <p style={styles.description}>"{mapName}" 맵에 대한 설명을 여기에 작성할 수 있습니다.</p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
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
  navItems: {
    display: 'flex',
    gap: '30px',
  },
  navItem: {
    fontSize: '18px',
    color: '#333',
    cursor: 'pointer',
  },
  content: {
    padding: '100px 40px 40px 40px',
    textAlign: 'center',
  },
  mapTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  mapImage: {
    width: '80%',
    maxWidth: '600px',
    height: 'auto',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  description: {
    fontSize: '18px',
    color: '#555',
    lineHeight: '1.6',
  },
};

export default MapDetailPage;