/** Fade + slide-up elements marked `.appear` when they enter the viewport. */
class AppearObserver extends HTMLElement {
  connectedCallback(): void {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".appear"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of els) el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of els) io.observe(el);
  }
}

customElements.define("appear-observer", AppearObserver);
