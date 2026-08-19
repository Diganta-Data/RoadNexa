import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { EXTERNAL_LINKS, ROUTES } from '../config';
import { useSystemHealth, usePrefersReducedMotion } from '../hooks';
import { useGSAP } from '../animations/register';
import { animateFooter } from '../animations/scrollAnimations';
import { IrisLogo } from './ui';

const PRODUCT = [
  { label: 'Dashboard', to: ROUTES.dashboard },
  { label: 'Cities', to: ROUTES.cities },
  { label: 'Map', to: ROUTES.map },
  { label: 'Road Intelligence', to: ROUTES.risk },
  { label: 'Accident Intelligence', to: ROUTES.accidents },
  { label: 'Traffic Intelligence', to: ROUTES.map },
  { label: 'Pothole Analytics', to: ROUTES.map },
  { label: 'Risk Analysis', to: ROUTES.risk },
  { label: 'Machine Learning', to: ROUTES.ml },
];

const DATA = [
  { label: 'Upload Dataset', to: ROUTES.upload },
  { label: 'Datasets', to: ROUTES.data },
  { label: 'Data Quality', to: ROUTES.data },
  { label: 'Data Sources', to: ROUTES.data },
  { label: 'Methodology', href: '#methodology' },
  { label: 'Demo Dataset', to: ROUTES.upload },
];

const RESOURCES = [
  { label: 'Documentation', href: EXTERNAL_LINKS.docs },
  { label: 'API', href: EXTERNAL_LINKS.api },
  { label: 'Architecture', href: '#platform' },
  { label: 'ML Methodology', to: ROUTES.ml },
  { label: 'Geospatial Methodology', to: ROUTES.map },
  { label: 'FAQ', href: '#disclaimer' },
  { label: 'About RoadNexa', to: '/' },
];

const COMPANY = [
  { label: 'About', to: '/' },
  { label: 'Contact', href: EXTERNAL_LINKS.portfolio },
  { label: 'GitHub', href: EXTERNAL_LINKS.github },
  { label: 'LinkedIn', href: EXTERNAL_LINKS.linkedin },
  { label: 'Portfolio', href: EXTERNAL_LINKS.portfolio },
  { label: 'Contribute', href: EXTERNAL_LINKS.github },
];

export default function LandingFooter() {
  const ref = useRef(null);
  const health = useSystemHealth();
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    animateFooter(ref.current, reduced);
  }, { dependencies: [reduced] });

  return (
    <footer ref={ref} className="iris-footer" id="disclaimer">
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden" aria-hidden="true">
        <span className="block h-px w-1/3 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent animate-[irisDrift_6s_linear_infinite]" />
      </div>
      <div className="iris-wrap">
        <div className="iris-footer-grid">
          <div data-footer>
            <Link to="/" className="iris-brand mb-4">
              <IrisLogo />
              <span>
                <strong>RoadNexa</strong>
                <small>Road Intelligence & Safety Platform</small>
              </span>
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed mt-4">
              Geospatial analytics, road safety intelligence and machine learning for smarter cities.
            </p>
            <p className="mt-4 text-sm text-[#22C55E]">Platform Operational</p>
            <div className="iris-status">
              <p>API <b className={health.api !== 'operational' ? 'is-bad' : ''}>{health.api}</b></p>
              <p>Database <b className={health.database !== 'connected' ? 'is-bad' : ''}>{health.database}</b></p>
              <p>PostGIS <b>{health.postgis}</b></p>
              <p>Demo Dataset <b>{health.demo}</b></p>
            </div>
          </div>
          <FooterCol title="Product" items={PRODUCT} />
          <FooterCol title="Data" items={DATA} />
          <FooterCol title="Resources" items={RESOURCES} />
          <FooterCol title="Company" items={COMPANY} />
        </div>

        <div className="iris-disclaimer" id="methodology" data-footer>
          <strong className="text-[#F8FAFC]">Data disclaimer. </strong>
          RoadNexa demo uses synthetic data for demonstration. Analytics and risk scores are derived metrics and should not be interpreted as official government statistics or safety directives.
        </div>

        <div className="iris-bottom" data-footer>
          <p>© {new Date().getFullYear()} RoadNexa - Road Intelligence & Safety Platform</p>
          <p>Built with React - Python - PostgreSQL/PostGIS - Machine Learning</p>
          <p>
            <a href="#disclaimer">Privacy</a>
            {' - '}
            <a href="#disclaimer">Terms</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div data-footer>
      <h3>{title}</h3>
      {items.map((item) => {
        if (item.href) return <a key={item.label} href={item.href}>{item.label}</a>;
        if (item.to) return <Link key={item.label} to={item.to}>{item.label}</Link>;
        return <span key={item.label} className="is-placeholder">{item.label}</span>;
      })}
    </div>
  );
}
