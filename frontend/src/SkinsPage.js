// SkinPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const dummySkins = [
  { id: 1, name: '약탈자1.0', image: '/skins/Reaver1.jpg', rating: 4.5 },
  { id: 2, name: '아이온1.0', image: '/skins/Aion1.jpg', rating: 4.2 },
  { id: 3, name: '프라임1.0', image: '/skins/Prime1.jpg', rating: 4.2 },
  { id: 4, name: '도깨비1.0', image: '/skins/Oni1.jpg', rating: 4.2 },
  { id: 5, name: 'RGX1.0', image: '/skins/RGX1.jpg', rating: 4.2 },
  { id: 6, name: '챔피언스2021', image: '/skins/Champions2021.jpg', rating: 4.2 },
  { id: 7, name: '챔피언스2022', image: '/skins/Champions2022.jpg', rating: 4.2 },
  { id: 8, name: '챔피언스2023', image: '/skins/Champions2023.jpg', rating: 4.2 },
  { id: 9, name: '챔피언스2024', image: '/skins/Champions2024.jpg', rating: 4.2 },
];

function SkinPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.skinGrid}>
        {dummySkins.map(skin => (
          <button
            key={skin.id}
            style={styles.skinCard}
            onClick={() => navigate(`/skins/${skin.id}`)}
          >
            <img src={skin.image} alt={skin.name} style={styles.skinImage} />
            <div style={styles.skinInfo}>
              <div style={styles.skinName}>{skin.name}</div>
              <div style={styles.skinRating}>⭐ {skin.rating.toFixed(1)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    padding: '20px 40px',
    backgroundColor: '#fff',
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
  skinGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '24px',
    padding: '40px',
  },
  skinCard: {
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    width: '240px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  skinImage: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
  },
  skinInfo: {
    padding: '12px',
  },
  skinName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  skinRating: {
    color: '#888',
    fontSize: '14px',
  },
};

export default SkinPage;
