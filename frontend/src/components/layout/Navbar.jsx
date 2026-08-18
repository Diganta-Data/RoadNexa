import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/" className="logo text-gradient">IRIS</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/cities">Cities</Link>
        <Link to="/map">Map</Link>
        <Link to="/upload-data" className="btn btn-primary btn-small">Upload Data</Link>
      </div>
    </nav>
  );
};

export default Navbar;
