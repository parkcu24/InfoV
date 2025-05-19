import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Terms() {
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
        <h1>서비스 이용약관</h1>
        <p><strong>최종 수정일: 2025년 5월 18일</strong></p>

        <h2>1. 개요</h2>
        <p>
          본 이용약관은 사용자가 InfoV(이하 "당사")에서 제공하는 서비스(https://infov.vercel.app)를 이용함에 있어 필요한
          권리, 의무 및 책임사항을 규정합니다. 서비스를 이용함으로써 귀하는 본 약관에 동의하게 됩니다.
        </p>

        <h2>2. 서비스 내용</h2>
        <p>
          당사는 Riot Games API 및 사용자 인증 시스템(RSO)을 활용하여 Valorant 전적 정보 및 기타 통계 데이터를 제공합니다.
          사용자 로그인 후 본인의 데이터에 접근할 수 있으며, 동의 시 일부 데이터를 공개할 수 있습니다.
        </p>

        <h2>3. 사용자 계정 및 보안</h2>
        <p>
          사용자는 Riot 계정으로 로그인하며, 개인 정보 및 인증 관련 정보는 Riot OAuth 시스템을 통해 안전하게 처리됩니다.
          로그인한 사용자만 자신의 데이터를 조회하거나 선택적으로 공개할 수 있습니다.
        </p>

        <h2>4. 데이터 저장 및 공개</h2>
        <p>
          당사는 사용자의 명시적 동의가 없는 한 어떤 데이터도 저장하거나 공개하지 않습니다. 동의한 사용자에 한해
          매치 기록 및 프로필 정보를 공개하며, 사용자는 언제든지 철회할 수 있습니다.
        </p>

        <h2>5. 금지 사항</h2>
        <ul>
          <li>타인의 계정을 무단으로 사용하거나 허가 없이 접근하는 행위</li>
          <li>서비스를 비정상적으로 이용하거나 방해하는 행위</li>
          <li>Riot Games의 정책을 위반하는 자동 수집 또는 크롤링 시도</li>
        </ul>

        <h2>6. 책임의 한계</h2>
        <p>
          본 서비스는 Riot Games의 공식 서비스가 아니며, Riot API를 기반으로 한 팬 프로젝트입니다.
          Riot Games는 본 서비스에 대해 어떤 책임도 지지 않습니다.
        </p>

        <h2>7. 약관 변경</h2>
        <p>
          당사는 필요 시 본 약관을 변경할 수 있으며, 변경 사항은 웹사이트에 공지됩니다.
          변경 이후에도 서비스를 계속 이용하는 경우, 개정된 약관에 동의한 것으로 간주됩니다.
        </p>

        <h2>8. 문의</h2>
        <p>
          약관 또는 서비스에 대한 문의사항은 pskcu1357@naver.com 이메일을 통해 접수받고 있습니다.
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

export default Terms;
