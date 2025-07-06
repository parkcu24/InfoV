// src/CallbackPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      fetch(`http://localhost:5050/api/auth/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          // 여기에서 로그인 완료 처리 (예: 토큰 저장 등)
          console.log('OAuth 로그인 성공:', data);
          navigate('/'); // 로그인 후 홈으로 이동
        })
        .catch(err => {
          console.error('OAuth 처리 중 오류:', err);
          navigate('/error');
        });
    } else {
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
    buttonGroup: {
      marginTop: '40px',
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    grayButton: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#555',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    blueButton: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#4A90E2',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
  };

export default CallbackPage;
