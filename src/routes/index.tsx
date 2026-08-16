import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DATA_AS_OF, GAMES } from "@/data/games";
import {
  buildDesk,
  inPriceFilter,
  scoreGame,
  sortGames,
  type PriceFilter,
  type SortKey,
} from "@/lib/heat";
import { TicketCard } from "@/components/ticket-card";
import { DeskReviewPanel } from "@/components/desk-review";
import { DisclaimerLead, DisclaimerPanel } from "@/components/disclaimer-panel";
import { RadarCashHero } from "@/components/radar-cash-hero";
import { UnlockStrip } from "@/components/unlock-strip";
import { BootSplash } from "@/components/boot-splash";
import { useAccess } from "@/lib/use-access";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: VaultHome,
});

const FILTERS: { id: PriceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "5", label: "$5" },
  { id: "10", label: "$10" },
  { id: "20", label: "$20" },
  { id: "higher", label: "$25+" },
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: "heat", label: "Best overall" },
  { id: "medium", label: "Best mid-tier" },
  { id: "safest", label: "Safest (avoid busts)" },
  { id: "grand", label: "Grand prizes" },
  { id: "price", label: "Price" },
  { id: "name", label: "Name" },
];

function VaultHome() {
  const [filter, setFilter] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortKey>("heat");
  const [query, setQuery] = useState("");
  const { paid } = useAccess();
  const locked = !paid;

  const reports = useMemo(() => {
    const map = new Map(GAMES.map((g) => [g.number, scoreGame(g)]));
    return map;
  }, []);

  const desk = useMemo(() => buildDesk(GAMES, reports), [reports]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = GAMES.filter((g) => {
      if (!inPriceFilter(g, filter)) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) || String(g.number).includes(q)
      );
    });
    return sortGames(filtered, sort, reports);
  }, [filter, sort, query, reports]);

  return (
    <div>
      <BootSplash />
      <RadarCashHero />
      <UnlockStrip locked={locked} />

      <section className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
          <p className="max-w-3xl rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            <span className="text-fg">Quick note: </span>
            18+ only. This is information, not a betting system. Remaining
            counts do not make you more likely to win. If play stops being
            entertainment, call or text{" "}
            <a className="underline underline-offset-2" href="tel:18005224700">
              1-800-GAMBLER
            </a>
            .
          </p>

          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
              Full disclaimer
            </p>
            <DisclaimerLead />
            <div className="mt-4">
              <DisclaimerPanel />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <Stat label="Games tracked" value={String(desk.stats.games)} />
            <Stat
              label="Retail jackpots"
              value={String(desk.stats.retailJackpots)}
            />
            <Stat label="Avoid" value={String(desk.stats.busts)} />
            <Stat label="Data as of" value={DATA_AS_OF} />
          </div>
        </div>
      </section>

      <div id="desk">
        <DeskReviewPanel desk={desk} locked={locked} />
      </div>

      <div className="sticky top-[57px] z-10 border-b border-line bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-11 rounded-md px-3 text-sm",
                  filter === f.id
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-muted hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
            <label className="sr-only" htmlFor="q">
              Search games
            </label>
            <input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or #"
              className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-faint sm:max-w-56"
            />
            <label className="sr-only" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-11 rounded-md border border-line bg-surface px-3 text-sm text-fg"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main id="games" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-faint">{list.length} games</p>
          <p className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs tracking-wide text-muted uppercase">
            Updated {DATA_AS_OF}. Not live store inventory.
          </p>
        </div>
        {list.length === 0 ? (
          <p className="text-muted">No games match that filter.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((game) => (
              <TicketCard
                key={game.number}
                game={game}
                heat={reports.get(game.number)!}
                locked={locked}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs tracking-wide text-faint uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-xl text-fg">{value}</p>
    </div>
  );
}
