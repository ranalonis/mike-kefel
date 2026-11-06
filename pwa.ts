import { registerSW } from "virtual:pwa-register";

const CHECK_EVERY_MS = 60 * 60 * 1000; // an installed app may stay open for days

let updateReady = false;
let safeNow = false;
let applyUpdate: ((reload?: boolean) => Promise<void>) | undefined;

function maybeApply(): void {
  if (updateReady && safeNow) {
    updateReady = false;
    void applyUpdate?.(true); // activates the new service worker and reloads
  }
}

/**
 * Registers the service worker. A new version is downloaded in the background and switched in
 * only while the home screen is showing, never in the middle of a round.
 */
export function registerPwa(): void {
  if (!("serviceWorker" in navigator)) return;
  applyUpdate = registerSW({
    onNeedRefresh() {
      updateReady = true;
      maybeApply();
    },
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => void registration.update(), CHECK_EVERY_MS);
    },
  });
}

/** Called by the router: true while a screen where reloading is harmless (home) is showing. */
export function setUpdateSafe(safe: boolean): void {
  safeNow = safe;
  maybeApply();
}

/** Ask the browser not to evict our data under storage pressure (history lives only here for now). */
export function requestPersistentStorage(): void {
  void navigator.storage?.persist?.().catch(() => {});
}
