import { defineConfig } from "vite";

import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@Prefabs": path.resolve(__dirname, "./src/assets/prefabs"),
      "@gameObjects": path.resolve(__dirname, "./src/assets/gameObjects"),
      "@Game": path.resolve(__dirname, "./src/game"),
      "@utils": path.resolve(__dirname, "./src/utils.ts"),

    },
  },
  plugins: [VitePWA({ registerType: "autoUpdate" })],
});