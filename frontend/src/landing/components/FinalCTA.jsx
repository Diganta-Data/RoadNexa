import { ROUTES } from '../config';
import { IrisButton, IrisLogo } from './ui';

export default function FinalCTA() {
  return (
    <section className="iris-cta relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 260 C 180 180, 320 340, 520 240 S 860 120, 1200 220" stroke="#22D3EE" fill="none">
          <animate attributeName="stroke-dasharray" values="0,800;800,0" dur="8s" repeatCount="indefinite" />
        </path>
        <path d="M0 320 C 240 380, 480 220, 760 300 S 1000 360, 1200 280" stroke="#6366F1" fill="none" />
        <circle cx="420" cy="240" r="4" fill="#EF4444">
          <animate attributeName="fill" values="#EF4444;#22C55E;#EF4444" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="740" cy="290" r="4" fill="#F59E0B">
          <animate attributeName="fill" values="#F59E0B;#22C55E;#F59E0B" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="iris-wrap relative">
        <div className="flex justify-center mb-6"><IrisLogo className="w-12 h-12" /></div>
        <h2 className="iris-display">
          Build Safer Roads
          <br />
          <span className="iris-gradient-text">With Better Intelligence.</span>
        </h2>
        <p className="iris-copy mx-auto mt-5">Explore India's road intelligence layer.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <IrisButton to={ROUTES.dashboard} size="lg">Explore Demo</IrisButton>
          <IrisButton to={ROUTES.upload} variant="secondary" icon="upload" size="lg">Upload Dataset</IrisButton>
          <IrisButton to={ROUTES.map} variant="secondary" size="lg">View Map</IrisButton>
        </div>
      </div>
    </section>
  );
}
