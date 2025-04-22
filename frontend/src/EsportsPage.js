// EsportsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const leagues = ['PACIFIC', 'EMEA', 'NA', 'CN'];

const leagueImages = {
  PACIFIC: '/leagues/PACIFIC.jpg',
  EMEA: '/leagues/EMEA.jpg',
  NA: '/leagues/NA.jpg',
  CN: '/leagues/CN.jpg',
};

function EsportsPage() {
  const navigate = useNavigate();
  const [selectedLeagues, setSelectedLeagues] = useState(leagues);

  const toggleLeague = (league) => {
    if (selectedLeagues.includes(league)) {
      setSelectedLeagues(selectedLeagues.filter((l) => l !== league));
    } else {
      setSelectedLeagues([...selectedLeagues, league]);
    }
  };

  const toggleAll = () => {
    if (selectedLeagues.length === leagues.length) {
      setSelectedLeagues([]);
    } else {
      setSelectedLeagues(leagues);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>E-Sports</span>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.leagueButtons}>
          <div
            onClick={toggleAll}
            style={{
              ...styles.leagueSelector,
              borderColor: selectedLeagues.length === leagues.length ? '#4A90E2' : '#ddd',
              boxShadow: selectedLeagues.length === leagues.length ? '0 0 0 2px #4A90E2' : 'none',
              justifyContent: 'center'
            }}
          >
            <span style={styles.leagueName}>전체</span>
          </div>

          {leagues.map((league) => (
            <div
              key={league}
              onClick={() => toggleLeague(league)}
              style={{
                ...styles.leagueSelector,
                borderColor: selectedLeagues.includes(league) ? '#4A90E2' : '#ddd',
                boxShadow: selectedLeagues.includes(league) ? '0 0 0 2px #4A90E2' : 'none',
              }}
            >
              <img
                src={leagueImages[league]}
                alt={league}
                style={styles.leagueButtonImage}
              />
              <span style={styles.leagueName}>{league}</span>
            </div>
          ))}
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
  content: {
    paddingTop: '120px',
    textAlign: 'center',
  },
  leagueButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  leagueSelector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '6px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    width: '140px',
    height: '140px',
    cursor: 'pointer',
    transition: '0.2s ease',
    justifyContent: 'center',
  },
  leagueButtonImage: {
    width: '90px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  leagueName: {
    marginTop: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};

export default EsportsPage;
