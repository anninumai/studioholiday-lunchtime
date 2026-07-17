/** Smooth, weighted momentum scrolling via Lenis — matched to the requested
 *  reference feel (wellness-arao.com). `lerp` is the "weight": lower = heavier /
 *  more inertia, higher = snappier. Lenis drives the real scroll position, so the
 *  CSS scroll-driven reveals (animation-timeline: scroll()) still track it.
 *  Disabled under reduced-motion (native scroll then). Runs for the page lifetime. */
import Lenis from "lenis";

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });

  const raf = (time: number): void => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
