// server.js
console.log('✅✅✅ server.js 코드 실행됨');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// ✅ Render/배포 환경도 동작하도록 PORT 우선
const PORT = process.env.PORT || 5050;

// ✅ (중요) Render/Nginx 프록시 뒤에서 secure cookie / https 판단 안정화
app.set('trust proxy', 1);

// 🔽 라우터 import
const rankingsRouter = require('./routes/rankings');
const actsRouter = require('./routes/acts');
const rotationRouter = require('./routes/rotation');
const searchRouter = require('./routes/search');
const authRouter = require('./routes/auth');
const publicRouter = require('./routes/public'); // ✅ 추가

// ✅ CORS 설정
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5050',
  'http://127.0.0.1:5050',
  'https://infov.vercel.app',
  /^https:\/\/info-[\w-]+-parkcu24s-projects\.vercel\.app$/, // preview
  /^https:\/\/.+\.onrender\.com$/, // 필요 시 백엔드 도메인 테스트
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // 서버-서버/로컬 툴 호출 허용
    const ok = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
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

// ✅ 미들웨어 순서가 중요함
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight
app.use(express.json());

// ✅ 쿠키 파싱은 라우터보다 먼저!
app.use(cookieParser());

// 기본 라우트/헬스체크
app.get('/', (req, res) => res.send('✅ InfoV backend is running on Render'));
app.get('/health', (_, res) => res.status(200).send('ok'));

// 🔗 라우터 연결
app.use('/api/rankings', rankingsRouter);
app.use('/api/acts', actsRouter);
app.use('/api/rotation', rotationRouter);
app.use('/api/search', searchRouter);

// ✅ authRouter에 cors를 "또" 붙일 필요 없음 (위에서 이미 전역 적용)
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter); // ✅ 추가 (auth 아래/위 상관없음)

// 에러 핸들러 (CORS 오류 등 보기 좋게)
app.use((err, req, res, next) => {
  console.error('❌ 서버 에러:', err.message || err);
  res.status(500).json({ error: err.message || 'Server error' });
});

// 🟢 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅✅✅ Server listening on http://localhost:${PORT}`);
});
