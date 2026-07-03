// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    // Cast avoids a types-only clash between Astro's bundled Vite and the one
    // @tailwindcss/vite is built against; runtime is unaffected.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
