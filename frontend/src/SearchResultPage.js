import React from 'react';
import { useLocation } from 'react-router-dom';

function SearchResultPage() {
  const query = new URLSearchParams(useLocation().search);
  const gameName = query.get('name');
  const tagLine = query.get('tag');

  const handleLogin = () => {
    // Riot OAuth 로그인 시작
    window.location.href = 'http://localhost:5050/api/auth/login';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.message}>
        "{gameName}#{tagLine}" 전적 정보가 없습니다.
      </h2>
      <button style={styles.button} onClick={handleLogin}>
        로그인 하기
      </button>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '150px',
    textAlign: 'center',
  },
  message: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '18px',
    backgroundColor: '#4A90E2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default SearchResultPage;
