import { designScale } from "./scale";

/** Scales the fixed 1440px `.page` to fill the viewport width (full-bleed) using
 *  `transform: scale()` — standard and consistent across browsers (unlike the
 *  non-standard CSS `zoom`). The wrapper's height is set to the scaled height so
 *  the document scrolls correctly (transform does not change layout size). */
class ZoomFit extends HTMLElement {
  connectedCallback(): void {
    const page = this.querySelector<HTMLElement>(".page");
    if (!page) return;
    const fit = (): void => {
      const s = designScale();
      page.style.transform = `scale(${s})`;
      this.style.height = `${page.offsetHeight * s}px`;
    };
    window.addEventListener("resize", fit);
    fit();
  }
}

customElements.define("zoom-fit", ZoomFit);
