import { gsap } from './register';

export function floatCard(element: HTMLElement, index: number, reduced: boolean) {
  if (!element || reduced) return;
  gsap.to(element, {
    y: index % 2 === 0 ? -10 : -14,
    duration: 2.4 + index * 0.18,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    delay: 1.6 + index * 0.12,
  });
}

export function shineOnHover(element: HTMLElement) {
  if (!element) return;
  const shine = element.querySelector('.iris-shine');
  if (!shine) return;
  const enter = () => gsap.fromTo(shine, { x: '-120%' }, { x: '120%', duration: 0.7, ease: 'power2.out' });
  element.addEventListener('mouseenter', enter);
  return () => element.removeEventListener('mouseenter', enter);
}
