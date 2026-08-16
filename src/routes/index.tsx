import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GAMES, money } from "@/data/games";
import { DESK_META } from "@/data/desk-meta";
import {
  bandLabel,
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
import { DeskAlertBanner } from "@/components/desk-alert-banner";
import { TripCard } from "@/components/trip-card";
import { TrialCta } from "@/components/trial-cta";
import { useAccess } from "@/lib/use-access";
import { readPricePref, writePricePref, pricePrefLabel } from "@/lib/price-pref";
import { SITE_DESCRIPTION, SITE_TITLE, pageHead } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: VaultHome,
  head: () =>
    pageHead({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      path: "/",
    }),
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
  const [sort, setSort] = useState<SortKey>("safest");
  const [query, setQuery] = useState("");
  const { paid } = useAccess();
  const locked = !paid;
  const [lateNight, setLateNight] = useState(false);

  useEffect(() => {
    const saved = readPricePref();
    if (saved) setFilter(saved);
    try {
      const hour = Number(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hour12: false,
          timeZone: "America/Chicago",
        }).format(new Date()),
      );
      setLateNight(hour >= 23 || hour < 6);
    } catch {
      const hour = new Date().getHours();
      setLateNight(hour >= 23 || hour < 6);
    }
  }, []);

  const setPrice = (next: PriceFilter) => {
    setFilter(next);
    writePricePref(next);
  };

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

  const tripFilter: PriceFilter = filter === "all" ? "10" : filter;
  const tripGames = useMemo(() => {
    const pool = GAMES.filter((g) => inPriceFilter(g, tripFilter));
    return sortGames(pool, "medium", reports).slice(0, 3);
  }, [tripFilter, reports]);

  const publicList = locked ? list.slice(0, 3) : list;
  const prefLabel = pricePrefLabel(filter);

  return (
    <div>
      <BootSplash />
      <p className="border-b border-line px-4 py-2 text-center font-mono text-[10px] tracking-[0.16em] text-faint uppercase sm:px-6">
        {DESK_META.weekLabel} · {GAMES.length} TN games tracked
      </p>
      {lateNight ? (
        <p className="border-b border-line bg-raised/50 px-4 py-3 text-center text-sm text-muted sm:px-6">
          Desk is for store hours. Review now, buy later if you still want to.
          18+.
        </p>
      ) : null}
      <DeskAlertBanner />
      <RadarCashHero priceFilter={filter} />

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-gold uppercase">
            {prefLabel ? `Your ${prefLabel} desk` : "Best still-posted by price"}
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">
            Highest remaining-prize heat at each price
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {desk.byPrice.map((row) =>
              row.pick ? (
                <Link
                  key={row.price}
                  to="/game/$number"
                  params={{ number: String(row.pick.game.number) }}
                  className="min-h-11 rounded-lg border border-line bg-surface p-4 hover:border-gold/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gold">{row.price}</span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
                      {bandLabel(row.pick.heat.band)}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-lg leading-snug">
                    {row.pick.game.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-faint">
                    Mid{" "}
                    {row.pick.heat.midRemaining == null
                      ? "—"
                      : row.pick.heat.midRemaining.toLocaleString()}{" "}
                    still posted · top {money(row.pick.game.topPrize)}
                  </p>
                </Link>
              ) : (
                <div
                  key={row.price}
                  className="rounded-lg border border-line p-4 text-sm text-faint"
                >
                  {row.price}: nothing still posted
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-danger uppercase">
            Skip these
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">
            Don’t spend a book on a drained game
          </h2>
          <ul className="mt-4 divide-y divide-line border border-line">
            {desk.avoid.slice(0, 3).map((p) => (
              <li key={p.game.number}>
                <Link
                  to="/game/$number"
                  params={{ number: String(p.game.number) }}
                  className="flex min-h-11 items-center justify-between gap-3 px-3 py-3 hover:bg-raised"
                >
                  <span className="truncate text-sm">
                    ${p.game.price} · {p.game.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-danger uppercase">
                    Skip
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TripCard
        games={tripGames}
        reports={reports}
        filter={tripFilter}
        locked={locked}
      />

      <UnlockStrip locked={locked} />

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
                onClick={() => setPrice(f.id)}
                className={cn(
                  "min-h-11 min-w-11 rounded-md px-3 text-sm",
                  filter === f.id
                    ? "bg-gold text-accent-fg"
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
          <p className="text-sm text-faint">
            {locked ? "3 public cards · full mid-tier table is Vault" : `${list.length} games`}
          </p>
          <p className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs tracking-wide text-muted uppercase">
            Updated {DESK_META.weekLabel}. Not live store inventory.
          </p>
        </div>
        {publicList.length === 0 ? (
          <p className="text-muted">No games match that filter.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicList.map((game) => (
              <TicketCard
                key={game.number}
                game={game}
                heat={reports.get(game.number)!}
                locked={locked}
              />
            ))}
          </div>
        )}
        {locked ? (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-5">
            <p className="text-sm text-muted">
              Full mid-tier table is in the Vault. Review before you buy.
            </p>
            <TrialCta />
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted">
            You’re done. Put the phone away.
          </p>
        )}

        <div className="mt-10 max-w-3xl">
          <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
            Full disclaimer
          </p>
          <DisclaimerLead />
          <div className="mt-4">
            <DisclaimerPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
