// server.js
console.log('✅✅✅ server.js 코드 실행됨');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Render/배포 환경도 동작하도록 PORT 우선
const PORT = process.env.PORT || 5050;

// 🔽 라우터 import
const rankingsRouter = require('./routes/rankings');
const actsRouter = require('./routes/acts');
const rotationRouter = require('./routes/rotation');
const searchRouter = require('./routes/search');
const authRouter = require('./routes/auth');

// ✅ CORS 설정
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5050',        // 로컬에서 직접 찍을 때
  'http://127.0.0.1:5050',
  'https://infov.vercel.app',     // prod
  /^https:\/\/info-[\w-]+-parkcu24s-projects\.vercel\.app$/, // preview
  // 필요 시 Render 도메인도 허용 (백엔드에 직접 접속 테스트용)
  /^https:\/\/.+\.onrender\.com$/
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // 서버-서버/로컬 툴 호출 허용
    const ok = allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin));
    if (ok) cb(null, true);
    else {
      console.warn('❌ CORS 차단:', origin);
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// 프리플라이트 빠른 응답
app.options('*', cors(corsOptions));

app.use(express.json());

// 🔹 헬스체크 (빠른 연결 확인용)
app.get('/health', (_, res) => res.status(200).send('ok'));

// 🔗 라우터 연결
app.use('/api/rankings', rankingsRouter);
app.use('/api/acts', actsRouter);
app.use('/api/rotation', rotationRouter);
app.use('/api/search', searchRouter);
app.use('/api/auth', authRouter);

// 🟢 서버 시작 (0.0.0.0 바인딩: WSL/도커/배포 호환)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`👉 서버가 ${PORT} 포트에서 곧 실행될 예정`);
  console.log(`✅✅✅ Server listening on http://localhost:${PORT}`);
});
