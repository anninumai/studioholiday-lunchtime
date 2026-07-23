/** Starts the noren-hero's revealed video once the pinned scroll passes a
 *  threshold (`data-play-at`, a fraction of viewport height). The video buffers
 *  as soon as the stage connects so mobile playback is ready when the noren opens.
 *  The mobile scroll cue is visible at the page top and fades while scrolling below.
 *  Under reduced-motion the video stays on its poster while the cue remains static.
 *  All listeners are torn down on disconnect. */
class VideoStage extends HTMLElement {
  #cleanups: Array<() => void> = [];

  connectedCallback(): void {
    const video = this.querySelector<HTMLVideoElement>("video");
    if (!video) return;
    this.#setupScrollHint();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    // Keep the video source unset when motion is reduced or Data Saver is active;
    // the optimized CSS poster remains as the complete fallback.
    if (reduceMotion || connection?.saveData) return;

    // Select the source explicitly because media-qualified <source> selection is
    // inconsistent across mobile browsers.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const src = mobile ? video.dataset.mobileSrc : video.dataset.src;
    if (!src) return;
    // Mobile Safari gives autoplaying inline video a more reliable loading path.
    // Desktop keeps the existing threshold-triggered playback behavior.
    video.autoplay = mobile;
    video.src = src;

    const playAt = Number.parseFloat(this.dataset.playAt ?? "0.5");
    let prepared = false;
    let started = false;
    let revealStarted = false;
    const visibilityTarget = this.closest<HTMLElement>(".noren-hero") ?? video;
    const isVisible = (): boolean => {
      const rect = visibilityTarget.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };
    let visible = isVisible();

    const prepare = (): void => {
      if (prepared) return;
      prepared = true;
      video.preload = "auto";
      video.load();
    };

    const resume = (): void => {
      if (!started || !visible || document.hidden || !video.paused) return;
      prepare();
      void video.play().catch(() => {});
    };

    // This hero is the first experience on the page. Buffer it immediately so
    // mobile devices do not reveal a stalled first frame while the file loads.
    prepare();

    const onScroll = (): void => {
      // The noren hero is the first section, so scrollY maps directly to how far
      // into the pinned reveal we are; play once we pass playAt * viewport height.
      if (window.scrollY < playAt * window.innerHeight) return;
      started = true;
      // Read the current geometry here instead of waiting for the asynchronous
      // observer so the threshold and visibility use the same scroll position.
      visible = isVisible();
      // Mobile may already be playing behind the cloth to force Safari to load
      // and decode it. Restart once, exactly when the visible reveal begins.
      if (!revealStarted) {
        revealStarted = true;
        video.currentTime = 0;
      }
      resume();
      if (!video.paused) window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.#cleanups.push(() => window.removeEventListener("scroll", onScroll));
    onScroll(); // in case the page is loaded already scrolled past the threshold

    // A rejected or deferred first play can be retried once enough data arrives.
    video.addEventListener("canplay", resume);
    const onPlaying = (): void => {
      if (started) window.removeEventListener("scroll", onScroll);
    };
    video.addEventListener("playing", onPlaying);

    // A touch that begins scrolling is a user gesture, so it also unlocks video
    // on iOS configurations that decline muted autoplay (for example Low Power Mode).
    const onPointerDown = (): void => {
      if (!mobile || started || !video.paused) return;
      void video.play().catch(() => {});
    };
    visibilityTarget.addEventListener("pointerdown", onPointerDown, { passive: true });
    this.#cleanups.push(() => {
      video.removeEventListener("canplay", resume);
      video.removeEventListener("playing", onPlaying);
      visibilityTarget.removeEventListener("pointerdown", onPointerDown);
    });

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) resume();
      else video.pause();
    });
    visibilityObserver.observe(visibilityTarget);
    this.#cleanups.push(() => visibilityObserver.disconnect());

    const onVisibilityChange = (): void => {
      if (document.hidden) video.pause();
      else resume();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    this.#cleanups.push(() => document.removeEventListener("visibilitychange", onVisibilityChange));
  }

  disconnectedCallback(): void {
    for (const off of this.#cleanups.splice(0)) off();
  }

  /** Show the instruction at the page top and hide it while scrolling below. */
  #setupScrollHint(): void {
    const hint = this.querySelector<HTMLElement>(".scroll-hint");
    if (!hint) return;

    const update = (): void => {
      hint.classList.toggle("is-shown", window.scrollY < 8);
    };
    window.addEventListener("scroll", update, { passive: true });
    this.#cleanups.push(() => window.removeEventListener("scroll", update));
    update();
  }
}

customElements.define("video-stage", VideoStage);
