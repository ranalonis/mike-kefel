import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates the app icons from public/icon.svg:  npm run icons
const sky = "#D8E9FB";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0.05, resizeOptions: { background: sky } },
    // Android crops maskable icons to a circle; keep the ears inside the safe zone
    maskable: { ...minimal2023Preset.maskable, padding: 0.32, resizeOptions: { background: sky } },
    apple: { ...minimal2023Preset.apple, padding: 0.15, resizeOptions: { background: sky } },
  },
  images: ["public/icon.svg"],
});
