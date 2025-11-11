// 📁 src/CallbackPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');

    if (token) {
      localStorage.setItem('riot_access_token', token);
      console.log('✅ 로그인 성공! Access Token 저장됨:', token);
      navigate('/'); // 홈 또는 전적 페이지로 이동
    } else {
      console.error('❌ access_token 없음');
      navigate('/');
    }
  }, [navigate]);

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
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>로그인 처리 중입니다...</h1>
        <p style={styles.message}>
          Riot 계정 인증을 확인하고 있습니다.
          <br />
          잠시만 기다려 주세요.
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
  content: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  message: {
    fontSize: '18px',
    color: '#bbb',
    lineHeight: '1.6',
  },
};

export default CallbackPage;
