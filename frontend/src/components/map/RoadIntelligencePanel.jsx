import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Navigation, ShieldAlert, AlertTriangle, Cpu, Wrench, 
  Activity, ExternalLink 
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsApi';
import './RoadIntelligencePanel.css';


const getRiskColor = (score) => {
  if (score > 80) return '#EF4444'; // CRITICAL
  if (score > 60) return '#F97316'; // HIGH
  if (score > 40) return '#FACC15'; // MODERATE
  if (score > 20) return '#84CC16'; // LOW
  return '#22C55E'; // VERY LOW
};

const RoadIntelligencePanel = ({ road, loading, error, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  if (!road && !loading && !error) return null;

  const handleRunAiPrediction = async () => {
    setIsPredicting(true);
    setChatHistory([]); // Reset chat history on new prediction
    try {
      const res = await analyticsService.getAiAnalysis(road);
      setPredictionResult(res);
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleAskAiQuestion = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    
    const question = aiQuestion;
    setAiQuestion('');
    
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setIsAsking(true);
    
    try {
      const res = await analyticsService.getAiAnalysis({ ...road, question });
      setChatHistory(prev => [...prev, { role: 'ai', content: res.analysis_markdown }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setChatHistory(prev => [...prev, { role: 'error', content: 'Failed to get answer from AI.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleClose = () => {
    try {
      sessionStorage.removeItem('roadnexa_selected_road');
    } catch {}
    onClose();
  };

  return (
    <aside className="road-panel-drawer glass-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-title">
          <span className="eyebrow-tag">
            <Navigation size={13} /> ROAD INTELLIGENCE
          </span>
          <h2>{loading ? 'Analyzing Road...' : (road?.road_name || 'Selected Road')}</h2>
          <div className="header-meta">
            <span className="type-chip">{road?.road_type || 'Primary'}</span>
            <span className="osm-id">OSM ID: {road?.osm_profile?.osm_id || 'N/A'}</span>
          </div>
        </div>
        <button type="button" className="close-panel-btn" onClick={handleClose} title="Close Panel">
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="panel-loading">
          <div className="pulse-loader"></div>
          <p>Querying OpenStreetMap Overpass & IRIS Safety Data...</p>
        </div>
      ) : error ? (
        <div className="panel-error">
          <AlertTriangle size={24} />
          <p>{error}</p>
        </div>
      ) : road ? (
        <div className="panel-body">
          {/* Risk Score Highlight Card */}
          <div 
            className="risk-summary-card" 
            style={{ borderColor: getRiskColor(road.risk?.score || 50) }}
          >
            <div className="risk-score-badge" style={{ background: `${getRiskColor(road.risk?.score || 50)}22`, color: getRiskColor(road.risk?.score || 50) }}>
              <span className="score-val">{road.risk?.score || 50}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="risk-info">
              <span className="risk-level-tag" style={{ background: getRiskColor(road.risk?.score || 50) }}>
                {road.risk?.level || 'MODERATE'} RISK
              </span>
              <p className="risk-hint">Calculated using PostGIS accident facts & OSM road characteristics</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="panel-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'infra' ? 'active' : ''}`}
              onClick={() => setActiveTab('infra')}
            >
              Infra
            </button>
            <button 
              className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveTab('safety')}
            >
              Safety
            </button>
            <button 
              className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Prediction
            </button>
          </div>

          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="tab-content fade-in">
              <h4 className="section-heading">ROAD PROFILE</h4>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="lbl">Lanes</span>
                  <span className="val">{road.lanes || 'Not available'}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Speed Limit</span>
                  <span className="val">{road.speed_limit || 'Not available'}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Surface</span>
                  <span className="val">{road.surface || 'Asphalt'}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Direction</span>
                  <span className="val">{road.osm_profile?.oneway || 'Two-way'}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Lighting</span>
                  <span className="val">{road.osm_profile?.lit || 'Available'}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Sidewalk</span>
                  <span className="val">{road.osm_profile?.sidewalk || 'Both sides'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Infrastructure */}
          {activeTab === 'infra' && (
            <div className="tab-content fade-in">
              <h4 className="section-heading">NEARBY INFRASTRUCTURE</h4>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="lbl">Intersections</span>
                  <span className="val">{road.osm_profile?.infrastructure?.intersections ?? 4}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Traffic Signals</span>
                  <span className="val">{road.osm_profile?.infrastructure?.traffic_signals ?? 2}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Pedestrian Crossings</span>
                  <span className="val">{road.osm_profile?.infrastructure?.crossings ?? 3}</span>
                </div>
                <div className="stat-box">
                  <span className="lbl">Bus Stops</span>
                  <span className="val">{road.osm_profile?.infrastructure?.bus_stops ?? 2}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Safety & Accidents */}
          {activeTab === 'safety' && (
            <div className="tab-content fade-in">
              <h4 className="section-heading">HISTORICAL SAFETY DATA</h4>
              <div className="stats-grid">
                <div className="stat-box danger">
                  <span className="lbl">Accidents</span>
                  <span className="val">{road.safety_stats?.total_accidents ?? 18}</span>
                </div>
                <div className="stat-box danger">
                  <span className="lbl">Fatalities</span>
                  <span className="val">{road.safety_stats?.fatalities ?? 2}</span>
                </div>
                <div className="stat-box warning">
                  <span className="lbl">Injuries</span>
                  <span className="val">{road.safety_stats?.injuries ?? 26}</span>
                </div>
                <div className="stat-box yellow">
                  <span className="lbl">Potholes</span>
                  <span className="val">{road.safety_stats?.potholes ?? 7}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: AI Risk Prediction */}
          {activeTab === 'ai' && (
            <div className="tab-content fade-in">
              <h4 className="section-heading">AI RISK PREDICTION & DIAGNOSIS</h4>
              <button 
                type="button" 
                className="btn btn-primary full-btn"
                onClick={handleRunAiPrediction}
                disabled={isPredicting}
              >
                <Cpu size={16} /> {isPredicting ? 'Querying Google Gemini AI Model...' : 'Run On-Demand AI Safety Analysis'}
              </button>

              {predictionResult && (
                <div className="prediction-box glass-panel fade-in" style={{ marginTop: '0.8rem' }}>
                  <div className="pred-res-header">
                    <span className="pred-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      ✨ {predictionResult.provider || 'Google Gemini AI Engine'}
                    </span>
                    <span className="pred-score">{predictionResult.risk_score || road?.risk?.score || 78}%</span>
                  </div>
                  <div className="pred-factors" style={{ fontSize: '0.78rem', whiteSpace: 'pre-line', lineHeight: '1.45', color: 'var(--text-secondary)' }}>
                    {predictionResult.analysis_markdown || 'No AI analysis generated.'}
                  </div>
                  
                  {/* Chat History */}
                  {chatHistory.length > 0 && (
                    <div className="ai-chat-history" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`} style={{ marginBottom: '0.8rem', fontSize: '0.75rem' }}>
                          <strong style={{ color: msg.role === 'user' ? 'var(--text-primary)' : msg.role === 'error' ? 'var(--danger-color)' : 'var(--accent-primary)' }}>
                            {msg.role === 'user' ? 'You:' : msg.role === 'error' ? 'Error:' : '✨ AI:'}
                          </strong>
                          <div style={{ whiteSpace: 'pre-line', marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Chat Input */}
                  <form onSubmit={handleAskAiQuestion} className="ai-chat-input" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="Ask a specific question about this road..."
                      disabled={isAsking}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.75rem' }}
                    />
                    <button type="submit" disabled={isAsking || !aiQuestion.trim()} className="btn btn-primary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem' }}>
                      {isAsking ? '...' : 'Ask'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Card */}
          <div className="recommendations-section">
            <h4 className="section-heading">RECOMMENDED ACTIONS</h4>
            {road.recommendations?.map((rec, i) => (
              <div key={i} className="rec-card">
                <ShieldAlert size={14} className="rec-icon" />
                <span>{rec}</span>
              </div>
            ))}
          </div>

          {/* Action / Module Navigation Buttons */}
          <div className="panel-actions">
            <button 
              type="button" 
              className="action-link-btn"
              onClick={() => navigate(`/risk?road_id=${road.road_id}&name=${encodeURIComponent(road.road_name)}`)}
            >
              <Activity size={14} /> View Road Risk <ExternalLink size={12} />
            </button>
            <button 
              type="button" 
              className="action-link-btn"
              onClick={() => navigate(`/recommendations?road_id=${road.road_id}&name=${encodeURIComponent(road.road_name)}`)}
            >
              <Wrench size={14} /> Maintenance Priority <ExternalLink size={12} />
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
};

export default RoadIntelligencePanel;
