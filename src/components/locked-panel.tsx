import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { TrialCta } from "@/components/trial-cta";
import { cn } from "@/lib/utils";

export function UnlockFullDeskButton({
  className,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <TrialCta className={className} />;
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
      <div aria-hidden="true" className="pointer-events-none select-none opacity-40">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="-rotate-24 font-display text-5xl tracking-[0.28em] text-gold/20">
          VAULT
        </span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/55 px-4 text-center">
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
