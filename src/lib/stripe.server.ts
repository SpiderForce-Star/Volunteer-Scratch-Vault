import Stripe from "stripe";

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
    apiVersion: "2025-02-24.acacia", // update if needed when package is installed
    typescript: true,
  });
}

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "price_1U4uLH2OSSYBR9Vqdc9ZrFN2",
  annual: process.env.STRIPE_PRICE_ANNUAL || "price_1U4uLH2OSSYBR9VqEfITU1IV",
} as const;

export type Plan = keyof typeof STRIPE_PRICES;
