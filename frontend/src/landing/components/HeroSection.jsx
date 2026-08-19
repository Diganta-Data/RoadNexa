import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HERO_STAGES, ROUTES } from '../config';
import { useIsDesktop, usePrefersReducedMotion } from '../hooks';
import { useGSAP } from '../animations/register';
import { createHeroTimeline } from '../animations/heroAnimations';
import { pinHeroStory } from '../animations/scrollAnimations';
import { IrisButton } from './ui';
import FloatingDataCard, { HangingCables } from './FloatingDataCard';
import RoadNetwork from './RoadNetwork';
import { ScrollIndicator } from './CustomCursor';

const Hero3DScene = lazy(() => import('./Hero3DScene'));

const FLOATS = [
  { label: 'ACCIDENT HOTSPOT', value: '82 / HIGH', meta: 'Accidents', tone: 'danger', style: { top: '12%', left: '2%' } },
  { label: 'TRAFFIC LOAD', value: '74%', meta: 'Traffic', tone: 'warning', style: { top: '8%', right: '2%' } },
  { label: 'POTHOLE DENSITY', value: '41', meta: 'Potholes', tone: 'warning', style: { top: '44%', left: '2%' } },
  { label: 'ROAD RISK', value: '87 / CRITICAL', meta: 'Road Risk', tone: 'danger', style: { bottom: '18%', right: '2%' } },
  { label: 'ML PREDICTION', value: '92%', meta: 'Demo Model', tone: 'cyan', style: { bottom: '12%', left: '10%' } },
];

function HeroFallback() {
  return (
    <div className="h-full grid place-items-center p-6">
      <RoadNetwork className="w-full h-auto" />
    </div>
  );
}

export default function HeroSection() {
  const rootRef = useRef(null);
  const progressRef = useRef(0);
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0);

  useGSAP(() => {
    if (!rootRef.current) return;
    createHeroTimeline(rootRef.current, reduced);
    pinHeroStory(rootRef.current, (value) => {
      progressRef.current = value;
      const next = Math.min(HERO_STAGES.length - 1, Math.floor(value * HERO_STAGES.length));
      setStage((current) => (current === next ? current : next));
    }, reduced);
  }, { scope: rootRef, dependencies: [reduced] });

  const words = useMemo(() => ['Understand', "India's Roads.", 'Before They', 'Become Risk.'], []);

  return (
    <section ref={rootRef} className="iris-hero" aria-labelledby="hero-heading">
      <div className="iris-wrap iris-hero-grid">
        <div>
          <p className="iris-kicker" data-hero="eyebrow">
            <i aria-hidden="true" />
            RoadNexa Intelligence Platform
          </p>
          <h1 id="hero-heading" className="iris-display">
            {words.map((word, index) => (
              <span
                key={word}
                data-hero="word"
                className={index >= 2 ? 'iris-gradient-text' : undefined}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="iris-copy mt-6" data-hero="sub">
            RoadNexa transforms road, accident, traffic, infrastructure and geospatial data into actionable safety intelligence.
          </p>
          <div className="iris-hero-actions">
            <span data-hero="cta">
              <IrisButton to={ROUTES.dashboard} size="lg">Explore Intelligence</IrisButton>
            </span>
            <span data-hero="cta">
              <IrisButton to={ROUTES.upload} variant="secondary" icon="upload" size="lg">Upload Your Dataset</IrisButton>
            </span>
          </div>
          <p className="iris-hero-meta" data-hero="meta">No setup required - Explore synthetic demo</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={HERO_STAGES[stage].id}
              className="iris-stage"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
            >
              <b>{HERO_STAGES[stage].label}</b>
              <p>{HERO_STAGES[stage].copy}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="iris-viz" data-hero="viz">
          <div className="iris-viz-frame iris-hud">
            {desktop && !reduced ? (
              <Suspense fallback={<HeroFallback />}>
                <Hero3DScene progressRef={progressRef} />
              </Suspense>
            ) : (
              <HeroFallback />
            )}
            <HangingCables />
            {FLOATS.map((card, index) => (
              <FloatingDataCard key={card.label} index={index} {...card} />
            ))}
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
}
