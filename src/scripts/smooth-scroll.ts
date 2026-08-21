/** Smooth, weighted momentum scrolling via Lenis — matched to the requested
 *  reference feel (wellness-arao.com). `lerp` is the "weight": lower = heavier /
 *  more inertia, higher = snappier. Lenis drives the real scroll position, so the
 *  CSS scroll-driven reveals (animation-timeline: scroll()) still track it.
 *  Disabled under reduced-motion (native scroll then). Runs for the page lifetime. */
import Lenis from "lenis";

/** Shared instance for modules that need programmatic scrolling
 *  (noren-auto-reveal). Stays null under reduced-motion (native scroll). */
export let lenis: Lenis | null = null;

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });

  const instance = lenis;
  const raf = (time: number): void => {
    instance.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
