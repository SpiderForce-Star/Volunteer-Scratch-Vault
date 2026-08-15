import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DisclaimerLead,
  DisclaimerPanel,
} from "@/components/disclaimer-panel";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
  head: () => ({
    meta: [{ title: "Disclaimer & responsible play · Volunteer Scratch Vault" }],
  }),
});

function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
        Legal & responsible play
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Disclaimer</h1>
      <div className="mt-4 mb-8">
        <DisclaimerLead />
      </div>
      <DisclaimerPanel />
      <p className="mt-10 text-sm text-faint">
        <Link to="/" className="underline underline-offset-2 hover:text-fg">
          Back to the vault
        </Link>
      </p>
    </article>
  );
}
