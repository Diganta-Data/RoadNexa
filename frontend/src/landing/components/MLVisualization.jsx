import { SectionHeading } from './ui';
import { ROUTES } from '../config';
import { IrisButton } from './ui';

const MODELS = ['Random Forest', 'Gradient Boosting', 'Logistic Regression'];
const FEATURES = [
  { label: 'Accident density', value: 86 },
  { label: 'Traffic volume', value: 72 },
  { label: 'Speed variance', value: 64 },
  { label: 'Road condition', value: 58 },
];

export default function MLVisualization() {
  return (
    <section id="ml" className="iris-section iris-section-violet">
      <div className="iris-wrap grid lg:grid-cols-2 gap-12 items-center">
        <SectionHeading
          kicker="07 / Machine Learning"
          title="From Descriptive"
          highlight="to Predictive."
          copy="Train models using your own road datasets."
          demo="Demo Model"
        />
        <div className="border border-white/10 p-6">
          <ol className="iris-mono text-[11px] tracking-[0.18em] text-[#22D3EE] grid grid-cols-4 gap-2 mb-8">
            <li>DATASET</li>
            <li>FEATURES</li>
            <li>MODEL</li>
            <li>PREDICTION</li>
          </ol>
          <svg viewBox="0 0 480 180" className="w-full mb-6" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <circle
                key={index}
                cx={40 + (index % 9) * 48}
                cy={40 + Math.floor(index / 9) * 70 + (index % 3) * 8}
                r="4"
                fill={index > 10 ? '#EF4444' : '#22D3EE'}
                opacity="0.85"
              />
            ))}
            <path d="M 20 130 C 140 20, 300 20, 460 90" stroke="#7C3AED" fill="none" />
          </svg>
          <div className="flex flex-wrap gap-2 mb-6">
            {MODELS.map((model) => (
              <span key={model} className="px-3 py-1 border border-white/10 text-xs">{model}</span>
            ))}
          </div>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="iris-mono text-[10px] text-[#94A3B8]">RISK PREDICTION</p>
              <p className="text-4xl font-extrabold">92%</p>
              <p className="text-sm text-[#94A3B8]">Confidence · Demo Model</p>
            </div>
            <div className="flex-1 space-y-2">
              {FEATURES.map((feature) => (
                <div key={feature.label}>
                  <p className="text-[11px] text-[#94A3B8] mb-1">{feature.label}</p>
                  <div className="h-1 bg-white/10">
                    <div className="h-1 bg-[#6366F1]" style={{ width: `${feature.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <IrisButton to={ROUTES.ml}>Open ML workspace</IrisButton>
          </div>
        </div>
      </div>
    </section>
  );
}
