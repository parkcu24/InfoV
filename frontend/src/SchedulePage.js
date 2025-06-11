// src/pages/SchedulePage.js
import React from 'react';
import { useLocation } from 'react-router-dom';

function SchedulePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const region = params.get('region');

  return (
    <div style={{ color: '#fff', padding: '40px' }}>
      <h1>Schedule Page</h1>
      <p>선택한 리그: {region}</p>
    </div>
  );
}

export default SchedulePage;
