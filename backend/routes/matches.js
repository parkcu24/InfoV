// routes/matches.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const API_KEY = process.env.RIOT_API_KEY;

router.get("/", async (req, res) => {
  const { puuid } = req.query;

  if (!puuid) {
    return res.status(400).json({ error: "puuid required" });
  }

  try {
    // 🔥 최근 10경기 matchId 가져오기
    const matchIdsRes = await axios.get(
      `https://asia.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": API_KEY } }
    );

    const matchIds = matchIdsRes.data.history.slice(0, 10);

    let matches = [];

    // 🔥 각 matchId로 세부정보 조회
    for (const m of matchIds) {
      const match = await axios.get(
        `https://asia.api.riotgames.com/val/match/v1/matches/${m.matchId}`,
        { headers: { "X-Riot-Token": API_KEY } }
      );

      matches.push(match.data);
    }

    res.json(matches);
  } catch (err) {
    console.error("❌ match fetch error:", err.response?.data || err.message);
    res.status(500).json({ error: "failed to fetch matches" });
  }
});

module.exports = router;
