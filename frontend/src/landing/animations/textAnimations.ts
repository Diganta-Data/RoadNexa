import { gsap } from './register';

export function animateCounter(
  element: HTMLElement | null,
  end: number,
  reduced: boolean,
  options?: { duration?: number; decimals?: number; suffix?: string },
) {
  if (!element || end === undefined || end === null) return;
  const decimals = options?.decimals ?? 0;
  const suffix = options?.suffix ?? '';
  if (reduced) {
    element.textContent = `${end.toFixed(decimals)}${suffix}`;
    return;
  }
  const state = { value: 0 };
  return gsap.to(state, {
    value: end,
    duration: options?.duration ?? 1.4,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 86%',
      once: true,
    },
    onUpdate: () => {
      element.textContent = `${state.value.toFixed(decimals)}${suffix}`;
    },
  });
}

export function revealHeading(element: HTMLElement, reduced: boolean) {
  if (!element) return;
  if (reduced) {
    gsap.set(element, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(element, { opacity: 0, y: 24 }, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 84%',
    },
  });
}
