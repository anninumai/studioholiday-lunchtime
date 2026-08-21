/** Horizontal slide carousel. Slide count is derived from the track children.
 *
 *  Input: drag/swipe (pointer events, so touch and mouse both work), dot
 *  pagination, and ←/→/Home/End once focus is anywhere inside the carousel —
 *  a phone previously had no way to advance except tapping a 12px dot.
 *
 *  Autoplay pauses on hover/focus and while the tab is hidden, never runs under
 *  reduced-motion, and stops for good after the first deliberate interaction:
 *  once someone is driving, taking the slides back off them is worse than
 *  helpful, and it gives the visitor the "stop" WCAG 2.2.2 asks for.
 *
 *  Off-screen slides are marked aria-hidden + inert so a screen reader reads one
 *  caption instead of all three at once, and a live region announces the change.
 *  Listeners/timer are released in disconnectedCallback. */
class GohanCarousel extends HTMLElement {
  #teardown: Array<() => void> = [];

  connectedCallback(): void {
    const track = this.querySelector<HTMLElement>(".track");
    const viewport = this.querySelector<HTMLElement>(".viewport");
    const status = this.querySelector<HTMLElement>(".carousel-status");
    const dots = [...this.querySelectorAll<HTMLButtonElement>(".dot")];
    if (!track || !viewport) return;

    const slides = [...track.children] as HTMLElement[];
    const n = slides.length;
    if (n === 0) return;

    let i = 0;
    const go = (k: number): void => {
      i = (k + n) % n;
      track.style.transform = `translateX(${-i * 100}%)`;
      for (const [index, dot] of dots.entries()) {
        dot.setAttribute("aria-current", index === i ? "true" : "false");
      }
      for (const [index, slide] of slides.entries()) {
        const off = index !== i;
        slide.toggleAttribute("inert", off);
        slide.setAttribute("aria-hidden", off ? "true" : "false");
      }
      if (status) status.textContent = `${n}枚中${i + 1}枚目`;
    };
    /** Deliberate navigation stops at the ends: the captions are numbered ①②③,
     *  so wrapping from the last step back to the first misreads as progress.
     *  Autoplay still cycles through go(). */
    const step = (delta: number): void => {
      const next = i + delta;
      if (next < 0 || next > n - 1) return;
      go(next);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    let paused = false; // hover / focus
    let surrendered = false; // the visitor took over; autoplay is done
    const start = (): void => {
      if (reduce || surrendered || timer || paused || document.hidden) return;
      timer = window.setInterval(() => go(i + 1), 4000);
    };
    const stop = (): void => {
      window.clearInterval(timer);
      timer = 0;
    };
    /** Hand control over permanently. */
    const surrender = (): void => {
      surrendered = true;
      stop();
    };
    this.#teardown.push(stop);

    const listen = (
      target: EventTarget,
      type: string,
      fn: EventListener,
      opts?: AddEventListenerOptions,
    ): void => {
      target.addEventListener(type, fn, opts);
      this.#teardown.push(() => target.removeEventListener(type, fn, opts));
    };

    for (const [index, dot] of dots.entries()) {
      listen(dot, "click", () => {
        surrender();
        go(index);
      });
    }

    // ←/→ while focus is inside (the dots are the focusable entry point).
    listen(this, "keydown", (event) => {
      const key = (event as KeyboardEvent).key;
      const delta = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
      if (delta === 0 && key !== "Home" && key !== "End") return;
      event.preventDefault();
      surrender();
      if (key === "Home") go(0);
      else if (key === "End") go(n - 1);
      else step(delta);
    });

    // Drag / swipe. touch-action: pan-y (see .carousel .viewport) leaves vertical
    // scrolling to the browser, so only the horizontal axis reaches us; we still
    // wait until the gesture is clearly horizontal before claiming it.
    const THRESHOLD = 0.18; // of the viewport width, to commit to a slide change
    const CLAIM = 10; // px of horizontal travel before this counts as a drag
    let pointer = -1;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dragging = false;

    const settle = (): void => {
      pointer = -1;
      dragging = false;
      dx = 0;
      track.classList.remove("is-dragging");
      track.style.transform = `translateX(${-i * 100}%)`;
    };

    listen(viewport, "pointerdown", (event) => {
      const e = event as PointerEvent;
      if (e.button !== 0 || pointer !== -1) return;
      pointer = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
    });

    listen(viewport, "pointermove", (event) => {
      const e = event as PointerEvent;
      if (e.pointerId !== pointer) return;
      dx = e.clientX - startX;
      if (!dragging) {
        // Let a mostly-vertical gesture go: it belongs to the page scroll.
        if (Math.abs(dx) < CLAIM) return;
        if (Math.abs(dx) <= Math.abs(e.clientY - startY)) {
          pointer = -1;
          return;
        }
        dragging = true;
        surrender();
        track.classList.add("is-dragging");
        viewport.setPointerCapture(pointer);
      }
      // Follow the finger, resisting at the two ends so they feel like ends.
      const w = viewport.clientWidth || 1;
      const atEdge = (dx > 0 && i === 0) || (dx < 0 && i === n - 1);
      const travel = (dx / w) * 100 * (atEdge ? 0.35 : 1);
      track.style.transform = `translateX(${-i * 100 + travel}%)`;
    });

    const release = (event: Event): void => {
      const e = event as PointerEvent;
      if (e.pointerId !== pointer) return;
      const w = viewport.clientWidth || 1;
      const moved = dx;
      const wasDragging = dragging;
      settle();
      if (!wasDragging) return;
      if (Math.abs(moved) > w * THRESHOLD) step(moved < 0 ? 1 : -1);
    };
    listen(viewport, "pointerup", release);
    listen(viewport, "pointercancel", release);

    // A committed drag must not also fire the click on the dot underneath.
    listen(viewport, "click", (event) => {
      if (Math.abs(dx) > CLAIM) event.preventDefault();
    });
    listen(viewport, "dragstart", (event) => event.preventDefault());

    listen(this, "pointerenter", () => {
      paused = true;
      stop();
    });
    listen(this, "pointerleave", () => {
      paused = false;
      start();
    });
    listen(this, "focusin", () => {
      paused = true;
      stop();
    });
    listen(this, "focusout", () => {
      paused = false;
      start();
    });
    listen(document, "visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    go(0);
    start();
  }

  disconnectedCallback(): void {
    for (const off of this.#teardown) off();
    this.#teardown = [];
  }
}

customElements.define("gohan-carousel", GohanCarousel);
