import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "מייק-כפל",
        short_name: "מייק-כפל",
        description: "תרגול לוח הכפל",
        lang: "he",
        dir: "rtl",
        start_url: "/",
        display: "standalone",
        background_color: "#D8E9FB",
        theme_color: "#B8461F",
        // TODO (PWA step): add PNG icons 192/512 + maskable
        icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      workbox: {
        // cache everything the app needs, including fonts and photos, so it works fully offline
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
