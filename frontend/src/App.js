import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import MapRotationPage from './MapRotationPage';
import MapDetailPage from './MapDetailPage';
import AgentsPage from './AgentsPage';
import AgentDetailPage from './AgentDetailPage';
import SkinPage from './SkinsPage';
import SkinDetailPage from './SkinDetailPage';
import RankPage from './RankPage';
import EsportsPage from './EsportsPage';
import SearchResultPage from './SearchResultPage';
import PrivacyPage from './Privacy';
import TermsPage from './Terms';
import LogoutPage from './Logout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search-result" element={<SearchResultPage />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/agents/:agentName" element={<AgentDetailPage />} />
      <Route path="/maps" element={<MapRotationPage />} />
      <Route path="/maps/:mapName" element={<MapDetailPage />} />
      <Route path="/skins/" element={<SkinPage />} />
      <Route path="/skins/:skinId" element={<SkinDetailPage />} />
      <Route path="/rank" element={<RankPage />} />
      <Route path="/esports" element={<EsportsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/logout" element={<LogoutPage />} />
    </Routes>
  );
}

export default App;
