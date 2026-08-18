import React from 'react';

const PageStub = ({ title }) => (
  <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
    <div className="glass-panel" style={{ padding: '3rem' }}>
      <h2 className="text-gradient">{title}</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>This page will be implemented in future phases.</p>
    </div>
  </div>
);

export const Dashboard = () => <PageStub title="Dashboard" />;
export const UploadData = () => <PageStub title="Data Upload Portal" />;
export const DataManagement = () => <PageStub title="Data Management" />;
export const MapPage = () => <PageStub title="Interactive Map" />;
export const AccidentAnalytics = () => <PageStub title="Accident Analytics" />;
export const DangerousRoads = () => <PageStub title="Dangerous Roads" />;
export const RoadDetail = () => <PageStub title="Road Detail" />;
export const Hotspots = () => <PageStub title="Hotspots" />;
export const RiskIntelligence = () => <PageStub title="Risk Intelligence" />;
export const MLPredictions = () => <PageStub title="ML Predictions" />;
export const Recommendations = () => <PageStub title="Recommendations" />;
