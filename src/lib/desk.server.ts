import { DESK_META } from "@/data/desk-meta";
import { fullCatalog } from "@/data/games.full.server";
import type { Game } from "@/data/games";
import {
  buildDesk,
  cashBlips,
  catalogHeat,
  scoreGame,
} from "./heat.server";
import type { DeskReview, HeatReport } from "./heat";
import type { DeskSnapshot } from "./desk";
import { accessFromRow, loadUserBilling } from "./subscription.server";

function redactGame(game: Game): Game {
  return {
    ...game,
    tiers: game.tiers.map((tier, i) => ({
      ...tier,
      remaining: i === 0 ? tier.remaining : null,
    })),
  };
}

function redactReport(heat: HeatReport): HeatReport {
  return {
    ...heat,
    midRemaining: null,
    lowRemaining: null,
    mediumKnown: false,
  };
}

function redactPickWhy(why: string): string {
  return why.replace(/\d[\d,]*/g, "•");
}

async function subscriberIsPaid(userId: string | null): Promise<boolean> {
  if (!userId) return false;

  const row = await loadUserBilling(userId);
  if (accessFromRow(row, null).paid) return true;

  return hasRevenueCatEntitlement(userId);
}

async function hasRevenueCatEntitlement(userId: string): Promise<boolean> {
  const secret = process.env.REVENUECAT_SECRET_API_KEY?.trim();
  if (!secret) return false;
  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return false;
    const json = (await res.json()) as {
      subscriber?: {
        entitlements?: Record<string, { expires_date?: string | null }>;
      };
    };
    const ent = json.subscriber?.entitlements?.vsv_full_access;
    if (!ent) return false;
    if (!ent.expires_date) return true;
    const exp = Date.parse(ent.expires_date);
    return Number.isFinite(exp) && exp > Date.now();
  } catch {
    return false;
  }
}

export async function buildDeskSnapshot(
  userId: string | null,
  _email: string | null,
): Promise<DeskSnapshot> {
  const paid = await subscriberIsPaid(userId);
  const games = fullCatalog();
  const reports = new Map(games.map((game) => [game.number, scoreGame(game)]));
  const desk = buildDesk(games, reports);
  const blips = cashBlips(games, 8);
  const stats = catalogHeat(games);

  if (paid) {
    return {
      paid: true,
      weekLabel: DESK_META.weekLabel,
      gameCount: games.length,
      games,
      reports: Object.fromEntries(
        [...reports.entries()].map(([k, v]) => [String(k), v]),
      ),
      desk,
      blips,
      stats,
    };
  }

  const guestGames = games.map(redactGame);
  const guestReports: Record<string, HeatReport> = {};
  for (const [number, heat] of reports) {
    guestReports[String(number)] = redactReport(heat);
  }

  const guestDesk: DeskReview = {
    ...desk,
    byPrice: desk.byPrice.map((row) =>
      row.pick
        ? {
            ...row,
            pick: {
              ...row.pick,
              game: redactGame(row.pick.game),
              heat: redactReport(row.pick.heat),
              why: redactPickWhy(row.pick.why),
            },
          }
        : row,
    ),
    mediumLeaders: [],
    official: [],
    avoid: desk.avoid.slice(0, 3).map((row) => ({
      ...row,
      game: redactGame(row.game),
      heat: redactReport(row.heat),
      why: "No useful retail top on the posted counts",
    })),
  };

  return {
    paid: false,
    weekLabel: DESK_META.weekLabel,
    gameCount: games.length,
    games: guestGames,
    reports: guestReports,
    desk: guestDesk,
    blips: blips.map((blip) => ({ ...blip, remaining: null })),
    stats,
  };
}
