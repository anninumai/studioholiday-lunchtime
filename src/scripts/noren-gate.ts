/** Scroll-linked intro. The brand noren covers the top on load; scrolling through
 *  this section lifts the noren and fades the intro video in with a gentle push
 *  (a quiet "stepping into the shop"). Fully scrubbed to scroll — it never hijacks
 *  scroll. Under reduced-motion the noren is hidden and the video shown statically
 *  (handled in CSS), so this script no-ops. Cleaned up on disconnect. */

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const BLUR_PX = 24; // video blur at scroll start -> 0 as it fades in
const SCALE_FROM = 1.06; // video scale at start -> 1 (settles as you "arrive")
const REVEAL_LEAD = 1.3; // video finishes fading in a bit before the noren clears

class NorenGate extends HTMLElement {
  #raf = 0;
  #ticking = false;
  #playing = false;
  #teardown: Array<() => void> = [];
  #section: HTMLElement | null = null;
  #noren: HTMLElement | null = null;
  #video: HTMLVideoElement | null = null;

  connectedCallback(): void {
    const section = this.querySelector<HTMLElement>(".noren-gate");
    const noren = this.querySelector<HTMLElement>(".ng-noren");
    const video = this.querySelector<HTMLVideoElement>(".ng-video");
    if (!section || !noren || !video) return;
    this.#section = section;
    this.#noren = noren;
    this.#video = video;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onScroll = (): void => this.#requestUpdate();
    this.#listen(window, "scroll", onScroll, { passive: true });
    this.#listen(window, "resize", onScroll);
    this.#update();
  }

  disconnectedCallback(): void {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    for (const off of this.#teardown) off();
    this.#teardown = [];
  }

  #listen(
    target: EventTarget,
    type: string,
    fn: EventListener,
    opts?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, fn, opts);
    this.#teardown.push(() => target.removeEventListener(type, fn, opts));
  }

  #requestUpdate(): void {
    if (this.#ticking) return;
    this.#ticking = true;
    this.#raf = requestAnimationFrame(() => {
      this.#ticking = false;
      this.#update();
    });
  }

  #update(): void {
    const section = this.#section;
    const noren = this.#noren;
    const video = this.#video;
    if (!section || !noren || !video) return;

    // p = 0 at the top of the section, 1 after scrolling it up by one viewport.
    const range = section.offsetHeight - window.innerHeight;
    const p = range > 0 ? clamp01(-section.getBoundingClientRect().top / range) : 0;
    const reveal = clamp01(p * REVEAL_LEAD);

    noren.style.transform = `translateY(${(-p * 112).toFixed(2)}%)`;
    video.style.opacity = reveal.toFixed(3);
    video.style.filter = `blur(${lerp(BLUR_PX, 0, reveal).toFixed(2)}px)`;
    video.style.transform = `scale(${lerp(SCALE_FROM, 1, reveal).toFixed(4)})`;

    if (!this.#playing && p > 0.02) {
      this.#playing = true;
      video.currentTime = 0;
      void video.play().catch(() => {});
    }
  }
}

customElements.define("noren-gate", NorenGate);
