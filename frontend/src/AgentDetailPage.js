import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentDetails } from './agentData';

function AgentDetailPage() {
  const { agentName } = useParams();
  const navigate = useNavigate();

  const agent = agentDetails[agentName];

  // ✅ 조건문보다 위에서 Hook 선언
  const [selectedSkill, setSelectedSkill] = useState(
    agent && agent.skills.length > 0 ? agent.skills[0].name : ''
  );

  const currentSkill = agent?.skills.find(s => s.name === selectedSkill);

  if (!agent) {
    return (
      <div style={{ padding: '100px', color: '#fff', textAlign: 'center' }}>
        <h2>{agentName} 요원 정보를 찾을 수 없습니다.</h2>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <img
          src="/InfoV_logo.png"
          alt="INFOV Logo"
          style={styles.logoImage}
          onClick={() => navigate('/')}
        />
        <div style={styles.navItems}>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.topSection}>
        <img src={`/agents/${agent.image}`} alt={agent.korName} style={styles.agentImage} />
        <div style={styles.agentInfo}>
          <h1 style={styles.title}>
            <img src={agent.roleIcon} alt="role" style={styles.roleIcon} />
            {agent.korName}
          </h1>
          <p>포지션: {agent.role}</p>
          <p>주로 사용하는 맵: {agent.maps}</p>
          <p>픽률: {agent.pickRate}</p>
          <p>주로 사용하는 무기: {agent.weapons.join(', ')}</p>
        </div>
      </div>

      <div style={styles.skillSection}>
        <div style={styles.skillVideo}>
          {currentSkill && (
            <>
              <video width="100%" height="300" controls src={currentSkill.video} />
              <p style={styles.skillDesc}>{currentSkill.description}</p>
            </>
          )}
        </div>
        <div style={styles.skillList}>
          {agent.skills.map(skill => (
            <div
              key={skill.name}
              onClick={() => setSelectedSkill(skill.name)}
              style={{
                ...styles.skillItem,
                backgroundColor: skill.name === selectedSkill ? '#333' : 'transparent'
              }}
            >
              <img src={skill.icon} alt={skill.name} style={styles.skillIcon} />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    color: '#eee',
    fontFamily: 'Black Han Sans, sans-serif',
    minHeight: '100vh',
    paddingBottom: '60px'
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: '#1e1e1e',
    borderBottom: '1px solid #333',
    height: '72px',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  logoImage: {
    height: '48px',
    cursor: 'pointer'
  },
  navItems: {
    display: 'flex',
    gap: '30px'
  },
  navItem: {
    fontSize: '18px',
    color: '#DDD',
    cursor: 'pointer'
  },
  topSection: {
    display: 'flex',
    padding: '40px',
    gap: '40px',
    alignItems: 'center'
  },
  agentImage: {
    width: '300px',
    borderRadius: '8px'
  },
  agentInfo: {
    fontSize: '18px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  roleIcon: {
    width: '32px',
    height: '32px'
  },
  skillSection: {
    display: 'flex',
    padding: '0 40px',
    marginTop: '40px',
    gap: '40px',
    alignItems: 'flex-start'
  },
  skillVideo: {
    flex: 1
  },
  skillList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  skillItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  skillIcon: {
    width: '32px',
    height: '32px'
  },
  skillDesc: {
    marginTop: '10px',
    fontSize: '16px',
    color: '#ccc'
  }
};

export default AgentDetailPage;
