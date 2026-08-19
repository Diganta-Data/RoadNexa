import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cityService } from '../../services/cityApi';
import AddCityModal from './AddCityModal';
import './Cities.css';

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const data = await cityService.getAllCities();
      setCities(data);
    } catch {
      setError('Failed to load cities.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (cityData) => {
    await cityService.createCity(cityData);
    await fetchCities(); // Refresh list after adding
  };

  return (
    <div className="container cities-page">
      <div className="page-header">
        <div>
          <h1 className="text-gradient">City Management</h1>
          <p className="text-muted">Manage regions and view data completeness.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add New City
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading cities...</div>
      ) : cities.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No cities found</h3>
          <p>Get started by adding your first city.</p>
        </div>
      ) : (
        <div className="cities-grid">
          {cities.map((city) => (
            <div key={city.city_id} className="city-card glass-panel">
              <div className="city-card-header">
                <h2>{city.city_name}</h2>
                <span className={`status-dot ${city.active ? 'active' : 'inactive'}`}></span>
              </div>
              <p className="text-muted">{city.state}, {city.country}</p>
              
              <div className="city-stats">
                <div className="stat">
                  <span className="stat-label">Lat</span>
                  <span className="stat-value">{city.latitude.toFixed(4)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Lng</span>
                  <span className="stat-value">{city.longitude.toFixed(4)}</span>
                </div>
              </div>
              
              <div className="city-card-actions">
                <Link to={`/dashboard?city=${city.city_id}`} className="btn btn-secondary btn-small">
                  View Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddCity={handleAddCity}
      />
    </div>
  );
};

export default Cities;
