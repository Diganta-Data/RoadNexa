import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Brain, Construction, MapPin, Route, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import IRISMap from '../components/map/IRISMap';
import RoadIntelligencePanel from '../components/map/RoadIntelligencePanel';
import { analyticsService } from '../services/analyticsApi';
import { cityService } from '../services/cityApi';
import { geoService } from '../services/geoApi';
import { roadService } from '../services/roadApi';
import './FeaturePages.css';

const severityColors = ['#ff5c5c', '#f2b84b', '#73d8c2', '#79b8ff', '#c8d5df'];

const useAnalytics = (loader, fallback) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loaderRef = useRef(loader);

  useEffect(() => {
    let mounted = true;
    loaderRef.current()
      .then((result) => mounted && setData(result))
      .catch(() => mounted && setError('Unable to load backend data.'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};

export const MapPage = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({ roads: true, accidents: true, potholes: true });
  const [geoData, setGeoData] = useState({ roads: null, accidents: null, potholes: null });
  const [kpis, setKpis] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);

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

  useEffect(() => {
    cityService.getAllCities().then(setCities).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    const cityId = selectedCity?.city_id || null;
    Promise.all([
      analyticsService.getKPIs(cityId).catch(() => null),
      geoService.getRoads(cityId).catch(() => null),
      geoService.getAccidents(cityId).catch(() => null),
      geoService.getPotholes(cityId).catch(() => null),
    ]).then(([nextKpis, roads, accidents, potholes]) => {
      setKpis(nextKpis);
      setGeoData({ roads, accidents, potholes });
    });
  }, [selectedCity]);

  const center = selectedCity ? [selectedCity.latitude, selectedCity.longitude] : (clickedLocation ? [clickedLocation.latitude, clickedLocation.longitude] : [22.5726, 88.3639]);
  const zoom = selectedCity || clickedLocation ? 13 : 5;

  const handleMapClick = async (location) => {
    setClickedLocation(location);
    setLoadingRoad(true);
    setRoadError(null);

    // 1. Query OSM reverse geocode to get actual city / area name
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=12`);
      const geoObj = await res.json();
      const addr = geoObj.address || {};
      const areaName = addr.city || addr.town || addr.suburb || addr.county || addr.state_district || 'Selected Location';
      const stateName = addr.state || 'India';

      location.detectedName = areaName;
      location.detectedState = stateName;
    } catch {
      location.detectedName = `Location (${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)})`;
      location.detectedState = 'India';
    }

    // 2. Fetch nearest road details
    try {
      const roadDetails = await roadService.getNearestRoad(location.latitude, location.longitude);
      setSelectedRoad(roadDetails);
      try {
        sessionStorage.setItem('roadnexa_selected_road', JSON.stringify(roadDetails));
      } catch {}
    } catch (err) {
      console.error('Road details fetch error:', err);
    } finally {
      setLoadingRoad(false);
    }
  };

  const createLocation = async () => {
    if (!clickedLocation) return;
    setSavingLocation(true);
    try {
      const cityName = clickedLocation.detectedName || `Location ${clickedLocation.latitude.toFixed(2)}, ${clickedLocation.longitude.toFixed(2)}`;
      const city = await cityService.createCity({
        city_name: cityName,
        state: clickedLocation.detectedState || 'India',
        country: 'India',
        latitude: clickedLocation.latitude,
        longitude: clickedLocation.longitude,
        active: true,
      });
      
      const updated = await cityService.getAllCities();
      setCities(updated);
      setSelectedCity(city);
      setClickedLocation(null);
    } catch (err) {
      console.error('Create city error:', err);
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <div className="feature-page map-page-full">
      <div className="map-shell">
        <aside className="feature-side glass-panel">
          <h1>Interactive Map</h1>
          <p>Toggle layers, select a city, or click any point on the map to inspect road intelligence.</p>

          {selectedCity && (
            <div className="selected-location">
              <strong>{selectedCity.city_name}</strong>
              <span>{selectedCity.state ? `${selectedCity.state}, India` : ''} ({selectedCity.latitude.toFixed(4)}, {selectedCity.longitude.toFixed(4)})</span>
              <div className="mini-stats">
                <span>{kpis?.total_roads ?? 0} roads</span>
                <span>{kpis?.total_accidents ?? 0} accidents</span>
                <span>{kpis?.total_potholes ?? 0} potholes</span>
              </div>
              <Link className="btn btn-primary btn-small" to={`/upload-data?city=${selectedCity.city_id}`} style={{ marginTop: '8px' }}>
                <UploadCloud size={15} /> Upload Data
              </Link>
            </div>
          )}

          {clickedLocation && (
            <div className="selected-location manual">
              <strong>{clickedLocation.detectedName || 'Selected Location'}</strong>
              <span>{clickedLocation.detectedState || 'India'} ({clickedLocation.latitude}, {clickedLocation.longitude})</span>
              <button className="btn btn-primary btn-small" onClick={createLocation} disabled={savingLocation} style={{ marginTop: '8px' }}>
                <MapPin size={15} /> {savingLocation ? 'Saving & Loading Data...' : 'Save & Track City'}
              </button>
            </div>
          )}

          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MAP LAYERS</span>
            {['roads', 'accidents', 'potholes'].map((layer) => (
              <label className="switch-row" key={layer}>
                <input
                  type="checkbox"
                  checked={visibleLayers[layer]}
                  onChange={() => setVisibleLayers((current) => ({ ...current, [layer]: !current[layer] }))}
                />
                <span style={{ textTransform: 'capitalize' }}>{layer}</span>
              </label>
            ))}
          </div>

          <div className="city-chips">
            <button className={!selectedCity ? 'active' : ''} onClick={() => { setSelectedCity(null); setSelectedRoad(null); setClickedLocation(null); }}>All India</button>
            {cities.map((city) => (
              <button 
                key={city.city_id} 
                className={selectedCity?.city_id === city.city_id ? 'active' : ''} 
                onClick={() => { setSelectedCity(city); setSelectedRoad(null); setClickedLocation(null); }}
              >
                {city.city_name}
              </button>
            ))}
          </div>
        </aside>

        <div style={{ flex: 1, position: 'relative' }}>
          <IRISMap
            roadData={geoData.roads}
            accidentData={geoData.accidents}
            potholeData={geoData.potholes}
            selectedRoadGeom={selectedRoad?.geometry}
            visibleLayers={visibleLayers}
            center={center}
            zoom={zoom}
            cities={cities}
            onCitySelect={setSelectedCity}
            onMapClick={handleMapClick}
            height="calc(100vh - 96px)"
          />

          {/* Road Intelligence Drawer */}
          {(selectedRoad || loadingRoad || roadError) && (
            <RoadIntelligencePanel
              road={selectedRoad}
              loading={loadingRoad}
              error={roadError}
              onClose={() => setSelectedRoad(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const AccidentAnalytics = () => {
  const severity = useAnalytics(() => analyticsService.getSeverity(), []);
  const monthly = useAnalytics(() => analyticsService.getMonthlyAccidents(), []);

  return (
    <FeatureFrame icon={AlertTriangle} title="Accident Analytics" copy="Severity mix and monthly movement from ingested accident records." error={severity.error || monthly.error}>
      <div className="analytics-grid">
        <ChartCard title="Severity Breakdown" loading={severity.loading}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={severity.data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8ea0ad' }} />
              <YAxis tick={{ fill: '#8ea0ad' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {severity.data.map((_, index) => <Cell key={index} fill={severityColors[index % severityColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Accidents" loading={monthly.loading}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthly.data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8ea0ad' }} />
              <YAxis tick={{ fill: '#8ea0ad' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="accidents" stroke="#73d8c2" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </FeatureFrame>
  );
};

export const DangerousRoads = () => {
  const { data, loading, error } = useAnalytics(() => analyticsService.getDangerousRoads(), []);
  return (
    <FeatureFrame icon={Route} title="Dangerous Roads" copy="Ranked by crash frequency, fatality count, and severity weighting." error={error}>
      <RoadTable rows={data} loading={loading} />
    </FeatureFrame>
  );
};

export const RoadDetail = () => {
  const { roadId } = useParams();
  const { data } = useAnalytics(() => analyticsService.getDangerousRoads(), []);
  const road = useMemo(() => data.find((item) => String(item.road_id) === roadId), [data, roadId]);
  return (
    <FeatureFrame icon={Route} title={road?.road_name || 'Road Detail'} copy="Operational profile for the selected road segment.">
      {road ? <RoadTable rows={[road]} /> : <div className="empty-state glass-panel">Road not found in the current risk ranking.</div>}
    </FeatureFrame>
  );
};

export const Hotspots = () => {
  const { data, loading, error } = useAnalytics(() => analyticsService.getHotspots(), []);
  return (
    <FeatureFrame icon={MapPin} title="Hotspots" copy="Rounded geospatial clusters based on nearby accident coordinates." error={error}>
      <div className="hotspot-grid">
        {loading ? <div className="loading-state">Loading hotspots...</div> : data.map((spot, index) => (
          <div className="metric-card glass-panel" key={`${spot.latitude}-${spot.longitude}`}>
            <span>#{index + 1}</span>
            <h2>{spot.accidents} accidents</h2>
            <p>{spot.latitude}, {spot.longitude}</p>
            <strong>{spot.fatal_accidents} fatal</strong>
          </div>
        ))}
      </div>
    </FeatureFrame>
  );
};

export const RiskIntelligence = () => {
  const { data, loading, error } = useAnalytics(() => analyticsService.getDangerousRoads(), []);
  return (
    <FeatureFrame icon={ShieldAlert} title="Risk Intelligence" copy="Road risk scoring from frequency and severity signals." error={error}>
      <ChartCard title="Top Risk Scores" loading={loading}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#8ea0ad' }} />
            <YAxis type="category" dataKey="road_name" tick={{ fill: '#8ea0ad', fontSize: 12 }} width={130} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="risk_score" fill="#ff5c5c" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </FeatureFrame>
  );
};

export const MLPredictions = () => {
  const { data, loading, error } = useAnalytics(() => analyticsService.getPredictions(), null);
  return (
    <FeatureFrame icon={Brain} title="ML Predictions" copy="Baseline severity estimate using uploaded traffic features." error={error}>
      {loading ? <div className="loading-state">Loading prediction...</div> : (
        <div className="prediction-card glass-panel">
          <span>{data.model}</span>
          <h2>{data.predicted_severity}</h2>
          <p>Confidence: {Math.round(data.confidence * 100)}%</p>
          <div className="prediction-features">
            <strong>Avg volume: {data.features.average_traffic_volume}</strong>
            <strong>Avg speed: {data.features.average_speed} km/h</strong>
          </div>
        </div>
      )}
    </FeatureFrame>
  );
};

export const Recommendations = () => {
  const { data, loading, error } = useAnalytics(() => analyticsService.getRecommendations(), []);
  return (
    <FeatureFrame icon={Sparkles} title="Recommendations" copy="Prioritized interventions generated from the road risk ranking." error={error}>
      <div className="recommendation-list">
        {loading ? <div className="loading-state">Loading recommendations...</div> : data.map((item) => (
          <div className="recommendation glass-panel" key={item.road_id}>
            <span>{item.priority}</span>
            <h2>{item.road_name}</h2>
            <p>{item.action}</p>
            <strong>Risk {item.risk_score}/100</strong>
          </div>
        ))}
      </div>
    </FeatureFrame>
  );
};

const FeatureFrame = ({ icon: Icon, title, copy, error, children }) => (
  <div className="feature-page container fade-up">
    <div className="page-header feature-header">
      <div>
        <span className="eyebrow"><Icon size={16} /> RoadNexa operations</span>
        <h1 className="text-gradient">{title}</h1>
        <p className="text-muted">{copy}</p>
      </div>
      <Link to="/upload-data" className="btn btn-secondary"><Construction size={16} /> Add Data</Link>
    </div>
    {error && <div className="error-banner">{error}</div>}
    {children}
  </div>
);

const ChartCard = ({ title, loading, children }) => (
  <div className="chart-card glass-panel">
    <h2>{title}</h2>
    {loading ? <div className="loading-state">Loading chart...</div> : children}
  </div>
);

const RoadTable = ({ rows, loading }) => (
  <div className="table-container glass-panel">
    {loading ? <div className="loading-state">Loading roads...</div> : (
      <table className="data-table">
        <thead>
          <tr>
            <th>Road</th>
            <th>Type</th>
            <th>Accidents</th>
            <th>Fatal</th>
            <th>Risk</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((road) => (
            <tr key={road.road_id}>
              <td>{road.road_name}</td>
              <td>{road.road_type}</td>
              <td>{road.accidents}</td>
              <td>{road.fatal_accidents}</td>
              <td><span className="risk-pill">{road.risk_score}/100</span></td>
              <td><Link to={`/roads/${road.road_id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const tooltipStyle = {
  background: '#121922',
  border: '1px solid rgba(210, 230, 240, 0.14)',
  borderRadius: 8,
  color: '#f7fbff',
};
