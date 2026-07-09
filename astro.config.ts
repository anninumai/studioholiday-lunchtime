import tailwindcss from "@tailwindcss/vite";
import { defineConfig, passthroughImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
  // Base path for the GitHub Pages project site (served under /<repo>/). Set via
  // BASE_PATH at build time so local dev stays at "/". Consumed everywhere via
  // import.meta.env.BASE_URL (see src/lib/withBase.ts).
  base: process.env.BASE_PATH ?? "/",
  // Production domain for absolute canonical / OG URLs (see BaseLayout.astro).
  // Injected at build time via SITE_URL so no placeholder domain can ship; when
  // unset, canonical is omitted and og:image falls back to a relative path.
  site: process.env.SITE_URL,
  // Images are hand pre-optimized (webp) and the layout is fixed-pixel, so we
  // skip Sharp entirely (also avoids the Bun + Sharp native-module conflict).
  image: { service: passthroughImageService() },
  // Tailwind CSS v4 via the official Vite plugin (not @astrojs/tailwind).
  vite: { plugins: [tailwindcss()] },
});
