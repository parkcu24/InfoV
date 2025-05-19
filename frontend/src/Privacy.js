import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Privacy() {
  const navigate = useNavigate();
  const [riotId, setRiotId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
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
        <h1>개인정보 처리방침</h1>
        <p><strong>최종 수정일: 2025년 5월 18일</strong></p>

        <h2>1. 수집하는 정보</h2>
        <p>
          InfoV는 Riot Games의 OAuth(RSO) 시스템을 통해 사용자의 인증된 정보에 접근합니다.
          당사는 사용자의 <strong>게임 닉네임, PUUID, 매치 데이터</strong> 등 Riot API를 통해 제공되는 정보만을 조회하며,
          그 외 민감한 개인정보(이름, 이메일 등)는 수집하지 않습니다.
        </p>

        <h2>2. 정보 이용 목적</h2>
        <ul>
          <li>사용자 본인의 Valorant 전적 및 통계 제공</li>
          <li>사용자의 요청에 따른 전적 공개 기능 제공</li>
          <li>서비스 품질 개선 및 오류 분석</li>
        </ul>

        <h2>3. 정보 저장 및 보유</h2>
        <p>
          InfoV는 사용자의 <strong>명시적인 동의</strong>가 있을 경우에만 정보를 저장합니다.
          저장된 데이터는 사용자가 전적 공개를 허용한 경우에 한해 공개되며,
          동의를 철회하면 관련 정보는 즉시 삭제됩니다.
        </p>

        <h2>4. 제3자 제공</h2>
        <p>
          당사는 수집된 정보를 제3자에게 판매하거나 공유하지 않으며,
          오직 Riot API 정책 및 본 방침에 따라 사용됩니다.
        </p>

        <h2>5. 사용자 권리</h2>
        <p>
          사용자는 언제든지 본인의 정보 접근, 수정, 삭제 요청을 할 수 있으며,
          요청은 서비스 내 또는 이메일을 통해 접수할 수 있습니다.
        </p>

        <h2>6. 쿠키 및 추적 기술</h2>
        <p>
          본 사이트는 사용자 경험 향상을 위한 기본적인 쿠키만을 사용하며,
          타겟 광고나 마케팅 목적의 추적 쿠키는 사용하지 않습니다.
        </p>

        <h2>7. 보안</h2>
        <p>
          사용자의 정보는 안전하게 보호되며, HTTPS를 포함한 여러 보안 조치를 통해 전송 및 저장됩니다.
        </p>

        <h2>8. 정책 변경</h2>
        <p>
          본 개인정보 처리방침은 변경될 수 있으며, 변경 시 웹사이트를 통해 고지됩니다.
        </p>

        <h2>9. 문의</h2>
        <p>
          개인정보 관련 문의는 [문의 이메일 또는 서비스 내 채널]을 통해 언제든지 가능합니다.
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#eee',
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
    height: '72px',
    zIndex: 1000,
    overflow: 'visible',
  },
  left: { flex: '1 1 auto', display: 'flex', alignItems: 'center' },
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
  content: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '60px 20px',
    lineHeight: '1.7',
  },
};

export default Privacy;
