import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createCheckoutSession } from "@/lib/billing";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAccess } from "@/lib/use-access";
import { isNativeApp } from "@/lib/native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/pricing")({
  validateSearch: (search: Record<string, unknown>): { canceled?: boolean } => {
    if (search.canceled === "1" || search.canceled === true) return { canceled: true };
    return {};
  },
  component: PricingPage,
  head: () => ({
    meta: [{ title: "Pricing · Volunteer Scratch Vault" }],
  }),
});

function PricingPage() {
  const { canceled } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const { paid } = useAccess();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (plan: "monthly" | "annual") => {
    if (isPending) return;
    if (isNativeApp()) {
      setError(
        "Full Access on iOS and Android is sold through the App Store and Google Play, not Stripe.",
      );
      return;
    }
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
      return;
    }
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
      const message = err instanceof Error ? err.message : "Something went wrong starting checkout.";
      if (message === "Unauthorized") {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }
      console.error(err);
      setError(message);
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
          Full remaining-prize rankings, mid-tier leaders, and the skip list.
          Start with a 30-day free trial. Cancel anytime.
        </p>
      </div>

      {canceled ? (
        <p className="mt-6 text-center text-sm text-warm">
          Checkout was canceled. You can start the trial whenever you are ready.
        </p>
      ) : null}

      {isNativeApp() ? (
        <p className="mt-6 text-center text-sm text-muted">
          On iOS and Android, Full Access is $4.99/month or $49.99/year with a
          1-month free trial through the App Store or Google Play. Stripe
          checkout stays on the website.
        </p>
      ) : null}

      {paid ? (
        <p className="mt-6 text-center text-sm text-hot">
          Your desk is already unlocked.{" "}
          <Link to="/account" className="underline underline-offset-2">
            Manage billing
          </Link>
        </p>
      ) : null}

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="font-mono text-xs tracking-wide text-faint uppercase">
            Monthly
          </p>
          <p className="mt-2 font-display text-3xl">
            $4.99<span className="text-lg text-muted">/mo</span>
          </p>
          <p className="mt-1 text-sm text-muted">30-day free trial included</p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>Full heat rankings</li>
            <li>Official three-tier remaining counts</li>
            <li>Mid-tier leaders and skip list</li>
            <li>Cancel anytime</li>
          </ul>
          <button
            type="button"
            disabled={loading !== null || paid || isNativeApp()}
            onClick={() => startCheckout("monthly")}
            className="mt-8 flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {isNativeApp()
              ? "App Store / Play Billing next"
              : loading === "monthly"
                ? "Starting trial…"
                : "Start 30-day free trial"}
          </button>
        </div>

        <div className="rounded-xl border border-accent bg-surface p-6 ring-1 ring-accent/30">
          <p className="font-mono text-xs tracking-wide text-faint uppercase">
            Annual · Best value · save ~$10
          </p>
          <p className="mt-2 font-display text-3xl">
            $49.99<span className="text-lg text-muted">/year</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Save ~$10 vs monthly · same 30-day free trial
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>Everything in Monthly</li>
            <li>Lower yearly cost</li>
            <li>Same 30-day free trial</li>
            <li>Cancel anytime</li>
          </ul>
          <button
            type="button"
            disabled={loading !== null || paid || isNativeApp()}
            onClick={() => startCheckout("annual")}
            className="mt-8 flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {isNativeApp()
              ? "App Store / Play Billing next"
              : loading === "annual"
                ? "Starting trial…"
                : "Start free trial · Annual"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-bust">{error}</p>
      )}

      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="font-display text-2xl tracking-tight">Pricing FAQ</h2>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="trial">
            <AccordionTrigger>How long is the free trial?</AccordionTrigger>
            <AccordionContent>
              30 days. You can cancel anytime before it ends and you will not be
              charged. Trial access is full access.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancel">
            <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
            <AccordionContent>
              Yes. Use Manage billing on your account page to cancel or switch
              monthly and annual. Access stays open through the paid (or trial)
              period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="includes">
            <AccordionTrigger>What does full access include?</AccordionTrigger>
            <AccordionContent>
              The official three-tier remaining-prize table, mid-tier leaders,
              the skip/bust list, heat scores, and game-by-game remaining top
              and mid counts. The free homepage still shows a teaser desk and
              the legal disclaimer.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="lottery">
            <AccordionTrigger>
              Is this affiliated with the Tennessee Lottery?
            </AccordionTrigger>
            <AccordionContent>
              No. Volunteer Scratch Vault is an independent information product
              of Webb Spinner Visions. It is not affiliated with, endorsed by,
              or connected to the Tennessee Education Lottery Corporation.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="age">
            <AccordionTrigger>Do I have to be 18?</AccordionTrigger>
            <AccordionContent>
              Yes. Tennessee Lottery tickets are 18+. Remaining counts do not
              improve the odds of winning any prize. This tool does not sell
              tickets.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <p className="mt-10 text-center text-xs text-faint">
        18+ only. This is an independent information tool, not affiliated with the
        Tennessee Lottery. Remaining counts do not improve your odds. Play
        responsibly.
      </p>
    </div>
  );
}
