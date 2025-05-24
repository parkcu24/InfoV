// src/agentData.js

export const agentDetails = {
    네온: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '어센트, 바인드',
        pickRate: '26%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '릴레이 번개',
            icon: '/skills/릴레이번개.png',
            video: '/videos/릴레이번개.mp4',
            description: '에너지 볼트를 바닥에 튕겨 전류를 흘려보냅니다. 적중한 지면에 충격파를 발생시켜 맞은 적을 기절시킵니다.'
          },
          {
            name: '고속 질주',
            icon: '/skills/고속질주.png',
            video: '/videos/고속질주.mp4',
            description: '에너지를 집중해 이동 속도를 대폭 증가시킵니다. 슬라이딩으로 속도를 유지한 채 공격할 수 있습니다.'
          },
          {
            name: '속도 장벽',
            icon: '/skills/속도장벽.png',
            video: '/videos/속도장벽.mp4',
            description: '두 개의 전류 벽을 전방으로 펼쳐 시야를 차단하고, 이를 통과한 적에게 피해를 입힙니다.'
          },
          {
            name: '오버드라이브',
            icon: '/skills/오버드라이브.png',
            video: '/videos/오버드라이브.mp4',
            description: '에너지의 전력을 최대치로 끌어올려, 정확하고 빠른 고에너지 빔을 발사합니다. 지속 시간은 적 처치 시 초기화됩니다.'
          }
        ]      
      },      
      레이나: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '바인드, 헤이븐',
        pickRate: '32%',
        weapons: ['팬텀', '셰리프'],
        skills: [
          {
            name: '공허의 눈',
            icon: '/skills/공허의눈.png',
            video: '/videos/공허의눈.mp4',
            description: '적의 시야를 가리는 공허의 눈을 던집니다. 시야 내 적은 효과를 받습니다.'
          },
          {
            name: '포식',
            icon: '/skills/포식.png',
            video: '/videos/포식.mp4',
            description: '적 처치 시 생성되는 영혼구슬을 흡수하여 체력을 빠르게 회복합니다.'
          },
          {
            name: '기만',
            icon: '/skills/기만.png',
            video: '/videos/기만.mp4',
            description: '영혼구슬을 사용해 잠시 무형 상태가 되어 피해를 입지 않습니다.'
          },
          {
            name: '광기',
            icon: '/skills/광기.png',
            video: '/videos/광기.mp4',
            description: '궁극기를 발동해 공격 속도 및 모든 능력을 향상시키고, 적 처치 시 지속 시간이 초기화됩니다.'
          }
        ]
      },
      레이즈: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '스플릿, 프랙처',
        pickRate: '28%',
        weapons: ['팬텀', '점프 패드'],
        skills: [
          {
            name: '폭발 팩',
            icon: '/skills/폭발팩.png',
            video: '/videos/폭발팩.mp4',
            description: '표면에 부착되는 폭발 팩을 던집니다. 재사용 시 폭발하며 적에게 피해를 주고 자신은 도약할 수 있습니다.'
          },
          {
            name: '페인트탄',
            icon: '/skills/페인트탄.png',
            video: '/videos/페인트탄.mp4',
            description: '두 번 폭발하는 수류탄을 던져 넓은 범위에 피해를 줍니다.'
          },
          {
            name: '붐봇',
            icon: '/skills/붐봇.png',
            video: '/videos/붐봇.mp4',
            description: '근처 적을 추적하여 폭발하는 로봇을 바닥에 놓습니다.'
          },
          {
            name: '쇼스톱퍼',
            icon: '/skills/쇼스톱퍼.png',
            video: '/videos/쇼스톱퍼.mp4',
            description: '로켓 런처를 장착해 강력한 범위 피해를 주는 로켓을 발사합니다.'
          }
        ]
      },
      아이소: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '펄, 프랙처',
        pickRate: '21%',
        weapons: ['팬텀', '클래식'],
        skills: [
          {
            name: '더블 탭',
            icon: '/skills/더블탭.png',
            video: '/videos/더블탭.mp4',
            description: '적 처치 시 방어막을 얻는 상태로 들어갑니다.'
          },
          {
            name: '언락',
            icon: '/skills/언락.png',
            video: '/videos/언락.mp4',
            description: '에너지 투사체를 발사하여 맞은 적의 방어막을 무력화합니다.'
          },
          {
            name: '컨티젼',
            icon: '/skills/컨티젼.png',
            video: '/videos/컨티젼.mp4',
            description: '에너지 벽을 생성하여 적의 시야와 탄환을 막습니다.'
          },
          {
            name: '킬 계약',
            icon: '/skills/킬계약.png',
            video: '/videos/킬계약.mp4',
            description: '적을 다른 차원으로 끌어들여 1:1 결투를 벌입니다.'
          }
        ]
      },
      요루: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '아이스박스, 바인드',
        pickRate: '19%',
        weapons: ['팬텀', '셔리프'],
        skills: [
          {
            name: '기만',
            icon: '/skills/기만.png',
            video: '/videos/기만.mp4',
            description: '분신을 생성해 적을 혼란스럽게 합니다.'
          },
          {
            name: '차원 도약',
            icon: '/skills/차원도약.png',
            video: '/videos/차원도약.mp4',
            description: '차원 균열을 남긴 뒤 원하는 위치로 순간 이동합니다.'
          },
          {
            name: '눈부심',
            icon: '/skills/눈부심.png',
            video: '/videos/눈부심.mp4',
            description: '표면에 반사되는 섬광을 던져 적을 실명시킵니다.'
          },
          {
            name: '차원 표류',
            icon: '/skills/차원표류.png',
            video: '/videos/차원표류.mp4',
            description: '차원 밖으로 이동해 적에게 들키지 않고 전장을 돌아다닐 수 있습니다.'
          }
        ]
      },
      웨이레이: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '로터스, 선셋',
        pickRate: '13%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '번개 낙하',
            icon: '/skills/번개낙하.png',
            video: '/videos/번개낙하.mp4',
            description: '지정한 위치에 번개를 떨어뜨려 범위 피해를 줍니다.'
          },
          {
            name: '에너지 구슬',
            icon: '/skills/에너지구슬.png',
            video: '/videos/에너지구슬.mp4',
            description: '적중 시 적을 감전시켜 잠시 기절시키는 에너지 구슬을 던집니다.'
          },
          {
            name: '속력 강화',
            icon: '/skills/속력강화.png',
            video: '/videos/속력강화.mp4',
            description: '순간적으로 이동 속도를 증가시킵니다.'
          },
          {
            name: '폭풍의 분노',
            icon: '/skills/폭풍의분노.png',
            video: '/videos/폭풍의분노.mp4',
            description: '넓은 지역에 전기 폭풍을 일으켜 강력한 범위 피해를 줍니다.'
          }
        ]
      },
      제트: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '어센트, 헤이븐',
        pickRate: '35%',
        weapons: ['팬텀', '오퍼레이터'],
        skills: [
          {
            name: '연막폭발',
            icon: '/skills/연막폭발.png',
            video: '/videos/연막폭발.mp4',
            description: '시야를 가리는 구름형 연막을 빠르게 던집니다. 곡선으로 조작할 수 있어 유연하게 사용 가능합니다.'
          },
          {
            name: '상승기류',
            icon: '/skills/상승기류.png',
            video: '/videos/상승기류.mp4',
            description: '위로 급상승해 고지대를 점령할 수 있습니다.'
          },
          {
            name: '질풍격',
            icon: '/skills/질풍격.png',
            video: '/videos/질풍격.mp4',
            description: '짧은 거리 앞으로 빠르게 돌진합니다. 적 처치 시 재사용할 수 있습니다.'
          },
          {
            name: '칼날 폭풍',
            icon: '/skills/칼날폭풍.png',
            video: '/videos/칼날폭풍.mp4',
            description: '치명적인 칼날을 여러 개 장착하여 빠르게 던질 수 있습니다. 헤드샷 시 큰 피해를 입힙니다.'
          }
        ]
      },
      피닉스: {
        role: '타격대',
        roleIcon: '/roles/duelist.png',
        maps: '바인드, 스플릿',
        pickRate: '24%',
        weapons: ['팬텀', '셔리프'],
        skills: [
          {
            name: '커브볼',
            icon: '/skills/커브볼.png',
            video: '/videos/커브볼.mp4',
            description: '커브 경로를 따라 날아가는 섬광탄을 던져 적을 실명시킵니다. 좌우로 커브를 줄 수 있습니다.'
          },
          {
            name: '핫핸즈',
            icon: '/skills/핫핸즈.png',
            video: '/videos/핫핸즈.mp4',
            description: '바닥에 불을 던져 적에게 피해를 주고, 본인은 회복할 수 있는 화염 지역을 생성합니다.'
          },
          {
            name: '블레이즈',
            icon: '/skills/블레이즈.png',
            video: '/videos/블레이즈.mp4',
            description: '불의 벽을 세워 시야를 차단하고, 이를 통과하는 적에게 피해를 입힙니다.'
          },
          {
            name: '환생',
            icon: '/skills/환생.png',
            video: '/videos/환생.mp4',
            description: '일정 시간 동안 사망 시 시작 위치로 부활할 수 있는 상태가 됩니다.'
          }
        ]
      },
      게코: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '로터스, 프랙처',
        pickRate: '18%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '디지',
            icon: '/skills/디지.png',
            video: '/videos/디지.mp4',
            description: '디지를 발사해 적을 추적하고, 적을 맞추면 실명시킵니다. 회수하면 재사용할 수 있습니다.'
          },
          {
            name: '윙맨',
            icon: '/skills/윙맨.png',
            video: '/videos/윙맨.mp4',
            description: '윙맨을 보내 적을 기절시키거나 스파이크 설치/해제를 도울 수 있습니다. 회수 가능.'
          },
          {
            name: '머쉬피트',
            icon: '/skills/머쉬피트.png',
            video: '/videos/머쉬피트.mp4',
            description: '바닥에 쏘아 느려지고 피해를 주는 점액 지역을 생성합니다.'
          },
          {
            name: '스래쉬',
            icon: '/skills/스래쉬.png',
            video: '/videos/스래쉬.mp4',
            description: '스래쉬를 조종하여 적에게 돌진시키고, 맞은 적은 구속 상태에 빠집니다. 회수 시 1회 재사용 가능.'
          }
        ]
      },         
      브리치: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '헤이븐, 프랙처',
        pickRate: '22%',
        weapons: ['팬텀', '셰리프'],
        skills: [
          {
            name: '애프터쇼크',
            icon: '/skills/애프터쇼크.png',
            video: '/videos/애프터쇼크.mp4',
            description: '벽을 뚫고 폭발하는 충격파를 발사해 지연된 피해를 줍니다.'
          },
          {
            name: '섬광',
            icon: '/skills/섬광.png',
            video: '/videos/섬광.mp4',
            description: '벽을 관통해 일정 시간 후 폭발하는 섬광을 발사합니다. 적을 실명시킵니다.'
          },
          {
            name: '진동파',
            icon: '/skills/진동파.png',
            video: '/videos/진동파.mp4',
            description: '일직선상으로 진동파를 발사해 범위 내 적을 기절시키고 둔화시킵니다.'
          },
          {
            name: '지진 강타',
            icon: '/skills/지진강타.png',
            video: '/videos/지진강타.mp4',
            description: '넓은 범위에 강력한 진동을 발생시켜 적을 기절시키고, 이동을 어렵게 만듭니다.'
          }
        ]
      },
      소바: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '바인드, 헤이븐',
        pickRate: '27%',
        weapons: ['밴달', '고스트'],
        skills: [
          {
            name: '충격 화살',
            icon: '/skills/충격화살.png',
            video: '/videos/충격화살.mp4',
            description: '충격 에너지를 방출하는 화살을 발사하여 적에게 피해를 줍니다.'
          },
          {
            name: '정찰 화살',
            icon: '/skills/정찰화살.png',
            video: '/videos/정찰화살.mp4',
            description: '적을 탐지하는 정찰 화살을 쏘아 일정 범위 내 적의 위치를 드러냅니다.'
          },
          {
            name: '올빼미 드론',
            icon: '/skills/올빼미드론.png',
            video: '/videos/올빼미드론.mp4',
            description: '드론을 조종해 적을 탐색하고, 적중 시 적에게 추적 표식을 부착합니다.'
          },
          {
            name: '사냥꾼의 분노',
            icon: '/skills/사냥꾼의분노.png',
            video: '/videos/사냥꾼의분노.mp4',
            description: '지도 전체를 관통하는 에너지 화살 3발을 순차적으로 발사하여 큰 피해를 줍니다.'
          }
        ]
      },
      스카이: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '로터스, 선셋',
        pickRate: '23%',
        weapons: ['팬텀', '셰리프'],
        skills: [
          {
            name: '빛의 길',
            icon: '/skills/빛의길.png',
            video: '/videos/빛의길.mp4',
            description: '앞으로 날아가는 매를 조종해 적을 실명시킵니다.'
          },
          {
            name: '회복의 씨앗',
            icon: '/skills/회복의씨앗.png',
            video: '/videos/회복의씨앗.mp4',
            description: '아군을 범위 내에서 회복시킬 수 있는 능력. 본인 제외.'
          },
          {
            name: '넝쿨',
            icon: '/skills/넝쿨.png',
            video: '/videos/넝쿨.mp4',
            description: '넝쿨을 보내 적을 탐지하고, 닿은 적을 기절 상태로 만듭니다.'
          },
          {
            name: '추적자',
            icon: '/skills/추적자.png',
            video: '/videos/추적자.mp4',
            description: '세 개의 추적자를 보내 적을 찾아 자동으로 따라가며 위치를 표시합니다.'
          }
        ]
      },
      케이오: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '어센트, 아이스박스',
        pickRate: '20%',
        weapons: ['밴달', '클래식'],
        skills: [
          {
            name: '파편 수류탄',
            icon: '/skills/파편수류탄.png',
            video: '/videos/파편수류탄.mp4',
            description: '지면에 여러 번 폭발하는 수류탄을 던져 적에게 큰 피해를 줍니다.'
          },
          {
            name: '플래시 드라이브',
            icon: '/skills/플래시드라이브.png',
            video: '/videos/플래시드라이브.mp4',
            description: '짧은 시간 뒤 폭발하는 섬광탄을 던집니다. 적을 실명시킵니다.'
          },
          {
            name: '제로/포인트',
            icon: '/skills/제로포인트.png',
            video: '/videos/제로포인트.mp4',
            description: '적의 능력을 무력화하는 억제 칼날을 던집니다. 적중 시 능력 사용이 제한됩니다.'
          },
          {
            name: '무력화//명령',
            icon: '/skills/무력화명령.png',
            video: '/videos/무력화명령.mp4',
            description: '자신의 능력을 극대화하여 주변 적을 억제하며, 사망 시 다운된 상태로 일정 시간 부활을 기다릴 수 있습니다.'
          }
        ]
      },
      테호: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '헤이븐, 바인드',
        pickRate: '12%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '파열파',
            icon: '/skills/파열파.png',
            video: '/videos/파열파.mp4',
            description: '전방으로 파열 에너지를 방출해 적의 위치를 드러내고 피해를 줍니다.'
          },
          {
            name: '속박지뢰',
            icon: '/skills/속박지뢰.png',
            video: '/videos/속박지뢰.mp4',
            description: '접근하는 적을 일정 시간 속박시키는 지뢰를 설치합니다.'
          },
          {
            name: '탐지 투사체',
            icon: '/skills/탐지투사체.png',
            video: '/videos/탐지투사체.mp4',
            description: '벽을 통과하는 투사체를 발사해 적을 탐지하고, 맞은 적을 추적 표식으로 표시합니다.'
          },
          {
            name: '공명 폭발',
            icon: '/skills/공명폭발.png',
            video: '/videos/공명폭발.mp4',
            description: '넓은 범위에 강력한 음파 폭발을 발생시켜 적을 기절 및 방해합니다.'
          }
        ]
      },페이드: {
        role: '척후대',
        roleIcon: '/roles/initiator.png',
        maps: '바인드, 프랙처',
        pickRate: '19%',
        weapons: ['팬텀', '셰리프'],
        skills: [
          {
            name: '추적자',
            icon: '/skills/추적자.png',
            video: '/videos/추적자.mp4',
            description: '적을 자동으로 추적하는 괴물을 소환해 위치를 노출시키고 둔화 효과를 부여합니다.'
          },
          {
            name: '파멸의 장막',
            icon: '/skills/파멸의장막.png',
            video: '/videos/파멸의장막.mp4',
            description: '전방에 어두운 장막을 뿌려 적의 시야를 차단합니다.'
          },
          {
            name: '공포의 촉수',
            icon: '/skills/공포의촉수.png',
            video: '/videos/공포의촉수.mp4',
            description: '촉수를 발사해 적중한 적을 속박하고 일시적인 실명 상태에 빠뜨립니다.'
          },
          {
            name: '밤의 추적자',
            icon: '/skills/밤의추적자.png',
            video: '/videos/밤의추적자.mp4',
            description: '전방의 모든 적을 추적하고, 위치를 노출시키며, 암흑 상태에 빠뜨립니다.'
          }
        ]
      },
      데드록: {
        role: '감시자',
        roleIcon: '/roles/sentinel.png',
        maps: '로터스, 아이스박스',
        pickRate: '11%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '소리 센서',
            icon: '/skills/소리센서.png',
            video: '/videos/소리센서.mp4',
            description: '지정한 지역에 센서를 설치해 소리를 감지하고, 적의 움직임에 반응해 폭발하며 속박 효과를 줍니다.'
          },
          {
            name: '바리케이드',
            icon: '/skills/바리케이드.png',
            video: '/videos/바리케이드.mp4',
            description: '넓은 장벽을 전방에 설치해 적의 이동을 방해하고 시야를 차단합니다.'
          },
          {
            name: '자석 덫',
            icon: '/skills/자석덫.png',
            video: '/videos/자석덫.mp4',
            description: '표면에 부착 가능한 자석형 덫을 던져, 반응 시 범위 내 적을 끌어당겨 속박합니다.'
          },
          {
            name: '중앙 신경망',
            icon: '/skills/중앙신경망.png',
            video: '/videos/중앙신경망.mp4',
            description: '적 하나를 감싸는 구속 고리를 발사해 적을 죽일 때까지 속박 상태로 끌어당깁니다.'
          }
        ]
      },
      바이스: {
        role: '감시자',
        roleIcon: '/roles/sentinel.png',
        maps: '프랙처, 바인드',
        pickRate: '10%',
        weapons: ['밴달', '셰리프'],
        skills: [
          {
            name: '면도날 덩굴',
            icon: '/skills/면도날덩굴.png',
            video: '/videos/면도날덩굴.mp4',
            description: '액체 금속 둥지를 던져 바닥에 설치합니다. 활성화 시 거대한 덩굴이 펼쳐져 이를 통과하는 적에게 지속 피해와 둔화를 부여합니다.'
          },
          {
            name: '가지치기',
            icon: '/skills/가지치기.png',
            video: '/videos/가지치기.mp4',
            description: '액체 금속 필라멘트를 장착해, 적이 지나가면 강철 벽을 솟구치게 하는 장벽 함정을 설치합니다. 벽은 일시적으로 적의 이동을 차단합니다.'
          },
          {
            name: '아크 장미',
            icon: '/skills/아크장미.png',
            video: '/videos/아크장미.mp4',
            description: '투명한 장미 형태의 장비를 설치해, 발동 시 범위 내 적을 실명시킵니다. 아크 장미는 다시 회수하여 재사용할 수 있습니다.'
          },
          {
            name: '강철 정원',
            icon: '/skills/강철정원.png',
            video: '/videos/강철정원.mp4',
            description: '넓은 범위에 금속 가시를 전개해, 범위 내 적의 주 무기를 8초간 사용할 수 없게 만듭니다. 전황을 뒤집는 궁극기입니다.'
          }
        ]
      },
      사이퍼: {
        role: '감시자',
        roleIcon: '/roles/sentinel.png',
        maps: '바인드, 어센트',
        pickRate: '21%',
        weapons: ['셰리프', '스펙터'],
        skills: [
          {
            name: '트랩 와이어',
            icon: '/skills/트랩와이어.png',
            video: '/videos/트랩와이어.mp4',
            description: '두 벽면 사이에 와이어를 설치해, 이를 통과한 적을 속박하고 시야를 제한합니다. 적이 일정 시간 내에 파괴하지 않으면 기절 상태가 됩니다.'
          },
          {
            name: '사이버 감시망',
            icon: '/skills/사이버감시망.png',
            video: '/videos/사이버감시망.mp4',
            description: '연막처럼 펼쳐지는 감시망을 투척해, 통과하는 적의 시야를 차단하고 둔화시킵니다. 원격으로 재사용하여 폭발시킬 수 있습니다.'
          },
          {
            name: '스파이캠',
            icon: '/skills/스파이캠.png',
            video: '/videos/스파이캠.mp4',
            description: '표면에 부착 가능한 원격 카메라를 설치해 적을 감시합니다. 카메라에서 추적 화살을 발사해 적의 위치를 주기적으로 표시할 수 있습니다.'
          },
          {
            name: '신경 절단기',
            icon: '/skills/신경절단기.png',
            video: '/videos/신경절단기.mp4',
            description: '처치된 적의 시체에서 정보를 추출해, 모든 살아있는 적의 위치를 순간적으로 드러냅니다.'
          }
        ]
      },
      세이지: {
        role: '감시자',
        roleIcon: '/roles/sentinel.png',
        maps: '헤이븐, 스플릿',
        pickRate: '28%',
        weapons: ['팬텀', '셰리프'],
        skills: [
          {
            name: '슬로우 오브',
            icon: '/skills/슬로우오브.png',
            video: '/videos/슬로우오브.mp4',
            description: '지면에 부착되는 오브를 던져 일정 범위 내 적의 이동 속도를 크게 늦추고 발소리를 증폭시킵니다.'
          },
          {
            name: '배리어 오브',
            icon: '/skills/배리어오브.png',
            video: '/videos/배리어오브.mp4',
            description: '두꺼운 얼음 벽을 세워 통로를 차단하거나 고지대를 생성할 수 있습니다. 벽은 시간이 지나면 약해지고 파괴할 수 있습니다.'
          },
          {
            name: '힐링 오브',
            icon: '/skills/힐링오브.png',
            video: '/videos/힐링오브.mp4',
            description: '자신 또는 아군의 체력을 빠르게 회복시킬 수 있는 회복 오브를 시전합니다. 회복량은 시간이 지남에 따라 증가합니다.'
          },
          {
            name: '부활',
            icon: '/skills/부활.png',
            video: '/videos/부활.mp4',
            description: '전투 불능 상태의 아군을 완전한 체력으로 되살리는 강력한 궁극기입니다.'
          }
        ]
      },
      체임버: {
        role: '감시자',
        roleIcon: '/roles/sentinel.png',
        maps: '펄, 어센트',
        pickRate: '24%',
        weapons: ['셰리프', '옵저버'],
        skills: [
          {
            name: '트레이드마크',
            icon: '/skills/트레이드마크.png',
            video: '/videos/트레이드마크.mp4',
            description: '적이 범위에 들어오면 느려지게 만드는 함정을 설치합니다. 시야 확보와 진입 저지에 탁월한 효과를 발휘합니다.'
          },
          {
            name: '헤드헌터',
            icon: '/skills/헤드헌터.png',
            video: '/videos/헤드헌터.mp4',
            description: '전용 권총을 장착합니다. 정확한 에임과 강력한 데미지를 가진 권총으로 헤드샷 시 높은 효율을 보여줍니다.'
          },
          {
            name: '랑데부',
            icon: '/skills/랑데부.png',
            video: '/videos/랑데부.mp4',
            description: '두 개의 순간이동 앵커를 설치해 빠르게 위치를 전환할 수 있습니다. 전투 중 빠른 후퇴나 재배치에 적합합니다.'
          },
          {
            name: '역작',
            icon: '/skills/역작.png',
            video: '/videos/역작.mp4',
            description: '일격 필살의 저격총을 장착합니다. 적을 처치하면 범위 내에 슬로우 존이 생성되어 추가적인 진입을 저지합니다.'
          }
        ]
      },
      킬조이: {
        role: '감시자',
        roleIcon: '/roles/sentinel.png',
        maps: '바인드, 로터스',
        pickRate: '30%',
        weapons: ['스펙터', '셰리프'],
        skills: [
          {
            name: '나노스웜',
            icon: '/skills/나노스웜.png',
            video: '/videos/나노스웜.mp4',
            description: '폭발형 수류탄을 투척해 지면에 부착합니다. 원격으로 활성화하면 해당 영역 내 적에게 빠른 속도로 지속 피해를 입힙니다.'
          },
          {
            name: '알람봇',
            icon: '/skills/알람봇.png',
            video: '/videos/알람봇.mp4',
            description: '은신 상태의 봇을 배치해 범위 내 적을 추적 후 폭발시킵니다. 맞은 적은 일시적으로 취약 상태에 빠집니다.'
          },
          {
            name: '터렛',
            icon: '/skills/터렛.png',
            video: '/videos/터렛.mp4',
            description: '작은 터렛을 설치하여 일정 범위 내 적에게 자동으로 총알을 발사합니다. 감시 및 견제에 유용합니다.'
          },
          {
            name: '봉쇄',
            icon: '/skills/봉쇄.png',
            video: '/videos/봉쇄.mp4',
            description: '넓은 범위에 디바이스를 전개하여, 폭발 이후 범위 내 모든 적의 행동을 제한합니다. 진입 차단 및 사이트 확보에 매우 강력합니다.'
          }
        ]
      },
      바이퍼: {
        role: '전략가',
        roleIcon: '/roles/controller.png',
        maps: '바인드, 아이스박스',
        pickRate: '33%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '뱀 이빨',
            icon: '/skills/뱀이빨.png',
            video: '/videos/뱀이빨.mp4',
            description: '화학 물질을 담은 투척체를 던져, 적이 밟을 경우 피해와 취약 상태를 부여합니다. 궤적은 낮고 빠르며 진입 저지에 효과적입니다.'
          },
          {
            name: '독성 장막',
            icon: '/skills/독성장막.png',
            video: '/videos/독성장막.mp4',
            description: '직선 형태의 가스 방출기를 배치하고 활성화하여, 적의 시야를 차단하는 높은 독성 장막을 생성합니다. 연속 사용이 가능하며 연료를 소모합니다.'
          },
          {
            name: '독 구름',
            icon: '/skills/독구름.png',
            video: '/videos/독구름.mp4',
            description: '가스 장치를 던져 일정 시간 후 연기를 피웁니다. 시야를 차단하며 독성 효과를 부여하고, 원격으로 껐다 켤 수 있습니다.'
          },
          {
            name: '맹독의 소굴',
            icon: '/skills/맹독의소굴.png',
            video: '/videos/맹독의소굴.mp4',
            description: '넓은 반경에 극도로 치명적인 독성 구역을 생성합니다. 적은 내부에서 시야가 제한되고 체력이 지속적으로 감소합니다.'
          }
        ]
      },                                                                                                                    
      브림스톤: {
        role: '전략가',
        roleIcon: '/roles/controller.png',
        maps: '어센트, 바인드',
        pickRate: '26%',
        weapons: ['팬텀', '고스트'],
        skills: [
          {
            name: '소이탄',
            icon: '/skills/소이탄.png',
            video: '/videos/소이탄.mp4',
            description: '지면에 충격을 주는 소이탄을 발사해 적에게 피해를 줍니다.'
          },
          {
            name: '공중연막',
            icon: '/skills/공중연막.png',
            video: '/videos/공중연막.mp4',
            description: '원격으로 연막을 설치하여 시야를 차단합니다.'
          },
          {
            name: '자극제 신호기',
            icon: '/skills/자극제신호기.png',
            video: '/videos/자극제신호기.mp4',
            description: '근처 아군의 사격 속도를 증가시켜주는 신호기를 설치합니다.'
          },
          {
            name: '궤도 일격',
            icon: '/skills/궤도일격.png',
            video: '/videos/궤도일격.mp4',
            description: '위성으로부터 강력한 레이저를 지면에 투하하여 범위 피해를 줍니다.'
          }
        ]
      },
      오멘: {
        role: '전략가',
        roleIcon: '/roles/controller.png',
        maps: '스플릿, 헤이븐',
        pickRate: '29%',
        weapons: ['밴달', '셰리프'],
        skills: [
          {
            name: '쉐도우 워크',
            icon: '/skills/쉐도우워크.png',
            video: '/videos/쉐도우워크.mp4',
            description: '짧은 채널링 후 가까운 거리로 순간이동합니다. 연막 뒤나 적의 후방으로 침투할 때 효과적입니다.'
          },
          {
            name: '천상의 장막',
            icon: '/skills/천상의장막.png',
            video: '/videos/천상의장막.mp4',
            description: '전장을 가로지르는 연막을 멀리 배치할 수 있습니다. 지도 전체를 활용해 정밀한 연막 플레이가 가능합니다.'
          },
          {
            name: '편집된 시야',
            icon: '/skills/편집된시야.png',
            video: '/videos/편집된시야.mp4',
            description: '적중한 적의 시야를 일시적으로 박탈하며, 이동 속도를 느리게 만듭니다. 시야 차단과 교전 유도에 유용합니다.'
          },
          {
            name: '그림자 속으로',
            icon: '/skills/그림자속으로.png',
            video: '/videos/그림자속으로.mp4',
            description: '지도 전역의 원하는 위치로 장거리 순간이동을 수행합니다. 발동 중 적에게 위치가 노출되며, 취소도 가능합니다.'
          }
        ]
      },
      클로브: {
        role: '전략가',
        roleIcon: '/roles/controller.png',
        maps: '로터스, 스플릿',
        pickRate: '22%',
        weapons: ['팬텀', '셰리프'],
        skills: [
          {
            name: '픽 미 업',
            icon: '/skills/픽미업.png',
            video: '/videos/픽미업.mp4',
            description: '클로브가 피해를 입히거나 처치한 적의 생명력을 흡수하여 일시적인 체력과 이동 속도 증가 효과를 얻습니다.'
          },
          {
            name: '메들',
            icon: '/skills/메들.png',
            video: '/videos/메들.mp4',
            description: '불멸의 정수를 던져 일정 시간 후 폭발시키며, 범위 내 적들에게 감쇠 효과를 부여하여 최대 체력을 일시적으로 감소시킵니다.'
          },
          {
            name: '루즈',
            icon: '/skills/루즈.png',
            video: '/videos/루즈.mp4',
            description: '전장을 조망하여 시야를 차단하는 연막을 원하는 위치에 배치합니다. 이 능력은 사망 후에도 사용할 수 있습니다.'
          },
          {
            name: '아직 죽지 않았어',
            icon: '/skills/아직죽지않았어.png',
            video: '/videos/아직죽지않았어.mp4',
            description: '사망 후 일정 시간 내에 부활할 수 있으며, 부활 후 제한 시간 내에 적을 처치하거나 어시스트해야 생존할 수 있습니다.'
          }
        ]
      },
      하버: {
        role: '전략가',
        roleIcon: '/roles/controller.png',
        maps: '펄, 바인드',
        pickRate: '19%',
        weapons: ['가디언', '셰리프'],
        skills: [
          {
            name: '폭우',
            icon: '/skills/폭우.png',
            video: '/videos/폭우.mp4',
            description: '물의 구체를 발사해 적의 움직임을 방해하고 피해를 줍니다. 일정 시간 후 구체는 파열되어 넓은 범위에 둔화 효과를 부여합니다.'
          },
          {
            name: '해일',
            icon: '/skills/해일.png',
            video: '/videos/해일.mp4',
            description: '물의 벽을 전방으로 밀어내어 시야를 차단하고, 벽을 통과하는 적에게 둔화 효과를 부여합니다. 벽의 경로를 조작할 수 있습니다.'
          },
          {
            name: '강수',
            icon: '/skills/강수.png',
            video: '/videos/강수.mp4',
            description: '지정한 위치에 원형 물 보호막을 생성해 적의 탄환을 차단합니다. 보호막은 일정 시간 후 사라집니다.'
          },
          {
            name: '쇄도의 파도',
            icon: '/skills/쇄도의파도.png',
            video: '/videos/쇄도의파도.mp4',
            description: '거대한 파도를 전방으로 밀어내며, 파도는 적을 밀쳐내고 둔화시킵니다. 교전 지역 진입 및 진입 차단에 효과적입니다.'
          }
        ]
      },                  
  };
  