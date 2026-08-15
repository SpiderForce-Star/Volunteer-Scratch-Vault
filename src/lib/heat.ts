import type { Game } from "@/data/games";

export type HeatBand = "hot" | "warm" | "cool" | "bust";
export type GameRole = "cash-out" | "jackpot";

export type HeatReport = {
  grand: number;
  medium: number;
  vault: number;
  band: HeatBand;
  bust: boolean;
  mediumKnown: boolean;
  role: GameRole;
  topRemaining: number | null;
  /** Jackpot games: remaining minus 1 Play It Again holdback. */
  effectiveTop: number | null;
  midRemaining: number | null;
  lowRemaining: number | null;
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function gameRole(game: Game): GameRole {
  const top = game.tiers[0]?.amount ?? game.topPrize;
  return top <= game.price * 120 ? "cash-out" : "jackpot";
}

export function scoreGame(game: Game): HeatReport {
  const role = gameRole(game);
  const topRemaining = game.tiers[0]?.remaining ?? null;
  const midRemaining = game.tiers[1]?.remaining ?? null;
  const lowRemaining = game.tiers[2]?.remaining ?? null;

  const effectiveTop =
    topRemaining == null
      ? null
      : role === "cash-out"
        ? topRemaining
        : Math.max(0, topRemaining - 1);

  const mediumKnown =
    role === "cash-out"
      ? topRemaining != null
      : midRemaining != null || lowRemaining != null;

  let grand = 35;
  if (role === "cash-out") {
    grand = 22;
  } else if (effectiveTop == null) {
    grand = 35;
  } else if (effectiveTop <= 0) {
    grand = 0;
  } else {
    const size = Math.log10(Math.max(game.topPrize, 10));
    grand = clamp(16 + Math.min(effectiveTop, 12) * 7 + size * 4);
  }

  let medium = 36;
  if (role === "cash-out") {
    if (topRemaining == null) medium = 38;
    else {
      const perDollar = topRemaining / game.price;
      medium = clamp(18 + Math.min(perDollar, 80) * 0.95);
    }
  } else if (midRemaining != null || lowRemaining != null) {
    const midN = midRemaining ?? 0;
    const lowN = lowRemaining ?? 0;
    medium = clamp(6 + midN * 2.8 + Math.min(lowN, 700) * 0.09);
  } else if (effectiveTop != null) {
    medium = clamp(24 + Math.min(effectiveTop, 6) * 6);
  }

  const bust =
    role === "jackpot" &&
    effectiveTop != null &&
    effectiveTop <= 0 &&
    (midRemaining == null || midRemaining <= 2);

  const vault = bust
    ? 0
    : clamp(grand * 0.38 + medium * 0.62);

  let band: HeatBand = "cool";
  if (bust) band = "bust";
  else if (vault >= 62 || medium >= 68) band = "hot";
  else if (vault >= 42 || medium >= 44) band = "warm";

  return {
    grand,
    medium,
    vault,
    band,
    bust,
    mediumKnown,
    role,
    topRemaining,
    effectiveTop,
    midRemaining,
    lowRemaining,
  };
}

export function bandLabel(band: HeatBand): string {
  if (band === "hot") return "Hot";
  if (band === "warm") return "Warm";
  if (band === "cool") return "Cool";
  return "Bust";
}

export type PriceFilter = "all" | "5" | "10" | "20" | "higher";

export function inPriceFilter(game: Game, filter: PriceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "5") return game.price === 5;
  if (filter === "10") return game.price === 10;
  if (filter === "20") return game.price === 20;
  return game.price > 20;
}

export type SortKey = "heat" | "grand" | "medium" | "price" | "name";

export function sortGames(
  games: Game[],
  key: SortKey,
  reports: Map<number, HeatReport>,
): Game[] {
  const copy = [...games];
  copy.sort((a, b) => {
    const ra = reports.get(a.number)!;
    const rb = reports.get(b.number)!;
    if (key === "heat") return rb.vault - ra.vault;
    if (key === "grand") return rb.grand - ra.grand;
    if (key === "medium") return rb.medium - ra.medium;
    if (key === "price") return a.price - b.price || a.number - b.number;
    return a.name.localeCompare(b.name);
  });
  return copy;
}

export type DeskPick = {
  game: Game;
  heat: HeatReport;
  why: string;
};

export type DeskReview = {
  byPrice: { price: string; pick: DeskPick | null }[];
  mediumLeaders: DeskPick[];
  avoid: DeskPick[];
  official: DeskPick[];
  stats: {
    games: number;
    retailJackpots: number;
    cashOuts: number;
    busts: number;
    officialTiers: number;
  };
};

export function buildDesk(
  games: Game[],
  reports: Map<number, HeatReport>,
): DeskReview {
  const rows = games.map((game) => ({ game, heat: reports.get(game.number)! }));

  const why = (g: Game, h: HeatReport): string => {
    if (h.role === "cash-out" && h.topRemaining != null) {
      return `${h.topRemaining.toLocaleString()} cash prizes of $${g.topPrize.toLocaleString()} still posted`;
    }
    if (h.mediumKnown && h.midRemaining != null) {
      return `${h.effectiveTop ?? "—"} retail top · ${h.midRemaining.toLocaleString()} mid-tier left`;
    }
    if (h.effectiveTop != null) {
      return `${h.effectiveTop} effective top prize${h.effectiveTop === 1 ? "" : "s"} after Play It Again holdback`;
    }
    return "Published remaining count is thin";
  };

  const pick = (list: typeof rows): DeskPick | null => {
    const live = list.filter((r) => !r.heat.bust);
    if (!live.length) return null;
    live.sort((a, b) => b.heat.vault - a.heat.vault);
    const best = live[0];
    return { ...best, why: why(best.game, best.heat) };
  };

  const prices: { key: PriceFilter; label: string }[] = [
    { key: "5", label: "$5" },
    { key: "10", label: "$10" },
    { key: "20", label: "$20" },
    { key: "higher", label: "$25+" },
  ];

  const byPrice = prices.map((p) => ({
    price: p.label,
    pick: pick(rows.filter((r) => inPriceFilter(r.game, p.key))),
  }));

  const mediumLeaders = [...rows]
    .filter((r) => !r.heat.bust)
    .sort((a, b) => b.heat.medium - a.heat.medium)
    .slice(0, 5)
    .map((r) => ({ ...r, why: why(r.game, r.heat) }));

  const avoid = rows
    .filter((r) => r.heat.bust || (r.heat.effectiveTop === 0 && r.heat.role === "jackpot"))
    .sort((a, b) => a.heat.vault - b.heat.vault)
    .slice(0, 8)
    .map((r) => ({
      ...r,
      why:
        r.heat.effectiveTop === 0
          ? "No retail top prize after the Play It Again holdback"
          : "Depleted mid-tier and jackpot",
    }));

  const official = rows
    .filter((r) => r.game.source === "tn-remaining")
    .sort((a, b) => b.heat.vault - a.heat.vault)
    .map((r) => ({ ...r, why: why(r.game, r.heat) }));

  return {
    byPrice,
    mediumLeaders,
    avoid,
    official,
    stats: {
      games: games.length,
      retailJackpots: rows.filter(
        (r) => r.heat.role === "jackpot" && (r.heat.effectiveTop ?? 0) > 0,
      ).length,
      cashOuts: rows.filter((r) => r.heat.role === "cash-out").length,
      busts: rows.filter((r) => r.heat.bust).length,
      officialTiers: rows.filter((r) => r.game.source === "tn-remaining").length,
    },
  };
}
