console.log('✅✅✅ server.js 코드 실행됨');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5050;

console.log(`👉 서버가 ${PORT} 포트에서 곧 실행될 예정`);

// 🔽 라우터 import
const rankingsRouter = require('./routes/rankings');
const actsRouter = require('./routes/acts');
const rotationRouter = require('./routes/rotation');
const searchRouter = require('./routes/search');
const authRouter = require('./routes/auth');

// ✅ CORS 설정
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://infov.vercel.app', // ✅ production 도메인 허용
      /^https:\/\/info-[\w-]+-parkcu24s-projects\.vercel\.app$/ // ✅ preview 도메인 허용
    ];

    if (!origin || allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )) {
      callback(null, true);
    } else {
      console.warn('❌ CORS 차단:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔗 라우터 연결
app.use('/api/rankings', rankingsRouter);
app.use('/api/acts', actsRouter);
app.use('/api/rotation', rotationRouter);
app.use('/api/search', searchRouter);
app.use('/api/auth', authRouter);

// 🟢 서버 시작
app.listen(PORT, () => {
  console.log(`✅✅✅ Server running on http://localhost:${PORT}`);
});
