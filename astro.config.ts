import tailwindcss from "@tailwindcss/vite";
import { defineConfig, passthroughImageService } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
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
