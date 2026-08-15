# Volunteer Scratch Vault

Independent heat map of Tennessee Lottery scratch-off remaining prizes.

**Not affiliated with, endorsed by, or connected to the Tennessee Education Lottery Corporation.**

Live desk ranks $5, $10, $20, and $25+ instant games by:

- **Grand heat** — jackpots still in retail after subtracting Tennessee’s Play It Again holdback (one top prize per game is reserved)
- **Medium heat** — mid-tier remaining prizes (what most tickets actually pay)
- **Bust / avoid** — no effective retail top, or a drained mid-tier
- **Cash-out games** — Frenzy-style tickets whose “top prize” is itself a medium cash prize

Printed overall odds never change and are not used to rank tickets.

## Stack

React 19 · TypeScript · Vite · TanStack Start · Tailwind v4

## Local

```bash
npm install
npm run dev
```

App listens on `http://localhost:8080`.

```bash
npm run typecheck
npm run build
```

## Data

Catalog lives in [`src/data/games.ts`](src/data/games.ts). Heat and desk logic is in [`src/lib/heat.ts`](src/lib/heat.ts).

Sources:

- [Tennessee Lottery remaining prizes](https://tnlottery.com/remaining-prizes/) (official three-tier rows when published)
- Compiled public remaining counts for games that only post a top prize

Ticket faces are independent reconstructions for store identification (name, number, price). They are not official Lottery scans.

## Disclaimer

Informational only. Remaining counts change as tickets sell. This tool does not improve the odds of winning any prize. Play only if you are 18 or older.

Webb Spinner Visions
