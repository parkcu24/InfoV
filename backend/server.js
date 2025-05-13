console.log('✅✅✅ server.js 코드 실행됨');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const PORT = 5050;  // 포트 먼저 선언

console.log(`👉 서버가 ${PORT} 포트에서 곧 실행될 예정`);

// 🔽 라우터 import
const rankingsRouter = require('./routes/rankings');
const actsRouter = require('./routes/acts');
const rotationRouter = require('./routes/rotation');

// 🔧 CORS 설정: 로컬 + Vercel 주소 허용
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://info-1pff0vemd-parkcu24s-projects.vercel.app' // ✅ Vercel 도메인
  ],
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

// JSON 요청 파싱
app.use(express.json());

// 🔗 라우터 연결
app.use('/api/rankings', rankingsRouter);
app.use('/api/acts', actsRouter);
app.use('/api/rotation', rotationRouter);

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅✅✅ Server running on http://localhost:${PORT}`);
});
