/** Horizontal slide carousel: prev/next buttons + autoplay. Slide count is
 *  derived from the track children (no dot indicators). Autoplay pauses on
 *  hover/focus, while the tab is hidden, and never runs under reduced-motion.
 *  Listeners/timer are released in disconnectedCallback. */
class GohanCarousel extends HTMLElement {
  #teardown: Array<() => void> = [];

  connectedCallback(): void {
    const track = this.querySelector<HTMLElement>(".track");
    const prev = this.querySelector<HTMLButtonElement>(".prev");
    const next = this.querySelector<HTMLButtonElement>(".next");
    if (!track) return;

    const n = track.children.length;
    if (n === 0) return;

    let i = 0;
    const go = (k: number): void => {
      i = (k + n) % n;
      track.style.transform = `translateX(${-i * 100}%)`;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    let hoverPaused = false;
    const start = (): void => {
      if (reduce || timer || hoverPaused || document.hidden) return;
      timer = window.setInterval(() => go(i + 1), 4000);
    };
    const stop = (): void => {
      window.clearInterval(timer);
      timer = 0;
    };
    const restart = (): void => {
      stop();
      start();
    };
    this.#teardown.push(stop);

    const listen = (target: EventTarget, type: string, fn: EventListener): void => {
      target.addEventListener(type, fn);
      this.#teardown.push(() => target.removeEventListener(type, fn));
    };

    if (prev) {
      listen(prev, "click", () => {
        go(i - 1);
        restart();
      });
    }
    if (next) {
      listen(next, "click", () => {
        go(i + 1);
        restart();
      });
    }
    listen(this, "pointerenter", () => {
      hoverPaused = true;
      stop();
    });
    listen(this, "pointerleave", () => {
      hoverPaused = false;
      start();
    });
    listen(this, "focusin", () => {
      hoverPaused = true;
      stop();
    });
    listen(this, "focusout", () => {
      hoverPaused = false;
      start();
    });
    listen(document, "visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  disconnectedCallback(): void {
    for (const off of this.#teardown) off();
    this.#teardown = [];
  }
}

customElements.define("gohan-carousel", GohanCarousel);
