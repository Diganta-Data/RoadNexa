import { Link } from 'react-router-dom';
import { CITIES } from '../config';
import { SectionHeading } from './ui';

export default function CityShowcase() {
  return (
    <section className="iris-section iris-section-blue">
      <div className="iris-wrap">
        <SectionHeading
          kicker="06 / Multi-city"
          title="One Platform."
          highlight="Every City."
          demo="Synthetic Demo Data"
        />
        <div className="iris-cities">
          {CITIES.map((city) => (
            <CityCard key={city.slug} city={city} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CityCard({ city }) {
  return (
    <Link
      to={`/cities/${city.slug}`}
      className="iris-city block"
      data-cursor="button"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        event.currentTarget.style.setProperty('--rx', `${(-y * 4).toFixed(2)}deg`);
        event.currentTarget.style.setProperty('--ry', `${(x * 4).toFixed(2)}deg`);
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.setProperty('--rx', '0deg');
        event.currentTarget.style.setProperty('--ry', '0deg');
      }}
    >
      <svg viewBox="0 0 160 72" className="w-full mb-4 opacity-80" aria-hidden="true">
        <rect width="160" height="72" fill="#0A1024" />
        <path d="M8 40 L40 22 L70 38 L110 18 L152 34" stroke="#22D3EE" fill="none" />
        <circle cx={40 + city.risk / 8} cy="28" r="3" fill="#EF4444" />
      </svg>
      <h3 className="text-xl font-bold">{city.name}</h3>
      <p className="text-xs text-[#94A3B8] mt-1">{city.state}</p>
      <dl className="grid grid-cols-3 gap-2 mt-4 text-[11px] uppercase tracking-wider text-[#94A3B8]">
        <div><dt>Risk</dt><dd className="text-[#F8FAFC] text-base font-semibold">{city.risk}</dd></div>
        <div><dt>Accidents</dt><dd className="text-[#F8FAFC] text-base font-semibold">{city.accidents}</dd></div>
        <div><dt>Traffic</dt><dd className="text-[#F8FAFC] text-base font-semibold">{city.traffic}</dd></div>
      </dl>
    </Link>
  );
}
