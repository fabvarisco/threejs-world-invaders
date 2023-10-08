import { defineConfig } from "vite";

import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@Assets": path.resolve(__dirname, "./src/Assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@Overlay": path.resolve(__dirname, "./src/Overlay"),
    },
  },
  plugins: [VitePWA({ registerType: "autoUpdate" })],
});
