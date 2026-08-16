import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { optionalAuthMiddleware } from "./auth/optional";
import { isPaidStatus, type AccessState, type BillingSummary } from "./subscription";
import type { Plan } from "./stripe.prices";

export type { AccessState, BillingSummary, Plan };

export const getAccessState = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(async ({ context }): Promise<AccessState> => {
    if (!context.userId) {
      return { signedIn: false, paid: false, email: null, subscription: null };
    }
    const { loadUserBilling, accessFromRow } = await import("./subscription.server");
    const row = await loadUserBilling(context.userId);
    const access = accessFromRow(row, context.email);
    return {
      signedIn: true,
      paid: access.paid,
      email: access.email,
      subscription: access.subscription,
    };
  });

export const getBillingSummary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<BillingSummary> => {
    const { buildBillingSummary } = await import("./subscription.server");
    return buildBillingSummary(context.userId, null);
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid payload");
    }
    const plan = (data as { plan?: string }).plan;
    if (plan !== "monthly" && plan !== "annual") {
      throw new Error("plan must be 'monthly' or 'annual'");
    }
    return { plan: plan as Plan };
  })
  .handler(async ({ data, context }) => {
    const { getStripe, STRIPE_PRICES, requestOrigin } = await import("./stripe.server");
    const { loadUserBilling } = await import("./subscription.server");
    const { getRequest } = await import("@tanstack/react-start/server");

    const stripe = getStripe();
    const priceId = STRIPE_PRICES[data.plan];
    const row = await loadUserBilling(context.userId);

    if (isPaidStatus(row?.subscriptionStatus)) {
      return { url: "/account", alreadySubscribed: true as const };
    }

    const origin = requestOrigin(getRequest());

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      client_reference_id: context.userId,
      customer: row?.stripeCustomerId || undefined,
      customer_email: row?.stripeCustomerId ? undefined : (row?.email ?? undefined),
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          plan: data.plan,
          userId: context.userId,
        },
      },
      metadata: {
        plan: data.plan,
        userId: context.userId,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }

    return { url: session.url, alreadySubscribed: false as const };
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getStripe, requestOrigin } = await import("./stripe.server");
    const { loadUserBilling } = await import("./subscription.server");
    const { getRequest } = await import("@tanstack/react-start/server");

    const row = await loadUserBilling(context.userId);
    if (!row?.stripeCustomerId) {
      throw new Error("No billing customer on this account yet.");
    }
    const stripe = getStripe();
    const origin = requestOrigin(getRequest());
    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${origin}/account`,
    });
    if (!session.url) {
      throw new Error("Stripe did not return a portal URL");
    }
    return { url: session.url };
  });

export const syncCheckoutSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid payload");
    }
    const sessionId = (data as { sessionId?: string }).sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("sessionId is required");
    }
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      throw new Error("Invalid checkout session");
    }
    return { sessionId };
  })
  .handler(async ({ data, context }) => {
    const { getStripe } = await import("./stripe.server");
    const { persistFromStripeSubscription } = await import("./subscription.server");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ["subscription"],
    });

    const owner = session.client_reference_id || session.metadata?.userId || null;
    if (owner && owner !== context.userId) {
      throw new Error("This checkout session belongs to a different account.");
    }

    const customerId = customerIdOf(session.customer);
    const subRaw = session.subscription;
    const sub =
      typeof subRaw === "string"
        ? await stripe.subscriptions.retrieve(subRaw)
        : subRaw;

    if (!customerId || !sub || typeof sub === "string") {
      throw new Error("Checkout session is missing subscription details.");
    }

    await persistFromStripeSubscription({
      userId: context.userId,
      customerId,
      subscriptionId: sub.id,
      status: sub.status,
      priceId: sub.items.data[0]?.price.id ?? null,
      currentPeriodEnd: periodEndOf(sub),
      trialEnd: sub.trial_end,
    });

    return { ok: true as const, status: sub.status };
  });

function customerIdOf(customer: unknown): string | null {
  if (typeof customer === "string" && customer) return customer;
  if (customer && typeof customer === "object" && "id" in customer) {
    const id = (customer as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function periodEndOf(sub: unknown): number | null {
  if (!sub || typeof sub !== "object") return null;
  const rec = sub as {
    current_period_end?: number;
    trial_end?: number | null;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  return rec.current_period_end ?? rec.items?.data?.[0]?.current_period_end ?? rec.trial_end ?? null;
}

export async function handleStripeEvent(event: {
  type: string;
  data: { object: Record<string, unknown> };
}): Promise<void> {
  const { getStripe } = await import("./stripe.server");
  const { applyStripeSubscriptionObject, persistFromStripeSubscription } =
    await import("./subscription.server");

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      client_reference_id?: string | null;
      metadata?: { userId?: string };
      customer?: unknown;
      subscription?: unknown;
    };
    const userId = session.client_reference_id || session.metadata?.userId || null;
    const customerId = customerIdOf(session.customer);
    const subRef = session.subscription;
    if (!customerId) return;

    const stripe = getStripe();
    const sub =
      typeof subRef === "string"
        ? await stripe.subscriptions.retrieve(subRef)
        : subRef && typeof subRef === "object"
          ? (subRef as Awaited<ReturnType<typeof stripe.subscriptions.retrieve>>)
          : null;
    if (!sub) return;

    await persistFromStripeSubscription({
      userId,
      customerId,
      subscriptionId: sub.id,
      status: sub.status,
      priceId: sub.items.data[0]?.price.id ?? null,
      currentPeriodEnd: periodEndOf(sub),
      trialEnd: sub.trial_end,
    });
    return;
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await applyStripeSubscriptionObject(
      event.data.object as Parameters<typeof applyStripeSubscriptionObject>[0],
    );
    return;
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as {
      customer?: unknown;
      subscription?: unknown;
    };
    const customerId = customerIdOf(invoice.customer);
    const subRef = invoice.subscription;
    if (!customerId) return;
    const stripe = getStripe();
    const sub =
      typeof subRef === "string"
        ? await stripe.subscriptions.retrieve(subRef)
        : null;
    const failedSubId = sub?.id ?? (typeof subRef === "string" ? subRef : null);
    if (!failedSubId) return;
    await persistFromStripeSubscription({
      userId: sub?.metadata?.userId ?? null,
      customerId,
      subscriptionId: failedSubId,
      status: sub?.status ?? "past_due",
      priceId: sub?.items.data[0]?.price.id ?? null,
      currentPeriodEnd: sub ? periodEndOf(sub) : null,
      trialEnd: sub?.trial_end,
    });
  }
}
