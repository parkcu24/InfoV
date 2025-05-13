const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.RIOT_API_KEY;

// ✅ 서버 매핑은 오직 여기에서만 처리
const serverRegionMap = {
  kr: 'kr',
  asia: 'ap',
  na: 'na',
  eu: 'eu'
};

router.get('/', async (req, res) => {
  const { actId, server = 'kr', start = 0, size = 200 } = req.query;

  if (!actId) {
    return res.status(400).json({ error: 'actId 쿼리 파라미터가 필요합니다.' });
  }

  const region = serverRegionMap[server];
  if (!region) {
    return res.status(400).json({ error: '지원하지 않는 서버입니다.' });
  }

  const url = `https://${region}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/${actId}?size=${size}&startIndex=${start}`;

  try {
    const response = await axios.get(url, {
      headers: { 'X-Riot-Token': API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❗ Riot API 랭킹 요청 실패', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: '랭킹 데이터 가져오기 실패', details: error.message });
  }
});

module.exports = router;
