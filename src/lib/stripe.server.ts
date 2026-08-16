import Stripe from "stripe";
import { STRIPE_PRICES as PUBLISHED_PRICES, type Plan } from "./stripe.prices";

export type { Plan };

/**
 * Server-only Stripe client.
 * Uses the Secret key from environment variables.
 */
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY?.trim() || PUBLISHED_PRICES.monthly,
  annual: process.env.STRIPE_PRICE_ANNUAL?.trim() || PUBLISHED_PRICES.annual,
} as const;

export function appOrigin(): string {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.VITE_APP_URL?.trim() ||
    "https://volunteer-scratch-vault.vercel.app"
  );
}

export function requestOrigin(request?: Request | null): string {
  if (request) {
    try {
      const url = new URL(request.url);
      const proto =
        request.headers.get("x-forwarded-proto") ??
        url.protocol.replace(":", "") ??
        "https";
      const host =
        request.headers.get("x-forwarded-host") ??
        request.headers.get("host") ??
        url.host;
      if (host) return `${proto}://${host}`;
    } catch {
      /* fall through */
    }
  }
  return appOrigin();
}

export function unixToIso(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}
