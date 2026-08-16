import { createServerFn } from "@tanstack/react-start";
import { optionalAuthMiddleware } from "./auth/optional";
import type { Game } from "@/data/games";
import type { CashBlip, DeskReview, HeatReport } from "./heat";

export type DeskSnapshot = {
  paid: boolean;
  weekLabel: string;
  gameCount: number;
  games: Game[];
  reports: Record<string, HeatReport>;
  desk: DeskReview;
  blips: CashBlip[];
  stats: { grand: number; medium: number; busts: number; games: number };
};

export const getDeskSnapshot = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .handler(async ({ context }): Promise<DeskSnapshot> => {
    const { buildDeskSnapshot } = await import("./desk.server");
    return buildDeskSnapshot(context.userId, context.email);
  });
