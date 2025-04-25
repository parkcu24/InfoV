// EsportsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [scheduleData, setScheduleData] = useState([]);
  const [revealedMatches, setRevealedMatches] = useState({});

  useEffect(() => {
    axios
      .get('https://opensheet.elk.sh/1ByDPqajUpphFNQh6JvFrbobApo7B_wL9-TQUMoju5Ks/Esports_valorant')
      .then((response) => {
        setScheduleData(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error('Error fetching schedule:', error);
      });
  }, []);

  const toggleLeague = (league) => {
    setSelectedLeagues((prev) =>
      prev.includes(league) ? prev.filter((l) => l !== league) : [...prev, league]
    );
  };

  const toggleAll = () => {
    setSelectedLeagues((prev) =>
      prev.length === leagues.length ? [] : leagues
    );
  };

  const toggleResult = (idx) => {
    setRevealedMatches(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredSchedule = scheduleData
    .filter(
      (match) =>
        match['경기종류'] &&
        selectedLeagues.includes(match['경기종류'].toUpperCase())
    )
    .sort((a, b) => {
      const dateA = new Date(`${a['날짜']} ${a['시간']}`);
      const dateB = new Date(`${b['날짜']} ${b['시간']}`);
      return dateA - dateB;
    });

  let lastDate = '';

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        <div style={styles.navItems}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span> {/* 새로 추가 */}
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>E-Sports</span>
        </div>
      </nav>
      <div style={styles.content}>
        <div style={styles.leagueButtons}>
          <div onClick={toggleAll} style={{
            ...styles.leagueSelector,
            borderColor: selectedLeagues.length === leagues.length ? '#4A90E2' : '#ddd',
            boxShadow: selectedLeagues.length === leagues.length ? '0 0 0 2px #4A90E2' : 'none',
            justifyContent: 'center'
          }}>
            <span style={styles.leagueName}>전체</span>
          </div>

          {leagues.map((league) => (
            <div key={league} onClick={() => toggleLeague(league)} style={{
              ...styles.leagueSelector,
              borderColor: selectedLeagues.includes(league) ? '#4A90E2' : '#ddd',
              boxShadow: selectedLeagues.includes(league) ? '0 0 0 2px #4A90E2' : 'none',
            }}>
              <img src={leagueImages[league]} alt={league} style={styles.leagueButtonImage} />
              <span style={styles.leagueName}>{league}</span>
            </div>
          ))}
        </div>

        <div style={styles.matchCards}>
          {filteredSchedule.map((match, idx) => {
            const isNewDay = match['날짜'] !== lastDate;
            lastDate = match['날짜'];
            return (
              <React.Fragment key={idx}>
                {isNewDay && <hr style={styles.dateDivider} />}
                <div style={styles.card}>
                  <div style={styles.resultButtonContainer}>
                    {match['결과'] && !revealedMatches[idx] ? (
                      <button style={styles.resultButton} onClick={() => toggleResult(idx)}>결과 보기</button>
                    ) : match['결과'] && (
                      <div style={styles.resultText}>{match['결과']}</div>
                    )}
                  </div>
                  <div style={styles.teamsRow}>
                    <div style={styles.teamBox}>
                      <img src={`/teams/${match['팀1']}.png`} alt={match['팀1']} style={styles.teamLogoLeft}
                        onError={(e) => e.target.style.display = 'none'} />
                      <div style={styles.nameContainer}><span>{match['팀1']}</span></div>
                    </div>
                    <span style={styles.vs}>VS</span>
                    <div style={styles.teamBox}>
                      <div style={styles.nameContainer}><span>{match['팀2']}</span></div>
                      <img src={`/teams/${match['팀2']}.png`} alt={match['팀2']} style={styles.teamLogoRight}
                        onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  </div>
                  <div style={styles.matchInfo}>
                    {match['날짜']} {match['시간']} | {match['경기종류']}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: '#f5f5f5', minHeight: '100vh' },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px',
    padding: '20px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #ddd',
    position: 'relative'
  },
  logo: { position: 'absolute', left: '40px', fontSize: '24px', fontWeight: 'bold', color: '#000', cursor: 'pointer' },
  navItems: { display: 'flex', gap: '30px' },
  navItem: { fontSize: '18px', color: '#333', cursor: 'pointer' },
  content: { paddingTop: '120px', textAlign: 'center' },
  leagueButtons: {
    display: 'flex', justifyContent: 'center', gap: '20px',
    marginBottom: '30px', flexWrap: 'wrap'
  },
  leagueSelector: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '6px', border: '2px solid #ddd', borderRadius: '10px',
    width: '140px', height: '140px', cursor: 'pointer',
    transition: '0.2s ease', justifyContent: 'center'
  },
  leagueButtonImage: { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px' },
  leagueName: { marginTop: '6px', fontSize: '14px', fontWeight: 'bold' },
  matchCards: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '30px', padding: '20px'
  },
  card: {
    backgroundColor: '#ffffff', borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '20px', width: '90%', maxWidth: '700px',
    textAlign: 'center', position: 'relative'
  },
  teamsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '10px', marginBottom: '10px'
  },
  teamBox: {
    display: 'flex', alignItems: 'center', width: '40%',
    justifyContent: 'space-between'
  },
  nameContainer: {
    flexGrow: 1, textAlign: 'center',
    fontWeight: 'bold', fontSize: '18px'
  },
  teamLogoLeft: { width: '48px', height: '48px', objectFit: 'contain', marginRight: '12px' },
  teamLogoRight: { width: '48px', height: '48px', objectFit: 'contain', marginLeft: '12px' },
  vs: { fontSize: '16px', fontWeight: 'bold', color: '#999' },
  matchInfo: { marginTop: '12px', fontSize: '14px', color: '#666' },
  resultButtonContainer: { position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)' },
  resultButton: {
    padding: '4px 10px', border: '1px solid #ccc', backgroundColor: '#fff',
    borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
  },
  resultText: { fontSize: '14px', fontWeight: 'bold' },
  dateDivider: {
    width: '90%', height: '2px', backgroundColor: '#ccc',
    margin: '20px 0'
  },
};

export default EsportsPage;
