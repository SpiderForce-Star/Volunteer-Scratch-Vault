import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** One label everywhere we sell the trial. */
export const TRIAL_CTA = "Start 1-month free trial";

export function TrialCta({ className }: { className?: string }) {
  return (
    <Link
      to="/pricing"
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-4 text-sm font-medium text-accent-fg",
        className,
      )}
    >
      {TRIAL_CTA}
    </Link>
  );
}
