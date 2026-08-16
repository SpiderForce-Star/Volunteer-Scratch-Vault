import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-display text-lg">Volunteer Scratch Vault</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Independent remaining-prize information for Tennessee scratch-off
              tickets. Not a lottery, not a ticket seller, and not affiliated
              with the Tennessee Education Lottery Corporation.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
              If gambling is no longer fun
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg">
              Call or text{" "}
              <a className="underline underline-offset-2" href="tel:18005224700">
                1-800-GAMBLER
              </a>{" "}
              (1-800-522-4700) · Tennessee REDLINE{" "}
              <a className="underline underline-offset-2" href="tel:18008899789">
                1-800-889-9789
              </a>
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4">
              <Link
                to="/disclaimer"
                className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-2 hover:text-fg"
              >
                Full disclaimer & help resources
              </Link>
              <Link
                to="/pricing"
                className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-2 hover:text-fg"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>

        <p className="max-w-3xl text-xs leading-relaxed text-faint">
          18+ only. Remaining counts do not improve your odds of winning any
          prize. Ticket faces are independent reconstructions, not official
          Lottery artwork. Play only with money you can afford to lose. If you
          or someone you know may have a gambling problem, help is available
          24/7.
        </p>
      </div>
    </footer>
  );
}
