/** Starts the noren-hero's revealed video once the pinned scroll passes a
 *  threshold (`data-play-at`, a fraction of viewport height). Playback therefore
 *  begins as the video fades in — the fade itself is CSS scroll-driven. When the
 *  looping video finishes its first pass and starts a 2nd (detected via a
 *  timeupdate wrap), it reveals the `.scroll-hint` cue; the cue hides again on the
 *  next scroll. Under reduced-motion the video stays on its poster (no cue).
 *  All listeners are torn down on disconnect. */
class VideoStage extends HTMLElement {
  #cleanups: Array<() => void> = [];

  connectedCallback(): void {
    const video = this.querySelector<HTMLVideoElement>("video");
    if (!video) return;
    // Reduced motion: don't play; the poster frame stays (shown by CSS).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const playAt = Number.parseFloat(this.dataset.playAt ?? "0.5");
    const onScroll = (): void => {
      // The noren hero is the first section, so scrollY maps directly to how far
      // into the pinned reveal we are; play once we pass playAt * viewport height.
      if (window.scrollY < playAt * window.innerHeight) return;
      video.currentTime = 0;
      void video.play().catch(() => {});
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.#cleanups.push(() => window.removeEventListener("scroll", onScroll));
    onScroll(); // in case the page is loaded already scrolled past the threshold

    this.#watchForLoop(video);
  }

  disconnectedCallback(): void {
    for (const off of this.#cleanups.splice(0)) off();
  }

  /** Reveal the scroll cue when the loop wraps back to the start (2nd play), then
   *  hide it once the visitor scrolls in response. */
  #watchForLoop(video: HTMLVideoElement): void {
    const hint = this.querySelector<HTMLElement>(".scroll-hint");
    if (!hint) return;

    let lastTime = 0;
    const onTime = (): void => {
      // A large backward jump in currentTime means the loop restarted.
      if (video.currentTime + 0.4 < lastTime) {
        hint.classList.add("is-shown");
        video.removeEventListener("timeupdate", onTime);
        const hide = (): void => {
          hint.classList.remove("is-shown");
          window.removeEventListener("scroll", hide);
        };
        window.addEventListener("scroll", hide, { passive: true });
        this.#cleanups.push(() => window.removeEventListener("scroll", hide));
      }
      lastTime = video.currentTime;
    };
    video.addEventListener("timeupdate", onTime);
    this.#cleanups.push(() => video.removeEventListener("timeupdate", onTime));
  }
}

customElements.define("video-stage", VideoStage);
