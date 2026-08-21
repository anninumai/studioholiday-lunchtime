/** Drives the pink mound — cut into .message itself (one pink ground, no
 *  second texture layer): after the hero video's first loop the greeting's
 *  own background pokes up from the stage bottom as the bouncing scroll cue
 *  (clip heights oscillate in JS; the .pink-cue label rides along via its own
 *  matching CSS bob), and scrolling pulls it up like surface tension — the
 *  peak leads, the skirts lag — until the stage is fully pink just before the
 *  pin releases, where the greeting CONTENT fades in in place (.is-revealed).
 *  All geometry is measured in px from the real pin/hero heights (never
 *  window.innerHeight multiples: on iOS that flips between svh and lvh with
 *  the URL bar, which would desync the takeover from the pin release). */
import { lenis } from "./smooth-scroll";

const cue = document.querySelector<HTMLElement>(".pink-cue");
const hero = document.querySelector<HTMLElement>(".noren-hero");
const pin = hero?.querySelector<HTMLElement>(".noren-pin");
const message = document.querySelector<HTMLElement>(".message");
const photo = message?.querySelector<HTMLElement>(".msg-photo");

// The mound only makes sense on the enhanced 300vh pinned hero. Desktop gets
// that under @supports scroll-timeline; mobile gets the pin from a plain
// media query regardless of scroll-timeline support (global.css).
const enhanced =
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
  (CSS.supports("animation-timeline: scroll()") || window.matchMedia("(max-width: 767px)").matches);

if (cue && hero && pin && message && photo && enhanced) {
  const GROW_START = 1.2; // ×pinH — just past the auto-glide's 1.1 landing
  const REVEAL_EPS = 8; // px of slack so t reaches exactly 1 at the landing
  /* The takeover used to finish at 0.97 × releaseY — a position on the HERO's
   * timeline, unrelated to where the poster sits. Since .message is pulled up
   * over the hero by 140vh, that landed the scroll 96–188px BELOW the top of the
   * greeting photo: while the photo's top was on screen the mound was still
   * clipping it, and by the time the clip lifted the top had already scrolled
   * past. There was no scroll position where the top of the poster could be
   * seen. It now finishes where the poster's top comes into view instead. */
  const CUE_ZONE = 0.9; // ×pinH — cue only over the open curtain
  const TARGET = 1.25; // ×pinH — peak/skirt overshoot at t = 1
  const SKIRT_EXP = 1.7; // skirts lag the peak (the surface-tension look)
  const SPRING_MS = 650; // cue entrance, matching the label's cue-in
  const BOB_MS = 2400; // idle poyon period, matching the label's cue-poyon
  const easeInOut = (t: number): number => t * t * (3 - 2 * t);
  // Overshooting spring (easeOutBack), like the label's 1.56 bezier.
  const spring = (t: number): number => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

  let pinH = 0;
  let releaseY = 0;
  let landing = 0; // scroll position the takeover completes at, and glides to
  let cuePeak = 0;
  let cueSkirt = 0;
  let loopDone = false;
  let cuePlayed = false;
  let cueShown = false;
  let cueStart = 0;
  let frame = 0;

  const measure = (): void => {
    pinH = pin.offsetHeight;
    releaseY = hero.offsetHeight - pinH;
    // Land where the top of the poster is just inside the viewport. The gap
    // above it is a fraction of .message's own padding-top, so the pink always
    // reaches past the viewport top (no sliver of hero above it) whether that
    // padding is 240px or 48px.
    const messageTop = message.getBoundingClientRect().top + window.scrollY;
    const photoTop = photo.getBoundingClientRect().top + window.scrollY;
    const posterOffset = Math.max(0, photoTop - messageTop);
    landing = Math.min(releaseY, photoTop - Math.min(48, posterOffset * 0.4));
    // Never collapse onto the growth start, which would divide by ~zero below.
    landing = Math.max(Math.round(landing), Math.round(GROW_START * pinH) + 1);
    cuePeak = Math.min(Math.max(0.2 * pinH, 120), 190); // mirrors the CSS clamp
    cueSkirt = cuePeak * 0.32;
    cue.style.setProperty("--surge-cue-peak", `${cuePeak}px`);
  };

  /** Cosine-bell top edge sampled into a polygon in .message's own box
   *  (msgTop = its current screen-space top), anchored to the viewport
   *  bottom (= pinH while the hero is pinned). */
  const clipFor = (peakH: number, skirtH: number): string => {
    const w = message.offsetWidth;
    const msgTop = message.getBoundingClientRect().top;
    const yBase = pinH - msgTop; // viewport bottom in message coords
    const n = 48;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * w;
      const bell = 0.5 * (1 + Math.cos(2 * Math.PI * (i / n - 0.5)));
      const yEdge = yBase - (skirtH + (peakH - skirtH) * bell);
      pts.push(`${x.toFixed(1)}px ${yEdge.toFixed(1)}px`);
    }
    return `polygon(${pts.join(",")}, ${w}px ${(yBase + 240).toFixed(1)}px, 0px ${(yBase + 240).toFixed(1)}px)`;
  };

  const render = (now: number): void => {
    frame = 0;
    const y = window.scrollY;
    const startY = GROW_START * pinH;
    // Complete a few px BEFORE the landing: a wheel or trackpad stops on an
    // arbitrary integer, and finishing exactly at `landing` left t at 0.999 —
    // enough to keep .is-revealed off, so the poster sat there invisible.
    const t = Math.min(1, Math.max(0, (y - startY) / Math.max(1, landing - REVEAL_EPS - startY)));

    // Fully pink → the greeting content fades in right here; receding hides it.
    message.classList.toggle("is-revealed", t >= 1);

    if (t === 0 && !loopDone) {
      // First playthrough still running and no scroll intent: nothing shows.
      cue.classList.remove("is-active", "is-cue", "is-settled", "is-grown");
      cueShown = false;
      message.style.clipPath = "inset(100% 0 0 0)";
      return;
    }
    cue.classList.add("is-active");

    if (t >= 1) {
      cue.classList.add("is-grown");
      cue.classList.remove("is-cue", "is-settled");
      cueShown = false;
      message.style.clipPath = "none";
      return;
    }
    if (t > 0) {
      cue.classList.add("is-grown");
      cue.classList.remove("is-cue", "is-settled");
      cueShown = false;
      const peakH = cuePeak + (TARGET * pinH - cuePeak) * easeInOut(t);
      const skirtH = cueSkirt + (TARGET * pinH - cueSkirt) * t ** SKIRT_EXP;
      message.style.clipPath = clipFor(peakH, skirtH);
      return;
    }
    // t === 0 with the loop done: the resting cue, only over the open curtain.
    cue.classList.remove("is-grown");
    if (y < CUE_ZONE * pinH) {
      // Back over the closed curtain (page top): retract the mound.
      cue.classList.remove("is-cue", "is-settled");
      cueShown = false;
      message.style.clipPath = "inset(100% 0 0 0)";
      return;
    }
    if (!cueShown) {
      cueShown = true;
      // Re-entering the hold after the cue already played skips the spring.
      cueStart = cuePlayed ? now - SPRING_MS : now;
      if (cuePlayed) cue.classList.add("is-settled");
      cue.classList.add("is-cue");
      cuePlayed = true;
    }
    // Mound choreography, in step with the label's CSS: spring up, then bob.
    const elapsed = now - cueStart;
    const rise = elapsed < SPRING_MS ? spring(elapsed / SPRING_MS) : 1;
    const phase = (((elapsed - SPRING_MS) % BOB_MS) + BOB_MS) % BOB_MS;
    const theta = (phase / BOB_MS) * 2 * Math.PI;
    const bob = elapsed < SPRING_MS ? 0 : 6 * Math.sin(theta) + 2 * Math.sin(2 * theta);
    message.style.clipPath = clipFor(cuePeak * rise + bob, cueSkirt * rise + bob * 0.5);
    requestRender(); // keep the idle bob alive while the cue rests
  };

  const requestRender = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(render);
  };

  window.addEventListener("hero-video-looped", () => {
    loopDone = true;
    requestRender();
  });
  window.addEventListener("scroll", requestRender, { passive: true });
  const remeasure = (): void => {
    measure();
    requestRender();
  };
  window.addEventListener("resize", remeasure, { passive: true });
  window.addEventListener("orientationchange", remeasure, { passive: true });
  measure();
  requestRender();

  // Auto-complete the takeover: once the visitor has pushed the mound about
  // 15% of a screen into the growth zone and is still heading down, glide the
  // real scroll to the pin release so the pink fill and the greeting reveal
  // finish on their own. Same claim/re-claim dance as noren-auto-reveal:
  // every user input clears the glide (user always wins), the next scrolled
  // frame re-asserts it while still descending inside the zone.
  const GLIDE_TRIGGER = 0.15; // ×pinH scrolled past the growth start
  const GLIDE_S = 1.2; // seconds
  const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
  if (lenis) {
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
      if (!down || y >= landing) {
        gliding = false;
        return;
      }
      if (y < GROW_START * pinH + GLIDE_TRIGGER * pinH || gliding) return;
      if (instance.targetScroll >= landing) return; // already headed past on their own
      gliding = true;
      instance.scrollTo(landing, { duration: GLIDE_S, easing: easeOutCubic });
    });
  }
}
