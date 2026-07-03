/** Reveal `.appear` elements (fade + slide-up) when they enter the viewport.
 *  The intro video's reveal + playback is owned by <video-stage>, not here. */
class AppearObserver extends HTMLElement {
  #io?: IntersectionObserver;

  connectedCallback(): void {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".appear"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of els) el.classList.add("in"); // show everything at rest
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
  }

  disconnectedCallback(): void {
    this.#io?.disconnect();
    this.#io = undefined;
  }
}

customElements.define("appear-observer", AppearObserver);
