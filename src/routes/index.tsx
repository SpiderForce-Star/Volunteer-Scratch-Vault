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
  { id: "heat", label: "Combined heat" },
  { id: "medium", label: "Medium prizes" },
  { id: "grand", label: "Grand prizes" },
  { id: "price", label: "Price" },
  { id: "name", label: "Name" },
];

function VaultHome() {
  const [filter, setFilter] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortKey>("heat");
  const [query, setQuery] = useState("");

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
    <div className="min-h-svh bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
          <p className="font-mono text-xs tracking-[0.18em] text-faint uppercase">
            Volunteer Scratch Vault
          </p>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Tennessee scratch-offs, ranked by remaining heat.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              Independent remaining-prize desk. We ignore printed odds, subtract
              Tennessee’s Play It Again holdback, and rank medium prizes first.
            </p>
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
      </header>

      <DeskReviewPanel desk={desk} />

      <div className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur-sm">
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-6 text-sm text-faint">{list.length} games</p>
        {list.length === 0 ? (
          <p className="text-muted">No games match that filter.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((game) => (
              <TicketCard
                key={game.number}
                game={game}
                heat={reports.get(game.number)!}
              />
            ))}
          </div>
        )}

        <footer className="mt-16 max-w-2xl border-t border-line pt-8 pb-16 text-sm leading-relaxed text-faint">
          Ticket faces are independent reconstructions for store identification
          (name, number, and price on the header). They are not official Lottery
          scans. Volunteer Scratch Vault is not affiliated with the Tennessee
          Education Lottery Corporation. Remaining counts come from publicly
          posted prize tables. Data does not improve your odds. One remaining
          top prize in each game may be reserved for Play It Again. Play only if
          you are 18 or older.
        </footer>
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
