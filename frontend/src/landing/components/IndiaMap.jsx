import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CITIES, INDIA_MAINLAND, INDIA_NORTHEAST, SRI_LANKA, polygonPath } from '../config';
import { SectionHeading } from './ui';

const WIDTH = 640;
const HEIGHT = 720;

function project(lng, lat) {
  return [
    ((lng - 67.5) / (98 - 67.5)) * WIDTH,
    ((37.5 - lat) / (37.5 - 6.5)) * HEIGHT,
  ];
}

export default function IndiaMap() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const mainland = polygonPath(INDIA_MAINLAND, WIDTH, HEIGHT);
  const northeast = polygonPath(INDIA_NORTHEAST, WIDTH, HEIGHT);
  const lanka = polygonPath(SRI_LANKA, WIDTH, HEIGHT);

  return (
    <section className="iris-section iris-section-cyan">
      <div className="iris-wrap">
        <SectionHeading
          kicker="06 / Geospatial layer"
          title="A living map of"
          highlight="Indian cities."
          copy="Hover a node for risk context. Click to open that city in the platform."
        />
        <div className="iris-india iris-hud p-4 md:p-8 border border-white/10">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-h-[72vh]" role="img" aria-label="Interactive map of Indian cities">
            <path d={mainland} fill="rgba(15,23,42,0.9)" stroke="#22D3EE" strokeWidth="1.2" />
            <path d={northeast} fill="rgba(15,23,42,0.9)" stroke="#22D3EE" strokeWidth="1.2" />
            <path d={lanka} fill="rgba(15,23,42,0.45)" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
            {CITIES.map((city, index) => {
              const [x, y] = project(city.lng, city.lat);
              const next = CITIES[(index + 1) % CITIES.length];
              const [nx, ny] = project(next.lng, next.lat);
              return (
                <g key={city.slug}>
                  <line x1={x} y1={y} x2={nx} y2={ny} stroke="rgba(99,102,241,0.28)" />
                </g>
              );
            })}
            {CITIES.map((city) => {
              const [x, y] = project(city.lng, city.lat);
              const hovered = active === city.slug;
              return (
                <g
                  key={city.slug}
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(city.slug)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => navigate(`/cities/${city.slug}`)}
                  onKeyDown={(event) => event.key === 'Enter' && navigate(`/cities/${city.slug}`)}
                  tabIndex={0}
                  role="link"
                  aria-label={`${city.name}, risk ${city.risk}`}
                >
                  <circle cx={x} cy={y} r={hovered ? 16 : 10} fill="rgba(34,211,238,0.14)" />
                  <circle cx={x} cy={y} r="4" fill={city.risk > 75 ? '#EF4444' : '#22D3EE'} />
                  <text x={x + 10} y={y - 8} fill="#F8FAFC" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                    {city.name}
                  </text>
                  {hovered && (
                    <g>
                      <rect x={x + 8} y={y + 6} width="118" height="42" fill="#070B1A" stroke="rgba(34,211,238,0.35)" />
                      <text x={x + 16} y={y + 22} fill="#94A3B8" fontSize="9">RISK {city.risk} · ACC {city.accidents}</text>
                      <text x={x + 16} y={y + 36} fill="#22D3EE" fontSize="9">SYNTHETIC DEMO</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
