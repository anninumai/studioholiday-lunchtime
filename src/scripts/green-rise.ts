/** Scroll-linked transition from the pink greeting poster into the green contact
 * region. The fixed green cloth grows upward from the viewport bottom, reaching
 * full height when the contact card's bottom arrives at the viewport bottom. */
const section = document.querySelector<HTMLElement>(".message2");
const card = section?.querySelector<HTMLElement>(".card");

if (section && card) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame = 0;

  const render = (): void => {
    frame = 0;
    if (reduce) {
      section.style.setProperty("--green-rise", "1");
      return;
    }

    const viewportHeight = window.innerHeight;
    const sectionTop = section.getBoundingClientRect().top;
    // The stacked mobile card is much taller than the viewport. Using its full
    // height as the reveal distance lets the card outrun the green curtain and
    // appear over the pink section. On mobile, complete the rise in one viewport
    // so green is always behind the card from the moment it enters.
    const mobile = window.matchMedia("(max-width: 540px)").matches;
    const revealDistance = mobile
      ? viewportHeight
      : Math.max(viewportHeight, card.offsetTop + card.offsetHeight);
    const progress = Math.min(
      1,
      Math.max(0, (viewportHeight - sectionTop) / revealDistance),
    );

    section.style.setProperty("--green-rise", progress.toFixed(4));
  };

  const requestRender = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(render);
  };

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  render();
}
