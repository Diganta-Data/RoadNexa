import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeading } from './ui';
import RoadNetwork from './RoadNetwork';

const LAYERS = [
  { id: 'risk', label: 'Risk', color: '#EF4444' },
  { id: 'traffic', label: 'Traffic', color: '#F59E0B' },
  { id: 'accidents', label: 'Accidents', color: '#EF4444' },
  { id: 'potholes', label: 'Potholes', color: '#F59E0B' },
];

export default function IntelligenceMap() {
  const [active, setActive] = useState({ risk: true, traffic: true, accidents: true, potholes: false });

  const markers = useMemo(() => ([
    { x: 18, y: 28, layer: 'accidents' },
    { x: 36, y: 42, layer: 'risk' },
    { x: 52, y: 33, layer: 'traffic' },
    { x: 61, y: 58, layer: 'accidents' },
    { x: 74, y: 40, layer: 'potholes' },
    { x: 28, y: 62, layer: 'potholes' },
    { x: 44, y: 22, layer: 'risk' },
    { x: 80, y: 63, layer: 'traffic' },
  ]), []);

  return (
    <section id="intelligence" className="iris-section iris-section-cyan">
      <div className="iris-wrap">
        <SectionHeading
          kicker="03 / Live Intelligence"
          title="One Map."
          highlight="Every Road Signal."
          demo="Demo Data"
        />
        <div className="iris-intel">
          <div className="iris-layers" role="group" aria-label="Map layers">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                className={`iris-layer ${active[layer.id] ? 'is-on' : ''}`}
                data-cursor="button"
                onClick={() => setActive((current) => ({ ...current, [layer.id]: !current[layer.id] }))}
              >
                <span className="inline-block w-2 h-2 mr-2 rounded-full" style={{ background: layer.color }} />
                {layer.label}
              </button>
            ))}
          </div>
          <div className="relative min-h-[420px] p-4" data-cursor="crosshair">
            <RoadNetwork className="w-full h-full opacity-80" />
            {markers.map((marker) => (
              active[marker.layer] && (
                <motion.span
                  key={`${marker.x}-${marker.y}-${marker.layer}`}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    background: LAYERS.find((item) => item.id === marker.layer).color,
                    boxShadow: `0 0 16px ${LAYERS.find((item) => item.id === marker.layer).color}`,
                  }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
