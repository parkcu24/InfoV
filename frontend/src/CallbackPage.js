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

// (styles 객체는 그대로 유지)
export default CallbackPage;
