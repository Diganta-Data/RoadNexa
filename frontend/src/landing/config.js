export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  cities: '/cities',
  map: '/map',
  upload: '/upload-data',
  uploadAlias: '/data/upload',
  data: '/data-management',
  accidents: '/accident-analytics',
  dangerousRoads: '/dangerous-roads',
  hotspots: '/hotspots',
  risk: '/risk',
  ml: '/ml-predictions',
  mlAlias: '/ml',
  recommendations: '/recommendations',
};

export const NAV_ITEMS = [
  { label: 'Platform', to: ROUTES.dashboard },
  { label: 'Intelligence', to: ROUTES.risk },
  { label: 'Cities', to: ROUTES.cities },
  { label: 'Map', to: ROUTES.map },
  { label: 'Analytics', to: ROUTES.accidents },
  { label: 'ML', to: ROUTES.ml },
];

export const SEARCH_TARGETS = [
  { label: 'Dashboard', to: ROUTES.dashboard, hint: 'Command center' },
  { label: 'Cities', to: ROUTES.cities, hint: 'Multi-city coverage' },
  { label: 'Interactive Map', to: ROUTES.map, hint: 'Geospatial layers' },
  { label: 'Upload Dataset', to: ROUTES.upload, hint: 'CSV, Excel, GeoJSON' },
  { label: 'Data Management', to: ROUTES.data, hint: 'Datasets and quality' },
  { label: 'Accident Analytics', to: ROUTES.accidents, hint: 'Severity and trends' },
  { label: 'Risk Intelligence', to: ROUTES.risk, hint: 'Derived road risk' },
  { label: 'ML Predictions', to: ROUTES.ml, hint: 'Predictive models' },
  { label: 'Hotspots', to: ROUTES.hotspots, hint: 'Cluster analysis' },
  { label: 'Recommendations', to: ROUTES.recommendations, hint: 'Decision support' },
];

export const EXTERNAL_LINKS = {
  github: null,
  linkedin: null,
  portfolio: null,
  docs: null,
  api: null,
};

export const DEMO_STATS = {
  accidents: 37,
  highRiskZones: 12,
  criticalRoads: 8,
  riskScore: 87,
  trafficLoad: 74,
  qualityScore: 94,
  rows: 24831,
  missing: 2.4,
  invalidCoords: 0.7,
  duplicates: 1.2,
  mlConfidence: 92,
};

export const RISK_BREAKDOWN = [
  { key: 'accident', label: 'Accident Risk', value: 30, color: '#EF4444' },
  { key: 'traffic', label: 'Traffic Risk', value: 20, color: '#F59E0B' },
  { key: 'speed', label: 'Speed Risk', value: 15, color: '#F97316' },
  { key: 'condition', label: 'Road Condition', value: 15, color: '#A855F7' },
  { key: 'pedestrian', label: 'Pedestrian Risk', value: 10, color: '#22D3EE' },
  { key: 'infra', label: 'Infrastructure', value: 10, color: '#3B82F6' },
];

export const CITIES = [
  { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.877, risk: 78, accidents: 142, traffic: 86, roads: 1240 },
  { name: 'Delhi', slug: 'delhi', state: 'Delhi', lat: 28.613, lng: 77.209, risk: 81, accidents: 168, traffic: 91, roads: 980 },
  { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal', lat: 22.572, lng: 88.363, risk: 69, accidents: 96, traffic: 77, roads: 760 },
  { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka', lat: 12.971, lng: 77.594, risk: 72, accidents: 118, traffic: 88, roads: 890 },
  { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', lat: 17.385, lng: 78.486, risk: 64, accidents: 84, traffic: 73, roads: 710 },
  { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', lat: 13.082, lng: 80.270, risk: 67, accidents: 91, traffic: 79, roads: 680 },
  { name: 'Pune', slug: 'pune', state: 'Maharashtra', lat: 18.520, lng: 73.856, risk: 61, accidents: 73, traffic: 71, roads: 540 },
];

export const INDIA_MAINLAND = [
  [74.7, 36.9], [76.5, 35.8], [77.8, 35.2], [78.5, 34.0], [78.9, 32.5],
  [79.8, 31.5], [80.4, 30.4], [81.5, 30.2], [84.0, 29.0], [86.5, 27.8],
  [88.1, 27.4], [88.3, 26.5], [88.0, 25.2], [88.4, 24.5], [89.0, 22.4],
  [88.3, 21.6], [87.0, 21.3], [85.8, 20.3], [84.8, 19.3], [83.0, 17.7],
  [82.2, 16.5], [80.8, 15.8], [80.2, 13.5], [80.3, 12.0], [79.9, 10.3],
  [78.2, 8.9], [77.55, 8.08], [76.4, 9.5], [75.8, 11.2], [75.0, 12.8],
  [74.5, 14.2], [74.1, 15.8], [73.4, 16.9], [72.85, 18.95], [72.75, 20.2],
  [72.2, 21.0], [70.0, 20.6], [69.2, 22.2], [68.8, 23.2], [68.5, 23.7],
  [69.2, 24.5], [70.8, 25.0], [71.8, 24.4], [72.6, 23.8], [73.0, 26.0],
  [73.8, 28.5], [74.4, 30.8], [74.6, 32.5], [74.3, 34.2], [74.7, 36.9],
];

export const INDIA_NORTHEAST = [
  [88.1, 27.4], [88.9, 27.7], [91.5, 27.9], [95.5, 29.0], [97.2, 28.2],
  [96.4, 27.2], [95.3, 26.6], [94.6, 25.5], [94.2, 24.6], [93.2, 24.2],
  [92.6, 22.8], [92.8, 22.0], [91.7, 22.4], [90.5, 23.5], [89.8, 25.2],
  [88.9, 26.2], [88.1, 26.5],
];

export const SRI_LANKA = [
  [79.8, 9.8], [81.7, 8.6], [81.1, 6.1], [80.0, 6.0], [79.7, 8.2],
];

export const HERO_STAGES = [
  { id: 'india', label: 'INDIA', copy: 'National road intelligence layer across metropolitan corridors.' },
  { id: 'city', label: 'CITY', copy: 'Drill from country scale into a living urban network.' },
  { id: 'roads', label: 'ROAD NETWORK', copy: 'Every corridor becomes a measurable safety surface.' },
  { id: 'accidents', label: 'ACCIDENT HOTSPOTS', copy: 'Clusters emerge where severity and frequency collide.' },
  { id: 'risk', label: 'ROAD RISK', copy: 'Derived risk shows which roads need attention first.' },
];

export const PIPELINE = [
  { id: 'data', title: 'DATA', items: ['Accidents', 'Traffic', 'Roads', 'Potholes', 'Weather', 'Infrastructure'] },
  { id: 'process', title: 'PROCESS', items: ['Cleaning', 'Validation', 'Geospatial processing'] },
  { id: 'analyze', title: 'ANALYZE', items: ['Hotspots', 'Congestion', 'Risk'] },
  { id: 'predict', title: 'PREDICT', items: ['Machine Learning'] },
  { id: 'act', title: 'ACT', items: ['Safety recommendations'] },
];

export const WORKFLOW = [
  { step: '01', title: 'COLLECT', copy: 'Ingest accident, traffic, road and infrastructure signals from city datasets.' },
  { step: '02', title: 'CLEAN', copy: 'Profile quality, repair coordinates, and remove duplicates before they distort risk.' },
  { step: '03', title: 'MAP', copy: 'Snap records to the road graph with PostGIS-backed geospatial joins.' },
  { step: '04', title: 'ANALYZE', copy: 'Surface hotspots, congestion, and corridor-level safety patterns.' },
  { step: '05', title: 'PREDICT', copy: 'Train models on historical signals to estimate emerging road risk.' },
  { step: '06', title: 'ACT', copy: 'Turn ranked risk into maintenance and enforcement recommendations.' },
];

export const CAPABILITIES = [
  {
    id: 'accidents',
    title: 'Accident Intelligence',
    copy: 'Understand where, when and why accidents happen.',
    to: ROUTES.accidents,
  },
  {
    id: 'traffic',
    title: 'Traffic Intelligence',
    copy: 'Identify congestion and overloaded roads.',
    to: ROUTES.map,
  },
  {
    id: 'condition',
    title: 'Road Condition',
    copy: 'Prioritize potholes and infrastructure maintenance.',
    to: ROUTES.map,
  },
  {
    id: 'geo',
    title: 'Geospatial Analytics',
    copy: 'Analyze roads, intersections and nearby infrastructure.',
    to: ROUTES.map,
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    copy: 'Predict road risk using historical signals.',
    to: ROUTES.ml,
  },
  {
    id: 'decision',
    title: 'Decision Support',
    copy: 'Turn analytics into actionable recommendations.',
    to: ROUTES.recommendations,
  },
];

export function projectIndia(lng, lat, width = 640, height = 720) {
  const x = ((lng - 67.5) / (98 - 67.5)) * width;
  const y = ((37.5 - lat) / (37.5 - 6.5)) * height;
  return [x, y];
}

export function polygonPath(points, width, height) {
  return points
    .map((point, index) => {
      const [x, y] = projectIndia(point[0], point[1], width, height);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}
