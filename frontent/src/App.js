// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import MapRotationPage from './MapRotationPage';
import MapDetailPage from './MapDetailPage';
import AgentsPage from './AgentsPage';
import AgentDetailPage from './AgentDetailPage';
import RankPage from './RankPage';
import EsportsPage from './EsportsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/agents/:agentName" element={<AgentDetailPage />} />
      <Route path="/maps" element={<MapRotationPage />} />
      <Route path="/maps/:mapName" element={<MapDetailPage />} />
      <Route path="/rank" element={<RankPage />} />
      <Route path="/esports" element={<EsportsPage />} />
    </Routes>
  );
}

export default App;
