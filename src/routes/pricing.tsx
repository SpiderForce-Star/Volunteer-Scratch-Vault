import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createCheckoutSession } from "@/lib/billing";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    setError(null);
    try {
      const result = await createCheckoutSession({ data: { plan } });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError("Could not start checkout. Please try again.");
        setLoading(null);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong starting checkout.",
      );
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
          Full access
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          Unlock the complete Tennessee desk
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
          Get every remaining-prize ranking, heat score, and mid-tier alert.
          Start with a 1-month free trial. Cancel anytime.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {/* Monthly */}
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="font-mono text-xs tracking-wide text-faint uppercase">
            Monthly
          </p>
          <p className="mt-2 font-display text-3xl">
            $4.99<span className="text-lg text-muted">/mo</span>
          </p>
          <p className="mt-1 text-sm text-muted">1-month free trial included</p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>✓ Full heat rankings</li>
            <li>✓ All remaining prizes</li>
            <li>✓ Medium & grand heat scores</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => startCheckout("monthly")}
            className="mt-8 flex w-full min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {loading === "monthly" ? "Starting trial…" : "Start 1-month free trial"}
          </button>
        </div>

        {/* Annual */}
        <div className="rounded-xl border border-accent bg-surface p-6 ring-1 ring-accent/30">
          <p className="font-mono text-xs tracking-wide text-faint uppercase">
            Annual · best value
          </p>
          <p className="mt-2 font-display text-3xl">
            $49.99<span className="text-lg text-muted">/year</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Save ~$10 vs monthly · 1-month free trial
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>✓ Everything in Monthly</li>
            <li>✓ Lower yearly cost</li>
            <li>✓ Same 30-day free trial</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => startCheckout("annual")}
            className="mt-8 flex w-full min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {loading === "annual" ? "Starting trial…" : "Start free trial · Annual"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-500">{error}</p>
      )}

      <p className="mt-10 text-center text-xs text-faint">
        18+ only. This is an independent information tool, not affiliated with the
        Tennessee Lottery. Most players lose money. Play responsibly.
      </p>
    </div>
  );
}
