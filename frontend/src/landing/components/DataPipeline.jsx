import { useRef } from 'react';
import { PIPELINE } from '../config';
import { SectionHeading } from './ui';
import { useGSAP, gsap } from '../animations/register';
import { usePrefersReducedMotion } from '../hooks';

export default function DataPipeline() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    if (!ref.current || reduced) return;
    gsap.from(ref.current.querySelectorAll('.iris-pipe'), {
      opacity: 0,
      y: 24,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 78%' },
    });
  }, { dependencies: [reduced] });

  return (
    <section id="platform" className="iris-section iris-section-blue">
      <div className="iris-wrap">
        <SectionHeading
          kicker="02 / Pipeline"
          title="From Raw Data"
          highlight="to Road Intelligence."
          copy="RoadNexa connects fragmented urban data into a single analytical intelligence layer."
        />
        <div ref={ref} className="iris-pipeline">
          {PIPELINE.map((stage) => (
            <article key={stage.id} className="iris-pipe">
              <h3>{stage.title}</h3>
              <ul>
                {stage.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
