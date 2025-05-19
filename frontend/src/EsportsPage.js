import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

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

  const handleSearch = () => {
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      alert('아이디 형식을 확인해주세요. 예: CU24#KR');
      return;
    }
    setIsLoading(true);
    navigate(`/search-result?name=${encodeURIComponent(gameName)}&tag=${encodeURIComponent(tagLine)}`);
    setIsLoading(false);
  };

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

  const filteredSchedule = useMemo(() => {
    return scheduleData
      .filter(
        (match) =>
          match['경기종류'] &&
          selectedLeagues.includes(match['경기종류'].toUpperCase())
      )
      .sort((a, b) => {
        const dateA = new Date(`${a['날짜']} ${a['시간']}`);
        const dateB = new Date(`${b['날짜']} ${b['시간']}`);
        return dateB - dateA;
      });
  }, [scheduleData, selectedLeagues]);

  useEffect(() => {
    const today = new Date();
    const futureMatchIndex = filteredSchedule.findIndex((match) => {
      const matchTime = new Date(`${match['날짜']} ${match['시간']}`);
      return matchTime >= today;
    });

    if (futureMatchIndex !== -1 && scrollRef.current) {
      const matchElement = scrollRef.current.querySelector(`[data-index="${futureMatchIndex}"]`);
      if (matchElement) {
        matchElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [filteredSchedule]);

  let lastDate = '';

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            onClick={() => navigate('/')}
          />
        </div>

        <div style={styles.center}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={{ ...styles.navItem, fontWeight: 'bold', fontSize: '20px' }}>E-Sports</span>
        </div>

        <div style={styles.right}>
          <input
            type="text"
            placeholder="예: CU24#KR"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            style={styles.topSearchInput}
          />
          <button style={styles.searchButton} onClick={handleSearch} disabled={isLoading}>
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.leagueButtons}>
          <div onClick={toggleAll} style={{
            ...styles.leagueSelector,
            borderColor: selectedLeagues.length === leagues.length ? '#4A90E2' : '#555',
            boxShadow: selectedLeagues.length === leagues.length ? '0 0 0 2px #4A90E2' : 'none',
            justifyContent: 'center'
          }}>
            <span style={styles.leagueName}>전체</span>
          </div>

          {leagues.map((league) => (
            <div key={league} onClick={() => toggleLeague(league)} style={{
              ...styles.leagueSelector,
              borderColor: selectedLeagues.includes(league) ? '#4A90E2' : '#555',
              boxShadow: selectedLeagues.includes(league) ? '0 0 0 2px #4A90E2' : 'none',
            }}>
              <img src={leagueImages[league]} alt={league} style={styles.leagueButtonImage} />
              <span style={styles.leagueName}>{league}</span>
            </div>
          ))}
        </div>

        <div style={styles.matchCards} ref={scrollRef}>
          {filteredSchedule.map((match, idx) => {
            const isNewDay = match['날짜'] !== lastDate;
            lastDate = match['날짜'];
            return (
              <React.Fragment key={idx}>
                {isNewDay && <hr style={styles.dateDivider} />}
                <div style={styles.card} data-index={idx}>
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
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: 'Black Han Sans, sans-serif',
    paddingTop: '72px',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #333',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
    height: '72px',
    overflow: 'visible',
  },
  left: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
  },
  center: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  right: {
    flex: 1.5,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    paddingRight: '50px',
  },
  logoImage: {
    height: '200px',
    marginTop: '-8px',
    cursor: 'pointer',
  },
  navItem: {
    fontSize: '18px',
    color: '#DDD',
    cursor: 'pointer',
  },
  topSearchInput: {
    height: '34px',
    fontSize: '14px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  searchButton: {
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: '#E63946',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  content: { paddingTop: '40px', textAlign: 'center' },
  leagueButtons: {
    marginTop: '30px', // ✅ 추가
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
    border: '2px solid #555',
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
    color: '#fff',
  },
  matchCards: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    padding: '20px',
  },
  card: {
    backgroundColor: '#4a4a4a',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(255,255,255,0.05)',
    padding: '20px',
    width: '90%',
    maxWidth: '700px',
    textAlign: 'center',
    position: 'relative',
    color: '#fff',
  },
  teamsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '10px',
  },
  teamBox: {
    display: 'flex',
    alignItems: 'center',
    width: '40%',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  teamLogoLeft: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    marginRight: '12px',
  },
  teamLogoRight: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    marginLeft: '12px',
  },
  vs: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ccc',
  },
  matchInfo: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#aaa',
  },
  resultButtonContainer: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  resultButton: {
    padding: '4px 10px',
    border: '1px solid #888',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  resultText: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  dateDivider: {
    width: '90%',
    height: '2px',
    backgroundColor: '#555',
    margin: '20px 0',
  },
};

export default EsportsPage;
