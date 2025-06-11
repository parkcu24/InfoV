// src/pages/LeaguesPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as WorldMap } from './assets/world.svg';
import './LeaguesPage.css';

function LeaguesPage() {
  const navigate = useNavigate();

  const regionColors = {
    PACIFIC: '#00FFFF',
    EMEA: '#4A90E2',
    AMERICAS: '#FFD700',
    CN: '#FF4C4C',
  };

  const regionCountries = {
    PACIFIC: ['KR', 'JP', 'ID', 'MY', 'SG', 'PH', 'TH', 'VN', 'HK', 'TW', 'IN', 'AU', 'Japan', 'Indonesia', 'Malaysia'],
    EMEA: ['FR', 'DE', 'GB', 'SA', 'TR', 'EG', 'AE', 'ES', 'IT', 'PT', 'PL', 'SE', 'FI', 'NO', 'DK', 'IE', 'BE', 'NL', 'LU', 'AT', 'CH'],
    AMERICAS: [
      'Antigua and Barbuda', 'Argentina', 'BO', 'BR', 'BZ', 'Bahamas', 'CO', 'CR', 'CU', 'Canada', 'Chile',
      'DM', 'DO', 'EC', 'GD', 'GT', 'GY', 'HN', 'HT', 'JM', 'MX', 'NI', 'PA', 'PE', 'PY', 'Puerto Rico',
      'SR', 'SV', 'Trinidad and Tobago', 'UY', 'United States', 'VE','United States', 'Greenland',
    ],
    CN: ['CN', 'China'],
  };

  useEffect(() => {
    Object.entries(regionCountries).forEach(([region, countries]) => {
      countries.forEach((code) => {
        const classElements = document.querySelectorAll(`.${code}`);
        const idElement = document.getElementById(code);
        const elements = [...classElements];
        if (idElement) elements.push(idElement);

        elements.forEach((element) => {
          element.style.fill = regionColors[region];
          element.style.opacity = 0.7;
          element.style.transition = 'fill 0.3s ease, transform 0.3s ease, filter 0.3s ease';
        });
      });
    });
  }, []);

  const handleHover = (region, isHovering) => {
    const countries = regionCountries[region];
    countries.forEach((code) => {
      const classElements = document.querySelectorAll(`.${code}`);
      const idElement = document.getElementById(code);
      const elements = [...classElements];
      if (idElement) elements.push(idElement);

      elements.forEach((el) => {
        el.style.transform = isHovering ? 'scale(1.08)' : 'scale(1)';
        el.style.filter = isHovering ? 'drop-shadow(0 0 10px rgba(255,255,255,0.7))' : 'none';
      });
    });
  };

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
            onClick={() => handleRegionClick(region)}
            onMouseEnter={() => handleHover(region, true)}
            onMouseLeave={() => handleHover(region, false)}
          >
            {region}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaguesPage;
