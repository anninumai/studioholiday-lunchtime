// Prefix a root-absolute asset path (e.g. "/assets/x.webp") with the configured
// base so it resolves under a GitHub Pages project subpath. No-op when the base
// is "/" (local dev / root deploys). import.meta.env.BASE_URL is injected by Vite
// from astro.config's `base` and always ends with a slash.
const BASE = import.meta.env.BASE_URL;

export const withBase = (path: string): string =>
  `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
