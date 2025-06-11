// src/WorldMap.js
import React, { useEffect } from 'react';
import { ReactComponent as MapSVG } from './assets/world.svg';
import { useNavigate } from 'react-router-dom';

const leagueRegions = {
  AMERICAS: ['US', 'CA', 'BR', 'AR', 'MX', 'CO', 'CL', 'PE'],
  EMEA: ['GB', 'FR', 'DE', 'IT', 'ES', 'RU', 'SA', 'EG', 'TR', 'AE'],
  PACIFIC: ['KR', 'JP', 'PH', 'TH', 'VN', 'IN', 'SG', 'MY', 'AU', 'NZ'],
  CN: ['China'],
};

const leagueColors = {
  AMERICAS: '#FFD700',
  EMEA: '#4A90E2',
  PACIFIC: '#50E3C2',
  CN: '#FF4D4D',
};

function WorldMap() {
  const navigate = useNavigate();

  useEffect(() => {
    const paths = document.querySelectorAll('svg path');

    paths.forEach((path) => {
      const countryId = path.id || path.getAttribute('class');

      let league = null;
      for (const [key, countries] of Object.entries(leagueRegions)) {
        if (countries.includes(countryId)) {
          league = key;
          break;
        }
      }

      if (league) {
        path.style.fill = leagueColors[league];
        path.style.transition = '0.3s';
        path.style.cursor = 'pointer';

        path.addEventListener('mouseenter', () => {
          path.style.filter = 'brightness(1.2)';
        });
        path.addEventListener('mouseleave', () => {
          path.style.filter = 'none';
        });
        path.addEventListener('click', () => {
          navigate(`/esports/${league}`); // ✅ 클릭 시 페이지 이동
        });
      } else {
        path.style.fill = '#444';
      }
    });

    return () => {
      paths.forEach((path) => {
        path.replaceWith(path.cloneNode(true));
      });
    };
  }, [navigate]);

  return (
    <div style={{ width: '100%', textAlign: 'center', padding: '30px 0' }}>
      <MapSVG style={{ width: '90%', maxWidth: '1100px' }} />
    </div>
  );
}

export default WorldMap;
