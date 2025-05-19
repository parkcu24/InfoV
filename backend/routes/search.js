// routes/search.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.RIOT_API_KEY;

router.get('/', async (req, res) => {
  const { region, gameName, tagLine } = req.query;

  if (!region || !gameName || !tagLine) {
    return res.status(400).json({ error: '필수 파라미터 누락' });
  }

  const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Riot-Token': API_KEY,
      },
    });

    res.json(response.data); // { puuid, gameName, tagLine }
  } catch (err) {
    console.error('전적 검색 실패:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.status?.message || '전적 검색 실패',
    });
  }
});

module.exports = router;
