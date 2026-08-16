import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createPortalSession, getBillingSummary } from "@/lib/billing";
import {
  formatBillingDate,
  planLabel,
  type BillingSummary,
} from "@/lib/subscription";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [{ title: "Account · Volunteer Scratch Vault" }],
  }),
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  useEffect(() => {
    if (isPending || !user || user.isDevFallback) return;
    void getBillingSummary()
      .then(setSummary)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load billing.");
      });
  }, [user, isPending]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted">
        Loading account…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" search={{ next: "/account" }} />;
  }

  const paid = user.isDevFallback || Boolean(summary?.paid);
  const status = user.isDevFallback ? "active" : summary?.status;
  const plan = user.isDevFallback ? "monthly" : summary?.plan;

  const openPortal = async () => {
    setPortalBusy(true);
    setError(null);
    try {
      const result = await createPortalSession();
      if (result.url) window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal.");
      setPortalBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
        Account
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Your desk</h1>
      <p className="mt-2 text-sm text-muted">
        {user.primaryEmail ?? user.displayName ?? "Signed in"}
      </p>

      <div className="mt-8 rounded-xl border border-line bg-surface p-6">
        <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
          Plan
        </p>
        <p className="mt-2 font-display text-2xl">
          {paid ? planLabel(plan ?? null) : "Locked"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {status === "trialing"
            ? `Trial ends ${formatBillingDate(summary?.trialEnd ?? summary?.currentPeriodEnd)}`
            : paid
              ? `Next bill ${formatBillingDate(summary?.currentPeriodEnd)}`
              : "Start a 30-day trial to unlock the full remaining-prize desk."}
        </p>
        {summary?.cancelAtPeriodEnd ? (
          <p className="mt-2 text-sm text-warm">
            Cancellation is scheduled. Access stays open through the current period.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          {paid && summary?.hasCustomer ? (
            <button
              type="button"
              disabled={portalBusy}
              onClick={() => void openPortal()}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
            >
              {portalBusy ? "Opening…" : "Manage billing"}
            </button>
          ) : (
            <Link
              to="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
            >
              {paid ? "View plans" : "Start 30-day trial"}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOut("/")}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-muted hover:text-fg"
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-bust">{error}</p> : null}

      <p className="mt-8 text-xs leading-relaxed text-faint">
        Remaining counts do not improve the odds of winning any prize. 18+ only.
        Independent information tool, not affiliated with the Tennessee Education
        Lottery Corporation.
      </p>
    </div>
  );
}
