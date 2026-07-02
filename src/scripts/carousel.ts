/** Horizontal slide carousel with prev/next buttons and dot indicators. */
class GohanCarousel extends HTMLElement {
  connectedCallback(): void {
    const track = this.querySelector<HTMLElement>(".track");
    const dots = Array.from(this.querySelectorAll<HTMLElement>(".dot"));
    const prev = this.querySelector<HTMLButtonElement>(".prev");
    const next = this.querySelector<HTMLButtonElement>(".next");
    if (!track || dots.length === 0) return;

    const n = dots.length;
    let i = 0;
    const go = (k: number): void => {
      i = (k + n) % n;
      track.style.transform = `translateX(${-i * 100}%)`;
      dots.forEach((d, j) => {
        d.classList.toggle("active", j === i);
      });
    };
    prev?.addEventListener("click", () => go(i - 1));
    next?.addEventListener("click", () => go(i + 1));
  }
}

customElements.define("gohan-carousel", GohanCarousel);
