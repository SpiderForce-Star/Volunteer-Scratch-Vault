import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createPortalSession, getBillingSummary } from "@/lib/billing";
import { isNativeApp } from "@/lib/native";
import {
  getNativeAccess,
  manageNativeSubscription,
  restoreNativePurchases,
  type NativeAccess,
} from "@/lib/iap";
import {
  formatBillingDate,
  planLabel,
  subscriptionStatusCopy,
  type BillingSummary,
} from "@/lib/subscription";
import { publicPortalMessage } from "@/lib/stripe-errors";
import {
  deskNotifyEnabled,
  enableDeskNotifications,
} from "@/lib/desk-alert";
import { TRIAL_CTA } from "@/components/trial-cta";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () =>
    pageHead({
      title: "Account",
      path: "/account",
      noindex: true,
    }),
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const native = isNativeApp();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [nativeAccess, setNativeAccess] = useState<NativeAccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"portal" | "restore" | "manage" | "notify" | null>(
    null,
  );
  const [notifyOn, setNotifyOn] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (native) {
      void getNativeAccess()
        .then(setNativeAccess)
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Could not load purchases.");
        });
    }
    setNotifyOn(deskNotifyEnabled());
    if (user && !user.isDevFallback) {
      void getBillingSummary()
        .then(setSummary)
        .catch((err) => {
          if (!native) {
            setError(err instanceof Error ? err.message : "Could not load billing.");
          }
        });
    }
  }, [user, isPending, native]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted">
        Loading account…
      </div>
    );
  }

  if (!native && !user) {
    return <Navigate to="/login" search={{ next: "/account" }} />;
  }

  const paid =
    user?.isDevFallback ||
    Boolean(nativeAccess?.paid) ||
    Boolean(summary?.paid);
  const status = nativeAccess?.paid
    ? nativeAccess.status
    : user?.isDevFallback
      ? "active"
      : summary?.status;
  const plan = nativeAccess?.paid
    ? nativeAccess.plan
    : user?.isDevFallback
      ? "monthly"
      : summary?.plan;
  const trialEnd = nativeAccess?.paid
    ? nativeAccess.trialEnd
    : summary?.trialEnd;
  const periodEnd = nativeAccess?.paid
    ? nativeAccess.currentPeriodEnd
    : summary?.currentPeriodEnd;

  const openPortal = async () => {
    setBusy("portal");
    setError(null);
    try {
      const result = await createPortalSession();
      if (result.url) window.location.href = result.url;
    } catch (err) {
      setError(
        err instanceof Error && err.message.startsWith("No billing customer")
          ? err.message
          : publicPortalMessage(err),
      );
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy("restore");
    setError(null);
    try {
      const access = await restoreNativePurchases();
      setNativeAccess(access);
      if (!access.paid) {
        setError("No active Full Access purchase was found for this store account.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setBusy(null);
    }
  };

  const manage = async () => {
    setBusy("manage");
    setError(null);
    try {
      await manageNativeSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open subscription settings.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
        Account
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Your desk</h1>
      <p className="mt-2 text-sm text-muted">
        {user
          ? (user.primaryEmail ?? user.displayName ?? "Signed in")
          : "Store account"}
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
            ? `Trial ends ${formatBillingDate(trialEnd ?? periodEnd)}`
            : paid
              ? `Next bill ${formatBillingDate(periodEnd)}`
              : (subscriptionStatusCopy(status) ??
                "Start a free trial to unlock the full remaining-prize desk.")}
        </p>
        {summary?.cancelAtPeriodEnd || (nativeAccess && !nativeAccess.willRenew && nativeAccess.paid) ? (
          <p className="mt-2 text-sm text-warm">
            Cancellation is scheduled. Access stays open through the current period.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          {native ? (
            <>
              {!paid ? (
                <Link
                  to="/pricing"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
                >
                  {TRIAL_CTA}
                </Link>
              ) : null}
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void manage()}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
              >
                {busy === "manage" ? "Opening…" : "Manage subscription"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void restore()}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-muted hover:text-fg disabled:opacity-60"
              >
                {busy === "restore" ? "Restoring…" : "Restore purchases"}
              </button>
            </>
          ) : paid && summary?.hasCustomer ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void openPortal()}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
            >
              {busy === "portal" ? "Opening…" : "Manage billing"}
            </button>
          ) : (
            <Link
              to="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
            >
              {paid ? "View plans" : TRIAL_CTA}
            </Link>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => void signOut("/")}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-muted hover:text-fg"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              search={{ next: "/account" }}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-muted hover:text-fg"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface p-6">
        <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
          Settings
        </p>
        <div className="mt-3 flex flex-col">
          {paid ? (
            <button
              type="button"
              disabled={busy !== null || notifyOn}
              onClick={() => {
                setBusy("notify");
                void enableDeskNotifications()
                  .then((ok) => {
                    setNotifyOn(ok);
                    if (!ok) {
                      setError("Browser did not allow notifications.");
                    }
                  })
                  .finally(() => setBusy(null));
              }}
              className="inline-flex min-h-11 items-center text-left text-sm text-muted underline underline-offset-2 hover:text-fg disabled:no-underline"
            >
              {notifyOn
                ? "Desk alerts enabled in this browser"
                : busy === "notify"
                  ? "Asking permission…"
                  : "Enable desk alerts"}
            </button>
          ) : null}
          <Link
            to="/privacy"
            className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-2 hover:text-fg"
          >
            Privacy
          </Link>
          <Link
            to="/disclaimer"
            className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-2 hover:text-fg"
          >
            Disclaimer & help
          </Link>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-bust">{error}</p> : null}

      <p className="mt-8 text-xs leading-relaxed text-faint">
        Remaining counts do not improve the odds of winning any prize. 18+ only.
        Independent information tool, not affiliated with any state lottery.
      </p>
    </div>
  );
}
