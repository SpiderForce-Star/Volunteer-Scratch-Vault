# Volunteer Scratch Vault

Independent heat map of Tennessee Lottery scratch-off remaining prizes.

**Not affiliated with, endorsed by, or connected to the Tennessee Education Lottery Corporation.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SpiderForce-Star/Volunteer-Scratch-Vault)

**One-click live site:** [Import this repo on Vercel](https://vercel.com/new/import?s=https://github.com/SpiderForce-Star/Volunteer-Scratch-Vault)

That opens Vercel signed in with GitHub, creates the project, and gives you a `*.vercel.app` URL. No extra env vars are required.

## What it does

Live desk ranks $5, $10, $20, and $25+ instant games by:

- **Grand heat** — jackpots still in retail after subtracting Tennessee’s Play It Again holdback
- **Medium heat** — mid-tier remaining prizes
- **Bust / avoid** — no effective retail top, or a drained mid-tier
- **Cash-out games** — Frenzy-style tickets whose “top prize” is a medium cash prize

Printed overall odds are not used to rank tickets. Full disclaimer and problem-gambling help are in the app.

## Stack

React 19 · TypeScript · Vite · TanStack Start · Tailwind v4

## Local

```bash
npm install
npm run dev
```

```bash
npm run typecheck
npm run build
```

## Data

Catalog: [`src/data/games.ts`](src/data/games.ts)  
Heat / desk: [`src/lib/heat.ts`](src/lib/heat.ts)

Sources: [Tennessee Lottery remaining prizes](https://tnlottery.com/remaining-prizes/) and other published public counts.

Ticket faces are independent reconstructions for store identification. They are not official Lottery scans.

## Disclaimer

Informational only. Remaining counts change as tickets sell. This tool does not improve the odds of winning any prize. Play only if you are 18 or older. If gambling is a problem, call or text [1-800-GAMBLER](tel:18005224700).

Webb Spinner Visions
