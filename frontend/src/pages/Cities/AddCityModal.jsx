import React, { useState } from 'react';
import './Cities.css';

const AddCityModal = ({ isOpen, onClose, onAddCity }) => {
  const [formData, setFormData] = useState({
    city_name: '',
    state: '',
    country: 'India',
    latitude: '',
    longitude: '',
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      await onAddCity(payload);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to add city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>Add New City</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="city-form">
          <div className="form-group">
            <label>City Name</label>
            <input required type="text" name="city_name" value={formData.city_name} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>State</label>
            <input required type="text" name="state" value={formData.state} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input required type="text" name="country" value={formData.country} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input required type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Longitude</label>
              <input required type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add City'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCityModal;
