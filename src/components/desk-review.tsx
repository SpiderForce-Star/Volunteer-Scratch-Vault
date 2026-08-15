import { Link } from "@tanstack/react-router";
import { money, type Game } from "@/data/games";
import type { DeskPick, DeskReview } from "@/lib/heat";
import { BandChip } from "@/components/ticket-card";

export function DeskReviewPanel({ desk }: { desk: DeskReview }) {
  return (
    <section className="border-b border-line bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
            Current desk
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">
            What the remaining-prize data actually supports
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Printed odds never change. Tennessee also holds one top prize per
            game for Play It Again, so a posted “1 left” is treated as no
            retail jackpot. Medium heat is weighted heavier than the grand.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini
            label="Retail jackpots live"
            value={String(desk.stats.retailJackpots)}
          />
          <Mini label="Cash-out games" value={String(desk.stats.cashOuts)} />
          <Mini label="Avoid / bust" value={String(desk.stats.busts)} />
          <Mini
            label="Official 3-tier rows"
            value={String(desk.stats.officialTiers)}
          />
        </div>

        <div>
          <h3 className="font-display text-lg">Best ticket by price</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {desk.byPrice.map((row) =>
              row.pick ? (
                <PickCard
                  key={row.price}
                  kicker={row.price}
                  pick={row.pick}
                />
              ) : (
                <div
                  key={row.price}
                  className="rounded-lg border border-line p-4 text-sm text-faint"
                >
                  {row.price}: no live pick
                </div>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-lg">Medium-prize leaders</h3>
            <p className="mt-1 text-sm text-faint">
              Where regular players still get paid.
            </p>
            <PickList picks={desk.mediumLeaders} />
          </div>
          <div>
            <h3 className="font-display text-lg">Skip these</h3>
            <p className="mt-1 text-sm text-faint">
              Effective retail top is gone, or mid-tier is drained.
            </p>
            <PickList picks={desk.avoid} />
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg">Official three-tier table</h3>
          <p className="mt-1 text-sm text-faint">
            Highest-confidence rows from the Lottery remaining-prizes page.
          </p>
          <PickList picks={desk.official} />
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg p-4">
      <p className="font-mono text-[10px] tracking-wide text-faint uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

function PickCard({ kicker, pick }: { kicker: string; pick: DeskPick }) {
  return (
    <Link
      to="/game/$number"
      params={{ number: String(pick.game.number) }}
      className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4 hover:border-muted"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-faint">{kicker}</span>
        <BandChip band={pick.heat.band} />
      </div>
      <p className="font-display text-lg leading-snug">{pick.game.name}</p>
      <p className="text-sm text-muted">{pick.why}</p>
      <p className="font-mono text-xs text-faint">
        Vault {Math.round(pick.heat.vault)} · Med {Math.round(pick.heat.medium)}
      </p>
    </Link>
  );
}

function PickList({ picks }: { picks: DeskPick[] }) {
  if (!picks.length) {
    return <p className="mt-3 text-sm text-muted">None flagged.</p>;
  }
  return (
    <ul className="mt-3 divide-y divide-line border border-line">
      {picks.map((p) => (
        <li key={p.game.number}>
          <Link
            to="/game/$number"
            params={{ number: String(p.game.number) }}
            className="flex items-start justify-between gap-3 px-3 py-3 hover:bg-raised"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-fg">
                ${p.game.price} · {p.game.name}
              </p>
              <p className="mt-0.5 text-xs text-faint">{p.why}</p>
            </div>
            <span className="shrink-0 font-mono text-xs text-muted">
              {Math.round(p.heat.vault)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PrizeNote({ game, heat }: { game: Game; heat: DeskPick["heat"] }) {
  return (
    <p className="text-xs text-faint">
      Posted top {heat.topRemaining ?? "—"} · effective retail{" "}
      {heat.effectiveTop ?? "—"} · mid {heat.midRemaining ?? "—"} ·{" "}
      {money(game.topPrize)}
    </p>
  );
}
