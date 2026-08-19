import React, { useState, useEffect, useRef } from 'react';
import { INDIAN_CITIES } from '../../data/indianCities';
import { Search, MapPin, Loader2 } from 'lucide-react';
import './CityAutocomplete.css';

const CityAutocomplete = ({ value, onChange, onSelectCity }) => {
  const [query, setQuery] = useState(value || '');
  const [filteredCities, setFilteredCities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChange(text);

    if (text.trim().length > 0) {
      const q = text.toLowerCase();
      const matches = INDIAN_CITIES.filter(
        c => c.city_name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
      );
      setFilteredCities(matches.slice(0, 10));
      setIsOpen(true);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (city) => {
    setQuery(city.city_name);
    setIsOpen(false);
    if (onSelectCity) {
      onSelectCity(city);
    }
  };

  const searchOnline = async () => {
    if (!query.trim()) return;
    setIsSearchingOnline(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},+India&limit=5&addressdetails=1`
      );
      const data = await res.json();
      const results = data.map((item) => ({
        city_name: item.address?.city || item.address?.town || item.address?.state_district || item.display_name.split(',')[0],
        state: item.address?.state || 'India',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        displayName: item.display_name
      }));
      setOnlineResults(results);
    } catch (err) {
      console.error('Online geocoding failed:', err);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  return (
    <div className="city-autocomplete-wrapper" ref={wrapperRef}>
      <div className="input-with-icon">
        <MapPin className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search any Indian City (e.g. Mumbai, Jaipur, Kolkata)..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          className="autocomplete-input"
          required
        />
      </div>

      {isOpen && (
        <div className="autocomplete-dropdown glass-panel">
          <div className="dropdown-section-title">
            <span>SUGGESTED INDIAN CITIES</span>
            <span className="count-badge">{filteredCities.length}</span>
          </div>

          {filteredCities.length > 0 ? (
            filteredCities.map((city, idx) => (
              <div
                key={idx}
                className="autocomplete-item"
                onClick={() => handleSelect(city)}
              >
                <div className="item-main">
                  <span className="city-title">{city.city_name}</span>
                  <span className="state-subtitle">{city.state}, India</span>
                </div>
                <div className="coords-badge">
                  {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                </div>
              </div>
            ))
          ) : (
            <div className="no-local-match">
              <p>No offline match found for "{query}"</p>
              <button
                type="button"
                className="btn-online-search"
                onClick={searchOnline}
                disabled={isSearchingOnline}
              >
                {isSearchingOnline ? (
                  <>
                    <Loader2 size={14} className="spin" /> Searching OpenStreetMap India...
                  </>
                ) : (
                  <>
                    <Search size={14} /> Search Live OSM India Geocoder
                  </>
                )}
              </button>
            </div>
          )}

          {onlineResults.length > 0 && (
            <div className="online-results-section">
              <div className="dropdown-section-title">LIVE GEOCODING RESULTS</div>
              {onlineResults.map((res, idx) => (
                <div
                  key={`online-${idx}`}
                  className="autocomplete-item online-item"
                  onClick={() => handleSelect(res)}
                >
                  <div className="item-main">
                    <span className="city-title">{res.city_name}</span>
                    <span className="state-subtitle">{res.displayName}</span>
                  </div>
                  <div className="coords-badge">
                    {res.latitude.toFixed(4)}°, {res.longitude.toFixed(4)}°
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
