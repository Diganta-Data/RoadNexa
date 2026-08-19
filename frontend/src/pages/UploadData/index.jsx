import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Database, FileUp, UploadCloud } from 'lucide-react';
import { cityService } from '../../services/cityApi';
import { uploadService } from '../../services/uploadApi';
import './UploadData.css';

const datasetOptions = [
  { value: 'accidents', label: 'Accident Records', hint: 'date, lat/lng, severity, injuries' },
  { value: 'roads', label: 'Road Network', hint: 'road name, type, LineString geometry' },
  { value: 'potholes', label: 'Potholes / Defects', hint: 'lat/lng, severity, status' },
  { value: 'traffic', label: 'Traffic Volume', hint: 'date, speed, volume, congestion' },
];

const UploadData = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({ city_id: '', dataset_type: 'accidents' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    cityService.getAllCities()
      .then((items) => {
        setCities(items);
        const cityParam = searchParams.get('city');
        if (cityParam && items.some((city) => String(city.city_id) === cityParam)) {
          setFormData((prev) => ({ ...prev, city_id: cityParam }));
        }
      })
      .catch(() => setError('Unable to load city list.'));
  }, [searchParams]);

  const selectedDataset = datasetOptions.find((item) => item.value === formData.dataset_type);

  const [isNewCity, setIsNewCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city_id') {
      if (value === 'other') {
        setIsNewCity(true);
        setFormData((prev) => ({ ...prev, city_id: 'other' }));
      } else {
        setIsNewCity(false);
        setFormData((prev) => ({ ...prev, city_id: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city_id) return setError('Please select a city.');
    if (isNewCity && !newCityName.trim()) return setError('Please enter a city name.');
    if (!file) return setError('Please choose a supported tabular or GIS file.');

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let finalCityId = formData.city_id;

      if (isNewCity) {
        // Create new city
        const newCity = await cityService.createCity({
          city_name: newCityName.trim(),
          state: 'Unknown',
          country: 'India',
          latitude: 22.5, // Default center
          longitude: 82.0 // Default center
        });
        finalCityId = newCity.city_id;
        
        // Refresh city list
        const updatedCities = await cityService.getAllCities();
        setCities(updatedCities);
        
        // Update form state
        setIsNewCity(false);
        setNewCityName('');
        setFormData((prev) => ({ ...prev, city_id: finalCityId }));
      }

      const upload = await uploadService.uploadDataset(finalCityId, formData.dataset_type, file);
      setSuccess(`Processed ${upload.record_count ?? 0} records from ${upload.original_filename}.`);
      setFile(null);
      document.getElementById('file-upload').value = '';
    } catch (err) {
      let errorMsg = 'Upload failed. Check the file columns and backend logs.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(e => e.msg).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container upload-page fade-up">
      <div className="page-header">
        <div>
          <span className="eyebrow"><UploadCloud size={16} /> Data operations</span>
          <h1 className="text-gradient">Upload Data</h1>
          <p className="text-muted">Ingest tabular or GIS files into the backend and make them available for map and analytics pages.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/data-management')}>
          <Database size={16} /> View Uploads
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner"><CheckCircle2 size={16} /> {success}</div>}

      <div className="upload-layout">
        <form onSubmit={handleSubmit} className="upload-form glass-panel">
          <div className="form-group">
            <label>Select City</label>
            <select name="city_id" value={formData.city_id} onChange={handleChange} required>
              <option value="">Choose a city</option>
              {cities.map((city) => <option key={city.city_id} value={city.city_id}>{city.city_name}</option>)}
              <option value="other">+ Add New City</option>
            </select>
          </div>

          {isNewCity && (
            <div className="form-group" style={{ marginTop: '-1rem' }}>
              <input 
                type="text" 
                placeholder="Enter new city name..." 
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          )}

          <div className="dataset-grid">
            {datasetOptions.map((option) => (
              <label className={formData.dataset_type === option.value ? 'dataset-option active' : 'dataset-option'} key={option.value}>
                <input type="radio" name="dataset_type" value={option.value} checked={formData.dataset_type === option.value} onChange={handleChange} />
                <strong>{option.label}</strong>
                <span>{option.hint}</span>
              </label>
            ))}
          </div>

          <label className="dropzone" htmlFor="file-upload">
            <FileUp size={34} />
            <strong>{file ? file.name : 'Choose file to upload'}</strong>
            <span>{selectedDataset?.hint}. Supported: CSV, TSV, Excel, JSON, GeoJSON, GPKG, KML, SHP, zipped SHP</span>
            <input type="file" id="file-upload" accept=".csv,.tsv,.xlsx,.xls,.json,.geojson,.gpkg,.kml,.shp,.zip" onChange={handleFileChange} />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <UploadCloud size={17} /> {loading ? 'Processing...' : 'Upload and Process'}
          </button>
        </form>

        <aside className="upload-guide glass-panel">
          <h2>Expected Columns</h2>
          <p>The parser accepts common aliases like lat/lon, date, severity, road_name, speed_limit, volume, geometry, and status.</p>
          <div className="guide-step"><span>1</span> Select city and dataset type</div>
          <div className="guide-step"><span>2</span> Upload a clean CSV or GeoJSON file</div>
          <div className="guide-step"><span>3</span> Open dashboard or map to inspect records</div>
        </aside>
      </div>
    </div>
  );
};

export default UploadData;
