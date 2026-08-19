import { useRef } from 'react';
import { SectionHeading } from './ui';
import { useDemoStats, usePrefersReducedMotion } from '../hooks';
import { useGSAP } from '../animations/register';
import { animateCounter } from '../animations/textAnimations';

export default function AccidentVisualization() {
  const stats = useDemoStats();
  const reduced = usePrefersReducedMotion();
  const a = useRef(null);
  const b = useRef(null);
  const c = useRef(null);

  useGSAP(() => {
    animateCounter(a.current, stats.accidents, reduced);
    animateCounter(b.current, stats.highRiskZones, reduced);
    animateCounter(c.current, stats.criticalRoads, reduced);
  }, { dependencies: [reduced, stats.accidents, stats.highRiskZones, stats.criticalRoads] });

  return (
    <section className="iris-section iris-section-red">
      <div className="iris-wrap">
        <SectionHeading
          kicker="05 / Accident Intelligence"
          title="See clusters before"
          highlight="they become corridors."
          copy="Hotspots are derived from density, severity and recurrence — not a static pin dump."
          demo={stats.source === 'live' ? 'Live dataset with synthetic demo fallback' : 'Synthetic Demo'}
        />
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <svg viewBox="0 0 640 360" className="w-full border border-white/10 bg-[#070B1A]" aria-hidden="true">
            <rect width="640" height="360" fill="#070B1A" />
            <path d="M40 80 C 140 40, 220 140, 320 90 S 500 40, 600 100" stroke="#3B82F6" fill="none" opacity="0.5" />
            <path d="M50 180 C 180 210, 250 120, 380 170 S 520 240, 610 190" stroke="#22D3EE" fill="none" opacity="0.7" />
            <path d="M70 280 C 170 240, 280 300, 410 250 S 530 220, 600 280" stroke="#6366F1" fill="none" opacity="0.45" />
            {[[160, 96, 34], [318, 108, 48], [470, 86, 28], [250, 188, 40], [402, 176, 36], [180, 262, 30]].map(([x, y, r]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r={r} fill="rgba(239,68,68,0.12)" />
                <circle cx={x} cy={y} r="4" fill="#EF4444" />
              </g>
            ))}
          </svg>
          <div className="grid gap-6">
            <Stat label="Accident Hotspots" valueRef={a} />
            <Stat label="High-Risk Zones" valueRef={b} />
            <Stat label="Critical Roads" valueRef={c} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, valueRef }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="iris-mono text-[11px] text-[#94A3B8]">{label}</p>
      <p className="text-5xl font-extrabold tracking-tight mt-1" ref={valueRef}>0</p>
    </div>
  );
}
