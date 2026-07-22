/** Owns the noren cloth: each flap is joined to the band along its top edge and
 *  leans from there (skewX) like hanging fabric. A pointer sweeping across the
 *  cloth (or a tap on touch) imparts velocity to the flaps nearest the cursor;
 *  the flaps are coupled to their neighbours so the disturbance travels across
 *  the cloth like a wave, each has a slightly different natural frequency so they
 *  don't move in lockstep, and every flap springs softly back to rest — so the
 *  cloth is perfectly still when untouched and settles fluidly when let go. The
 *  rAF loop only runs while something is moving (idle = zero CPU). Disabled under
 *  reduced-motion; listeners and the loop are torn down on disconnect. */
class NorenCloth extends HTMLElement {
  #cloth: HTMLElement | null = null;
  #panels: HTMLElement[] = [];
  #angle: number[] = []; // current swing angle (deg) per panel
  #vel: number[] = []; // angular velocity (deg/s) per panel
  #stiff: number[] = []; // per-panel spring stiffness (varied → different frequencies)
  #centers: number[] = []; // panel center X in viewport px (remeasured on resize)
  #raf = 0;
  #prev = -1; // previous frame timestamp (ms); -1 = loop not started
  #lastX: number | null = null; // previous pointer X, for pointer velocity
  #coarsePointer = false;
  #running = false;
  #tapAnimations: Animation[] = [];

  // Responsive cloth tuning. STIFFNESS is the base spring back to rest (per-panel
  // varied in connectedCallback); DAMPING gives a fluid, few-swing settle;
  // COUPLING pulls each flap toward its neighbours so motion propagates as a
  // wave; GAIN maps pointer speed to an angular kick; SIGMA is the gaussian
  // influence half-width (fraction of viewport width) so the sway originates at
  // the cursor; MAX clamps the swing; MAX_DX clamps a single pointer step so a
  // fast jump can't deliver a violent kick.
  static readonly #STIFFNESS = 48;
  static readonly #DAMPING = 6.4;
  static readonly #COUPLING = 18;
  static readonly #GAIN = 0.15;
  static readonly #SIGMA = 0.2;
  static readonly #TAP_KICK = 22;
  static readonly #MAX = 14;
  static readonly #MAX_DX = 60;
  static readonly #REST_EPS = 0.01; // below this angle+velocity a panel is "at rest"

  connectedCallback(): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    this.#cloth = this.querySelector<HTMLElement>(".noren");
    if (!this.#cloth) return;
    this.#panels = Array.from(this.#cloth.querySelectorAll<HTMLElement>(".noren-panel"));
    if (this.#panels.length === 0) return;

    this.#angle = new Array(this.#panels.length).fill(0);
    this.#vel = new Array(this.#panels.length).fill(0);
    // Spread the natural frequencies with a golden-ratio walk (well distributed,
    // non-monotonic) so neighbouring flaps never swing perfectly in sync.
    this.#stiff = this.#panels.map(
      (_, i) => NorenCloth.#STIFFNESS * (0.85 + 0.3 * ((i * 0.618) % 1)),
    );
    this.#centers = new Array(this.#panels.length).fill(0);
    this.#coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.#measure();

    this.#cloth.addEventListener("pointermove", this.#onPointerMove, { passive: true });
    this.#cloth.addEventListener("pointerdown", this.#onPointerDown, { passive: true });
    this.#cloth.addEventListener("pointerleave", this.#onPointerLeave, { passive: true });
    this.#cloth.addEventListener("pointercancel", this.#onPointerLeave, { passive: true });
    window.addEventListener("resize", this.#measure, { passive: true });
  }

  disconnectedCallback(): void {
    this.#cloth?.removeEventListener("pointermove", this.#onPointerMove);
    this.#cloth?.removeEventListener("pointerdown", this.#onPointerDown);
    this.#cloth?.removeEventListener("pointerleave", this.#onPointerLeave);
    this.#cloth?.removeEventListener("pointercancel", this.#onPointerLeave);
    window.removeEventListener("resize", this.#measure);
    for (const animation of this.#tapAnimations) animation.cancel();
    this.#tapAnimations = [];
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#running = false;
  }

  // Cache each panel's viewport-center X once; interaction reads it every move.
  #measure = (): void => {
    for (let i = 0; i < this.#panels.length; i++) {
      // Measure the physical flap rect, not the full-size clipped logo copy inside
      // the group; otherwise transparent logo geometry shifts the hit influence.
      const target = this.#panels[i].querySelector("rect") ?? this.#panels[i];
      const r = target.getBoundingClientRect();
      this.#centers[i] = r.left + r.width / 2;
    }
  };

  // Gaussian falloff of the pointer's influence on panel i (1 at the cursor).
  #influence(x: number, i: number): number {
    const sigmaPx = NorenCloth.#SIGMA * (window.innerWidth || 1);
    const d = (x - this.#centers[i]) / sigmaPx;
    return Math.exp(-d * d);
  }

  #onPointerMove = (e: PointerEvent): void => {
    // Touch uses the compositor-driven tap animation; pointer movement is only
    // needed for mouse and trackpad input.
    if (this.#coarsePointer) return;
    const x = e.clientX;
    // Convert the pointer's horizontal step into an angular kick on the nearest
    // flaps. Clamp the step so a fast jump can't deliver a violent kick.
    if (this.#lastX !== null) {
      const raw = x - this.#lastX;
      const dx = Math.max(-NorenCloth.#MAX_DX, Math.min(NorenCloth.#MAX_DX, raw));
      for (let i = 0; i < this.#panels.length; i++) {
        this.#vel[i] += dx * NorenCloth.#GAIN * this.#influence(x, i);
      }
    }
    this.#lastX = x;
    this.#start();
  };

  #onPointerDown = (e: PointerEvent): void => {
    // Mouse hover already sways via pointermove; only touch/pen "tap" needs a kick.
    if (e.pointerType === "mouse") return;
    if (this.#coarsePointer) {
      this.#playTouchTap(e.clientX);
      return;
    }
    const x = e.clientX;
    for (let i = 0; i < this.#panels.length; i++) {
      // Push panels away from the tap (sign by side) for a symmetric shimmer.
      const dir = this.#centers[i] < x ? -1 : 1;
      this.#vel[i] += dir * NorenCloth.#TAP_KICK * this.#influence(x, i);
    }
    // Seed lastX so a drag right after the tap measures dx from the tap point.
    this.#lastX = e.clientX;
    this.#start();
  };

  // A touch tap uses the browser's animation compositor instead of running the
  // spring integrator on the main thread for every frame. This keeps the same
  // mirrored flap gesture while the large clipped artwork remains smooth.
  #playTouchTap(x: number): void {
    for (const animation of this.#tapAnimations) animation.cancel();
    this.#tapAnimations = [];

    for (let i = 0; i < this.#panels.length; i++) {
      const direction = this.#centers[i] < x ? -1 : 1;
      const peak = direction * (i === 1 ? 5 : 4);
      const animation = this.#panels[i].animate(
        [
          {
            transform: "skewX(0deg)",
            offset: 0,
            easing: "cubic-bezier(.2,.75,.3,1)",
          },
          {
            transform: `skewX(${peak}deg)`,
            offset: 0.3,
            easing: "cubic-bezier(.25,.1,.25,1)",
          },
          { transform: "skewX(0deg)", offset: 1 },
        ],
        {
          duration: 620 + i * 30,
        },
      );
      this.#tapAnimations.push(animation);
    }
  }

  // The pointer left the cloth: forget its position so a later re-entry isn't
  // registered as one huge dx jump.
  #onPointerLeave = (): void => {
    this.#lastX = null;
  };

  #start(): void {
    if (this.#running) return;
    this.#running = true;
    this.#prev = -1;
    this.#raf = requestAnimationFrame(this.#step);
  }

  #step = (t: number): void => {
    if (this.#prev < 0) this.#prev = t;
    // Clamp dt so a backgrounded tab doesn't explode the integrator on return.
    const dt = Math.min((t - this.#prev) / 1000, 1 / 30);
    this.#prev = t;

    const n = this.#panels.length;
    let moving = false;
    for (let i = 0; i < n; i++) {
      // Coupling: pull toward the neighbours' angles so a disturbance travels.
      let couple = 0;
      if (i > 0) couple += this.#angle[i - 1] - this.#angle[i];
      if (i < n - 1) couple += this.#angle[i + 1] - this.#angle[i];
      // Semi-implicit Euler: damped spring back to rest (per-flap stiffness) plus
      // the neighbour coupling.
      const accel =
        -this.#stiff[i] * this.#angle[i] -
        NorenCloth.#DAMPING * this.#vel[i] +
        NorenCloth.#COUPLING * couple;
      this.#vel[i] += accel * dt;
      this.#angle[i] += this.#vel[i] * dt;
      // Clamp the swing and kill velocity at the limit so it can't wind up.
      if (this.#angle[i] > NorenCloth.#MAX) {
        this.#angle[i] = NorenCloth.#MAX;
        this.#vel[i] = 0;
      } else if (this.#angle[i] < -NorenCloth.#MAX) {
        this.#angle[i] = -NorenCloth.#MAX;
        this.#vel[i] = 0;
      }
      // skewX (top-anchored) leans the hem sideways while the top edge stays put.
      this.#panels[i].style.transform = `skewX(${this.#angle[i].toFixed(3)}deg)`;
      if (
        Math.abs(this.#angle[i]) > NorenCloth.#REST_EPS ||
        Math.abs(this.#vel[i]) > NorenCloth.#REST_EPS
      ) {
        moving = true;
      }
    }

    if (moving) {
      this.#raf = requestAnimationFrame(this.#step);
      return;
    }
    // Fully settled: snap to rest, drop inline transforms, and stop the loop.
    for (const p of this.#panels) p.style.transform = "";
    this.#running = false;
    this.#raf = 0;
    // NB: do NOT clear #lastX here. Pointermoves arrive one per frame and the
    // loop settles in between; nulling lastX would make every move skip its dx,
    // so velocity — and the sway — would never build. It is cleared only when the
    // pointer actually leaves (pointerleave/pointercancel).
  };
}

customElements.define("noren-cloth", NorenCloth);
