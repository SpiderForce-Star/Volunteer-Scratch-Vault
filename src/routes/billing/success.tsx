import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { syncCheckoutSession } from "@/lib/billing";

export const Route = createFileRoute("/billing/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : "",
  }),
  component: SuccessPage,
  head: () => ({
    meta: [{ title: "You’re in · Volunteer Scratch Vault" }],
  }),
});

function SuccessPage() {
  const { session_id: sessionId } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [status, setStatus] = useState<"idle" | "saving" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !user || !sessionId || user.isDevFallback) {
      if (!isPending && user && !sessionId) setStatus("ready");
      return;
    }
    setStatus("saving");
    void syncCheckoutSession({ data: { sessionId } })
      .then(() => setStatus("ready"))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not confirm billing.");
        setStatus("error");
      });
  }, [user, isPending, sessionId]);

  if (!isPending && !user) {
    return <Navigate to="/login" search={{ next: "/billing/success" }} />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl tracking-tight">
        You’re in. Welcome to the full desk.
      </h1>
      <p className="mt-4 text-muted">
        {status === "saving"
          ? "Confirming your 30-day trial…"
          : "Your 30-day free trial has started. You now have complete access to every ranking, heat score, and remaining-prize view."}
      </p>
      {error ? <p className="mt-4 text-sm text-bust">{error}</p> : null}
      <Link
        to="/"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-fg"
      >
        Go to the desk
      </Link>
      <p className="mt-10 text-xs text-faint">
        Manage or cancel anytime from{" "}
        <Link to="/account" className="underline underline-offset-2">
          your account
        </Link>
        .
      </p>
    </div>
  );
}
