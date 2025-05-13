const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.RIOT_API_KEY;

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

    res.json(response.data);
  } catch (error) {
    console.error('❗ Riot API 요청 실패');
    if (!res.headersSent) {
      res.status(error.response?.status || 500).json({ error: 'Acts 가져오기 실패', details: error.message });
    }
  }
});

module.exports = router;