/** Owns the intro video: reveals it (blur -> focus) and plays it from the top
 *  when scrolled into view — STUDIO starts it on appear, not on load, so it
 *  isn't already finished off-screen by the time the viewer arrives. Under
 *  reduced-motion it stays paused on its poster frame. Cleaned up on disconnect. */
class VideoStage extends HTMLElement {
  #io?: IntersectionObserver;

  connectedCallback(): void {
    const video = this.querySelector<HTMLVideoElement>("video");
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.classList.add("in"); // static, sharp poster frame; no playback
      return;
    }

    this.#io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          video.classList.add("in");
          video.currentTime = 0;
          void video.play().catch(() => {});
          this.#io?.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    this.#io.observe(video);
  }

  disconnectedCallback(): void {
    this.#io?.disconnect();
    this.#io = undefined;
  }
}

customElements.define("video-stage", VideoStage);
