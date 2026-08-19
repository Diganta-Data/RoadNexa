import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Building2, Database, Map, UploadCloud } from 'lucide-react';
import './Navbar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/cities', label: 'Cities', icon: Building2 },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/data-management', label: 'Data', icon: Database },
];

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand" aria-label="RoadNexa home">
        <span className="brand-mark">RN</span>
        <span>
          <strong>RoadNexa</strong>
          <small>Road Intelligence</small>
        </span>
      </NavLink>

      <div className="navbar-links">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/upload-data" className="btn btn-primary btn-small">
          <UploadCloud size={16} />
          Upload
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
