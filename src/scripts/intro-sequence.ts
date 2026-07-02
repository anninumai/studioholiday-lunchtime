const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"];

/**
 * TOP curtain intro. Locks the page and drives, in one pinned stage:
 *   rise → video → fading → done
 * Scroll/touch/key input raises the noren; once fully risen the video fades in
 * and plays from 0; on `ended` it fades out; then the curtain fades out to
 * reveal the message (the pink section below). Disabled under reduced-motion.
 */
class IntroSequence extends HTMLElement {
  connectedCallback(): void {
    const stage = this.querySelector<HTMLElement>(".intro-stage");
    const noren = this.querySelector<HTMLElement>(".noren");
    const video = this.querySelector<HTMLVideoElement>(".intro-video");
    const skip = this.querySelector<HTMLButtonElement>(".intro-skip");
    if (!stage || !noren || !video) return;

    // Reduced motion: keep the stage as a static in-flow hero; do nothing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let phase: "rise" | "video" | "fading" | "done" = "rise";
    let p = 0; // 0..1 rise progress
    let rise = 1; // px the noren travels to clear the top
    let fallback = 0;

    const computeRise = (): void => {
      rise = Math.max(1, (window.innerHeight + noren.offsetHeight) / 2 + 40);
    };
    const applyNoren = (): void => {
      noren.style.transform = `translate(-50%, calc(-50% - ${(p * rise).toFixed(1)}px))`;
    };

    stage.classList.add("is-active"); // become the locked fixed overlay
    computeRise();
    applyNoren();

    const advance = (deltaPx: number): void => {
      if (phase !== "rise") return;
      p = Math.min(1, Math.max(0, p + deltaPx / rise));
      applyNoren();
      if (p >= 1) startVideo();
    };

    const startVideo = (): void => {
      if (phase !== "rise") return;
      phase = "video";
      video.classList.add("show");
      video.loop = false;
      try {
        video.currentTime = 0;
      } catch {
        /* metadata may not be ready; play() still starts from 0 */
      }
      const played = video.play();
      if (played) played.catch(() => {});
      const ms =
        (Number.isFinite(video.duration) && video.duration ? video.duration * 1000 : 13000) + 1500;
      fallback = window.setTimeout(endVideo, ms);
    };

    const endVideo = (): void => {
      if (phase !== "video") return;
      phase = "fading";
      window.clearTimeout(fallback);
      video.classList.remove("show"); // fade out (0.6s)
      window.setTimeout(finish, 650);
    };

    const finish = (): void => {
      if (phase !== "fading") return;
      phase = "done";
      stage.classList.add("fade-out"); // reveal the pink message beneath
      unlock();
      window.setTimeout(() => {
        stage.style.display = "none";
      }, 950);
    };

    const onWheel = (e: WheelEvent): void => {
      if (phase === "done") return;
      e.preventDefault();
      if (phase === "rise") advance(e.deltaY);
      // during "video"/"fading": stay locked (no accidental skip); use the skip button
    };
    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent): void => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent): void => {
      if (phase === "done") return;
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? lastTouchY;
      const d = lastTouchY - y;
      lastTouchY = y;
      if (phase === "rise") advance(d);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (phase === "done" || !SCROLL_KEYS.includes(e.key)) return;
      e.preventDefault();
      if (phase === "rise") advance(80);
    };
    const onResize = (): void => {
      computeRise();
      if (phase === "rise") applyNoren();
    };

    const lock = (): void => {
      document.body.style.overflow = "hidden";
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
    };
    const unlock = (): void => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };

    lock();
    video.addEventListener("ended", endVideo);
    if (noren instanceof HTMLImageElement && !noren.complete) {
      noren.addEventListener(
        "load",
        () => {
          computeRise();
          applyNoren();
        },
        { once: true },
      );
    }
    skip?.addEventListener("click", () => {
      if (phase === "rise") {
        p = 1;
        applyNoren();
        startVideo();
      } else if (phase === "video") {
        endVideo();
      }
    });
  }
}

customElements.define("intro-sequence", IntroSequence);
