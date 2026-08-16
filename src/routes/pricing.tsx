import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createCheckoutSession } from "@/lib/billing";
import { TRIAL_CTA } from "@/components/trial-cta";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAccess } from "@/lib/use-access";
import { isNativeApp } from "@/lib/native";
import { purchasePlan, restoreNativePurchases } from "@/lib/iap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/pricing")({
  validateSearch: (search: Record<string, unknown>): { canceled?: boolean } => {
    if (search.canceled === "1" || search.canceled === true) return { canceled: true };
    return {};
  },
  component: PricingPage,
  head: () =>
    pageHead({
      title: "Pricing",
      description:
        "Full Tennessee remaining-prize desk. $4.99/month or $49.99/year with a 1-month free trial. Cancel anytime. 18+. Independent of the Lottery.",
      path: "/pricing",
    }),
});

function PricingPage() {
  const { canceled } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const { paid, isPending: accessPending } = useAccess();
  const [loading, setLoading] = useState<"monthly" | "annual" | "restore" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const native = isNativeApp();

  const startCheckout = async (plan: "monthly" | "annual") => {
    if (isPending || accessPending) return;
    setLoading(plan);
    setError(null);
    try {
      if (native) {
        const access = await purchasePlan(plan);
        if (access.paid) {
          window.location.href = "/";
          return;
        }
        setError("Purchase finished but Full Access is not active yet. Try Restore purchases.");
        setLoading(null);
        return;
      }
      if (!user) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }
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
      if (message === "Purchase canceled.") {
        setLoading(null);
        return;
      }
      console.error(err);
      setError(message);
      setLoading(null);
    }
  };

  const restore = async () => {
    setLoading("restore");
    setError(null);
    try {
      const access = await restoreNativePurchases();
      if (access.paid) {
        window.location.href = "/";
        return;
      }
      setError("No active Full Access purchase was found for this store account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
    } finally {
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
          Full remaining-prize rankings, mid-tier leaders, the skip list, and
          radar alerts when new official counts hit the desk. Start with a
          30-day free trial. Cancel anytime.
        </p>
      </div>

      {canceled ? (
        <p className="mt-6 text-center text-sm text-warm">
          Checkout was canceled. You can start the trial whenever you are ready.
        </p>
      ) : null}

      {native ? (
        <p className="mt-6 text-center text-sm text-muted">
          Full Access is $4.99/month or $49.99/year with a free trial, billed
          through the App Store or Google Play.
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
        <div className="rounded-xl border border-gold bg-surface p-6 ring-1 ring-gold/30 sm:order-2">
          <p className="font-mono text-xs tracking-wide text-gold uppercase">
            Annual · Best value · save ~$10
          </p>
          <p className="mt-2 font-display text-3xl">
            $49.99<span className="text-lg text-muted">/year</span>
          </p>
          <p className="mt-1 text-sm text-muted">1-month free trial</p>
          <button
            type="button"
            disabled={loading !== null || paid}
            onClick={() => startCheckout("annual")}
            className="mt-8 flex min-h-12 w-full items-center justify-center rounded-md bg-gold px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {loading === "annual" ? "Starting trial…" : TRIAL_CTA}
          </button>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 sm:order-1">
          <p className="font-mono text-xs tracking-wide text-faint uppercase">
            Monthly
          </p>
          <p className="mt-2 font-display text-3xl">
            $4.99<span className="text-lg text-muted">/mo</span>
          </p>
          <p className="mt-1 text-sm text-muted">1-month free trial</p>
          <button
            type="button"
            disabled={loading !== null || paid}
            onClick={() => startCheckout("monthly")}
            className="mt-8 flex min-h-12 w-full items-center justify-center rounded-md border border-line px-4 text-sm text-paper disabled:opacity-60"
          >
            {loading === "monthly" ? "Starting trial…" : TRIAL_CTA}
          </button>
        </div>
      </div>

      <ul className="mx-auto mt-8 max-w-md space-y-1 text-center text-sm text-muted">
        <li>Full heat desk</li>
        <li>Skip / bust list</li>
        <li>Radar when new counts drop</li>
      </ul>

      {error && (
        <p className="mt-6 text-center text-sm text-bust">{error}</p>
      )}

      <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-faint">
        By starting a trial you agree to the{" "}
        <Link to="/terms" className="underline underline-offset-2 hover:text-fg">
          Terms
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy"
          className="underline underline-offset-2 hover:text-fg"
        >
          Privacy Policy
        </Link>
        . 18+ only.
      </p>

      {native ? (
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void restore()}
          className="mx-auto mt-6 flex min-h-11 items-center justify-center text-sm text-muted underline underline-offset-2 hover:text-fg disabled:opacity-60"
        >
          {loading === "restore" ? "Restoring…" : "Restore purchases"}
        </button>
      ) : null}

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
              Yes. On the website, use Manage billing. In the iOS or Android
              app, use Manage subscription to open the App Store or Google Play
              subscription page. Access stays open through the paid or trial
              period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="includes">
            <AccordionTrigger>What does full access include?</AccordionTrigger>
            <AccordionContent>
              The official three-tier remaining-prize table, mid-tier leaders,
              the skip/bust list, heat scores, game-by-game remaining top
              and mid counts, and radar alerts when new remaining-prize data
              is ready to review. The free homepage still shows a teaser desk
              and the legal disclaimer.
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
