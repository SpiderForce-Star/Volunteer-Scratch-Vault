import { Link } from "@tanstack/react-router";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useDeskAlert } from "@/lib/use-desk-alert";

const NAV = [
  { to: "/" as const, hash: "desk", label: "Desk" },
  { to: "/" as const, hash: "games", label: "Games" },
  { to: "/pricing" as const, hash: undefined, label: "Pricing" },
  { to: "/disclaimer" as const, hash: undefined, label: "Play responsibly" },
];

export function SiteHeader() {
  const { unseen, markSeen } = useDeskAlert();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:px-6">
        <Link to="/" className="flex min-h-11 min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-raised font-display text-sm text-fg">
            VSV
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base tracking-tight">
              Volunteer Scratch Vault
            </span>
            <span className="block font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
              Tennessee · independent desk
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex shrink-0 items-center justify-end gap-0.5"
        >
          {NAV.map((item) => {
            const isDesk = item.label === "Desk";
            const hideOnMobile =
              (item.label === "Desk" && !unseen) ||
              item.label === "Games" ||
              item.label === "Play responsibly";
            const className = [
              "relative inline-flex min-h-11 items-center px-2.5 text-sm text-muted hover:text-fg sm:px-3",
              hideOnMobile ? "hidden md:inline-flex" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const pip =
              isDesk && unseen ? (
                <span
                  className="ml-1.5 inline-block size-1.5 rounded-full bg-gold"
                  aria-label="New desk information"
                />
              ) : null;
            return item.hash ? (
              <a
                key={item.label}
                href={`${item.to}#${item.hash}`}
                className={className}
                onClick={() => {
                  if (isDesk && unseen) markSeen();
                }}
              >
                {item.label}
                {pip}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className={className}>
                {item.label}
                {pip}
              </Link>
            );
          })}
          <HeaderAuth />
        </nav>
      </div>
    </header>
  );
}

function HeaderAuth() {
  const { user, isPending } = useCurrentUserState();

  if (!authEnabled) return null;

  if (isPending) {
    return (
      <span className="inline-flex min-h-11 items-center px-3 text-sm text-faint">
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        search={{ next: "/" }}
        className="inline-flex min-h-11 items-center px-3 text-sm text-fg"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      to="/account"
      className="inline-flex min-h-11 items-center px-3 text-sm text-fg"
    >
      Account
    </Link>
  );
}
