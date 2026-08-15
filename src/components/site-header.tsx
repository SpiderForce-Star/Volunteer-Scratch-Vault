import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/" as const, hash: "desk", label: "Desk" },
  { to: "/" as const, hash: "games", label: "Games" },
  { to: "/disclaimer" as const, hash: undefined, label: "Play responsibly" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-raised font-display text-sm text-fg">
            VSV
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base tracking-tight">
              Volunteer Scratch Vault
            </span>
            <span className="block font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
              Tennessee · independent desk
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-end gap-1"
        >
          {NAV.map((item) =>
            item.hash ? (
              <a
                key={item.label}
                href={`${item.to}#${item.hash}`}
                className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-fg"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-fg"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
