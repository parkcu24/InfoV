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
          <span className="navItem" style={styles.navItem} onClick={() => navigate('/agents')}>요원</span>
          <span className="navItem" style={styles.navItem} onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span className="navItem" style={styles.navItem} onClick={() => navigate('/skins')}>스킨</span>
          <span className="navItem" style={styles.navItem} onClick={() => navigate('/rank')}>랭킹</span>
          <span className="navItem" style={styles.navItem} onClick={() => navigate('/esports')}>E-Sports</span>
        </div>

        <div style={styles.right}>
          <button className="loginButton" style={styles.loginButton}>로그인</button>
          <input
            type="text"
            placeholder="예) CU24#KR"
            style={styles.topSearchInput}
          />
          <button style={styles.searchButton}>검색</button>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div style={styles.main}>
        <h1 style={styles.title}>INFOV</h1>

        <div style={styles.searchSection}>
          <select style={styles.select}>
            <option value="asia">아시아 서버</option>
            <option value="kr">한국 서버</option>
            <option value="cn">중국 서버</option>
            <option value="na">미국 서버</option>
            <option value="eu">유럽 서버</option>
          </select>

          <input
            type="text"
            placeholder="아이디를 입력해주세요 ex.) CU24#편의점"
            style={styles.input}
          />

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
    flexWrap: 'wrap',
  },
  left: {
    flex: '1 1 auto',
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
  loginButton: {
    padding: '6px 12px',
    fontSize: '15px',
    backgroundColor: 'transparent',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  topSearchInput: {
    height: '34px',
    fontSize: '14px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    whiteSpace: 'nowrap'
  },
  searchButton: {
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: '#4A90E2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
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
    flexWrap: 'wrap',
    justifyContent: 'center',
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
