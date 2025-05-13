console.log('✅✅✅ server.js 코드 실행됨');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const PORT = 5050;  // 🔥 여기에 PORT를 먼저 선언해야 함!!

console.log(`👉 서버가 ${PORT} 포트에서 곧 실행될 예정`);

const skinsRouter = require('./routes/skins');
const rankingsRouter = require('./routes/rankings');
const actsRouter = require('./routes/acts');  // ✅ 여기 맞아야 함
const rotationRouter = require('./routes/rotation');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/skins', skinsRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/acts', actsRouter);  // ✅
app.use('/api/rotation', rotationRouter); // ✅ 추가

app.listen(PORT, () => {
  console.log(`✅✅✅ Server running on http://localhost:${PORT}`);
});
