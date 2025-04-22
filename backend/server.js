const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

const RIOT_API_KEY = 'RGAPI-d705f89c-ee0f-40cf-be49-bd86d0c55137'; // 여기에 RIOT API KEY 입력

// ✅ CORS 설정 추가
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ JSON 파싱 설정
app.use(express.json());

app.get('/account', async (req, res) => {
  const { username, tagline } = req.query;

  try {
    const response = await axios.get(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(username)}/${encodeURIComponent(tagline)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('라이엇 API 오류:', error.response?.data || error.message);
    res.status(500).json({ message: 'API 요청 실패', error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});