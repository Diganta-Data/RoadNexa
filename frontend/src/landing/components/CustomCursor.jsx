import { useEffect, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '../hooks';
import { useGSAP } from '../animations/register';
import { createScrollProgress } from '../animations/scrollAnimations';

export function ScrollProgress() {
  const barRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    if (barRef.current) createScrollProgress(barRef.current, reduced);
  }, { dependencies: [reduced] });

  return (
    <div className="iris-progress" aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!fine || reduced) return undefined;
    const root = document.querySelector('.iris-lp');
    root?.classList.add('has-cursor');

    const dot = { x: 0, y: 0 };
    const ring = { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    let frame = 0;

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target.closest('[data-cursor]');
      const mode = target?.getAttribute('data-cursor') || '';
      ringRef.current?.classList.toggle('is-hover', Boolean(mode));
      ringRef.current?.classList.toggle('is-button', mode === 'button');
      ringRef.current?.classList.toggle('is-cross', mode === 'crosshair');
    };

    const tick = () => {
      dot.x += (x - dot.x) * 0.35;
      dot.y += (y - dot.y) * 0.35;
      ring.x += (x - ring.x) * 0.18;
      ring.y += (y - ring.y) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(tick);
    return () => {
      root?.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <>
      <div ref={dotRef} className="iris-cursor-dot" />
      <div ref={ringRef} className="iris-cursor-ring" />
    </>
  );
}

export function ScrollIndicator() {
  return (
    <div className="iris-scroll" data-hero="scroll">
      SCROLL TO EXPLORE
      <i />
    </div>
  );
}

export function AnimatedGrid() {
  return <div className="iris-bg-grid" />;
}
