import type { Game } from "@/data/games";
import type {
  CashBlip,
  DeskPick,
  DeskReview,
  GameRole,
  HeatBand,
  HeatReport,
  PriceFilter,
} from "./heat";

function inPriceFilter(game: Game, filter: PriceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "5") return game.price === 5;
  if (filter === "10") return game.price === 10;
  if (filter === "20") return game.price === 20;
  return game.price > 20;
}

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
    midRemaining != null &&
    midRemaining <= 2;

  const vault = bust ? 0 : clamp(grand * 0.38 + medium * 0.62);

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

/** Strip mid/low remaining so only public fields remain. */
export function publicGame(game: Game): Game {
  return {
    ...game,
    tiers: game.tiers.map((tier, i) => ({
      ...tier,
      remaining: i === 0 ? tier.remaining : null,
    })),
  };
}

/** Guest scorer: price, top prize, and top-tier remaining only. */
export function scoreGamePublic(game: Game): HeatReport {
  return scoreGame(publicGame(game));
}

export function catalogHeat(
  games: Game[],
  score: (game: Game) => HeatReport = scoreGame,
): {
  grand: number;
  medium: number;
  busts: number;
  games: number;
} {
  if (!games.length) return { grand: 0, medium: 0, busts: 0, games: 0 };
  let grand = 0;
  let medium = 0;
  let busts = 0;
  for (const game of games) {
    const report = score(game);
    grand += report.grand;
    medium += report.medium;
    if (report.bust) busts += 1;
  }
  return {
    grand: grand / games.length,
    medium: medium / games.length,
    busts,
    games: games.length,
  };
}

function shortGameName(name: string): string {
  const trimmed = name.replace(/^\$[\d,]+(?:\s+)?/, "").trim();
  if (trimmed.length <= 16) return trimmed || name;
  return `${trimmed.slice(0, 15).trim()}…`;
}

export function cashBlips(games: Game[], count = 8): CashBlip[] {
  const found: Omit<CashBlip, "angle" | "radius">[] = [];
  for (const game of games) {
    const mid =
      game.tiers.find(
        (tier) =>
          tier.amount >= 200 &&
          tier.amount <= 20_000 &&
          tier.remaining != null &&
          tier.remaining > 0,
      ) ??
      (game.topPrize <= 3_000 && game.tiers[0]?.remaining
        ? game.tiers[0]
        : null);
    if (!mid || mid.remaining == null) continue;
    found.push({
      id: game.number,
      name: shortGameName(game.name),
      amount: mid.amount,
      remaining: mid.remaining,
    });
  }
  found.sort((a, b) => (b.remaining ?? 0) - (a.remaining ?? 0));
  return found.slice(0, count).map((blip, i) => ({
    ...blip,
    angle: (i * 360) / Math.max(count, found.length || 1) + 18 + (blip.id % 17),
    radius: 0.52 + (i % 3) * 0.1,
  }));
}

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
