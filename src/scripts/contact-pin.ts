/** Publishes the contact sheet's own height as --access-h so the sticky pin can
 *  switch from top-pinning to bottom-pinning when the card is taller than the
 *  viewport (see the .access sticky rule in global.css). offsetHeight is
 *  unaffected by the sticky offset, so this stays the flow height even while the
 *  sheet is stuck. ResizeObserver covers font loading, resize and orientation. */
const access = document.querySelector<HTMLElement>(".access");

if (access) {
  const publish = (): void => {
    document.documentElement.style.setProperty("--access-h", `${access.offsetHeight}px`);
  };
  publish();
  new ResizeObserver(publish).observe(access);
}
