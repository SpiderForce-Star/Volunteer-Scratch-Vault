import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Store binaries ship with bundled web assets (webDir) and NO remote
 * server.url — Apple/Google review the binary, not a live website.
 *
 * Live-reload against `npm run dev` only when CAP_LIVE_RELOAD=1.
 */
const liveReload = process.env.CAP_LIVE_RELOAD === "1";
const liveUrl = process.env.CAP_DEV_URL?.trim() || "http://localhost:8080";

const config: CapacitorConfig = {
  appId: "com.webbspinnervisions.volunteerscratchvault",
  appName: "Volunteer Scratch Vault",
  webDir: "dist",
  backgroundColor: "#0a0a0b",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Volunteer Scratch Vault",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0a0a0b",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      launchAutoHide: true,
      backgroundColor: "#0a0a0b",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0b",
    },
  },
};

if (liveReload) {
  config.server = {
    url: liveUrl,
    cleartext: true,
  };
}

export default config;
