import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/billing/success")({
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl tracking-tight">
        You’re in. Welcome to the full desk.
      </h1>
      <p className="mt-4 text-muted">
        Your 1-month free trial has started. You now have complete access to every
        ranking, heat score, and remaining-prize view.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-fg"
      >
        Go to the desk
      </Link>
      <p className="mt-10 text-xs text-faint">
        You can manage or cancel your subscription anytime from the Stripe Customer
        Portal (link coming soon).
      </p>
    </div>
  );
}
