// ✅ HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <span style={styles.logo} onClick={() => navigate('/')}>INFOV</span>
        </div>
        <div style={styles.center}>
        <span style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>

        <div style={styles.right}>
          {/* 향후 유저 정보나 로그인 버튼 들어올 공간 */}
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div style={styles.main}>
        <h1 style={styles.title}>INFOV</h1>

        <div style={styles.searchSection}>
          {/* 서버 선택 왼쪽 */}
          <select style={styles.select}>
            <option value="asia">아시아 서버</option>
            <option value="kr">한국 서버</option>
            <option value="cn">중국 서버</option>
            <option value="na">미국 서버</option>
            <option value="eu">유럽 서버</option>
          </select>

          {/* 아이디 입력 */}
          <input
            type="text"
            placeholder="아이디를 입력해주세요 ex.) CU24#편의점"
            style={styles.input}
          />

          {/* INFOV 버튼 오른쪽 */}
          <button style={styles.button}>INFOV</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f5f5f5',
    color: '#222',
    fontFamily: 'Black Han Sans, sans-serif',
    minHeight: '100vh',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ddd',
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
  },
  left: {
    flex: 1,
  },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
    cursor: 'pointer',
  },
  navItem: {
    fontSize: '18px',
    color: '#333',
    cursor: 'pointer',
    fontWeight: 'normal',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '120px',
  },
  title: {
    fontSize: '72px',
    fontWeight: 'bold',
    marginBottom: '30px',
  },
  searchSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  select: {
    height: '40px',
    fontSize: '16px',
    padding: '0 10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  input: {
    width: '300px',
    height: '40px',
    fontSize: '16px',
    padding: '0 10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    height: '40px',
    padding: '0 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#4A90E2',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default HomePage;