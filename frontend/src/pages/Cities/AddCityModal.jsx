import React, { useState } from 'react';
import CityAutocomplete from '../../components/common/CityAutocomplete';
import { Sparkles, MapPin } from 'lucide-react';
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

  const handleSelectCityFromAutocomplete = (selected) => {
    setFormData(prev => ({
      ...prev,
      city_name: selected.city_name,
      state: selected.state || prev.state || 'India',
      country: 'India',
      latitude: selected.latitude !== undefined ? selected.latitude.toString() : prev.latitude,
      longitude: selected.longitude !== undefined ? selected.longitude.toString() : prev.longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      setError('Please provide valid Latitude and Longitude.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      await onAddCity(payload);
      onClose();
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
          <div>
            <h2>Add New City</h2>
            <p className="modal-subtitle">Search any Indian city to auto-fill State & Coordinates</p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="city-form">
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>City Name</span>
              <span className="auto-tag"><Sparkles size={12} /> Autocomplete Indian Cities</span>
            </label>
            <CityAutocomplete
              value={formData.city_name}
              onChange={(val) => setFormData(prev => ({ ...prev, city_name: val }))}
              onSelectCity={handleSelectCityFromAutocomplete}
            />
          </div>
          
          <div className="form-group">
            <label>State</label>
            <input 
              required 
              type="text" 
              name="state" 
              placeholder="e.g. Maharashtra" 
              value={formData.state} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input 
              required 
              type="text" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude <MapPin size={12} /></label>
              <input 
                required 
                type="number" 
                step="any" 
                name="latitude" 
                placeholder="e.g. 19.0760" 
                value={formData.latitude} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Longitude <MapPin size={12} /></label>
              <input 
                required 
                type="number" 
                step="any" 
                name="longitude" 
                placeholder="e.g. 72.8777" 
                value={formData.longitude} 
                onChange={handleChange} 
              />
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
