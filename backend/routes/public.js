// 📁 backend/routes/public.js
const express = require('express');
const prisma = require('../lib/prisma'); // ✅ 너 프로젝트에 이미 있는 prisma 싱글톤 사용 추천

const router = express.Router();

/**
 * GET /api/public/profile?region=kr&name=CU24&tag=KR
 */
router.get('/profile', async (req, res) => {
  try {
    const region = String(req.query.region || '').toLowerCase();
    const name = String(req.query.name || '');
    const tag = String(req.query.tag || '');

    if (!region || !name || !tag) {
      return res.status(400).json({ error: 'Missing region/name/tag' });
    }

    const user = await prisma.user.findFirst({
      where: { region, gameName: name, tagLine: tag },
      select: {
        gameName: true,
        tagLine: true,
        region: true,
        cacheUpdatedAt: true,
        cachedProfile: true,
        cachedMatches: true,
      },
    });

    if (!user) return res.json({ exists: false });

    return res.json({
      exists: true,
      region: user.region,
      gameName: user.gameName,
      tagLine: user.tagLine,
      lastUpdated: user.cacheUpdatedAt,
      hasMatches: !!user.cachedMatches,
      hasProfile: !!user.cachedProfile,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/public/matches?region=kr&name=CU24&tag=KR
 */
router.get('/matches', async (req, res) => {
  try {
    const region = String(req.query.region || '').toLowerCase();
    const name = String(req.query.name || '');
    const tag = String(req.query.tag || '');

    if (!region || !name || !tag) {
      return res.status(400).json({ error: 'Missing region/name/tag' });
    }

    const user = await prisma.user.findFirst({
      where: { region, gameName: name, tagLine: tag },
      select: {
        cachedProfile: true,
        cachedMatches: true,
        cacheUpdatedAt: true,
      },
    });

    if (!user || !user.cachedMatches) {
      return res
        .status(404)
        .json({ error: 'No cached matches. Please login to fetch.' });
    }

    return res.json({
      profile: user.cachedProfile || null,
      matches: user.cachedMatches,
      lastUpdated: user.cacheUpdatedAt,
      source: 'cache',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
