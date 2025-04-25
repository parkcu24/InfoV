import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function MapDetailPage() {
  const { mapName } = useParams();
  const navigate = useNavigate();

  // 맵별 요원 조합 및 순위
  const agentCombosByMap = {
    어센트: [
      ['브림스톤', '제트', '사이퍼', '스카이', '세이지'],
      ['오멘', '레이나', '페이드', '킬조이', '브리치']
    ],
    헤이븐: [
      ['오멘', '소바', '사이퍼', '제트', '브리치'],
      ['브림스톤', '스카이', '세이지', '게코', '바이퍼']
    ],
    바인드: [
      ['바이퍼', '요루', '레이즈', '스카이', '브림스톤'],
      ['오멘', '세이지', '소바', '브리치', '사이퍼']
    ],
  };

  const agentRanksByMap = {
    어센트: ['제트', '사이퍼', '브림스톤', '세이지', '스카이'],
    헤이븐: ['소바', '오멘', '제트', '사이퍼', '브리치'],
    바인드: ['레이즈', '바이퍼', '브림스톤', '스카이', '요루'],
  };

  const agentCombos = agentCombosByMap[mapName] || [];
  const agentRanks = agentRanksByMap[mapName] || [];

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

      <div style={styles.contentWrapper}>
        {/* 좌측 - 맵 정보 */}
        <div style={styles.leftColumn}>
          <h1 style={styles.mapTitle}>{mapName}</h1>
          <img
            src={`/maps/${mapName}.jpg`}
            alt={mapName}
            style={styles.mapImage}
          />
          <img
            src={`/maps/${mapName}-brief.png`}
            alt={`${mapName} 브리핑`}
            style={styles.mapBrief}
          />
        </div>

        {/* 우측 - 요원 정보 */}
        <div style={styles.rightColumn}>
          <h2 style={styles.sectionTitle}>추천 요원 조합</h2>
          {agentCombos.map((combo, idx) => (
            <div key={idx} style={styles.comboRow}>
              {combo.map((agent) => (
                <img
                  key={agent}
                  src={`/agents/${agent}.png`}
                  alt={agent}
                  title={agent}
                  style={styles.agentImageSmall}
                />
              ))}
            </div>
          ))}

          <h2 style={styles.sectionTitle}>요원 순위</h2>
          <div style={styles.rankListImages}>
            {agentRanks.map((agent, index) => (
              <div key={agent} style={styles.rankItem}>
                <img
                  src={`/agents/${agent}.png`}
                  alt={agent}
                  title={agent}
                  style={styles.agentImageSmall}
                />
                <span style={styles.agentName}>{`${index + 1}위: ${agent}`}</span>
              </div>
            ))}
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
  contentWrapper: {
    display: 'flex',
    padding: '100px 40px 40px 40px',
    gap: '40px',
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mapTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'left',
  },
  mapImage: {
    width: '100%',
    maxWidth: '600px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  mapBrief: {
    width: '100%',
    maxWidth: '600px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: '300px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#222',
  },
  comboRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
  },
  rankListImages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  rankItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  agentImageSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  agentName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
};

export default MapDetailPage;
