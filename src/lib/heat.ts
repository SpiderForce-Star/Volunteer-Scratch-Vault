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

export type CashBlip = {
  id: number;
  name: string;
  amount: number;
  remaining: number | null;
  angle: number;
  radius: number;
};

export type PriceFilter = "all" | "5" | "10" | "20" | "higher";
export type SortKey = "heat" | "grand" | "medium" | "safest" | "price" | "name";

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

export function bandLabel(band: HeatBand): string {
  if (band === "hot") return "Hot";
  if (band === "warm") return "Warm";
  if (band === "cool") return "Cool";
  return "Bust";
}

export function inPriceFilter(game: Game, filter: PriceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "5") return game.price === 5;
  if (filter === "10") return game.price === 10;
  if (filter === "20") return game.price === 20;
  return game.price > 20;
}

export function sortGames(
  games: Game[],
  key: SortKey,
  reports: Map<number, HeatReport>,
): Game[] {
  const copy = [...games];
  copy.sort((a, b) => {
    const ra = reports.get(a.number);
    const rb = reports.get(b.number);
    if (!ra || !rb) return a.number - b.number;
    if (key === "heat") return rb.vault - ra.vault;
    if (key === "grand") return rb.grand - ra.grand;
    if (key === "medium") return rb.medium - ra.medium;
    if (key === "safest") {
      if (ra.bust !== rb.bust) return Number(ra.bust) - Number(rb.bust);
      return rb.vault - ra.vault;
    }
    if (key === "price") return a.price - b.price || a.number - b.number;
    return a.name.localeCompare(b.name);
  });
  return copy;
}

export function reportMap(
  reports: Record<string, HeatReport>,
): Map<number, HeatReport> {
  const map = new Map<number, HeatReport>();
  for (const [key, value] of Object.entries(reports)) {
    map.set(Number(key), value);
  }
  return map;
}
