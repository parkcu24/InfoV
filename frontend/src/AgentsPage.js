import React from 'react';
import { useNavigate } from 'react-router-dom';

const agentData = {
  "타격대": ["네온", "레이나", "레이즈", "아이소", "요루", "웨이레이", "제트", "피닉스"],
  "척후대": ["게코", "브리치", "소바", "스카이", "케이오", "테호", "페이드"],
  "감시자": ["데드록", "바이스", "사이퍼", "세이지", "체임버", "킬조이"],
  "전략가": ["바이퍼", "브림스톤", "아스트라", "오멘", "클로브", "하버"]
};

function AgentsPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 메뉴바 */}
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.pageContent}>
        {/* 왼쪽: 요원 목록 */}
        <div style={styles.leftColumn}>
          {Object.entries(agentData).map(([role, agents]) => (
            <div key={role}>
              <h2 style={styles.roleTitle}>{role}</h2>
              <div style={styles.grid}>
                {agents.map((name) => (
                  <div
                    key={name}
                    style={styles.card}
                    onClick={() => navigate(`/agents/${name}`)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={`/agents/${name}.png`}
                      alt={name}
                      style={styles.image}
                    />
                    <div style={styles.name}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 오른쪽: 랭킹 구조 */}
        <div style={styles.rightColumn}>
          <h2 style={styles.rankingTitle}>요원 랭킹</h2>
          <div style={styles.rankingBox}>
            <p>이곳에 요원 랭킹이 표시됩니다.</p>
          </div>
        </div>
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
  pageContent: {
    display: 'flex',
    padding: '40px',
    gap: '40px',
  },
  leftColumn: {
    flex: 3,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
  },
  roleTitle: {
    fontSize: '24px',
    margin: '30px 0 15px',
    color: '#222',
    fontWeight: 'bold',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '6px',
    width: '90px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s ease-in-out',
    cursor: 'pointer',
  },
  image: {
    width: '90px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  name: {
    marginTop: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  rankingTitle: {
    fontSize: '20px',
    marginBottom: '20px',
    color: '#222',
    fontWeight: 'bold',
  },
  rankingBox: {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
  },
};

export default AgentsPage;