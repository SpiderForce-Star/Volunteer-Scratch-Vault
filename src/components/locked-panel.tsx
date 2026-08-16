import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function UnlockFullDeskButton({
  className,
  children = "Unlock full desk",
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      to="/pricing"
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LockedPanel({
  title,
  teaser,
  children,
}: {
  title: string;
  teaser?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-[3px]"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/70 px-4 text-center backdrop-blur-[1px]">
        <Lock className="size-5 text-warm" aria-hidden="true" />
        <div>
          <p className="font-display text-lg text-fg">{title}</p>
          {teaser ? (
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{teaser}</p>
          ) : null}
        </div>
        <UnlockFullDeskButton />
      </div>
    </div>
  );
}
