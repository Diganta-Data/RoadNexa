import { gsap } from './register';

function nodes(root: ParentNode, name: string) {
  const list = root.querySelectorAll(`[data-hero="${name}"]`);
  return list.length ? list : null;
}

export function createHeroTimeline(root: HTMLElement, reduced: boolean) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (!root) return tl;

  const page = root.closest('.iris-lp') || root;
  const pick = (name: string) => nodes(page, name);

  if (reduced) {
    gsap.set(page.querySelectorAll('[data-hero]'), { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
    return tl;
  }

  const words = pick('word');
  const intro = ['eyebrow', 'sub', 'cta', 'meta', 'viz', 'float', 'scroll']
    .flatMap((name) => [...(pick(name) || [])]);

  if (words) gsap.set(words, { opacity: 0, y: 28, filter: 'blur(8px)' });
  if (intro.length) gsap.set(intro, { opacity: 0, y: 18 });

  const bg = pick('bg');
  const grid = pick('grid');
  const nav = pick('nav');
  const viz = pick('viz');

  if (bg) tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0);
  if (grid) tl.fromTo(grid, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.08);
  if (nav) tl.fromTo(nav, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.4 }, 0.12);
  if (pick('eyebrow')) tl.to(pick('eyebrow'), { opacity: 1, y: 0, duration: 0.35 }, 0.22);
  if (words) {
    tl.to(words, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.42,
      stagger: 0.07,
    }, 0.32);
  }
  if (pick('sub')) tl.to(pick('sub'), { opacity: 1, y: 0, duration: 0.4 }, 0.72);
  if (pick('cta')) tl.to(pick('cta'), { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, 0.88);
  if (pick('meta')) tl.to(pick('meta'), { opacity: 1, y: 0, duration: 0.3 }, 1.05);
  if (viz) tl.fromTo(viz, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.55 }, 0.55);
  if (pick('float')) tl.to(pick('float'), { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 1.15);
  if (pick('scroll')) tl.to(pick('scroll'), { opacity: 1, y: 0, duration: 0.3 }, 1.35);

  return tl;
}
