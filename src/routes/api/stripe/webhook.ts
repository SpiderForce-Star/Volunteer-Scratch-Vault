import { createFileRoute } from "@tanstack/react-router";
import { handleStripeEvent } from "@/lib/billing";
import { getStripe } from "@/lib/stripe.server";

const METHOD_NOT_ALLOWED = () =>
  new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      GET: METHOD_NOT_ALLOWED,
      HEAD: METHOD_NOT_ALLOWED,
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
          console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set");
          return new Response("Webhook secret is not configured", { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("Missing stripe-signature", { status: 400 });
        }

        const rawBody = await request.text();
        let event;
        try {
          event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
        } catch (err) {
          console.error("[stripe] webhook signature failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          await handleStripeEvent(
            event as unknown as { type: string; data: { object: Record<string, unknown> } },
          );
        } catch (err) {
          console.error("[stripe] webhook handler failed", err);
          return new Response("Webhook handler failed", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
