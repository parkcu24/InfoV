import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AgentDetailPage() {
  const { agentName } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 메뉴바 */}
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span> {/* 새로 추가 */}
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>{agentName}</h1>
        <p style={styles.description}>요원 {agentName}에 대한 상세 정보를 여기에 표시할 수 있습니다.</p>
        {/* 예: 능력치, 역할, 배경 스토리 등 */}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ddd',
    position: 'relative'
  },
  logo: {
    position: 'absolute',
    left: '40px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
    cursor: 'pointer'
  },
  navItems: {
    display: 'flex',
    gap: '30px'
  },
  navItem: {
    fontSize: '18px',
    color: '#333',
    cursor: 'pointer'
  },
  content: {
    padding: '120px 40px 40px 40px',
    textAlign: 'center'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  description: {
    fontSize: '18px',
    color: '#444'
  }
};

export default AgentDetailPage;
