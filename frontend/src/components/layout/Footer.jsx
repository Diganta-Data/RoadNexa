import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer glass-panel">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} IRIS — Indian Road Intelligence & Safety Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
