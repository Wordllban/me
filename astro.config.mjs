// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Astro 7 defaults to "jsx", which drops line-break spaces before inline tags
  compressHTML: true,
  vite: {
    // Cast avoids a types-only clash between Astro's bundled Vite and the one
    // @tailwindcss/vite is built against; runtime is unaffected.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
