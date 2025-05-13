const express = require('express');
const axios = require('axios');
const router = express.Router();

// assetName → weapon 매핑
const weaponAssetMap = {
  'Default__BasePistol': '클래식',
  'Default__Slim': '쇼티',
  'Default__AutoPistol': '프렌지',
  'Default__Luger': '고스트',
  'Default__Revolver': '셰리프',
  'Default__PumpShotgun': '버키',
  'Default__AutoShotgun': '저지',
  'Default__Vector': '스팅어',
  'Default__MP5': '스펙터',
  'Default__Burst': '불독',
  'Default__DMR': '가디언',
  'Default__LeverSniper': '마샬',
  'Default__DS_Gun': '아웃로',
  'Default__BoltSniper': '오퍼레이터',
  'Default__Carbine': '팬텀',
  'Default__AK': '벤달',
  'Default__HMG': '오딘',
  'Default__LMG': '아레스',
  'Default__Melee': '칼'
};

// assetName으로 총기 이름 추출
function getWeaponNameFromAsset(assetName) {
  for (const key in weaponAssetMap) {
    if (assetName.startsWith(key)) {
      return weaponAssetMap[key];
    }
  }
  return null;
}

// 총기 이름으로 세트명 추출 (예: "아이온 팬텀" → "아이온")
function extractSetName(displayName, weaponName) {
  if (displayName.endsWith(` ${weaponName}`)) {
    return displayName.replace(` ${weaponName}`, '').trim();
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      'https://kr.api.riotgames.com/val/content/v1/contents?locale=ko-KR',
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY
        }
      }
    );

    const skins = response.data.skins;
    const grouped = {};

    skins.forEach(skin => {
      const koName = skin.name;
      const assetName = skin.assetName;
      const weapon = getWeaponNameFromAsset(assetName);
      if (!weapon) return;

      const setName = extractSetName(koName, weapon);
      if (!setName) return;

      const edition = skinEditions[setName] || 'SE'; // 없으면 기본 'SE'

      if (!grouped[setName]) {
        grouped[setName] = {
          edition,
          skins: []
        };
      }

      grouped[setName].skins.push({
        uuid: skin.id,
        weapon,
        displayName: koName,
        displayIcon: `/skins/${setName}.jpg`
      });
    });

    console.log('✅ 응답 데이터 확인:', Object.keys(grouped).length, '개 세트');
    res.json(grouped);

  } catch (err) {
    console.error('❌ Riot API fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch skins' });
  }
});

module.exports = router;
