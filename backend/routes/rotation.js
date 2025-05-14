const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.RIOT_API_KEY;

// ✅ 수동 맵 로테이션 정의
const mapRotationByMode = {
  경쟁전: ['어센트', '헤이븐', '펄', '프랙처', '아이스박스', '바인드'],
  일반전: ['어센트', '로터스', '헤이븐', '펄', '프랙처', '스플릿', '아이스박스', '바인드', '선셋', '브리즈'],
  데스매치: ['어센트', '로터스', '헤이븐', '펄'],
  팀데스매치: ['펄', '바인드', '브리즈'],
  신속플레이: ['헤이븐', '프랙처', '바인드', '아이스박스'],
  스파이크돌격: ['어센트', '프랙처', '펄', '스플릿'],
  에스컬레이션: ['헤이븐', '아이스박스', '로터스', '바인드']
};

// GET /api/rotation
router.get('/', async (req, res) => {
  const url = `https://kr.api.riotgames.com/val/content/v1/contents`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': API_KEY,
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://developer.riotgames.com'
      }
    });

    const acts = response.data.acts;

    console.log('🧩 전체 act 목록:', acts);

    const activeAct = acts.find(act => act.isActive && act.type === 'act');
    const activeEpisode = acts.find(ep => ep.id === activeAct?.parentId);

    console.log('✅ activeAct:', activeAct);
    console.log('✅ activeEpisode:', activeEpisode);

    let seasonTitle = '시즌 정보 없음';

    if (activeAct && activeEpisode) {
      seasonTitle = `${activeEpisode.name} ${activeAct.name}`;
    } else if (activeAct) {
      seasonTitle = `${activeAct.name} (에피소드 정보 없음)`;
    }

    res.json({
      seasonTitle,
      rotationByMode: mapRotationByMode
    });
  } catch (error) {
    console.error('❗ Riot API rotation 요청 실패:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: '맵 로테이션 데이터 가져오기 실패',
      details: error.message
    });
  }
});

module.exports = router;
