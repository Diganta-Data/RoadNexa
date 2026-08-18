import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthService } from '../../services/api';
import './Home.css';

const Home = () => {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', dbStatus: 'checking' });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const appHealth = await healthService.checkHealth();
        const dbHealth = await healthService.checkDbHealth();
        setHealthStatus({
          status: appHealth.status,
          dbStatus: dbHealth.database
        });
      } catch (error) {
        setHealthStatus({ status: 'error', dbStatus: 'error' });
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="home-container">
      <header className="hero">
        <h1 className="title text-gradient">IRIS</h1>
        <p className="subtitle">Indian Road Intelligence & Safety Platform</p>
        <p className="description">
          A Full-Stack Geospatial Data Analytics and Machine Learning Platform for Multi-City Road Safety Intelligence.
        </p>
        <div className="action-buttons">
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          <Link to="/upload-data" className="btn btn-secondary glass-panel">Upload Dataset</Link>
        </div>
      </header>
      
      <section className="status-section">
        <div className="status-card glass-panel">
          <h3>Backend Connection</h3>
          <p>Status: <span className={`status-badge ${healthStatus.status}`}>{healthStatus.status}</span></p>
        </div>
        <div className="status-card glass-panel">
          <h3>Database Connection</h3>
          <p>PostgreSQL: <span className={`status-badge ${healthStatus.dbStatus}`}>{healthStatus.dbStatus}</span></p>
        </div>
      </section>
    </div>
  );
};

export default Home;
