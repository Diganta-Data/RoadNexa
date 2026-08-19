import React, { useState, useEffect } from 'react';
import { uploadService } from '../../services/uploadApi';
import { cityService } from '../../services/cityApi';
import './DataManagement.css';

const DataManagement = () => {
  const [uploads, setUploads] = useState([]);
  const [cities, setCities] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uploadData, cityData] = await Promise.all([
        uploadService.getAllUploads(),
        cityService.getAllCities()
      ]);
      
      const cityMap = {};
      cityData.forEach(c => { cityMap[c.city_id] = c.city_name; });
      setCities(cityMap);
      setUploads(uploadData);
    } catch (err) {
      console.error("Failed to fetch data management info", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PROCESSED': return <span className="badge badge-success">Processed</span>;
      case 'PROCESSING': return <span className="badge badge-warning">Processing</span>;
      case 'FAILED': return <span className="badge badge-error">Failed</span>;
      default: return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="container data-mgmt-page">
      <div className="page-header">
        <h1 className="text-gradient">Data Management</h1>
        <p className="text-muted">Review and manage uploaded datasets.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading datasets...</div>
      ) : uploads.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No datasets uploaded yet</h3>
          <p>Go to the Upload Data portal to get started.</p>
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Dataset Type</th>
                <th>Filename</th>
                <th>Format</th>
                <th>Status</th>
                <th>Records</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map(upload => (
                <tr key={upload.upload_id}>
                  <td>{cities[upload.city_id] || 'Unknown'}</td>
                  <td className="capitalize">{upload.dataset_type}</td>
                  <td>{upload.original_filename}</td>
                  <td className="uppercase">{upload.file_format}</td>
                  <td>{getStatusBadge(upload.upload_status)}</td>
                  <td>{upload.record_count || '-'}</td>
                  <td>{new Date(upload.uploaded_at).toLocaleString()}</td>
                  <td>
                    {upload.upload_status === 'PROCESSED' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a href={`/map?city=${upload.city_id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Open Map</a>
                        <a href={`/dashboard?city=${upload.city_id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Analytics</a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
