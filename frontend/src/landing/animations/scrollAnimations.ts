import { gsap, ScrollTrigger } from './register';

export function createScrollProgress(bar: HTMLElement, reduced: boolean) {
  if (!bar) return;
  if (reduced) {
    gsap.set(bar, { scaleX: 0 });
    return;
  }
  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    transformOrigin: '0% 50%',
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.2,
    },
  });
}

export function pinHeroStory(
  section: HTMLElement,
  onProgress: (progress: number) => void,
  reduced: boolean,
) {
  if (!section) return;
  if (reduced) {
    onProgress(1);
    return;
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.7,
      anticipatePin: 1,
      onUpdate: (self) => onProgress(self.progress),
    });
  });
  return mm;
}

export function pinHorizontalTimeline(
  section: HTMLElement,
  track: HTMLElement,
  reduced: boolean,
  enabled: boolean,
) {
  if (!section || !track || reduced || !enabled) return;

  const getDistance = () => Math.max(0, track.scrollWidth - section.clientWidth + 80);

  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

export function animateFooter(root: HTMLElement, reduced: boolean) {
  if (!root) return;
  if (reduced) return;

  const items = root.querySelectorAll('[data-footer]');
  gsap.fromTo(items, { opacity: 0, y: 16 }, {
    opacity: 1,
    y: 0,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: root,
      start: 'top 85%',
    },
  });
}
