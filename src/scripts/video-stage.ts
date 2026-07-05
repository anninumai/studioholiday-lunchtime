/** Starts the noren-hero's revealed video once the pinned scroll passes a
 *  threshold (`data-play-at`, a fraction of viewport height). Playback therefore
 *  begins as the video fades in — the fade itself is CSS scroll-driven. Under
 *  reduced-motion the video is left on its poster frame (CSS keeps it visible).
 *  The scroll listener is removed after it fires, and on disconnect. */
class VideoStage extends HTMLElement {
  #onScroll?: () => void;

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
      this.#onScroll = undefined;
    };
    this.#onScroll = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // in case the page is loaded already scrolled past the threshold
  }

  disconnectedCallback(): void {
    if (this.#onScroll) window.removeEventListener("scroll", this.#onScroll);
    this.#onScroll = undefined;
  }
}

customElements.define("video-stage", VideoStage);
