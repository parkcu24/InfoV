// 📁 src/MatchHistoryPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Render 백엔드 주소
const API_BASE_URL = 'https://infov.onrender.com';

// 🔢 티어 이름 → 번호 매핑 (아이언1=3 ... 레디언트=27)
const TIER_NAME_MAP = {
  iron1: 3,
  iron2: 4,
  iron3: 5,
  bronze1: 6,
  bronze2: 7,
  bronze3: 8,
  silver1: 9,
  silver2: 10,
  silver3: 11,
  gold1: 12,
  gold2: 13,
  gold3: 14,
  platinum1: 15,
  platinum2: 16,
  platinum3: 17,
  diamond1: 18,
  diamond2: 19,
  diamond3: 20,
  ascendant1: 21,
  ascendant2: 22,
  ascendant3: 23,
  immortal1: 24,
  immortal2: 25,
  immortal3: 26,
  radiant: 27,
};

// 🎲 오늘의 발로란트 운세 문구들
const FORTUNES = [
  '사격장으로 손을 풀고 게임하러 가요 !',
  '오퍼레이터를 굴려보는건 어때요?',
  '메인 피킹을 나오는 오퍼레이터를 조심하세요!',
  '설치할 때 나오는 적군을 조심하세요!',
  '요동봇에 물리지 않게 조심하세요!',
  '오늘은 벤달을 써보는 건 어때요?',
  '오늘은 팬텀을 써보는 건 어때요?',
  '상대팀 브리치가 있다면 삥을 생각하고 게임해봐요!',
  '적군 스카이 뺑을 조심하세요!',
  '아군 피닉스 삥을 조심하세요!',
  '오늘은 내 촉이 다 맞을 것 같은데요?',
  '수류탄 각을 다시 한 번 체크해봐요!',
  '무리한 푸시는 한 번만 참아보는 건 어떨까요?',
  '첫 라운드 피스톨전에서 너무 앞서 나가지 마세요.',
  '오늘은 감시자 요원을 한 번 해보는 건 어때요?',
  '엔트리 팀원을 믿고 사이트를 같이 들어가봐요!',
  '적 소바의 각화살을 조심하세요!',
  '적 킬조이의 터렛 위치를 자주 확인해 보세요.',
  '오늘은 스킬보다는 에임을 믿어 보세요.',
  '너무 돈 아끼지 말고, 살 땐 과감하게 사보세요!',
  '이코 라운드라고 포기하지 말고 끝까지 해보세요.',
  '오늘은 오퍼레이터보단 라이플이 더 잘 맞을지도 몰라요.',
  '클러치 상황에서 너무 많은 각을 동시에 보지 마세요.',
  '사이트에 들어갈 때 유틸부터 던지고 들어가 보세요.',
  '적이 자주 나오는 각에 크로스헤어를 미리 두어 보세요.',
  '백업을 너무 늦게 가지 않도록 미니맵을 자주 보세요.',
  '아군 엔트리의 템포를 한 번 맞춰 봐도 좋아요.',
  '오늘은 평소에 안 하던 요원을 도전해 보세요!',
  '연속으로 지고 있다면, 한 판만 숨고르기 하면서 천천히 해보세요.',
  '적 팀의 오퍼레이터 위치를 초반에 체크해 보세요.',
  '라운드 시작 전에 팀과 라운드 플랜을 한마디라도 나눠 보세요.',
  '오늘은 스프레이보다는 점사에 더 힘을 실어보세요.',
  '상대 감시자를 보고 뒤를 돌아보는 거는 어떨까요?',
];

// 📘 스탯 설명 텍스트 (호버 시 아래 바에 표시)
const STAT_HELP_TEXT = {
  kda: 'K / D / A : 한 판에서 올린 킬, 데스, 어시스트 수예요.',
  kd: 'K/D : 킬을 데스로 나눈 비율이에요. 1.00 이상이면 데스보다 킬이 더 많다는 뜻이에요.',
  acs: 'ACS : 라운드당 평균 전투 점수(교전 기여도)를 나타내요.',
  adr: 'ADR : 라운드당 평균 피해량(데미지)입니다.',
  hs: 'HS% : 전체 명중탄 중에서 머리를 맞힌 비율이에요.',
};

function tierNameToNumber(tierName) {
  if (!tierName) return null;
  const key = tierName.toLowerCase().replace(/\s+/g, '');
  return TIER_NAME_MAP[key] || null;
}

// ⭐ 영어 티어 이름 → 한국어 변환
function toKoreanTierName(tierName) {
  if (!tierName || typeof tierName !== 'string') return tierName;

  const lower = tierName.trim().toLowerCase();
  const match = lower.match(
    /(iron|bronze|silver|gold|platinum|diamond|ascendant|immortal|radiant)\s*(\d)?/
  );
  if (!match) return tierName;

  const baseEn = match[1];
  const num = match[2] || '';

  const baseKoMap = {
    iron: '아이언',
    bronze: '브론즈',
    silver: '실버',
    gold: '골드',
    platinum: '플래티넘',
    diamond: '다이아몬드',
    ascendant: '초월자',
    immortal: '불멸',
    radiant: '레디언트',
  };

  const baseKo = baseKoMap[baseEn] || baseEn;
  return num ? `${baseKo} ${num}` : baseKo;
}

// 🔹 티어 변화 라인 그래프 컴포넌트
function TierChart({ data }) {
  if (!data || data.length === 0) return null;

  const widthPerPoint = 60;
  const height = 120;
  const paddingX = 20;
  const paddingY = 20;
  const width =
    paddingX * 2 + (data.length > 1 ? (data.length - 1) * widthPerPoint : 0);

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, idx) => {
    const x = paddingX + idx * widthPerPoint;
    const norm = (d.value - minVal) / range;
    const y =
      height - paddingY - norm * (height - paddingY * 2);
    return { x, y };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={width} height={height} style={styles.tierChartSvg}>
      <polyline
        points={polyPoints}
        fill="none"
        stroke="#4CAF50"
        strokeWidth="2"
      />
      {points.map((p, idx) => {
        const item = data[idx];
        const seasonLabel =
          typeof item.season === 'string' ? item.season : `S${idx + 1}`;
        const tierLabel =
          typeof item.tier === 'string' ? toKoreanTierName(item.tier) : '';

        return (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#ffffff"
            >
              {tierLabel}
            </text>
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#999999"
            >
              {seasonLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MatchHistoryPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [queueFilter, setQueueFilter] = useState('all');

  // 🔥 클릭된 경기(스코어보드 모달용)
  const [selectedMatch, setSelectedMatch] = useState(null);

  // 🔥 티어 그래프 토글
  const [showTierChart, setShowTierChart] = useState(false);

  // 🎲 오늘의 운세 모달 & 룰렛 상태
  const [showFortuneOverlay, setShowFortuneOverlay] = useState(false);
  const [fortuneIndex, setFortuneIndex] = useState(0);
  const [isFortuneRolling, setIsFortuneRolling] = useState(false);
  const [latestFortuneText, setLatestFortuneText] = useState(null);

  const fortuneIntervalRef = useRef(null);
  const fortuneStopTimeoutRef = useRef(null);

  // 📌 백엔드 페이지네이션: start, size 기반
  const [pageStart, setPageStart] = useState(0);      // 지금까지 불러온 총 개수
  const [hasMore, setHasMore] = useState(true);       // 더 불러올 수 있는지
  const [loadingMore, setLoadingMore] = useState(false);

  // 📘 어떤 스탯 위에 마우스 올라가 있는지
  const [hoveredStat, setHoveredStat] = useState(null);

  // ⭐ 에이전트 이름 → 이미지 파일명
  const getAgentImageSrc = (agent) => {
    const defaultSrc = '/agents/default.png';

    if (!agent) return defaultSrc;

    let agentName = agent;
    if (typeof agent === 'object') {
      agentName =
        agent.displayName ||
        agent.name ||
        agent.id ||
        '';
    }

    if (typeof agentName !== 'string' || agentName.length === 0) {
      return defaultSrc;
    }

    const normalized = agentName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    return normalized ? `/agents/${normalized}.png` : defaultSrc;
  };

  // ⭐ 티어 이미지 (아이언1~레디언트) 경로
  const getTierImageSrc = (tierNumber, tierName) => {
    if (!tierNumber && !tierName) return null;

    let num = tierNumber;
    if (!num && tierName) {
      num = tierNameToNumber(tierName);
    }

    if (!num) return null;
    return `/tiers/${num}.png`;
  };

  // ⭐ 플레이어 카드 이미지
  const getPlayerCardSrc = () => {
    if (summary && summary.playerCardUrl) {
      return summary.playerCardUrl;
    }
    return '/playercards/default.png';
  };

  // ⭐ 큐 이름을 영어 키로 정규화
  const normalizeQueueKey = (q) => {
    if (!q) return 'other';
    const s = String(q).toLowerCase();

    if (s.includes('competitive') || s.includes('rank')) return 'competitive';
    if (s.includes('unrated') || s.includes('normal')) return 'unrated';
    if (s.includes('swift') || s.includes('swiftplay')) return 'swiftplay';
    if (s.includes('spike') || s.includes('spikerush')) return 'spikerush';
    if (s.includes('deathmatch') && s.includes('team')) return 'team_deathmatch';
    if (s.includes('deathmatch')) return 'deathmatch';
    if (s.includes('escalation')) return 'escalation';
    if (s.includes('snowball') || s.includes('sheep')) return 'snowball';
    if (s.includes('custom')) return 'custom';
    if (s.includes('brawl') || s.includes('mayhem') || s.includes('swiftpush'))
      return 'brawl';

    return 'other';
  };

  // ⭐ 큐 이름 한국어
  const getQueueDisplayName = (match) => {
    const q = match.queue || match.mode;
    const key = normalizeQueueKey(q);

    switch (key) {
      case 'competitive':
        return '경쟁전';
      case 'unrated':
        return '일반';
      case 'swiftplay':
        return '신속';
      case 'spikerush':
        return '스파이크 돌격';
      case 'custom':
        return '사설';
      case 'deathmatch':
        return '데스매치';
      case 'team_deathmatch':
        return '팀 데스매치';
      case 'brawl':
        return '난투';
      case 'escalation':
        return '에스컬레이션';
      default:
        return typeof q === 'string' ? q : '기타 모드';
    }
  };

  // ⭐ 필터에 맞는 전적만 추리기
  const getFilteredMatches = () => {
    if (queueFilter === 'all') return matches;
    return matches.filter((m) => {
      const key = normalizeQueueKey(m.queue || m.mode);
      return key === queueFilter;
    });
  };

  // 🔥 첫 로딩 (profile, stats, matches 10개)
  useEffect(() => {
    const token = localStorage.getItem('riot_access_token');

    if (!token) {
      setHasToken(false);
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    setHasToken(true);

    const fetchData = async () => {
      try {
        setError('');
        setLoading(true);

        // 1) 프로필
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          throw new Error(
            `프로필 정보를 불러오지 못했습니다. (status ${profileRes.status})`
          );
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        // 2) Henrik 요약 스탯
        try {
          const statsRes = await fetch(`${API_BASE_URL}/api/auth/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setSummary(statsData);
          }
        } catch (e) {
          console.error('Stats API 오류:', e);
        }

        // 3) 전적 - 처음 10판(start=0, size=10)
        const matchesRes = await fetch(
          `${API_BASE_URL}/api/auth/matches?start=0&size=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!matchesRes.ok) {
          throw new Error(
            `전적 정보를 불러오지 못했습니다. (status ${matchesRes.status})`
          );
        }

        const matchesData = await matchesRes.json();
        const list = Array.isArray(matchesData)
          ? matchesData
          : matchesData.matches || [];

        setMatches(list);
        setPageStart(list.length);      // 지금까지 불러온 개수
        setHasMore(list.length === 10); // 10개 꽉 채워졌으면 더 있을 가능성 있음
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🎰 룰렛 시작 (한 번 뽑힌 후에는 다시 돌지 않도록 latestFortuneText 체크)
  const startFortuneRolling = () => {
    if (isFortuneRolling || latestFortuneText) return;

    setIsFortuneRolling(true);

    if (fortuneIntervalRef.current) {
      clearInterval(fortuneIntervalRef.current);
      fortuneIntervalRef.current = null;
    }
    if (fortuneStopTimeoutRef.current) {
      clearTimeout(fortuneStopTimeoutRef.current);
      fortuneStopTimeoutRef.current = null;
    }

    fortuneIntervalRef.current = setInterval(() => {
      setFortuneIndex((prev) => (prev + 1) % FORTUNES.length);
    }, 50);

    fortuneStopTimeoutRef.current = setTimeout(() => {
      if (fortuneIntervalRef.current) {
        clearInterval(fortuneIntervalRef.current);
        fortuneIntervalRef.current = null;
      }
      setIsFortuneRolling(false);

      const finalIndex = Math.floor(Math.random() * FORTUNES.length);
      setFortuneIndex(finalIndex);
      setLatestFortuneText(FORTUNES[finalIndex]);
    }, 1600);
  };

  // 🎰 모달 열기
  const openFortuneOverlay = () => {
    setShowFortuneOverlay(true);

    if (latestFortuneText) {
      const idx = FORTUNES.indexOf(latestFortuneText);
      if (idx >= 0) {
        setFortuneIndex(idx);
      }
      setIsFortuneRolling(false);
      if (fortuneIntervalRef.current) {
        clearInterval(fortuneIntervalRef.current);
        fortuneIntervalRef.current = null;
      }
      if (fortuneStopTimeoutRef.current) {
        clearTimeout(fortuneStopTimeoutRef.current);
        fortuneStopTimeoutRef.current = null;
      }
      return;
    }

    setFortuneIndex(Math.floor(Math.random() * FORTUNES.length));
    startFortuneRolling();
  };

  // ❌ 운세 모달 닫기
  const closeFortuneOverlay = () => {
    if (fortuneIntervalRef.current) {
      clearInterval(fortuneIntervalRef.current);
      fortuneIntervalRef.current = null;
    }
    if (fortuneStopTimeoutRef.current) {
      clearTimeout(fortuneStopTimeoutRef.current);
      fortuneStopTimeoutRef.current = null;
    }
    setIsFortuneRolling(false);
    setShowFortuneOverlay(false);
  };

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (fortuneIntervalRef.current) {
        clearInterval(fortuneIntervalRef.current);
      }
      if (fortuneStopTimeoutRef.current) {
        clearTimeout(fortuneStopTimeoutRef.current);
      }
    };
  }, []);

  // 🔥 전적 더 가져오기 (start=pageStart, size=10)
  const loadMoreMatches = async () => {
    if (!hasMore || loadingMore) return;

    const token = localStorage.getItem('riot_access_token');
    if (!token) return;

    try {
      setLoadingMore(true);

      const pageSize = 10;
      const res = await fetch(
        `${API_BASE_URL}/api/auth/matches?start=${pageStart}&size=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error(
          `추가 전적을 불러오지 못했습니다. (status ${res.status})`
        );
      }

      const data = await res.json();
      const newList = Array.isArray(data) ? data : data.matches || [];

      setMatches((prev) => [...prev, ...newList]);
      setPageStart((prev) => prev + newList.length);
      setHasMore(newList.length === pageSize); // 10개 꽉 채우지 못하면 더 이상 없음
    } catch (err) {
      console.error(err);
      setError(err.message || '추가 전적을 불러오지 못했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('riot_access_token');
    navigate('/');
  };

  const getDisplayName = (p) => {
    if (!p) return '';
    if (p.gameName && p.tagLine) return `${p.gameName}#${p.tagLine}`;
    return p.gameName || '';
  };

  // ⭐ 맵 이름 한국어 변환
  const getMapName = (match) => {
    const m = match.map;
    let name = 'Unknown Map';

    if (!m) return '알 수 없는 맵';
    if (typeof m === 'string') name = m;
    else if (m.name) name = m.name;

    const lower = name.toLowerCase();

    const mapKoMap = {
      ascent: '어센트',
      bind: '바인드',
      haven: '헤이븐',
      split: '스플릿',
      icebox: '아이스박스',
      breeze: '브리즈',
      fracture: '프랙처',
      pearl: '펄',
      lotus: '로터스',
      sunset: '선셋',
      abyss: '어비스',
    };

    const foundKey = Object.keys(mapKoMap).find((k) => lower.includes(k));
    if (foundKey) return mapKoMap[foundKey];

    return name;
  };

  const getQueueName = (match) => {
    return getQueueDisplayName(match);
  };

  const filteredMatches = getFilteredMatches();
  const visibleMatches = filteredMatches; // 이제는 서버에서 10판씩 가져와 누적

  // 📊 최근 전적 기준 요약 스탯(평균 HS, 평균 KD, 평균 ACS)
  let avgStats = null;
  if (matches && matches.length > 0) {
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAcs = 0;
    let countAcs = 0;
    let totalHs = 0;
    let countHs = 0;

    matches.forEach((m) => {
      const k = m.kills ?? 0;
      const d = m.deaths ?? 0;
      totalKills += k;
      totalDeaths += d;

      if (m.acs != null) {
        totalAcs += m.acs;
        countAcs += 1;
      }
      if (m.hsPercent != null) {
        totalHs += m.hsPercent;
        countHs += 1;
      }
    });

    const avgKd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
    const avgAcs = countAcs > 0 ? totalAcs / countAcs : null;
    const avgHs = countHs > 0 ? totalHs / countHs : null;

    avgStats = { avgKd, avgAcs, avgHs };
  }

  // 📈 시즌 히스토리 → 티어 그래프용 데이터
  let tierChartData = [];
  if (summary?.seasonHistory && summary.seasonHistory.length > 0) {
    const chronological = [...summary.seasonHistory].reverse();
    const lastSix = chronological.slice(-6);

    tierChartData = lastSix
      .map((s) => {
        const value = tierNameToNumber(s.tier);
        if (!value) return null;

        let seasonLabel = s.season;
        if (typeof seasonLabel === 'string') {
          const match = seasonLabel.toLowerCase().match(/e(\d+)a(\d+)/);
          if (match) {
            const ep = parseInt(match[1], 10);
            const act = parseInt(match[2], 10);
            if (!Number.isNaN(ep) && !Number.isNaN(act)) {
              seasonLabel = `에피소드${ep} 엑트${act}`;
            }
          }
        }

        return {
          season: seasonLabel,
          tier: s.tier,
          value,
        };
      })
      .filter(Boolean);
  }

  // 🔥 경기 카드 클릭 시 스코어보드 모달 열기
  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseModal = () => {
    setSelectedMatch(null);
  };

  const getModalTeams = (match) => {
    if (!match || !Array.isArray(match.players)) {
      return { allies: [], enemies: [] };
    }
    const myTeam = match.myTeam || 'blue';
    const enemyTeam = match.enemyTeam || (myTeam === 'blue' ? 'red' : 'blue');

    const allies = match.players.filter((p) => p.team === myTeam);
    const enemies = match.players.filter((p) => p.team === enemyTeam);

    return { allies, enemies, myTeam, enemyTeam };
  };

  const renderScoreboardModal = () => {
    if (!selectedMatch) return null;

    const { allies, enemies } = getModalTeams(selectedMatch);

    return (
      <div style={styles.modalOverlay} onClick={handleCloseModal}>
        <div
          style={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.modalHeader}>
            <div>
              <div style={styles.modalTitleRow}>
                <span style={styles.modalMapName}>
                  {getMapName(selectedMatch)}
                </span>
                <span style={styles.modalQueueName}>
                  · {getQueueName(selectedMatch)}
                </span>
              </div>
              <div style={styles.modalSubText}>
                {selectedMatch.timeAgo}
              </div>
            </div>

            <div style={styles.modalScoreBox}>
              <span style={styles.modalScoreText}>
                {selectedMatch.teamScore ?? '-'} :{' '}
                {selectedMatch.enemyScore ?? '-'}
              </span>
              {selectedMatch.win != null && (
                <span
                  style={{
                    ...styles.modalResultBadge,
                    backgroundColor: selectedMatch.win ? '#1b5e20' : '#b71c1c',
                  }}
                >
                  {selectedMatch.win ? 'WIN' : 'LOSS'}
                </span>
              )}
              <button
                style={styles.modalCloseButton}
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={styles.scoreboardWrapper}>
            {/* 우리 팀 */}
            <div style={styles.teamColumn}>
              <div style={styles.teamHeader}>
                <span style={styles.teamTitle}>우리 팀</span>
              </div>
              <div style={styles.tableHeaderRow}>
                <span style={styles.thPlayer}>플레이어</span>
                <span style={styles.thTier}>티어</span>
                <span style={styles.thAgent}>요원</span>
                <span style={styles.thStat}>K / D / A</span>
                <span style={styles.thStat}>K/D</span>
                <span style={styles.thStat}>ACS</span>
                <span style={styles.thStat}>HS%</span>
              </div>
              {allies.map((p, idx) => {
                const k = p.kills ?? 0;
                const d = p.deaths ?? 0;
                const a = p.assists ?? 0;
                const kd = d > 0 ? (k / d).toFixed(2) : k;
                const isSelf = !!p.isSelf;

                return (
                  <div
                    key={`${p.puuid || p.name || 'ally'}-${idx}`}
                    style={{
                      ...styles.tableRow,
                      backgroundColor: isSelf
                        ? 'rgba(76, 175, 80, 0.12)'
                        : 'transparent',
                    }}
                  >
                    <span style={styles.tdPlayer}>
                      <span style={styles.playerNameText}>{p.name}</span>
                      {p.tag && (
                        <span style={styles.playerTagText}>#{p.tag}</span>
                      )}
                    </span>

                    <span style={styles.tdTier}>
                      {p.tierNumber || p.tierName ? (
                        <img
                          src={getTierImageSrc(p.tierNumber, p.tierName)}
                          alt={
                            p.tierName
                              ? toKoreanTierName(p.tierName)
                              : '티어'
                          }
                          style={styles.tierIcon}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </span>

                    <span style={styles.tdAgent}>
                      <img
                        src={
                          p.agentIcon || getAgentImageSrc(p.agent || null)
                        }
                        alt={p.agent || 'agent'}
                        style={styles.modalAgentImg}
                        onError={(e) => {
                          if (e.currentTarget.dataset.errorHandled === '1') {
                            e.currentTarget.style.display = 'none';
                            return;
                          }
                          e.currentTarget.dataset.errorHandled = '1';
                          e.currentTarget.src = '/agents/default.png';
                        }}
                      />
                      <span style={styles.agentNameText}>{p.agent}</span>
                    </span>
                    <span style={styles.tdStat}>
                      {k} / {d} / {a}
                    </span>
                    <span
                      style={{
                        ...styles.tdStat,
                        color: kd >= 1 ? '#4CAF50' : '#F44336',
                      }}
                    >
                      {kd}
                    </span>
                    <span style={styles.tdStat}>
                      {p.acs != null ? p.acs : '-'}
                    </span>
                    <span style={styles.tdStat}>
                      {p.hsPercent != null ? `${p.hsPercent}%` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 상대 팀 */}
            <div style={styles.teamColumn}>
              <div style={styles.teamHeader}>
                <span style={styles.teamTitle}>상대 팀</span>
              </div>
              <div style={styles.tableHeaderRow}>
                <span style={styles.thPlayer}>플레이어</span>
                <span style={styles.thTier}>티어</span>
                <span style={styles.thAgent}>요원</span>
                <span style={styles.thStat}>K / D / A</span>
                <span style={styles.thStat}>K/D</span>
                <span style={styles.thStat}>ACS</span>
                <span style={styles.thStat}>HS%</span>
              </div>
              {enemies.map((p, idx) => {
                const k = p.kills ?? 0;
                const d = p.deaths ?? 0;
                const a = p.assists ?? 0;
                const kd = d > 0 ? (k / d).toFixed(2) : k;

                return (
                  <div
                    key={`${p.puuid || p.name || 'enemy'}-${idx}`}
                    style={styles.tableRow}
                  >
                    <span style={styles.tdPlayer}>
                      <span style={styles.playerNameText}>{p.name}</span>
                      {p.tag && (
                        <span style={styles.playerTagText}>#{p.tag}</span>
                      )}
                    </span>

                    <span style={styles.tdTier}>
                      {p.tierNumber || p.tierName ? (
                        <img
                          src={getTierImageSrc(p.tierNumber, p.tierName)}
                          alt={
                            p.tierName
                              ? toKoreanTierName(p.tierName)
                              : '티어'
                          }
                          style={styles.tierIcon}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </span>

                    <span style={styles.tdAgent}>
                      <img
                        src={
                          p.agentIcon || getAgentImageSrc(p.agent || null)
                        }
                        alt={p.agent || 'agent'}
                        style={styles.modalAgentImg}
                        onError={(e) => {
                          if (e.currentTarget.dataset.errorHandled === '1') {
                            e.currentTarget.style.display = 'none';
                            return;
                          }
                          e.currentTarget.dataset.errorHandled = '1';
                          e.currentTarget.src = '/agents/default.png';
                        }}
                      />
                      <span style={styles.agentNameText}>{p.agent}</span>
                    </span>
                    <span style={styles.tdStat}>
                      {k} / {d} / {a}
                    </span>
                    <span
                      style={{
                        ...styles.tdStat,
                        color: kd >= 1 ? '#4CAF50' : '#F44336',
                      }}
                    >
                      {kd}
                    </span>
                    <span style={styles.tdStat}>
                      {p.acs != null ? p.acs : '-'}
                    </span>
                    <span style={styles.tdStat}>
                      {p.hsPercent != null ? `${p.hsPercent}%` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 네비게이션 */}
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            style={styles.logoImage}
            onClick={() => navigate('/')}
          />
        </div>

        <div style={styles.center}>
          <span style={styles.navItem} onClick={() => navigate('/agents')}>
            요원
          </span>
          <span style={styles.navItem} onClick={() => navigate('/maps')}>
            맵 로테이션
          </span>
          <span style={styles.navItem} onClick={() => navigate('/skins')}>
            스킨
          </span>
          <span style={styles.navItem} onClick={() => navigate('/rank')}>
            랭킹
          </span>
          <span style={styles.navItem} onClick={() => navigate('/esports')}>
            E-Sports
          </span>
        </div>

        <div style={styles.right}>
          {profile ? (
            <div style={styles.profileBoxTopRight}>
              <span style={styles.profileNameTopRight}>
                {getDisplayName(profile)}
              </span>
              <button style={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button style={styles.loginButton} onClick={() => navigate('/')}>
              로그인
            </button>
          )}
        </div>
      </nav>

      {/* 본문 */}
      <div style={styles.content}>
        {loading && <p style={styles.message}>불러오는 중입니다...</p>}

        {!loading && error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
            {!hasToken && (
              <button
                style={styles.primaryButton}
                onClick={() => navigate('/')}
              >
                로그인 하러 가기
              </button>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 상단 프로필 카드 */}
            {profile && (
              <div style={styles.profileCard}>
                {/* 왼쪽: 플레이어 카드 동그라미 + 레벨 */}
                <div style={styles.profileLeft}>
                  <div style={styles.avatarWrapper}>
                    <img
                      src={getPlayerCardSrc()}
                      alt="Player Card"
                      style={styles.playerCardImage}
                      onError={(e) => {
                        if (e.currentTarget.dataset.errorHandled === '1') {
                          return;
                        }
                        e.currentTarget.dataset.errorHandled = '1';
                        e.currentTarget.src = '/playercards/default.png';
                      }}
                    />
                    <div style={styles.profileImageRing} />
                  </div>
                  <div style={styles.levelBadgeWrapper}>
                    <div style={styles.levelBadge}>
                      <span style={styles.levelLabel}>LEVEL</span>
                      <span style={styles.levelValue}>
                        {summary?.accountLevel ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 닉네임/티어/평균스탯/버튼 */}
                <div style={styles.profileRight}>
                  <div style={styles.nameCard}>
                    <div style={styles.nameRow}>
                      <span style={styles.nicknameText}>
                        {profile.gameName}
                      </span>
                      {profile.tagLine && (
                        <span style={styles.tagText}>#{profile.tagLine}</span>
                      )}
                    </div>
                    {summary && (
                      <>
                        <div style={styles.tierRow}>
                          <span style={styles.tierText}>
                            {summary.currentTier
                              ? toKoreanTierName(summary.currentTier)
                              : '티어 정보 없음'}
                          </span>
                          {typeof summary.rr === 'number' && (
                            <span style={styles.rrText}>{summary.rr} RR</span>
                          )}

                          {typeof summary.winRate === 'number' && (
                            <span style={styles.winrateText}>
                              · 시즌 전적 {summary.wins ?? '-'}승{' '}
                              {summary.losses ?? '-'}패 ({summary.winRate}%)
                            </span>
                          )}
                        </div>

                        {avgStats && (
                          <div style={styles.overallStatsRow}>
                            <div style={styles.overallStatItem}>
                              <span style={styles.overallStatLabel}>
                                평균 HS
                              </span>
                              <span style={styles.overallStatValue}>
                                {avgStats.avgHs != null
                                  ? `${avgStats.avgHs.toFixed(1)}%`
                                  : '-'}
                              </span>
                            </div>
                            <div style={styles.overallStatItem}>
                              <span style={styles.overallStatLabel}>
                                평균 K/D
                              </span>
                              <span style={styles.overallStatValue}>
                                {avgStats.avgKd != null
                                  ? avgStats.avgKd.toFixed(2)
                                  : '-'}
                              </span>
                            </div>
                            <div style={styles.overallStatItem}>
                              <span style={styles.overallStatLabel}>
                                평균 ACS
                              </span>
                              <span style={styles.overallStatValue}>
                                {avgStats.avgAcs != null
                                  ? Math.round(avgStats.avgAcs)
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div style={styles.tierButtonRow}>
                          <button
                            type="button"
                            style={styles.tierDetailButton}
                            onClick={() =>
                              setShowTierChart((prev) => !prev)
                            }
                          >
                            티어 자세히 보기 {showTierChart ? '▲' : '▼'}
                          </button>

                          <button
                            type="button"
                            style={styles.fortuneButton}
                            onClick={openFortuneOverlay}
                          >
                            오늘의 발로란트 운세 보기!
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {showTierChart && (
                    <div style={styles.tierChartCard}>
                      {tierChartData.length > 0 ? (
                        <TierChart data={tierChartData} />
                      ) : (
                        <div style={styles.tierChartEmptyText}>
                          티어 기록이 부족합니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🧿 오늘의 발로란트 운세 인라인 표시 */}
            <div style={styles.fortuneInlineBox}>
              <span style={styles.fortuneInlineLabel}>
                오늘의 발로란트 운세 ! :{' '}
              </span>
              <span style={styles.fortuneInlineText}>
                {latestFortuneText
                  ? latestFortuneText
                  : '위 버튼을 눌러 오늘의 발로란트 운세를 확인해보세요 !'}
              </span>
            </div>

            {/* 전적 헤더 + 필터 */}
            <div style={styles.matchesHeaderRow}>
              <h3 style={styles.sectionTitle}>최근 경기 전적</h3>

              <div style={styles.filterWrapper}>
                <label style={styles.filterLabel}>모드 선택</label>
                <select
                  style={styles.filterSelect}
                  value={queueFilter}
                  onChange={(e) => setQueueFilter(e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="competitive">경쟁전</option>
                  <option value="unrated">일반</option>
                  <option value="swiftplay">신속</option>
                  <option value="spikerush">스파이크 돌격</option>
                  <option value="custom">사설</option>
                  <option value="deathmatch">데스매치</option>
                  <option value="team_deathmatch">팀 데스매치</option>
                  <option value="brawl">난투</option>
                  <option value="escalation">에스컬레이션</option>
                </select>
              </div>
            </div>

            {/* 🔍 스탯 설명 바 */}
            {hoveredStat && (
              <div style={styles.statTooltipBar}>
                {STAT_HELP_TEXT[hoveredStat]}
              </div>
            )}

            {/* 전적 리스트 */}
            {filteredMatches.length === 0 ? (
              <p style={styles.message}>
                {queueFilter === 'all'
                  ? '최근 전적이 없습니다.'
                  : '최근 전적 중 이 모드로 플레이한 기록이 없습니다.'}
              </p>
            ) : (
              <>
                <div style={styles.matchList}>
                  {visibleMatches.map((match) => {
                    const k = match.kills ?? 0;
                    const d = match.deaths ?? 0;
                    const a = match.assists ?? 0;
                    const kd = d > 0 ? (k / d).toFixed(2) : k;

                    const scoreText =
                      match.teamScore !== undefined &&
                      match.teamScore !== null &&
                      match.enemyScore !== undefined &&
                      match.enemyScore !== null
                        ? `${match.teamScore} : ${match.enemyScore}`
                        : match.win === true
                        ? '승리'
                        : match.win === false
                        ? '패배'
                        : '-';

                    const isWin =
                      match.win !== undefined && match.win !== null
                        ? match.win
                        : typeof match.teamScore === 'number' &&
                          typeof match.enemyScore === 'number'
                        ? match.teamScore > match.enemyScore
                        : false;

                    return (
                      <div
                        key={
                          match.matchId ||
                          `${match.map}-${match.queue}-${match.timeAgo}`
                        }
                        style={{
                          ...styles.matchRowCard,
                          cursor: 'pointer',
                          background: isWin
                            ? 'linear-gradient(135deg, rgba(21, 101, 192, 0.18), rgba(13, 71, 161, 0.04))'
                            : 'linear-gradient(135deg, rgba(183, 28, 28, 0.18), rgba(183, 28, 28, 0.04))',
                          borderColor: isWin ? '#274766' : '#5c1a1a',
                        }}
                        onClick={() => handleMatchClick(match)}
                      >
                        {/* 왼쪽 */}
                        <div style={styles.matchLeft}>
                          <div
                            style={
                              isWin
                                ? styles.resultFlagWin
                                : styles.resultFlagLose
                            }
                          >
                            {isWin ? '승리' : '패배'}
                          </div>

                          <div style={styles.matchLeftDivider} />

                          <img
                            src={getAgentImageSrc(match.agent)}
                            alt={match.agent}
                            style={styles.agentImage}
                            onError={(e) => {
                              if (e.currentTarget.dataset.errorHandled === '1') {
                                e.currentTarget.style.display = 'none';
                                return;
                              }
                              e.currentTarget.dataset.errorHandled = '1';
                              e.currentTarget.src = '/agents/default.png';
                            }}
                          />

                          <div style={styles.matchLeftText}>
                            <div style={styles.mapName}>
                              {getMapName(match)}
                            </div>
                            <div style={styles.queueText}>
                              {getQueueName(match)}
                            </div>

                            <div style={styles.scoreBox}>
                              <span
                                style={{
                                  ...styles.scoreText,
                                  color: isWin ? '#81c784' : '#e57373',
                                }}
                              >
                                {scoreText}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 오른쪽 */}
                        <div style={styles.matchRight}>
                          <div style={styles.matchMetaBox}>
                            {match.gameDate && (
                              <div style={styles.matchDateText}>
                                {match.gameDate}
                              </div>
                            )}
                            {match.timeAgo && (
                              <div style={styles.matchTimeAgoText}>
                                {match.timeAgo}
                              </div>
                            )}
                          </div>

                          <div style={styles.statsRow}>
                            {/* KDA */}
                            <div
                              style={styles.statBlock}
                              onMouseEnter={() => setHoveredStat('kda')}
                              onMouseLeave={() => setHoveredStat(null)}
                            >
                              <span style={styles.statLabel}>
                                K / D / A
                              </span>
                              <span style={styles.statValue}>
                                {k} / {d} / {a}
                              </span>
                            </div>

                            {/* KD */}
                            <div
                              style={styles.statBlock}
                              onMouseEnter={() => setHoveredStat('kd')}
                              onMouseLeave={() => setHoveredStat(null)}
                            >
                              <span style={styles.statLabel}>K/D</span>
                              <span
                                style={{
                                  ...styles.statValue,
                                  color: kd >= 1 ? '#4CAF50' : '#F44336',
                                }}
                              >
                                {kd}
                              </span>
                            </div>

                            {/* ACS */}
                            <div
                              style={styles.statBlock}
                              onMouseEnter={() => setHoveredStat('acs')}
                              onMouseLeave={() => setHoveredStat(null)}
                            >
                              <span style={styles.statLabel}>ACS</span>
                              <span style={styles.statValue}>
                                {match.acs != null ? match.acs : '-'}
                              </span>
                            </div>

                            {/* ADR */}
                            <div
                              style={styles.statBlock}
                              onMouseEnter={() => setHoveredStat('adr')}
                              onMouseLeave={() => setHoveredStat(null)}
                            >
                              <span style={styles.statLabel}>ADR</span>
                              <span style={styles.statValue}>
                                {match.adr != null ? match.adr : '-'}
                              </span>
                            </div>

                            {/* HS% */}
                            <div
                              style={styles.statBlock}
                              onMouseEnter={() => setHoveredStat('hs')}
                              onMouseLeave={() => setHoveredStat(null)}
                            >
                              <span style={styles.statLabel}>HS%</span>
                              <span style={styles.statValue}>
                                {match.hsPercent != null
                                  ? `${match.hsPercent}%`
                                  : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 전적 더보기 버튼 - Henrik API 기준 최대 100판까지 */}
                <div style={styles.loadMoreWrapper}>
                  <button
                    type="button"
                    style={{
                      ...styles.loadMoreButton,
                      opacity: hasMore ? 1 : 0.4,
                      cursor: hasMore ? 'pointer' : 'default',
                    }}
                    disabled={!hasMore || loadingMore}
                    onClick={loadMoreMatches}
                  >
                    {loadingMore
                      ? '불러오는 중...'
                      : hasMore
                      ? '전적 더 보기 (+10)'
                      : '더 볼 전적이 없습니다'}
                  </button>
                  <div style={styles.loadMoreSubText}>
                    현재 {matches.length}판까지 불러왔습니다. (Henrik API 기준
                    최대 100판)
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* 🎲 오늘의 발로란트 운세 모달 */}
      {showFortuneOverlay && (
        <div style={styles.fortuneOverlay}>
          <div style={styles.fortuneCard}>
            <button
              style={styles.fortuneCloseButton}
              onClick={closeFortuneOverlay}
            >
              ✕
            </button>

            <h3 style={styles.fortuneTitle}>오늘의 발로란트 운세</h3>

            <div style={styles.fortuneWindow}>
              <div
                style={{
                  ...styles.fortuneInner,
                  transform: `translateY(-${fortuneIndex * 40}px)`,
                  transition: isFortuneRolling
                    ? 'transform 0.05s linear'
                    : 'transform 0.35s ease-out',
                }}
              >
                {FORTUNES.map((text, idx) => (
                  <div key={idx} style={styles.fortuneRow}>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {!isFortuneRolling && (
              <div style={styles.fortuneResultText}>
                {FORTUNES[fortuneIndex]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 경기 상세 스코어보드 모달 */}
      {renderScoreboardModal()}
    </div>
  );
}

/* ====================== 스타일 ====================== */
const styles = {
  pageWrapper: {
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#eee',
    paddingTop: '72px',
    fontFamily: 'Black Han Sans, sans-serif',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: '#1E1E1E',
    borderBottom: '1px solid #333',
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '72px',
    zIndex: 1000,
  },
  left: { flex: 1 },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    alignItems: 'center',
  },
  logoImage: {
    height: '200px',
    marginTop: '-8px',
    cursor: 'pointer',
  },
  navItem: {
    fontSize: '18px',
    color: '#DDD',
    cursor: 'pointer',
  },

  content: {
    padding: '100px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  message: {
    textAlign: 'center',
    color: '#bbb',
  },
  errorBox: {
    backgroundColor: '#2b1b1b',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #ff4d4f',
    textAlign: 'center',
  },
  errorText: { color: '#ff8888' },

  primaryButton: {
    marginTop: '10px',
    padding: '8px 16px',
    borderRadius: '999px',
    border: '1px solid #2e7d32',
    backgroundColor: '#388e3c',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
  },

  profileBoxTopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  profileNameTopRight: {
    fontSize: '14px',
    color: '#eee',
  },

  profileCard: {
    backgroundColor: '#181818',
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '16px',
    border: '1px solid #333',
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  profileLeft: {
    width: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 0 12px rgba(0,0,0,0.8)',
  },
  playerCardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profileImageRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.08)',
    pointerEvents: 'none',
  },
  levelBadgeWrapper: {
    marginTop: '4px',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  levelLabel: {
    fontSize: '11px',
    letterSpacing: '0.05em',
    color: '#aaa',
  },
  levelValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },

  profileRight: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
  },
  nameCard: {
    backgroundColor: '#151515',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #303030',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginBottom: '4px',
  },
  nicknameText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
  },
  tagText: {
    fontSize: '14px',
    color: '#888',
  },
  tierRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    fontSize: '13px',
    marginBottom: '6px',
  },
  tierText: {
    color: '#f5f5f5',
  },
  rrText: {
    color: '#d0d0ff',
  },
  winrateText: {
    color: '#9fd39f',
  },

  overallStatsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '6px',
  },
  overallStatItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    fontSize: '12px',
  },
  overallStatLabel: {
    color: '#aaaaaa',
  },
  overallStatValue: {
    color: '#ffffff',
    fontWeight: 600,
  },

  tierButtonRow: {
    marginTop: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tierDetailButton: {
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #444',
    backgroundColor: 'transparent',
    color: '#ddd',
    fontSize: '11px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  fortuneButton: {
    padding: '4px 12px',
    borderRadius: '999px',
    border: '1px solid #7c4dff',
    backgroundColor: 'rgba(124,77,255,0.18)',
    color: '#e5ddff',
    fontSize: '11px',
    cursor: 'pointer',
  },

  tierChartCard: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#151515',
    border: '1px solid #303030',
  },
  tierChartEmptyText: {
    fontSize: '12px',
    color: '#999',
  },
  tierChartSvg: {
    display: 'block',
  },

  fortuneInlineBox: {
    marginTop: '4px',
    marginBottom: '12px',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #2e2e2e',
    backgroundColor: '#151515',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  fortuneInlineLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffeb3b',
  },
  fortuneInlineText: {
    fontSize: '14px',
    color: '#eee',
  },

  matchesHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '20px',
    margin: 0,
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#aaa',
  },
  filterSelect: {
    backgroundColor: '#181818',
    color: '#eee',
    borderRadius: '999px',
    border: '1px solid #444',
    padding: '4px 10px',
    fontSize: '13px',
    outline: 'none',
  },

  statTooltipBar: {
    marginBottom: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#181818',
    border: '1px solid #333',
    fontSize: '12px',
    color: '#ddd',
  },

  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  matchRowCard: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: '#181818',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #303030',
    alignItems: 'center',
  },
  matchLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },

  resultFlagWin: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#90caf9',
    minWidth: '42px',
    textAlign: 'center',
  },
  resultFlagLose: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#ef9a9a',
    minWidth: '42px',
    textAlign: 'center',
  },

  matchLeftDivider: {
    width: '1px',
    height: '60%',
    backgroundColor: '#444',
    borderRadius: '999px',
    alignSelf: 'center',
  },

  agentImage: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  matchLeftText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  mapName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  queueText: {
    fontSize: '12px',
    color: '#999',
  },
  scoreBox: {
    marginTop: '2px',
  },
  scoreText: {
    fontSize: '14px',
    fontWeight: '600',
  },

  matchRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
    minWidth: '220px',
    marginLeft: '48px',
  },
  matchMetaBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  matchDateText: {
    fontSize: '11px',
    color: '#bbb',
  },
  matchTimeAgoText: {
    fontSize: '11px',
    color: '#888',
  },

  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '60px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#777',
  },
  statValue: {
    fontSize: '13px',
    color: '#fff',
  },

  loadMoreWrapper: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  loadMoreButton: {
    padding: '6px 20px',
    borderRadius: '999px',
    border: '1px solid #4f4f4f',
    backgroundColor: '#1f1f1f',
    color: '#eee',
    fontSize: '13px',
    cursor: 'pointer',
  },
  loadMoreSubText: {
    fontSize: '11px',
    color: '#888',
  },

  loginButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    border: '1px solid #555',
    color: '#eee',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    border: '1px solid #555',
    color: '#eee',
    cursor: 'pointer',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    width: '92%',
    maxWidth: '1300px',
    maxHeight: '82vh',
    backgroundColor: '#161616',
    borderRadius: '16px',
    border: '1px solid #333',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  modalTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  modalMapName: {
    fontSize: '18px',
    fontWeight: 700,
  },
  modalQueueName: {
    fontSize: '14px',
    color: '#aaa',
  },
  modalSubText: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#888',
  },
  modalScoreBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modalScoreText: {
    fontSize: '18px',
    fontWeight: 700,
  },
  modalResultBadge: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '999px',
    color: '#fff',
  },
  modalCloseButton: {
    marginLeft: '8px',
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: '18px',
    cursor: 'pointer',
  },

  scoreboardWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    overflow: 'auto',
    paddingTop: '4px',
  },
  teamColumn: {
    backgroundColor: '#151515',
    borderRadius: '12px',
    border: '1px solid #303030',
    padding: '10px',
  },
  teamHeader: {
    marginBottom: '6px',
  },
  teamTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  tableHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 0.7fr 1.4fr 1.2fr 0.8fr 0.9fr 0.9fr',
    fontSize: '11px',
    color: '#999',
    borderBottom: '1px solid #333',
    paddingBottom: '4px',
    marginBottom: '4px',
  },
  thPlayer: { textAlign: 'left' },
  thTier: { textAlign: 'center' },
  thAgent: { textAlign: 'left' },
  thStat: { textAlign: 'right' },

  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 0.7fr 1.4fr 1.2fr 0.8fr 0.9fr 0.9fr',
    fontSize: '12px',
    padding: '4px 0',
    alignItems: 'center',
  },
  tdPlayer: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  tdTier: {
    textAlign: 'center',
  },
  tdAgent: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  tdStat: {
    textAlign: 'right',
  },
  tierIcon: {
    width: 26,
    height: 26,
    objectFit: 'contain',
  },
  playerNameText: {
    fontWeight: 500,
  },
  playerTagText: {
    fontSize: '10px',
    color: '#888',
  },
  modalAgentImg: {
    width: '22px',
    height: '22px',
    borderRadius: '3px',
    objectFit: 'cover',
  },
  agentNameText: {
    fontSize: '11px',
    color: '#ddd',
  },

  fortuneOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2500,
  },
  fortuneCard: {
    position: 'relative',
    width: '480px',
    maxWidth: '90%',
    backgroundColor: '#151515',
    borderRadius: '18px',
    border: '1px solid #444',
    padding: '20px 22px 18px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  fortuneCloseButton: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: '#aaa',
    fontSize: '18px',
    cursor: 'pointer',
  },
  fortuneTitle: {
    fontSize: '18px',
    margin: '4px 0 8px',
    fontWeight: 700,
  },
  fortuneWindow: {
    width: '100%',
    height: '40px',
    overflow: 'hidden',
    borderRadius: '10px',
    border: '1px solid #444',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
  },
  fortuneInner: {
    display: 'flex',
    flexDirection: 'column',
  },
  fortuneRow: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#eee',
    whiteSpace: 'nowrap',
    padding: '0 10px',
  },
  fortuneResultText: {
    marginTop: '6px',
    fontSize: '16px',
    fontWeight: 600,
    textAlign: 'center',
    color: '#ffeb3b',
    textShadow: '0 0 10px rgba(255, 235, 59, 0.4)',
  },
};

export default MatchHistoryPage;
