import { useRef } from 'react';
import { WORKFLOW } from '../config';
import { SectionHeading } from './ui';
import { useGSAP } from '../animations/register';
import { pinHorizontalTimeline } from '../animations/scrollAnimations';
import { useIsDesktop, usePrefersReducedMotion } from '../hooks';

export default function WorkflowTimeline() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const desktop = useIsDesktop();

  useGSAP(() => {
    pinHorizontalTimeline(sectionRef.current, trackRef.current, reduced, desktop);
  }, { dependencies: [reduced, desktop] });

  return (
    <section ref={sectionRef} className="iris-section iris-workflow iris-section-blue">
      <div className="iris-wrap mb-8">
        <SectionHeading kicker="11 / How RoadNexa works" title="Collect to act" highlight="in six moves." />
      </div>
      <div ref={trackRef} className="iris-workflow-track">
        {WORKFLOW.map((item) => (
          <article key={item.step} className="iris-step">
            <b>{item.step}</b>
            <h3 className="text-4xl font-extrabold mt-4 mb-4">{item.title}</h3>
            <p className="text-[#94A3B8] max-w-sm">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
