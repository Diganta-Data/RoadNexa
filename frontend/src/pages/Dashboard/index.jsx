import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin, AlertTriangle, Car, ShieldAlert, Construction,
  Activity, TrendingUp, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsService } from '../../services/analyticsApi';
import { geoService } from '../../services/geoApi';
import { cityService } from '../../services/cityApi';
import { roadService } from '../../services/roadApi';
import IRISMap from '../../components/map/IRISMap';
import RoadIntelligencePanel from '../../components/map/RoadIntelligencePanel';
import './Dashboard.css';

const SEVERITY_COLORS = {
  fatal: '#EF4444',
  severe: '#F97316',
  minor: '#FACC15',
  damage_only: '#94A3B8',
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [kpis, setKpis] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [geoData, setGeoData] = useState({ roads: null, accidents: null, potholes: null });
  const [visibleLayers, setVisibleLayers] = useState({
    roads: true,
    accidents: true,
    potholes: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Road Intelligence State
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [loadingRoad, setLoadingRoad] = useState(false);
  const [roadError, setRoadError] = useState(null);

  // Restore selected road from sessionStorage on mount (preserves window when navigating back)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('roadnexa_selected_road');
      if (saved) {
        setSelectedRoad(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Session storage restore error', e);
    }
  }, []);

  // Load cities on mount
  useEffect(() => {
    cityService.getAllCities()
      .then((items) => {
        setCities(items);
        const cityParam = searchParams.get('city');
        if (cityParam) {
          const match = items.find((city) => String(city.city_id) === cityParam);
          if (match) setSelectedCity(match);
        }
      })
      .catch(err => console.error('Failed to load cities', err));
  }, [searchParams]);

  // Load KPIs + geo data when city selection changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cityId = selectedCity?.city_id || null;
        const kpiData = await analyticsService.getKPIs(cityId);
        setKpis(kpiData);

        if (cityId) {
          const [roads, accidents, potholes] = await Promise.all([
            geoService.getRoads(cityId).catch(() => null),
            geoService.getAccidents(cityId).catch(() => null),
            geoService.getPotholes(cityId).catch(() => null),
          ]);
          setGeoData({ roads, accidents, potholes });
        } else {
          setGeoData({ roads: null, accidents: null, potholes: null });
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data. Check backend connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const clearSelection = () => {
    setSelectedCity(null);
  };

  // Map Click Handler — Inspect Road & Fetch Overpass/OSM Intelligence
  const handleMapClick = async ({ latitude, longitude, roadProperties }) => {
    setLoadingRoad(true);
    setRoadError(null);
    try {
      const roadDetails = await roadService.getNearestRoad(latitude, longitude);
      if (roadProperties && roadProperties.road_name) {
        roadDetails.road_name = roadProperties.road_name;
      }
      setSelectedRoad(roadDetails);
      try {
        sessionStorage.setItem('roadnexa_selected_road', JSON.stringify(roadDetails));
      } catch {}
    } catch (err) {
      console.error('Failed to inspect road:', err);
      setRoadError('Unable to retrieve road intelligence data for this location.');
    } finally {
      setLoadingRoad(false);
    }
  };

  // Derive chart data from accident geojson
  const severityChart = useMemo(() => {
    if (!geoData.accidents?.features) return [];
    const counts = {};
    geoData.accidents.features.forEach(f => {
      const sev = f.properties?.severity || 'unknown';
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
      color: SEVERITY_COLORS[name] || '#94A3B8',
    }));
  }, [geoData.accidents]);

  // Map center logic
  const mapCenter = selectedCity
    ? [selectedCity.latitude, selectedCity.longitude]
    : [22.5726, 88.3639]; // Default to Kolkata center
  const mapZoom = selectedCity ? 13 : 12;

  const toggleLayer = (layer) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dash-sidebar glass-panel">
        <div className="sidebar-header">
          <Activity size={20} />
          <h3>RoadNexa Intelligence</h3>
        </div>

        <div className="city-list">
          <button
            className={`city-item ${!selectedCity ? 'active' : ''}`}
            onClick={clearSelection}
          >
            <MapPin size={16} />
            <span>All India (Overview)</span>
          </button>
          {cities.map(city => (
            <button
              key={city.city_id}
              className={`city-item ${selectedCity?.city_id === city.city_id ? 'active' : ''}`}
              onClick={() => handleCitySelect(city)}
            >
              <MapPin size={16} />
              <span>{city.city_name}</span>
              <ChevronRight size={14} className="chevron" />
            </button>
          ))}
        </div>

        <div className="layer-controls">
          <h4>Map Layers</h4>
          <label className="layer-toggle">
            <input type="checkbox" checked={visibleLayers.roads} onChange={() => toggleLayer('roads')} />
            <span className="dot" style={{ background: '#22C55E' }}></span>
            Roads
          </label>
          <label className="layer-toggle">
            <input type="checkbox" checked={visibleLayers.accidents} onChange={() => toggleLayer('accidents')} />
            <span className="dot" style={{ background: '#EF4444' }}></span>
            Accidents
          </label>
          <label className="layer-toggle">
            <input type="checkbox" checked={visibleLayers.potholes} onChange={() => toggleLayer('potholes')} />
            <span className="dot" style={{ background: '#FACC15' }}></span>
            Potholes
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        {/* Header */}
        <header className="dash-header">
          <div>
            <h1>{selectedCity ? selectedCity.city_name : 'Kolkata'} - Safety Intelligence</h1>
            <p className="text-muted">
              {selectedCity ? `Analyzing ${selectedCity.state || 'city'} road network` : 'Select a city or click any road on the map to inspect'}
            </p>
          </div>
          {selectedCity && (
            <span className="data-badge">SYNTHETIC DEMO</span>
          )}
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* KPI Strip */}
        <div className="kpi-strip">
          <KPICard icon={<Car size={22} />} label="Roads" value={kpis?.total_roads} color="blue" loading={loading} />
          <KPICard icon={<AlertTriangle size={22} />} label="Accidents" value={kpis?.total_accidents} color="red" loading={loading} />
          <KPICard icon={<ShieldAlert size={22} />} label="Fatal" value={kpis?.fatal_accidents} color="orange" loading={loading} />
          <KPICard icon={<Construction size={22} />} label="Potholes" value={kpis?.total_potholes} color="yellow" loading={loading} />
          <KPICard icon={<TrendingUp size={22} />} label="Avg Risk" value={kpis?.average_risk_score ? `${kpis.average_risk_score}` : '--'} suffix="/100" color="purple" loading={loading} />
        </div>

        {/* Map Container */}
        <div className="map-wrapper" style={{ position: 'relative' }}>
          <IRISMap
            roadData={geoData.roads}
            accidentData={geoData.accidents}
            potholeData={geoData.potholes}
            selectedRoadGeom={selectedRoad?.geometry}
            visibleLayers={visibleLayers}
            center={mapCenter}
            zoom={mapZoom}
            cities={cities}
            onCitySelect={handleCitySelect}
            onMapClick={handleMapClick}
            height="520px"
          />

          {/* Road Intelligence Side Drawer Overlay */}
          {(selectedRoad || loadingRoad || roadError) && (
            <RoadIntelligencePanel
              road={selectedRoad}
              loading={loadingRoad}
              error={roadError}
              onClose={() => setSelectedRoad(null)}
            />
          )}
        </div>

        {/* Charts Section */}
        {severityChart.length > 0 && (
          <div className="charts-row">
            <div className="chart-card glass-panel">
              <h3>Accident Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={severityChart}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {severityChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card glass-panel">
              <h3>Severity Proportion</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={severityChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {severityChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable KPI card
const KPICard = ({ icon, label, value, suffix = '', color, loading }) => (
  <div className={`kpi-card kpi-${color}`}>
    <div className="kpi-icon">{icon}</div>
    <div>
      <span className="kpi-value">{loading ? '...' : (value ?? 0)}{suffix}</span>
      <span className="kpi-label">{label}</span>
    </div>
  </div>
);

export default Dashboard;
