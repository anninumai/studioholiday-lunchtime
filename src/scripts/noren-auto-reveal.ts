/** Auto-completes the noren lift: as soon as the visitor shows scroll intent
 *  (a tenth of a screen) and is still heading down, glide the real scroll
 *  position to the end of the reveal range so the cloth lift, the video
 *  fade-in and playback — all scroll-driven — finish in sync on their own.
 *
 *  Lenis re-targets an active glide to `currentPos + delta` on every user
 *  wheel/touch input (user always wins), so a single fire dies under a
 *  stream of wheel events. Instead: each user input (`virtual-scroll`)
 *  clears our claim, and the next scrolled frame re-asserts the glide while
 *  still descending inside the reveal zone. Scrolling upward escapes, and a
 *  fast flick whose own target is already past the reveal is left alone.
 *  Skipped when the curtain is already open (no scroll-timeline support /
 *  reduced motion → lenis is null). */
import { lenis } from "./smooth-scroll";

const TRIGGER = 0.1; // fire after just a tenth of a screen of scroll intent
const OVERSHOOT = 1.1; // CSS 100vh (lvh on iOS) can exceed innerHeight (svh)
const DURATION = 1.1; // seconds
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

if (
  lenis &&
  CSS.supports("animation-timeline: scroll()") &&
  document.querySelector(".noren-hero")
) {
  const instance = lenis;
  let lastY = instance.scroll;
  let gliding = false;

  instance.on("virtual-scroll", () => {
    gliding = false;
  });

  instance.on("scroll", () => {
    const y = instance.scroll;
    const down = y > lastY;
    lastY = y;
    const vh = window.innerHeight; // read fresh each event: resize-proof
    const end = vh * OVERSHOOT;
    if (y >= vh || !down) {
      gliding = false;
      return;
    }
    if (y < TRIGGER * vh || gliding) return;
    if (instance.targetScroll >= end) return; // already headed past on their own
    gliding = true;
    instance.scrollTo(end, { duration: DURATION, easing: easeOutCubic });
  });
}
