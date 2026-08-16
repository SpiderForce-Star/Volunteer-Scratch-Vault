import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pageHead } from "@/lib/site";

function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: safeNext(search.next),
  }),
  component: LoginPage,
  head: () =>
    pageHead({
      title: "Sign in",
      path: "/login",
      noindex: true,
    }),
});

function LoginPage() {
  const { next } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isPending && user) {
    return <Navigate to={safeNext(next) as "/"} />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
        Account
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Sign in to start a 30-day trial or open a desk you already pay for.
        Independent tool — not affiliated with the Tennessee Education Lottery.
      </p>

      {!authEnabled ? (
        <p className="mt-8 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
          Sign-in is turned off in this environment.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              disabled={busy !== null || isPending}
              onClick={() => {
                setBusy(provider.providerId);
                setError(null);
                void signIn(provider.providerId, {
                  callbackURL: next || "/",
                  errorCallbackURL: "/login",
                }).catch((err) => {
                  setError(err instanceof Error ? err.message : "Sign-in failed.");
                  setBusy(null);
                });
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
            >
              {busy === provider.providerId
                ? "Opening…"
                : `Continue with ${provider.label}`}
            </button>
          ))}
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-bust">{error}</p> : null}

      <p className="mt-8 text-sm text-faint">
        New here?{" "}
        <Link to="/pricing" className="underline underline-offset-2 hover:text-fg">
          See pricing
        </Link>
        . 18+ only.
      </p>
    </div>
  );
}
