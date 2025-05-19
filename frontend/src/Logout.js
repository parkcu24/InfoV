function Logout() {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>로그아웃 되었습니다 👋</h1>
        <p style={{ fontSize: '18px', color: '#555' }}>
          계정에서 안전하게 로그아웃 처리되었습니다.<br />
          다시 로그인하려면 아래 버튼을 눌러주세요.
        </p>
  
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#888',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            홈으로 이동
          </button>
  
          <button
            onClick={() => (window.location.href = 'http://localhost:5050/api/auth/login')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4A90E2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            다시 로그인하기
          </button>
        </div>
      </div>
    );
  }
  
  export default Logout;
  