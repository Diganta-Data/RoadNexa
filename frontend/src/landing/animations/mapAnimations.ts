import { gsap } from './register';

export function drawRoads(paths: NodeListOf<SVGPathElement> | SVGPathElement[], reduced: boolean) {
  if (!paths || !paths.length) return;
  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduced ? '0' : `${length}`;
    if (reduced) return;
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.6,
      delay: 0.08 * index,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: path,
        start: 'top 85%',
      },
    });
  });
}

export function pulseNodes(nodes: NodeListOf<Element>, reduced: boolean) {
  if (!nodes.length || reduced) return;
  gsap.to(nodes, {
    scale: 1.35,
    opacity: 0.45,
    duration: 1.4,
    stagger: { each: 0.12, repeat: -1, yoyo: true },
    ease: 'sine.inOut',
    transformOrigin: 'center',
  });
}
