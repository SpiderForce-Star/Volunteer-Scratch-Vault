import type { Game, PrizeTier } from "@/data/games";
import type {
  CashBlip,
  DeskPick,
  DeskReview,
  GameRole,
  HeatBand,
  HeatReport,
  PriceFilter,
} from "./heat";

const PRICE_POINTS = [5, 10, 20, 25, 30, 50] as const;

function inPriceFilter(game: Game, filter: PriceFilter): boolean {
  if (filter === "all") return true;
  return game.price === Number(filter);
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function gameRole(game: Game): GameRole {
  const top = game.tiers[0]?.amount ?? game.topPrize;
  return top <= game.price * 120 ? "cash-out" : "jackpot";
}

function isTopTier(game: Game, tier: PrizeTier, index: number): boolean {
  return index === 0 || tier.amount === game.topPrize;
}

/** $10–$50 "won a ticket" rows — not mid-tier, not radar cash. */
function isTicketNoise(game: Game, tier: PrizeTier, index: number): boolean {
  if (isTopTier(game, tier, index)) return false;
  return tier.amount <= 50;
}

function isCashPrize(tier: PrizeTier): boolean {
  return tier.amount >= 50 && tier.amount <= 3_000;
}

function isMidPrize(game: Game, tier: PrizeTier, index: number): boolean {
  if (isTopTier(game, tier, index)) return false;
  if (isTicketNoise(game, tier, index)) return false;
  return tier.amount > 3_000 && tier.amount < game.topPrize;
}

function sumRemaining(tiers: PrizeTier[]): number | null {
  let known = false;
  let total = 0;
  for (const tier of tiers) {
    if (tier.remaining == null) continue;
    known = true;
    total += Math.max(0, tier.remaining);
  }
  return known ? total : null;
}

export function scoreGame(game: Game): HeatReport {
  const role = gameRole(game);
  const top = game.tiers[0];
  const topRemaining = top?.remaining ?? null;

  const effectiveTop =
    topRemaining == null
      ? null
      : role === "cash-out"
        ? topRemaining
        : Math.max(0, topRemaining - 1);

  const midTiers = game.tiers.filter((tier, i) => isMidPrize(game, tier, i));
  const cashTiers = game.tiers.filter((tier, i) => {
    if (isTicketNoise(game, tier, i)) return false;
    if (role === "cash-out" && isTopTier(game, tier, i)) return true;
    if (isTopTier(game, tier, i)) return false;
    return isCashPrize(tier) && !isMidPrize(game, tier, i);
  });

  const midRemaining = sumRemaining(midTiers);
  const lowRemaining = sumRemaining(cashTiers);
  const mediumKnown = midRemaining != null || lowRemaining != null;

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
  if (midRemaining != null) {
    medium = clamp(8 + Math.min(midRemaining, 120) * 0.7);
  } else if (role === "cash-out" && topRemaining != null) {
    medium = clamp(18 + Math.min(topRemaining / game.price, 80) * 0.95);
  } else if (effectiveTop != null) {
    medium = clamp(24 + Math.min(effectiveTop, 6) * 6);
  }

  let cash = 28;
  if (lowRemaining != null) {
    cash = clamp(10 + Math.min(lowRemaining, 400) * 0.18);
  } else if (role === "cash-out" && topRemaining != null) {
    cash = clamp(16 + Math.min(topRemaining, 80) * 0.7);
  }

  const bust =
    role === "jackpot" &&
    effectiveTop != null &&
    effectiveTop <= 0 &&
    midRemaining != null &&
    midRemaining <= 2;

  const vault = bust ? 0 : clamp(grand * 0.28 + medium * 0.42 + cash * 0.3);

  let band: HeatBand = "cool";
  if (bust) band = "bust";
  else if (vault >= 62 || medium >= 68 || cash >= 72) band = "hot";
  else if (vault >= 42 || medium >= 44 || cash >= 50) band = "warm";

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

function liveRadarTiers(game: Game): PrizeTier[] {
  const role = gameRole(game);
  const live: PrizeTier[] = [];
  for (let i = 0; i < game.tiers.length; i++) {
    const tier = game.tiers[i];
    if (tier.remaining == null || tier.remaining <= 0) continue;
    if (isTicketNoise(game, tier, i)) continue;
    const top = isTopTier(game, tier, i);
    if (top) {
      live.push(tier);
      continue;
    }
    if (isCashPrize(tier) || isMidPrize(game, tier, i) || role === "cash-out") {
      live.push(tier);
    }
  }
  return live;
}

/** Spread remaining-prize blips across $5–$50. One live row can yield several amounts. */
export function cashBlips(games: Game[], count = 12): CashBlip[] {
  const buckets = new Map<number, Omit<CashBlip, "angle" | "radius">[]>();
  for (const price of PRICE_POINTS) buckets.set(price, []);

  for (const game of games) {
    const bucket = buckets.get(game.price);
    if (!bucket) continue;
    for (const tier of liveRadarTiers(game)) {
      bucket.push({
        id: `${game.number}-${tier.amount}`,
        gameId: game.number,
        name: shortGameName(game.name),
        amount: tier.amount,
        remaining: tier.remaining,
      });
    }
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => (b.remaining ?? 0) - (a.remaining ?? 0) || b.amount - a.amount);
  }

  const picked: Omit<CashBlip, "angle" | "radius">[] = [];
  let guard = 0;
  while (picked.length < count && guard < count * PRICE_POINTS.length) {
    const price = PRICE_POINTS[guard % PRICE_POINTS.length];
    const next = buckets.get(price)?.shift();
    if (next) picked.push(next);
    guard += 1;
  }

  return picked.map((blip, i) => ({
    ...blip,
    angle: (i * 360) / Math.max(count, picked.length || 1) + 18 + (blip.gameId % 17),
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

  const prices: { key: PriceFilter; label: string }[] = PRICE_POINTS.map((p) => ({
    key: String(p) as PriceFilter,
    label: `$${p}`,
  }));

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
