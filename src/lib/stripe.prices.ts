/**
 * Published Stripe Price IDs. Safe to import from client code.
 * Secret keys live only in stripe.server.ts / env.
 */
export const STRIPE_PRICES = {
  monthly: "price_1U4uLH2OSSYBR9Vqdc9ZrFN2",
  annual: "price_1U4uLH2OSSYBR9VqEfITU1IV",
} as const;

export type Plan = keyof typeof STRIPE_PRICES;
