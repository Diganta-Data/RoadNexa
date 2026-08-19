import { useRef } from 'react';
import { RISK_BREAKDOWN } from '../config';
import { DemoBadge, SectionHeading } from './ui';
import { useGSAP, gsap } from '../animations/register';
import { animateCounter } from '../animations/textAnimations';
import { useDemoStats, usePrefersReducedMotion } from '../hooks';

export default function RiskVisualization() {
  const scoreRef = useRef(null);
  const barsRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const stats = useDemoStats();
  const score = stats.riskScore || 87;

  useGSAP(() => {
    if (scoreRef.current) animateCounter(scoreRef.current, score, reduced);
    if (!barsRef.current || reduced) {
      barsRef.current?.querySelectorAll('[data-bar]').forEach((bar) => {
        bar.style.width = bar.dataset.bar;
      });
      return;
    }
    gsap.to(barsRef.current.querySelectorAll('[data-bar]'), {
      width: (index, target) => target.dataset.bar,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: barsRef.current, start: 'top 80%' },
    });
  }, { dependencies: [reduced, score] });

  const offset = 100 - (score / 100) * 100;

  return (
    <section className="iris-section iris-section-violet">
      <div className="iris-wrap">
        <SectionHeading
          kicker="04 / Road Risk"
          title="Know Which Roads"
          highlight="Need Attention."
          demo="RoadNexa derived risk - Synthetic Demo"
        />
        <div className="iris-risk">
          <div>
            <div className="iris-gauge">
              <svg viewBox="0 0 200 200" className="w-full">
                <circle cx="100" cy="100" r="78" stroke="rgba(148,163,184,0.12)" strokeWidth="10" fill="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="78"
                  stroke="url(#riskGrad)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="490"
                  strokeDashoffset={4.9 * offset}
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="45%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="iris-gauge-label">
                <div>
                  <p className="iris-mono text-[10px] text-[#94A3B8]">ROADNEXA DERIVED RISK</p>
                  <p className="text-5xl font-extrabold tracking-tight mt-1">
                    <span ref={scoreRef}>0</span>
                    <span className="text-lg text-[#94A3B8]"> / 100</span>
                  </p>
                  <p className="text-[#EF4444] font-semibold mt-1">CRITICAL</p>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-sm text-[#94A3B8]">
              Road color shifts from green to red as composite risk rises.
            </p>
            <svg viewBox="0 0 420 36" className="w-full mt-6" aria-hidden="true">
              <defs>
                <linearGradient id="roadRisk" x1="0" x2="1">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="75%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
              <path d="M 8 18 C 80 8, 140 30, 210 16 S 330 8, 412 20" stroke="url(#roadRisk)" strokeWidth="8" fill="none" />
            </svg>
          </div>
          <div>
            <DemoBadge>Risk composition</DemoBadge>
            <div ref={barsRef} className="iris-bars">
              {RISK_BREAKDOWN.map((item) => (
                <div className="iris-bar" key={item.key}>
                  <span>
                    <em className="not-italic text-[#F8FAFC]">{item.label}</em>
                    {item.value}%
                  </span>
                  <i>
                    <b data-bar={`${item.value}%`} style={{ background: item.color }} />
                  </i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
