import { createServerFn } from "@tanstack/react-start";
import { getStripe, STRIPE_PRICES, type Plan } from "./stripe.server";

export const createCheckoutSession = createServerFn({ method: "POST" })
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
  .handler(async ({ data }) => {
    const stripe = getStripe();
    const priceId = STRIPE_PRICES[data.plan];

    const origin =
      process.env.BETTER_AUTH_URL ||
      process.env.VITE_APP_URL ||
      "https://volunteer-scratch-vault.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          plan: data.plan,
        },
      },
      metadata: {
        plan: data.plan,
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }

    return { url: session.url };
  });
