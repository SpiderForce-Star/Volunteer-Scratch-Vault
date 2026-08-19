import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SANDBOX_STRIPE_PRICES,
  STRIPE_PRICES,
  resolveStripePrices,
} from "../src/lib/stripe.prices.ts";
import {
  buildDesk,
  cashBlips,
  catalogHeat,
  publicGame,
  scoreGame,
  scoreGamePublic,
} from "../src/lib/heat.server.ts";

function fixture(overrides = {}) {
  return {
    number: 1001,
    name: "Fixture Jackpot",
    price: 10,
    topPrize: 200_000,
    odds: 4,
    tiers: [
      { amount: 200_000, remaining: 1 },
      { amount: 5_000, remaining: 80 },
      { amount: 500, remaining: 200 },
    ],
    source: "tn-remaining",
    theme: "cash",
    ...overrides,
  };
}

test("live checkout refuses missing price IDs", () => {
  assert.throws(
    () =>
      resolveStripePrices({
        mode: "live",
        monthly: "",
        annual: STRIPE_PRICES.annual,
      }),
    /requires STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL/,
  );
});

test("live checkout refuses sandbox price IDs", () => {
  assert.throws(
    () =>
      resolveStripePrices({
        mode: "live",
        monthly: SANDBOX_STRIPE_PRICES.monthly,
        annual: SANDBOX_STRIPE_PRICES.annual,
      }),
    /cannot use sandbox price IDs/,
  );
});

test("unknown key mode also refuses missing prices", () => {
  assert.throws(
    () => resolveStripePrices({ mode: "unknown", monthly: "", annual: "" }),
    /requires STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL/,
  );
});

test("test keys fall back to sandbox and refuse live IDs", () => {
  const fallback = resolveStripePrices({ mode: "test", monthly: "", annual: "" });
  assert.deepEqual(fallback, { ...SANDBOX_STRIPE_PRICES });
  assert.throws(
    () =>
      resolveStripePrices({
        mode: "test",
        monthly: STRIPE_PRICES.monthly,
        annual: STRIPE_PRICES.annual,
      }),
    /cannot use live price IDs/,
  );
});

test("live checkout accepts explicit live env IDs", () => {
  const resolved = resolveStripePrices({
    mode: "live",
    monthly: STRIPE_PRICES.monthly,
    annual: STRIPE_PRICES.annual,
  });
  assert.deepEqual(resolved, { ...STRIPE_PRICES });
});

test("scoreGamePublic never returns mid or low remaining", () => {
  const paid = scoreGame(fixture());
  const guest = scoreGamePublic(fixture());
  assert.equal(paid.midRemaining, 80);
  assert.equal(paid.lowRemaining, 200);
  assert.equal(guest.midRemaining, null);
  assert.equal(guest.lowRemaining, null);
  assert.equal(guest.mediumKnown, false);
  assert.equal(guest.topRemaining, 1);
});

test("guest scores ignore paid mid-tier data", () => {
  const richMid = fixture({ number: 1, tiers: [
    { amount: 200_000, remaining: 1 },
    { amount: 5_000, remaining: 80 },
    { amount: 500, remaining: 200 },
  ]});
  const paid = scoreGame(richMid);
  const guest = scoreGamePublic(richMid);
  assert.notEqual(guest.medium, paid.medium);
  assert.notEqual(guest.vault, paid.vault);
  assert.equal(guest.medium, scoreGame(publicGame(richMid)).medium);
});

test("unknown mid is not a bust", () => {
  const drainedTop = fixture({
    tiers: [
      { amount: 200_000, remaining: 1 },
      { amount: 5_000, remaining: null },
      { amount: 500, remaining: null },
    ],
  });
  const report = scoreGame(drainedTop);
  assert.equal(report.effectiveTop, 0);
  assert.equal(report.midRemaining, null);
  assert.equal(report.bust, false);
  assert.equal(scoreGamePublic(drainedTop).bust, false);
});

test("known drained mid is still a paid bust", () => {
  const drained = fixture({
    tiers: [
      { amount: 200_000, remaining: 1 },
      { amount: 5_000, remaining: 1 },
      { amount: 500, remaining: 0 },
    ],
  });
  assert.equal(scoreGame(drained).bust, true);
  assert.equal(scoreGamePublic(drained).bust, false);
});

test("guest catalog stats do not use mid remaining", () => {
  const games = [
    fixture({ number: 1 }),
    fixture({
      number: 2,
      tiers: [
        { amount: 200_000, remaining: 4 },
        { amount: 5_000, remaining: 0 },
        { amount: 500, remaining: 0 },
      ],
    }),
  ];
  const paid = catalogHeat(games);
  const guest = catalogHeat(games.map(publicGame), scoreGamePublic);
  assert.notEqual(guest.medium, paid.medium);
  assert.equal(guest.busts, 0);
  assert.ok(paid.busts >= 0);
});

test("guest cash blips rank without mid-tier remaining", () => {
  const midHeavy = fixture({
    number: 11,
    name: "Mid Heavy",
    topPrize: 200_000,
    tiers: [
      { amount: 200_000, remaining: 2 },
      { amount: 5_000, remaining: 90 },
      { amount: 500, remaining: 10 },
    ],
  });
  const publicCash = fixture({
    number: 12,
    name: "Cash Frenzy",
    price: 5,
    topPrize: 500,
    tiers: [
      { amount: 500, remaining: 4 },
      { amount: 100, remaining: null },
      { amount: 50, remaining: null },
    ],
  });
  const paidBlips = cashBlips([midHeavy, publicCash], 8);
  const guestBlips = cashBlips([publicGame(midHeavy), publicGame(publicCash)], 8);
  assert.equal(paidBlips[0]?.id, 11);
  assert.ok(guestBlips.every((blip) => blip.id !== 11));
  assert.equal(guestBlips[0]?.id, 12);
});

test("guest desk picks are not the paid mid-tier ranking", () => {
  const midHot = fixture({
    number: 21,
    name: "Mid Hot",
    price: 10,
    tiers: [
      { amount: 200_000, remaining: 1 },
      { amount: 5_000, remaining: 90 },
      { amount: 500, remaining: 400 },
    ],
  });
  const topLive = fixture({
    number: 22,
    name: "Top Live",
    price: 10,
    tiers: [
      { amount: 200_000, remaining: 6 },
      { amount: 5_000, remaining: 0 },
      { amount: 500, remaining: 0 },
    ],
  });
  const paidReports = new Map([
    [midHot.number, scoreGame(midHot)],
    [topLive.number, scoreGame(topLive)],
  ]);
  const guestGames = [publicGame(midHot), publicGame(topLive)];
  const guestReports = new Map(guestGames.map((game) => [game.number, scoreGamePublic(game)]));
  const paidPick = buildDesk([midHot, topLive], paidReports).byPrice.find((row) => row.price === "$10")?.pick;
  const guestPick = buildDesk(guestGames, guestReports).byPrice.find((row) => row.price === "$10")?.pick;
  assert.equal(paidPick?.game.number, 21);
  assert.equal(guestPick?.game.number, 22);
  assert.equal(guestPick?.heat.midRemaining, null);
});
