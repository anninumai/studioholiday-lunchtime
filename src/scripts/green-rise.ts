/** Contact entrance — the green dome (案D「まるく開く」), cut into .message2
 *  itself. While the greeting's last viewport is held at the page bottom
 *  (sticky .message-inner, its top offset computed here), a scroll into the
 *  runway TRIGGERS the dome: .message2 — the one and only green-canvas
 *  ground — opens as a swelling ellipse anchored to the viewport bottom
 *  (radii time-based, centre re-anchored per frame since a Lenis glide moves
 *  the scroll underneath), so the zabuton pops on exactly the green it will
 *  live on; no second texture layer, no scale jump.
 *  The runway is the .message::after spacer (real content — sticky children
 *  can only hold within the parent's content box, so padding cannot host it).
 *  Geometry is measured in px, mirroring pink-surge.ts (innerHeight drifts
 *  between svh and lvh on iOS; the hero pin height is the stable 100svh). */
import { lenis } from "./smooth-scroll";

const message = document.querySelector<HTMLElement>(".message");
const inner = message?.querySelector<HTMLElement>(".message-inner");
const pin = document.querySelector<HTMLElement>(".noren-pin");
const message2 = document.querySelector<HTMLElement>(".message2");
const access = message2?.querySelector<HTMLElement>(".access");

// Same enhanced gate as pink-surge: desktop needs scroll-timeline (the pinned
// hero path); mobile gets its pins from a plain media query regardless.
const enhanced =
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
  (CSS.supports("animation-timeline: scroll()") || window.matchMedia("(max-width: 767px)").matches);

if (message && inner && pin && message2 && access && enhanced) {
  const TRIGGER = 0.5; // a beat of pinned pink (~60vh) before the burst fires
  const REARM = 0.45; // scroll back above this to re-arm (hysteresis)
  const REVEAL_AT = 0.62; // pop the zabuton early in the glide (all green by then)
  const UNREVEAL_AT = 0.55;
  const GAP = 0.32; // ×viewport — pink breathing room under the pinned content
  const OPEN_MS = 800; // dome burst duration
  const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

  let opened = false; // first full open done → a plain section from then on
  let runway = 1;
  let vhRef = 0; // the hero pin height: 100svh/100dvh, stable on iOS
  let domeX = 0; // ellipse radii at full open
  let domeY = 0;
  let rt = 0; // dome openness 0..1
  let opening = false; // direction of the time-based animation
  let animStart = 0;
  let animFrom = 0;
  let animating = false;
  let gliding = false; // our claim on the Lenis glide (user input clears it)
  let lastY = window.scrollY;
  let frame = 0;

  // Lenis re-targets an active glide on every wheel/touch input (user wins),
  // so a single fire dies under a stream of touch events — clear the claim
  // and re-assert on the next frame while still descending inside the zone.
  lenis?.on("virtual-scroll", () => {
    gliding = false;
  });

  const measure = (): void => {
    vhRef = pin.offsetHeight;
    runway = Number.parseFloat(getComputedStyle(message, "::after").height) || vhRef * 1.2;
    // A wide, flat dome: x-radius past both screen edges so the base always
    // touches them and the arch reads broad (not egg-shaped); the y-radius
    // just clears the top corners when fully open (checked: (0.5/1.1)^2 +
    // (1/1.15)^2 = 0.96 < 1).
    domeX = message2.offsetWidth * 1.1;
    domeY = vhRef * 1.15;
    // Pin the greeting by its BOTTOM viewport: it sticks once its bottom
    // (plus the breathing gap) reaches the viewport bottom.
    inner.style.top = `${Math.round(vhRef - inner.offsetHeight - GAP * vhRef)}px`;
  };

  /* First full open done → fold the choreography layout (overlap, sticky
   * hold, runway) into ordinary flow: html.contact-settled (see the runway
   * blocks in global.css). The whole viewport is green at this moment, and
   * the document-height change is compensated in the same frame, so the
   * switch is invisible; from here the greeting and the green are one
   * contiguous, same-layer flow in both directions. */
  const settle = (): void => {
    opened = true;
    // Anchor the compensation to the CONTENT (.access), not .message2's box:
    // the settled state also drops the 60vh padding-top, so pinning the box
    // top would jump the zabuton 60vh up at the switch.
    const before = access.getBoundingClientRect().top;
    document.documentElement.classList.add("contact-settled");
    message2.style.clipPath = "";
    const delta = access.getBoundingClientRect().top - before;
    if (delta !== 0) {
      const y = window.scrollY + delta;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    }
  };

  const applyClip = (p: number): void => {
    if (rt >= 1 && p >= 1) {
      settle();
      return;
    }
    // Anchor the dome to the viewport bottom, in .message2's own box.
    const cy = vhRef - message2.getBoundingClientRect().top;
    message2.style.clipPath = `ellipse(${(rt * domeX).toFixed(1)}px ${(rt * domeY).toFixed(1)}px at 50% ${cy.toFixed(1)}px)`;
  };

  const render = (now: number): void => {
    frame = 0;
    if (opened) return; // settled: CSS owns the (ordinary) layout from here
    const rect = message.getBoundingClientRect();
    // p: 0 while reading the greeting, 1 when the runway is spent.
    const p = Math.min(1, Math.max(0, 1 - (rect.bottom - vhRef) / runway));

    const y = window.scrollY;
    const down = y > lastY;
    lastY = y;

    if (!opening && p >= TRIGGER) {
      opening = true;
      animating = true;
      animStart = now;
      animFrom = rt;
    } else if (opening && p < REARM) {
      opening = false;
      animating = true;
      animStart = now;
      animFrom = rt;
      gliding = false;
    }

    // Carry the scroll to the runway end while the green swallows the stage;
    // user input still wins, and we re-assert while descending in the zone.
    if (opening && down && p < 1 && !gliding && lenis) {
      const target = y + (rect.bottom - vhRef);
      if (lenis.targetScroll < target) {
        gliding = true;
        lenis.scrollTo(target, { duration: 1, easing: easeOutCubic });
      }
    }

    if (animating) {
      const t = Math.min(1, (now - animStart) / OPEN_MS);
      rt = animFrom + ((opening ? 1 : 0) - animFrom) * easeOutCubic(t);
      if (t >= 1) animating = false;
    }
    applyClip(p);

    if (p >= REVEAL_AT) message2.classList.add("is-revealed");
    else if (p < UNREVEAL_AT) message2.classList.remove("is-revealed");

    if (animating) requestRender(); // keep the burst running between scrolls
  };

  const requestRender = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(render);
  };
  window.addEventListener("scroll", requestRender, { passive: true });
  const remeasure = (): void => {
    measure();
    requestRender();
  };
  window.addEventListener("resize", remeasure, { passive: true });
  window.addEventListener("orientationchange", remeasure, { passive: true });
  // The greeting's images settle its height after load; measure again then.
  window.addEventListener("load", remeasure);
  measure();
  // Initial state: restore without motion (e.g. reload mid-page).
  {
    const rect = message.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, 1 - (rect.bottom - vhRef) / runway));
    if (p >= TRIGGER) {
      opening = true;
      rt = 1;
      if (p >= REVEAL_AT) message2.classList.add("is-revealed");
    }
    applyClip(p);
  }
}
