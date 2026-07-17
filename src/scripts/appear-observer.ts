/** Reveal `.appear` elements (fade + slide-up) when they enter the viewport, plus
 *  `.appear--hero` — the message centerpiece (photo focus-in + panel rise). Both
 *  fire via IntersectionObserver as the element scrolls into view; the hero uses a
 *  higher threshold so its bigger "moment" lands once it's substantially on screen.
 *  (Smooth scrolling is Lenis-driven with no snap, so a settle/`scrollend` trigger
 *  is unreliable — a plain threshold reveal is used instead.) The intro video's
 *  reveal is owned by <video-stage>, not here. */
class AppearObserver extends HTMLElement {
  #io?: IntersectionObserver;
  #heroIo?: IntersectionObserver;

  connectedCallback(): void {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".appear"));
    const heroes = Array.from(document.querySelectorAll<HTMLElement>(".appear--hero"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of els) el.classList.add("in"); // show everything at rest
      for (const el of heroes) el.classList.add("in");
      return;
    }

    this.#io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          this.#io?.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of els) this.#io.observe(el);

    // Hero: reveal once ~35% of the section is on screen — reliable at any scroll
    // speed, and the fade/scale + panel rise still reads as it enters.
    if (heroes.length > 0) {
      this.#heroIo = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add("in");
            this.#heroIo?.unobserve(e.target);
          }
        },
        { threshold: 0.35 },
      );
      for (const el of heroes) this.#heroIo.observe(el);
    }
  }

  disconnectedCallback(): void {
    this.#io?.disconnect();
    this.#io = undefined;
    this.#heroIo?.disconnect();
    this.#heroIo = undefined;
  }
}

customElements.define("appear-observer", AppearObserver);
