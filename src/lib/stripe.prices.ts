/**
 * Published Stripe Price IDs. Safe to import from client code.
 * Secret keys live only in stripe.server.ts / env.
 *
 * STRIPE_PRICES are the live Full Access prices (copied Aug 2026).
 * SANDBOX_STRIPE_PRICES stay for local/dev when using sk_test_ keys.
 * Live keys refuse sandbox IDs; test keys refuse live IDs.
 */
export const STRIPE_PRICES = {
  monthly: "price_1U5t25RpUVJitDggbykPkMzh",
  annual: "price_1U5t25RpUVJitDggtSQ4Qfws",
} as const;

export const SANDBOX_STRIPE_PRICES = {
  monthly: "price_1U4uLH2OSSYBR9Vqdc9ZrFN2",
  annual: "price_1U4uLH2OSSYBR9VqEfITU1IV",
} as const;

export type Plan = keyof typeof STRIPE_PRICES;
