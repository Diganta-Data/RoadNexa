import { AlertTriangle, Brain, Car, Construction, Map, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAPABILITIES } from '../config';
import { SectionHeading } from './ui';

const ICONS = {
  accidents: AlertTriangle,
  traffic: Car,
  condition: Construction,
  geo: Map,
  ml: Brain,
  decision: Sparkles,
};

export default function CapabilityCard() {
  return (
    <section className="iris-section">
      <div className="iris-wrap">
        <SectionHeading
          kicker="10 / Capabilities"
          title="Six intelligence"
          highlight="surfaces."
        />
        <div className="iris-caps">
          {CAPABILITIES.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <Link key={item.id} to={item.to} className="iris-cap block" data-cursor="button">
                <Icon size={22} className="text-[#22D3EE] mb-5" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{item.copy}</p>
                <CapabilityVisual id={item.id} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CapabilityVisual({ id }) {
  if (id === 'accidents') {
    return <svg viewBox="0 0 180 40" className="mt-6 w-28"><circle cx="20" cy="20" r="5" fill="#EF4444" /><circle cx="54" cy="16" r="8" fill="rgba(239,68,68,0.35)" /><circle cx="96" cy="22" r="4" fill="#EF4444" /></svg>;
  }
  if (id === 'traffic') {
    return <svg viewBox="0 0 180 40" className="mt-6 w-28"><path d="M4 28 L176 12" stroke="#F59E0B" /><circle cx="40" cy="24" r="2" fill="#F59E0B"><animate attributeName="cx" values="20;160;20" dur="3s" repeatCount="indefinite" /></circle></svg>;
  }
  if (id === 'condition') {
    return <svg viewBox="0 0 180 40" className="mt-6 w-28"><path d="M8 22 C 40 10, 70 30, 110 18 S 160 12, 176 20" stroke="#A855F7" fill="none" /></svg>;
  }
  if (id === 'geo') {
    return <svg viewBox="0 0 180 40" className="mt-6 w-28"><rect x="10" y="8" width="160" height="24" stroke="#3B82F6" fill="none" /><path d="M20 28 L70 12 L120 24 L160 14" stroke="#22D3EE" fill="none" /></svg>;
  }
  if (id === 'ml') {
    return <svg viewBox="0 0 180 40" className="mt-6 w-28"><path d="M10 30 C 60 30, 80 8, 170 10" stroke="#7C3AED" fill="none" /></svg>;
  }
  return <svg viewBox="0 0 180 40" className="mt-6 w-28"><path d="M10 20 L50 20 L70 8 L110 32 L140 20 L170 20" stroke="#22C55E" fill="none" /></svg>;
}
