import { useEffect, useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useDeskAlert } from "@/lib/use-desk-alert";
import { TrialCta } from "@/components/trial-cta";
import { SpiderMark } from "@/components/mechanical-spider";
import { useAccess } from "@/lib/use-access";

const NAV = [
  { to: "/" as const, hash: "desk", label: "Desk" },
  { to: "/" as const, hash: "games", label: "Games" },
  { to: "/pricing" as const, hash: undefined, label: "Pricing" },
  { to: "/disclaimer" as const, hash: undefined, label: "Play responsibly" },
];

export function SiteHeader() {
  const { unseen, markSeen } = useDeskAlert();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6">
        <Link
          to="/"
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 sm:gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-raised font-display text-sm text-fg">
            VSV
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-sm tracking-tight sm:text-base">
              <span className="sm:hidden">Scratch Vault</span>
              <span className="hidden sm:inline">Volunteer Scratch Vault</span>
            </span>
            <span className="block truncate font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
              Tennessee · independent desk
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <HeaderTrial />
          <HeaderAuth />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md text-fg md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <nav
            aria-label="Primary"
            className="hidden items-center md:flex"
          >
            <NavLinks unseen={unseen} markSeen={markSeen} onNavigate={() => setOpen(false)} />
            <StudioLink />
          </nav>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-line bg-bg px-3 py-3 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            <NavLinks
              unseen={unseen}
              markSeen={markSeen}
              onNavigate={() => setOpen(false)}
              stacked
            />
            <StudioLink stacked />
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function NavLinks({
  unseen,
  markSeen,
  onNavigate,
  stacked = false,
}: {
  unseen: boolean;
  markSeen: () => void;
  onNavigate: () => void;
  stacked?: boolean;
}) {
  return (
    <>
      {NAV.map((item) => {
        const isDesk = item.label === "Desk";
        const className = stacked
          ? "relative inline-flex min-h-11 items-center px-2 text-sm text-muted hover:text-fg"
          : "relative inline-flex min-h-11 items-center px-2.5 text-sm text-muted hover:text-fg sm:px-3";
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
              onNavigate();
            }}
          >
            {item.label}
            {pip}
          </a>
        ) : (
          <Link key={item.label} to={item.to} className={className} onClick={onNavigate}>
            {item.label}
            {pip}
          </Link>
        );
      })}
    </>
  );
}

function HeaderTrial() {
  const { paid, isPending } = useAccess();
  if (isPending || paid) return null;
  return <TrialCta compact className="px-2.5 text-xs sm:px-3 sm:text-sm" />;
}

function HeaderAuth() {
  const { user, isPending } = useCurrentUserState();

  if (!authEnabled) return null;

  if (isPending) {
    return (
      <span className="inline-flex min-h-11 items-center px-2 text-sm text-faint sm:px-3">
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        search={{ next: "/" }}
        className="inline-flex min-h-11 items-center px-2 text-sm text-fg sm:px-3"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      to="/account"
      className="inline-flex min-h-11 items-center px-2 text-sm text-fg sm:px-3"
    >
      Account
    </Link>
  );
}

function StudioLink({ stacked = false }: { stacked?: boolean }) {
  return (
    <a
      href="https://webbspinnervisions.net"
      target="_blank"
      rel="noopener noreferrer"
      className={
        stacked
          ? "inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted hover:text-gold"
          : "inline-flex min-h-11 items-center gap-1.5 px-2.5 text-sm text-muted hover:text-gold sm:px-3"
      }
    >
      <SpiderMark className="size-4 shrink-0 text-gold" />
      <span>Webb Spinner Visions</span>
    </a>
  );
}
