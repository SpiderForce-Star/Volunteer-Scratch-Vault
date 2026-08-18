import { STRIPE_PRICES } from "./stripe.prices";

/** Stripe subscription statuses that unlock the full desk. */
export const PAID_STATUSES = ["trialing", "active"] as const;

export type PaidStatus = (typeof PAID_STATUSES)[number];
export type Plan = "monthly" | "annual";

export type SubscriptionRow = {
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  subscriptionPriceId: string | null;
  subscriptionId: string | null;
  currentPeriodEnd: string | null;
};

export type AccessState = {
  signedIn: boolean;
  paid: boolean;
  email: string | null;
  subscription: SubscriptionRow | null;
};

export type BillingSummary = {
  signedIn: boolean;
  paid: boolean;
  email: string | null;
  plan: Plan | null;
  status: string | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
};

export function isPaidStatus(status: string | null | undefined): boolean {
  return status === "trialing" || status === "active";
}

export function planFromPriceId(
  priceId: string | null | undefined,
  catalog?: { monthly: string; annual: string },
): Plan | null {
  if (!priceId) return null;
  if (priceId === catalog?.monthly || priceId === STRIPE_PRICES.monthly) return "monthly";
  if (priceId === catalog?.annual || priceId === STRIPE_PRICES.annual) return "annual";
  return null;
}

export function planLabel(plan: Plan | null): string {
  if (plan === "annual") return "Annual";
  if (plan === "monthly") return "Monthly";
  return "None";
}

export function formatBillingDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
