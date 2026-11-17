// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Astro 7 defaults to "jsx", which drops line-break spaces before inline tags
  compressHTML: true,
  fonts: [
    {
      name: "Spectral",
      cssVariable: "--font-spectral",
      provider: fontProviders.google(),
      weights: [400, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["serif"],
    },
    {
      name: "EB Garamond",
      cssVariable: "--font-eb-garamond",
      provider: fontProviders.google(),
      weights: ["400 600"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.google(),
      weights: ["400 600"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
  vite: {
    // Cast avoids a types-only clash between Astro's bundled Vite and the one
    // @tailwindcss/vite is built against; runtime is unaffected.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
