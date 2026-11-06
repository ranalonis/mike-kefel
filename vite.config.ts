import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json" with { type: "json" };

const buildDate = new Date().toISOString().slice(0, 10);

const SKY = "#D8E9FB";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(`${pkg.version} · ${buildDate}`),
  },
  plugins: [
    VitePWA({
      // New versions wait until the home screen (see src/pwa.ts) so a round is never interrupted.
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        id: "/",
        name: "מייק-כפל",
        short_name: "מייק-כפל",
        description: "תרגול לוח הכפל",
        lang: "he",
        dir: "rtl",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: SKY,
        theme_color: SKY,
        categories: ["education", "kids"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // cache everything the app needs, including fonts and photos, so it works fully offline
        globPatterns: ["**/*.{js,css,html,svg,png,ico,jpg,woff2}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
