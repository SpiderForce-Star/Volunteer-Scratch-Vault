import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DisclaimerLead,
  DisclaimerPanel,
} from "@/components/disclaimer-panel";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
  head: () =>
    pageHead({
      title: "Disclaimer & responsible play",
      description:
        "Independent remaining-prize desk. Not affiliated with the Tennessee Education Lottery. Remaining counts do not improve odds. 18+. 1-800-GAMBLER.",
      path: "/disclaimer",
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
        {" · "}
        <Link
          to="/terms"
          className="underline underline-offset-2 hover:text-fg"
        >
          Terms
        </Link>
        {" · "}
        <Link
          to="/privacy"
          className="underline underline-offset-2 hover:text-fg"
        >
          Privacy
        </Link>
      </p>
    </article>
  );
}
