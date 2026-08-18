/**
 * Published Stripe Price IDs. Safe to import from client code.
 * Secret keys live only in stripe.server.ts / env.
 *
 * These fallbacks are the sandbox (test) prices used for local/dev.
 * Production MUST set STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL to live
 * price IDs. Live keys refuse to check out against these sandbox IDs.
 */
export const STRIPE_PRICES = {
  monthly: "price_1U4uLH2OSSYBR9Vqdc9ZrFN2",
  annual: "price_1U4uLH2OSSYBR9VqEfITU1IV",
} as const;

export type Plan = keyof typeof STRIPE_PRICES;

export const SANDBOX_STRIPE_PRICES = STRIPE_PRICES;
