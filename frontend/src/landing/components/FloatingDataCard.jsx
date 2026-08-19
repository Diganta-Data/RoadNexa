import { useEffect, useRef } from 'react';
import { floatCard } from '../animations/cardAnimations';
import { useGSAP } from '../animations/register';
import { usePrefersReducedMotion } from '../hooks';

export default function FloatingDataCard({
  label,
  value,
  meta,
  tone = 'cyan',
  style,
  index = 0,
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    if (ref.current) floatCard(ref.current, index, reduced);
  }, { dependencies: [index, reduced] });

  return (
    <article
      ref={ref}
      className={`iris-float tone-${tone}`}
      style={style}
      data-hero="float"
    >
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{meta}</em>
    </article>
  );
}

export function HangingCables() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || reduced) return undefined;
    const paths = ref.current.querySelectorAll('path');
    paths.forEach((path, index) => {
      path.style.strokeDasharray = '6 10';
      path.style.animation = `irisLine ${3 + index}s linear infinite`;
    });
    return undefined;
  }, [reduced]);

  return (
    <svg ref={ref} className="iris-cable" viewBox="0 0 640 560" fill="none" aria-hidden="true">
      <path d="M320 80 C 280 160, 210 190, 118 150" stroke="rgba(34,211,238,0.35)" />
      <path d="M320 90 C 360 170, 430 150, 530 120" stroke="rgba(99,102,241,0.35)" />
      <path d="M320 70 C 300 40, 240 36, 170 48" stroke="rgba(245,158,11,0.3)" />
      <path d="M320 100 C 390 240, 470 280, 545 300" stroke="rgba(239,68,68,0.28)" />
      <path d="M320 110 C 250 260, 180 300, 90 340" stroke="rgba(34,197,94,0.28)" />
    </svg>
  );
}
