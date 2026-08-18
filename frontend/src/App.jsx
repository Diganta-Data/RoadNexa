import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Cities from './pages/Cities';
import {
  Dashboard,
  UploadData,
  DataManagement,
  MapPage,
  AccidentAnalytics,
  DangerousRoads,
  RoadDetail,
  Hotspots,
  RiskIntelligence,
  MLPredictions,
  Recommendations
} from './pages/Stubs';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/upload-data" element={<UploadData />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/accident-analytics" element={<AccidentAnalytics />} />
            <Route path="/dangerous-roads" element={<DangerousRoads />} />
            <Route path="/roads/:roadId" element={<RoadDetail />} />
            <Route path="/hotspots" element={<Hotspots />} />
            <Route path="/risk" element={<RiskIntelligence />} />
            <Route path="/ml-predictions" element={<MLPredictions />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
