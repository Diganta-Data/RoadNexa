import { ArrowRight } from 'lucide-react';
import { SectionHeading } from './ui';

const LEFT = [
  'Fragmented data',
  'Manual Excel analysis',
  'Static reports',
  'Limited spatial context',
  'Reactive decisions',
];

const RIGHT = [
  'Unified data',
  'Geospatial intelligence',
  'Interactive analytics',
  'ML predictions',
  'Actionable recommendations',
];

export default function WhyIris() {
  return (
    <section className="iris-section iris-section-green">
      <div className="iris-wrap">
        <SectionHeading kicker="13 / Why RoadNexa" title="Traditional analysis" highlight="becomes intelligence." />
        <div className="iris-compare">
          <div>
            <p className="iris-mono text-[11px] text-[#94A3B8]">TRADITIONAL ANALYSIS</p>
            <ul>
              {LEFT.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="hidden md:grid place-items-center text-[#22D3EE]">
            <ArrowRight size={28} />
          </div>
          <div>
            <p className="iris-mono text-[11px] text-[#22D3EE]">ROADNEXA</p>
            <ul>
              {RIGHT.map((item) => <li key={item} className="text-[#F8FAFC]">{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
