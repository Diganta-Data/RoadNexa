import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Cities from './pages/Cities';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import DataManagement from './pages/DataManagement';
import {
  MapPage,
  AccidentAnalytics,
  DangerousRoads,
  RoadDetail,
  Hotspots,
  RiskIntelligence,
  MLPredictions,
  Recommendations
} from './pages/Stubs';

function AppShell() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const Wrapper = isLanding ? 'div' : 'main';

  return (
    <div className={isLanding ? undefined : 'app-container'}>
      {!isLanding && <Navbar />}
      <Wrapper className={isLanding ? undefined : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/cities/:cityName" element={<Cities />} />
          <Route path="/upload-data" element={<UploadData />} />
          <Route path="/data/upload" element={<UploadData />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/accident-analytics" element={<AccidentAnalytics />} />
          <Route path="/dangerous-roads" element={<DangerousRoads />} />
          <Route path="/roads/:roadId" element={<RoadDetail />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/risk" element={<RiskIntelligence />} />
          <Route path="/ml-predictions" element={<MLPredictions />} />
          <Route path="/ml" element={<MLPredictions />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </Wrapper>
      {!isLanding && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
