import { defineConfig } from "vite";

import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [VitePWA({ registerType: "autoUpdate" }) , tsconfigPaths()],
});