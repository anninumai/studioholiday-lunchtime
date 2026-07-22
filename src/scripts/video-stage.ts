/** Starts the noren-hero's revealed video once the pinned scroll passes a
 *  threshold (`data-play-at`, a fraction of viewport height). In NorenHero this is
 *  half a viewport, so playback begins from frame zero while the noren is opening.
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
    // inconsistent across mobile browsers. Keep preload disabled until scroll
    // intent so the large media file is not fetched on arrival.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const src = mobile ? video.dataset.mobileSrc : video.dataset.src;
    if (!src) return;
    video.src = src;

    const playAt = Number.parseFloat(this.dataset.playAt ?? "0.5");
    let prepared = false;
    let started = false;
    let playedOnce = false;
    const initialRect = video.getBoundingClientRect();
    let visible = initialRect.bottom > 0 && initialRect.top < window.innerHeight;

    const prepare = (): void => {
      if (prepared) return;
      prepared = true;
      // The markup starts at preload="none". Switching only after scroll intent
      // lets the browser select the matching <source media> before buffering it.
      video.preload = "auto";
      video.load();
    };

    const resume = (): void => {
      if (!started || !visible || document.hidden) return;
      prepare();
      if (!playedOnce) {
        playedOnce = true;
        video.currentTime = 0;
      }
      void video.play().catch(() => {});
    };

    const onScroll = (): void => {
      // A first scroll is enough intent to buffer ahead of the reveal, but a page
      // restored below the hero must not fetch a video that is already offscreen.
      if (window.scrollY > 0 && visible) prepare();
      // The noren hero is the first section, so scrollY maps directly to how far
      // into the pinned reveal we are; play once we pass playAt * viewport height.
      if (window.scrollY < playAt * window.innerHeight) return;
      started = true;
      resume();
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.#cleanups.push(() => window.removeEventListener("scroll", onScroll));
    onScroll(); // in case the page is loaded already scrolled past the threshold

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) resume();
      else video.pause();
    });
    visibilityObserver.observe(video);
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
