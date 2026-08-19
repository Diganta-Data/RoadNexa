import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Key } from 'lucide-react';
import './IRISMap.css';

// India centered view
const INDIA_CENTER = [22.5, 82.0];
const INDIA_ZOOM = 5;

// Tile Providers
const TILE_PROVIDERS = {
  cartoDark: {
    name: 'Carto Dark (Default)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  },
  osmStandard: {
    name: 'OpenStreetMap India',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19
  },
  esriSatellite: {
    name: 'Esri Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri & Earthstar Geographics',
    maxZoom: 18
  },
  govtCustom: {
    name: 'Govt / Custom Tile (Bhuvan / MapmyIndia)',
    url: '', // User configured
    attribution: '&copy; Survey of India / Bhuvan ISRO / MapmyIndia',
    maxZoom: 18
  }
};

// Risk colors
const RISK_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  moderate: '#FACC15',
  low: '#84CC16',
  veryLow: '#22C55E',
};

const getRiskColor = (score) => {
  if (score > 80) return RISK_COLORS.critical;
  if (score > 60) return RISK_COLORS.high;
  if (score > 40) return RISK_COLORS.moderate;
  if (score > 20) return RISK_COLORS.low;
  return RISK_COLORS.veryLow;
};

const severityColors = {
  fatal: '#EF4444',
  severe: '#F97316',
  minor: '#FACC15',
  damage_only: '#94A3B8',
};

const IRISMap = ({ 
  roadData, 
  accidentData, 
  potholeData, 
  selectedRoadGeom = null,
  visibleLayers = { roads: true, accidents: true, potholes: false },
  center = INDIA_CENTER,
  zoom = INDIA_ZOOM,
  cities = [],
  onCitySelect = null,
  onMapClick = null,
  height = '500px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupsRef = useRef({});
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);

  const [activeTile, setActiveTile] = useState('cartoDark');
  const [govtApiKey, setGovtApiKey] = useState('');
  const [customTileUrl, setCustomTileUrl] = useState('');
  const [showTileSelector, setShowTileSelector] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: true,
      attributionControl: false,
    });

    // Default tile layer
    const initialProvider = TILE_PROVIDERS.cartoDark;
    const tileLayer = L.tileLayer(initialProvider.url, {
      maxZoom: initialProvider.maxZoom,
      subdomains: initialProvider.subdomains || 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Attribution
    L.control.attribution({ position: 'bottomright' })
      .addAttribution(initialProvider.attribution)
      .addTo(map);

    mapInstanceRef.current = map;
    layerGroupsRef.current = {
      roads: L.layerGroup().addTo(map),
      accidents: L.layerGroup().addTo(map),
      potholes: L.layerGroup().addTo(map),
      cities: L.layerGroup().addTo(map),
      selectedRoad: L.layerGroup().addTo(map),
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map tile provider dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let provider = TILE_PROVIDERS[activeTile];
    let tileUrl = provider.url;

    if (activeTile === 'govtCustom') {
      if (customTileUrl) {
        tileUrl = customTileUrl;
      } else if (govtApiKey) {
        tileUrl = `https://apis.mapmyindia.com/advancedmaps/v1/${govtApiKey}/still_image?center={y},{x}&zoom={z}&size=800x600`;
      } else {
        tileUrl = 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=india3&STYLE=default&TILEMATRIXSET=EPSG:900913&TILEMATRIX=EPSG:900913:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png';
      }
    }

    if (tileUrl) {
      tileLayerRef.current = L.tileLayer(tileUrl, {
        maxZoom: provider.maxZoom || 18,
        subdomains: provider.subdomains || 'abc',
      }).addTo(map);
    }
  }, [activeTile, govtApiKey, customTileUrl]);

  // Click handler
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !onMapClick) return undefined;

    const handleClick = (event) => {
      onMapClick({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [onMapClick]);

  // Render city markers
  useEffect(() => {
    const group = layerGroupsRef.current.cities;
    if (!group || !cities.length) return;

    group.clearLayers();
    cities.forEach(city => {
      if (!city.latitude || !city.longitude) return;

      const marker = L.circleMarker([city.latitude, city.longitude], {
        radius: 8,
        fillColor: '#3B82F6',
        fillOpacity: 0.9,
        color: '#60A5FA',
        weight: 2,
      });

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;color:#1e293b;min-width:140px;">
          <strong style="font-size:14px;">${city.city_name}</strong>
          <br/><span style="color:#64748b;">${city.state || ''}</span>
        </div>
      `);

      if (onCitySelect) {
        marker.on('click', (event) => {
          L.DomEvent.stopPropagation(event);
          onCitySelect(city);
        });
      }

      marker.addTo(group);
    });
  }, [cities, onCitySelect]);

  // Render road data
  useEffect(() => {
    const group = layerGroupsRef.current.roads;
    if (!group) return;
    group.clearLayers();

    if (!visibleLayers.roads || !roadData?.features) return;

    roadData.features.forEach(feature => {
      if (!feature.geometry) return;
      const risk = feature.properties?.risk_score || 50;
      const coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
      
      const poly = L.polyline(coords, {
        color: getRiskColor(risk),
        weight: 4,
        opacity: 0.85,
      });

      poly.bindPopup(`
        <div style="font-family:Inter,sans-serif;color:#1e293b;">
          <strong>${feature.properties?.road_name || 'Road'}</strong>
          <br/>Type: ${feature.properties?.road_type || 'N/A'}
          <br/>Risk: <span style="color:${getRiskColor(risk)};font-weight:600;">${risk}/100</span>
        </div>
      `);

      if (onMapClick) {
        poly.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onMapClick({
            latitude: Number(e.latlng.lat.toFixed(6)),
            longitude: Number(e.latlng.lng.toFixed(6)),
            roadProperties: feature.properties
          });
        });
      }

      poly.addTo(group);
    });
  }, [roadData, visibleLayers.roads, onMapClick]);

  // Render selected road highlight layer
  useEffect(() => {
    const group = layerGroupsRef.current.selectedRoad;
    if (!group) return;
    group.clearLayers();

    if (!selectedRoadGeom) return;

    let coords = [];
    if (selectedRoadGeom.type === 'LineString' && selectedRoadGeom.coordinates) {
      coords = selectedRoadGeom.coordinates.map(c => [c[1], c[0]]);
    } else if (Array.isArray(selectedRoadGeom)) {
      coords = selectedRoadGeom.map(c => [c[1], c[0]]);
    }

    if (coords.length > 0) {
      // Glow background line
      L.polyline(coords, {
        color: '#22D3EE',
        weight: 10,
        opacity: 0.4,
      }).addTo(group);

      // Core highlighted line
      L.polyline(coords, {
        color: '#38BDF8',
        weight: 6,
        opacity: 1.0,
      }).addTo(group);
    }
  }, [selectedRoadGeom]);

  // Render accident markers
  useEffect(() => {
    const group = layerGroupsRef.current.accidents;
    if (!group) return;
    group.clearLayers();

    if (!visibleLayers.accidents || !accidentData?.features) return;

    accidentData.features.forEach(feature => {
      if (!feature.geometry) return;
      const [lng, lat] = feature.geometry.coordinates;
      const sev = feature.properties?.severity || 'minor';

      L.circleMarker([lat, lng], {
        radius: sev === 'fatal' ? 6 : 4,
        fillColor: severityColors[sev] || '#EF4444',
        fillOpacity: 0.8,
        color: 'transparent',
        weight: 0,
      }).bindPopup(`
        <div style="font-family:Inter,sans-serif;color:#1e293b;">
          <strong>Accident</strong>
          <br/>Severity: <span style="color:${severityColors[sev]};font-weight:600;">${sev}</span>
          <br/>Date: ${feature.properties?.date || 'N/A'}
        </div>
      `).addTo(group);
    });
  }, [accidentData, visibleLayers.accidents]);

  // Render pothole markers
  useEffect(() => {
    const group = layerGroupsRef.current.potholes;
    if (!group) return;
    group.clearLayers();

    if (!visibleLayers.potholes || !potholeData?.features) return;

    potholeData.features.forEach(feature => {
      if (!feature.geometry) return;
      const [lng, lat] = feature.geometry.coordinates;

      L.circleMarker([lat, lng], {
        radius: 4,
        fillColor: '#FACC15',
        fillOpacity: 0.8,
        color: 'transparent',
        weight: 0,
      }).bindPopup(`
        <div style="font-family:Inter,sans-serif;color:#1e293b;">
          <strong>Pothole</strong>
          <br/>Severity: ${feature.properties?.severity || 'N/A'}
          <br/>Status: ${feature.properties?.status || 'N/A'}
        </div>
      `).addTo(group);
    });
  }, [potholeData, visibleLayers.potholes]);

  // Fly to center with smooth animation & radar pulse effect when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo(center, zoom, {
      animate: true,
      duration: 2.0,
      easeLinearity: 0.25
    });

    // Pulse animation at center
    if (layerGroupsRef.current.selectedRoad) {
      const pulseMarker = L.circleMarker(center, {
        radius: 20,
        fillColor: '#38BDF8',
        fillOpacity: 0.4,
        color: '#0284C7',
        weight: 3,
        className: 'radar-pulse-marker'
      }).addTo(layerGroupsRef.current.selectedRoad);

      setTimeout(() => {
        if (layerGroupsRef.current.selectedRoad) {
          layerGroupsRef.current.selectedRoad.removeLayer(pulseMarker);
        }
      }, 3500);
    }
  }, [center, zoom]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div 
        ref={mapRef} 
        className="iris-map" 
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      />

      {/* Map Tile Control Toggle Button */}
      <button 
        type="button" 
        className="map-tile-btn glass-panel"
        onClick={() => setShowTileSelector(!showTileSelector)}
        title="Change Map Provider & Tiles"
      >
        <Layers size={16} /> Map Provider
      </button>

      {/* Map Tile Control Panel */}
      {showTileSelector && (
        <div className="map-tile-modal glass-panel">
          <h4>Map Layer Provider</h4>
          {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
            <label key={key} className="tile-option">
              <input
                type="radio"
                name="mapTile"
                value={key}
                checked={activeTile === key}
                onChange={() => setActiveTile(key)}
              />
              <span>{provider.name}</span>
            </label>
          ))}

          {activeTile === 'govtCustom' && (
            <div className="api-key-config">
              <label><Key size={12} /> Govt API Key / Token</label>
              <input
                type="text"
                placeholder="Enter Bhuvan/MapmyIndia API Key..."
                value={govtApiKey}
                onChange={(e) => setGovtApiKey(e.target.value)}
              />
              <label style={{ marginTop: '6px' }}>Or Custom Tile URL Template</label>
              <input
                type="text"
                placeholder="https://.../{z}/{x}/{y}.png"
                value={customTileUrl}
                onChange={(e) => setCustomTileUrl(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IRISMap;
