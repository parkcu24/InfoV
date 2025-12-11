// 📁 backend/scripts/testDb.js
const prisma = require('../lib/prisma'); // 경로 정확히 맞추기

async function main() {
  console.log('🔵 DB 테스트 시작');

  // 1) User 생성
  const user = await prisma.user.create({
    data: {
      riotPuuid: 'test-puuid-001',
      gameName: 'TestUser',
      tagLine: 'KR1',
      region: 'ap'
    }
  });

  console.log('🟢 User created:', user);

  // 2) Session 생성
  const session = await prisma.session.create({
    data: {
      id: 'test-session-001',
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 86400 * 1000),
    }
  });

  console.log('🟢 Session created:', session);
}

main()
  .then(() => {
    console.log('✨ 테스트 완료');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  });
