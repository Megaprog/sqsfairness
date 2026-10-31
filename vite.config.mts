import { defineConfig } from "vite";

export default defineConfig({
  root: "player",
  base: "/sqsfairness/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
