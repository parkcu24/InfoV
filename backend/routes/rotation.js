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
// GET /api/rotation
router.get('/', async (req, res) => {
  const url = `https://kr.api.riotgames.com/val/content/v1/contents?locale=ko-KR`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': API_KEY,
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://developer.riotgames.com'
      }
    });

    const acts = response.data.acts || [];

    console.log('🧩 전체 act 목록:', acts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      isActive: a.isActive,
      parentId: a.parentId,
      startTime: a.startTime
    })));

    // 1) 일단 isActive + type=act 를 우선 시도
    let activeAct =
      acts.find(a => a.isActive && a.type?.toLowerCase() === 'act');

    // 2) 없다면, type=act 중에서 startTime 기준 가장 최근 Act 사용
    if (!activeAct) {
      const actList = acts.filter(a => a.type?.toLowerCase() === 'act');
      if (actList.length > 0) {
        actList.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        activeAct = actList[0];
        console.log('⚠️ isActive act 없음, 최근 act로 대체:', activeAct);
      }
    }

    // 3) 그래도 없으면, 전체 중 첫 번째 항목이라도 사용 (완전 비어있지 않다면)
    if (!activeAct && acts.length > 0) {
      activeAct = acts[0];
      console.log('⚠️ act 타입도 없어 전체 첫 항목 사용:', activeAct);
    }

    let seasonTitle = '시즌 정보 없음';

    if (activeAct) {
      // type=episode 인 것만 에피소드 후보로
      const activeEpisode = acts.find(
        ep =>
          ep.id === activeAct.parentId &&
          ep.type?.toLowerCase() === 'episode'
      );

      if (activeEpisode) {
        seasonTitle = `${activeEpisode.name} ${activeAct.name}`;
      } else {
        // 에피소드 못 찾으면 act 이름만이라도
        seasonTitle = activeAct.name || '시즌 정보 없음';
      }
    }

    console.log('✅ 최종 seasonTitle:', seasonTitle);

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
