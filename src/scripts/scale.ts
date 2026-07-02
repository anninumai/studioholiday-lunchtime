/** The design is authored at a fixed 1440px width and scaled to the viewport
 *  with `transform: scale()`. This factor converts real px <-> design px.
 *  Uses clientWidth (excludes the scrollbar) so the scaled page fills exactly. */
export const designScale = (): number => document.documentElement.clientWidth / 1440;
