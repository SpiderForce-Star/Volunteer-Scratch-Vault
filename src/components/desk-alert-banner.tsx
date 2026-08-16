import { Link } from "@tanstack/react-router";
import { DESK_META } from "@/data/desk-meta";
import { useDeskAlert } from "@/lib/use-desk-alert";

/** Subscriber live banner, or unpaid SELL card. Never a fake personal alert. */
export function DeskAlertBanner() {
  const { unseen, subscriber, isPending, markSeen, reviewDesk } = useDeskAlert();

  if (isPending) return null;

  if (!subscriber) {
    return (
      <div className="border-b border-line bg-raised/50">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm leading-relaxed text-muted">
            Subscribers get a radar alert the moment new remaining-prize counts
            hit the desk.
          </p>
          <Link
            to="/pricing"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-gold px-4 text-sm font-medium text-accent-fg"
          >
            Start 1-month free trial — include radar alerts
          </Link>
        </div>
      </div>
    );
  }

  if (!unseen) return null;

  return (
    <div className="border-b border-gold/40 bg-gold/10">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm leading-relaxed text-paper">
          Desk updated {DESK_META.weekLabel}. {DESK_META.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reviewDesk()}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-4 text-sm font-medium text-accent-fg"
          >
            Review rankings
          </button>
          <button
            type="button"
            onClick={() => markSeen()}
            className="inline-flex min-h-11 items-center justify-center px-3 text-sm text-muted underline underline-offset-4 hover:text-paper"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
