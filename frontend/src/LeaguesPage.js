import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as WorldMap } from './assets/world.svg';
import './LeaguesPage.css';

function LeaguesPage() {
  const navigate = useNavigate();
  const [hoverRegion, setHoverRegion] = useState(null);

  // ✅ useMemo로 객체를 고정 (렌더마다 새로 만들어지지 않게)
  const regionColors = useMemo(() => ({
    PACIFIC: '#00FFFF',
    EMEA: '#4A90E2',
    AMERICAS: '#FFD700',
    CN: '#FF4C4C',
  }), []);

  const regionCountries = useMemo(() => ({
    PACIFIC: ['KR', 'JP', 'ID', 'MY', 'SG', 'PH', 'TH', 'VN', 'HK', 'TW', 'IN'],
    EMEA: [
      'FR', 'DE', 'GB', 'ES', 'IT', 'PT', 'PL', 'SE', 'FI', 'NO', 'DK', 'IE',
      'BE', 'NL', 'LU', 'AT', 'CH', 'CZ', 'HU', 'SK', 'SI', 'HR', 'BG', 'RO', 'GR',
      'LT', 'LV', 'EE', 'RS', 'BA', 'MK', 'MT', 'CY', 'UA',
      'SA', 'AE', 'TR', 'IL', 'JO', 'QA', 'KW', 'OM', 'BH', 'IR', 'IQ', 'YE', 'LB', 'PS', 'SY',
      'EG', 'MA', 'DZ', 'TN', 'LY', 'SD', 'CF', 'NG', 'CI', 'GN', 'SN', 'BF', 'TD', 'ML', 'NE',
      'MR', 'GW', 'LR', 'GH', 'BJ', 'CG', 'BW', 'AO', 'KE', 'ZM', 'ZA', 'NA', 'CD', 'TZ', 'MZ',
      'ZW', 'LS', 'SZ', 'ET', 'SS', 'UG', 'SO', 'MG', 'CM', 'GA'
    ],
    AMERICAS: [
      'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF',
      'BZ', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'JM', 'HT', 'DO', 'CU', 'TT', 'BS', 'BB', 'AG',
      'LC', 'GD', 'VC', 'GL', 'CA', 'United States', 'Canada'
    ],
    CN: ['CN', 'CHINA']
  }), []);

  useEffect(() => {
    const allLeagueCodes = new Set();

    Object.entries(regionCountries).forEach(([region, countries]) => {
      countries.forEach((codeRaw) => {
        const code = codeRaw.trim().toLowerCase();
        allLeagueCodes.add(code);

        document.querySelectorAll('path').forEach((element) => {
          const id = element.id?.toLowerCase();
          const classList = Array.from(element.classList).map(cls => cls.toLowerCase());
          const classAttrWords = element.getAttribute('class')?.toLowerCase().split(/\s+/) || [];
          const name = element.getAttribute('name')?.toLowerCase();

          const isMatch =
            id === code ||
            classList.includes(code) ||
            classAttrWords.includes(code) ||
            name === code;

          if (isMatch) {
            element.classList.add('league-country');
            element.style.setProperty('fill', regionColors[region], 'important');
            element.style.setProperty(
              'opacity',
              !hoverRegion || hoverRegion === region ? '1.0' : '0.3',
              'important'
            );
          }
        });
      });
    });

    document.querySelectorAll('path').forEach((path) => {
      const id = path.id?.toLowerCase();
      const classList = Array.from(path.classList).map(cls => cls.toLowerCase());
      const classAttrWords = path.getAttribute('class')?.toLowerCase().split(/\s+/) || [];
      const name = path.getAttribute('name')?.toLowerCase();

      const matched = [...allLeagueCodes].some(code =>
        id === code ||
        classList.includes(code) ||
        classAttrWords.includes(code) ||
        name === code
      );

      if (!matched) {
        path.classList.remove('league-country');
        path.style.setProperty('opacity', '0.2', 'important');
      }
    });
  }, [hoverRegion, regionColors, regionCountries]);

  const handleRegionClick = (region) => {
    navigate(`/schedule?region=${region}`);
  };

  return (
    <div className="leagues-page">
      <nav className="navbar">
        <div className="left">
          <img
            src="/InfoV_logo.png"
            alt="INFOV Logo"
            className="logoImage"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="center">
          <span className="navItem" onClick={() => navigate('/agents')}>요원</span>
          <span className="navItem" onClick={() => navigate('/maps')}>맵 로테이션</span>
          <span className="navItem" onClick={() => navigate('/skins')}>스킨</span>
          <span className="navItem" onClick={() => navigate('/rank')}>랭킹</span>
          <span className="navItem active">E-Sports</span>
        </div>

        <div className="right">
          <input type="text" placeholder="예: CU24#KR" className="topSearchInput" />
          <button className="searchButton">검색</button>
        </div>
      </nav>

      <h1 className="leagues-title">리그 선택</h1>
      <div className="world-map-container">
        <WorldMap className="world-map" />
        {['PACIFIC', 'EMEA', 'AMERICAS', 'CN'].map((region) => (
          <div
            key={region}
            className={`region-button ${region.toLowerCase()}`}
            onMouseEnter={() => setHoverRegion(region)}
            onMouseLeave={() => setHoverRegion(null)}
            onClick={() => handleRegionClick(region)}
          >
            {region}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaguesPage;
