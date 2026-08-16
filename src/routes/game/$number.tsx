import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { GAMES, DATA_AS_OF, money, moneyFull } from "@/data/games";
import { scoreGame } from "@/lib/heat";
import { BandChip } from "@/components/ticket-card";
import { TicketFace } from "@/components/ticket-face";
import { LockedPanel } from "@/components/locked-panel";
import { useAccess } from "@/lib/use-access";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/game/$number")({
  component: GameDetail,
});

function GameDetail() {
  const { number } = Route.useParams();
  const game = GAMES.find((g) => String(g.number) === number);
  if (!game) throw notFound();
  const heat = scoreGame(game);
  const { paid } = useAccess();
  const locked = !paid;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Back to vault
        </Link>

        <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <TicketFace game={game} full />
          <div className="flex items-start justify-between gap-3 p-6">
            <div>
              <p className="font-mono text-xs text-faint">
                Game #{game.number} · ${game.price}
              </p>
              <h1 className="mt-2 font-display text-3xl tracking-tight">
                {game.name}
              </h1>
              <p className="mt-2 text-muted">
                Top prize {moneyFull(game.topPrize)} · printed odds 1 in{" "}
                {game.odds.toFixed(2)}
              </p>
            </div>
            <BandChip band={heat.band} />
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <HeatPanel
            title="Vault score"
            value={heat.vault}
            note={
              heat.role === "cash-out"
                ? "Cash-out game — ranked on remaining mid-size prizes, not a jackpot."
                : "Combined score. Medium prizes weighted 62%."
            }
            tone="hot"
          />
          <HeatPanel
            title="Grand (retail)"
            value={heat.grand}
            note={
              heat.role === "jackpot"
                ? `Posted ${heat.topRemaining ?? "—"} top · effective ${heat.effectiveTop ?? "—"} after Play It Again holdback.`
                : "Not a jackpot ticket."
            }
            tone="hot"
          />
          <HeatPanel
            title={heat.mediumKnown ? "Medium heat" : "Medium heat (est.)"}
            value={heat.medium}
            note="What typical tickets still pay."
            tone="warm"
          />
        </section>

        {heat.role === "jackpot" ? (
          <section className="mt-8 rounded-lg border border-line bg-surface p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
              Play It Again holdback
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Tennessee holds one top prize per game for Play It Again. Posted top
              remaining is {heat.topRemaining ?? "—"}. Effective retail top is{" "}
              {heat.effectiveTop ?? "—"}. A posted “1 left” is treated as no
              retail jackpot.
            </p>
          </section>
        ) : null}

        {heat.bust ? (
          <p className="mt-8 rounded-lg border border-bust/40 bg-bust-ink px-4 py-3 text-sm text-bust">
            Skip this one. The posted counts no longer support a useful retail
            top. That is not a guarantee — remaining counts change as tickets
            sell.
          </p>
        ) : null}

        <section className="mt-8">
          <h2 className="font-display text-xl">Remaining prizes</h2>
          <p className="mt-1 text-sm text-faint">
            Source:{" "}
            {game.source === "tn-remaining"
              ? "Tennessee Lottery remaining-prizes table (three published tiers)"
              : "Compiled public remaining counts"}
            . Updated {DATA_AS_OF}. Not live store inventory.
          </p>
          {locked ? (
            <div className="mt-4">
              <LockedPanel
                title="Full prize table is members-only"
                teaser="Unlock remaining counts for every published tier."
              >
                <PrizeTable game={game} />
              </LockedPanel>
            </div>
          ) : (
            <PrizeTable game={game} />
          )}
        </section>

        <p className="mt-10 pb-10 text-sm leading-relaxed text-faint">
          Independent analysis only. Not affiliated with the Tennessee Lottery.
          Remaining prizes change as tickets sell. One top prize per game may
          be held for Play It Again. This does not change lottery outcomes.
          18+ only. If gambling is a problem, call 1-800-GAMBLER.
        </p>
      </div>
  );
}

function PrizeTable({ game }: { game: (typeof GAMES)[number] }) {
  return (
    <ul className="mt-4 divide-y divide-line border border-line">
      {game.tiers.map((tier) => (
        <li
          key={tier.amount}
          className="flex items-center justify-between px-4 py-3"
        >
          <span className="text-muted">{money(tier.amount)}</span>
          <span className="font-mono text-fg">
            {tier.remaining == null
              ? "Not published"
              : `${tier.remaining.toLocaleString()} left`}
          </span>
        </li>
      ))}
    </ul>
  );
}

function HeatPanel({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: number;
  note: string;
  tone: "hot" | "warm";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 font-display text-4xl tabular-nums">
        {Math.round(value)}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
        <div
          className={tone === "hot" ? "h-full bg-hot" : "h-full bg-warm"}
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-faint">{note}</p>
    </div>
  );
}
