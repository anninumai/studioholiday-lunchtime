/** Reveal `.appear` elements (fade + slide-up) when they enter the viewport, plus
 *  `.appear--hero` — the message centerpiece. Because that section scroll-snaps
 *  into place, its reveal fires when scrolling SETTLES with it in view (via
 *  `scrollend`), not mid-approach — so the blur/fade/scale + line-stagger lands as
 *  a "moment" on the settled section instead of finishing during the scroll.
 *  The intro video's reveal is owned by <video-stage>, not here. */
class AppearObserver extends HTMLElement {
  #io?: IntersectionObserver;
  #heroIo?: IntersectionObserver;
  #onScrollEnd?: () => void;

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

    this.#setupHeroes(heroes);
  }

  disconnectedCallback(): void {
    this.#io?.disconnect();
    this.#io = undefined;
    this.#heroIo?.disconnect();
    this.#heroIo = undefined;
    if (this.#onScrollEnd) {
      window.removeEventListener("scrollend", this.#onScrollEnd);
      this.#onScrollEnd = undefined;
    }
  }

  /** Play the hero reveal once the section has settled (scroll stopped) with at
   *  least half of it in view — so it reads as a landing "moment". Falls back to
   *  a high-threshold IntersectionObserver where `scrollend` is unavailable. */
  #setupHeroes(heroes: HTMLElement[]): void {
    if (heroes.length === 0) return;

    if ("onscrollend" in window) {
      let pending = heroes;
      const onScrollEnd = (): void => {
        pending = pending.filter((el) => {
          const r = el.getBoundingClientRect();
          const vh = window.innerHeight;
          const visible = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top));
          const ratio = visible / Math.min(r.height || vh, vh);
          if (ratio >= 0.5) {
            el.classList.add("in");
            return false;
          }
          return true;
        });
        if (pending.length === 0 && this.#onScrollEnd) {
          window.removeEventListener("scrollend", this.#onScrollEnd);
          this.#onScrollEnd = undefined;
        }
      };
      this.#onScrollEnd = onScrollEnd;
      window.addEventListener("scrollend", onScrollEnd, { passive: true });
      return;
    }

    this.#heroIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          this.#heroIo?.unobserve(e.target);
        }
      },
      { threshold: 0.9 },
    );
    for (const el of heroes) this.#heroIo.observe(el);
  }
}

customElements.define("appear-observer", AppearObserver);
