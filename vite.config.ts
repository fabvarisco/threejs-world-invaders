import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@GameObjects": path.resolve(__dirname, "./src/assets/gameObjects"),
      "@Prefabs": path.resolve(__dirname, "./src/assets/prefabs"),
      "@Game": path.resolve(__dirname, "./src/game"),
      "@Assets": path.resolve(__dirname, "./src/assets"),
      "@Utils": path.resolve(__dirname, "./src/utils.ts"),
    },
  },
  plugins: [VitePWA({ registerType: "autoUpdate" })],
  build: {
    rollupOptions: {
      external: (id) => id.startsWith("@"),
    },
  },
});
