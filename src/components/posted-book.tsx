import {
  money,
  moneyFull,
  postedBook,
  retailTopPool,
  type Game,
} from "@/data/games";
import type { HeatReport } from "@/lib/heat";
import { LockedPanel } from "@/components/locked-panel";

export function PostedBookPanel({
  game,
  heat,
  locked,
}: {
  game: Game;
  heat: HeatReport;
  locked: boolean;
}) {
  const book = postedBook(game);
  const retailPool = retailTopPool(game.topPrize, heat.effectiveTop);
  const headline = locked ? book.topPool : book.knownPool || book.topPool;

  return (
    <section className="mt-8">
      <p className="font-mono text-[10px] tracking-[0.16em] text-gold uppercase">
        Still posted
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-tight">
        How much cash is still listed
      </h2>
      <p className="mt-1 text-sm text-faint">
        Published remaining × prize amount. Not live store inventory. Unpublished
        lower tiers are missing from this total.
      </p>

      <div className="mt-4 rounded-xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">
          {locked ? "Top tier still listed" : "Published tiers still listed"}
        </p>
        <p className="mt-2 font-display text-4xl tabular-nums tracking-tight">
          {headline == null ? "—" : moneyFull(headline)}
        </p>
        {heat.role === "jackpot" && retailPool != null ? (
          <p className="mt-2 text-sm text-muted">
            After Play It Again holdback: {moneyFull(retailPool)} still in play
            at retail
            {heat.effectiveTop != null
              ? ` · ${heat.effectiveTop.toLocaleString()} top prize${heat.effectiveTop === 1 ? "" : "s"}`
              : ""}
          </p>
        ) : null}
        {book.topPool != null && heat.topRemaining != null ? (
          <p className="mt-1 text-sm text-faint">
            Top tier: {heat.topRemaining.toLocaleString()} × {money(game.topPrize)}{" "}
            = {moneyFull(book.topPool)}
          </p>
        ) : (
          <p className="mt-1 text-sm text-faint">Top-tier remaining is not posted.</p>
        )}
      </div>

      {locked ? (
        <div className="mt-4">
          <LockedPanel
            title="Mid-tier book is in the Vault"
            teaser="See remaining counts and dollar totals for every published prize tier on this ticket."
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line border border-line">
          {book.rows.map((row) => (
            <li
              key={row.amount}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-muted">{moneyFull(row.amount)} prizes</span>
              <span className="font-mono text-sm text-fg">
                {row.remaining == null
                  ? "Not published"
                  : `${row.remaining.toLocaleString()} left · ${moneyFull(row.pool ?? 0)}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!locked && book.unpublishedTiers > 0 ? (
        <p className="mt-3 text-xs text-faint">
          {book.unpublishedTiers} published prize amount
          {book.unpublishedTiers === 1 ? " has" : "s have"} no remaining count, so
          the true book is higher than {moneyFull(book.knownPool)}.
        </p>
      ) : null}
    </section>
  );
}
