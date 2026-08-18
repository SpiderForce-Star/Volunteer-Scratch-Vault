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

export function stripeSecretMode(): "live" | "test" | "unknown" {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  return "unknown";
}

function envPrice(name: "STRIPE_PRICE_MONTHLY" | "STRIPE_PRICE_ANNUAL"): string {
  return process.env[name]?.trim() ?? "";
}

const SANDBOX_PRICE_IDS = new Set<string>(Object.values(PUBLISHED_PRICES));

/**
 * Resolve monthly/annual Price IDs at call time.
 * Live keys require env price IDs and refuse the committed sandbox fallbacks.
 */
export function getStripePrices(): { monthly: string; annual: string } {
  const monthly = envPrice("STRIPE_PRICE_MONTHLY");
  const annual = envPrice("STRIPE_PRICE_ANNUAL");
  const mode = stripeSecretMode();

  if (mode === "live") {
    if (!monthly || !annual) {
      throw new Error(
        "Live Stripe keys require STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL",
      );
    }
    if (SANDBOX_PRICE_IDS.has(monthly) || SANDBOX_PRICE_IDS.has(annual)) {
      throw new Error("Live Stripe keys cannot use sandbox price IDs");
    }
    return { monthly, annual };
  }

  return {
    monthly: monthly || PUBLISHED_PRICES.monthly,
    annual: annual || PUBLISHED_PRICES.annual,
  };
}

/** Live getters so module-load env timing cannot pin sandbox fallbacks. */
export const STRIPE_PRICES = {
  get monthly() {
    return getStripePrices().monthly;
  },
  get annual() {
    return getStripePrices().annual;
  },
};

export function automaticTaxEnabled(): boolean {
  const raw = process.env.STRIPE_AUTOMATIC_TAX?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function appOrigin(): string {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.VITE_APP_URL?.trim() ||
    "https://volunteer-scratch-vault.vercel.app"
  );
}

function hostOf(value: string): string | null {
  try {
    const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    return url.host.split(":")[0].toLowerCase();
  } catch {
    return null;
  }
}

function allowedHosts(): Set<string> {
  const hosts = new Set<string>(["volunteer-scratch-vault.vercel.app"]);
  for (const raw of [
    process.env.BETTER_AUTH_URL,
    process.env.VITE_APP_URL,
    process.env.ALLOWED_CHECKOUT_HOSTS,
  ]) {
    if (!raw) continue;
    for (const part of raw.split(",")) {
      const host = hostOf(part.trim());
      if (host) hosts.add(host);
    }
  }
  return hosts;
}

/** Checkout return URLs may only point at this app — never a caller-supplied host. */
export function requestOrigin(request?: Request | null): string {
  const fallback = appOrigin();
  if (!request) return fallback;
  try {
    const url = new URL(request.url);
    const forwarded = (
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      url.host
    )
      .split(",")[0]
      .trim();
    const host = hostOf(forwarded);
    if (!host || !allowedHosts().has(host)) return fallback;
    return `https://${host}`;
  } catch {
    return fallback;
  }
}

export function unixToIso(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

export function isStripeCheckoutSessionId(id: string): boolean {
  return /^cs_(test|live)_[A-Za-z0-9]+$/.test(id);
}
