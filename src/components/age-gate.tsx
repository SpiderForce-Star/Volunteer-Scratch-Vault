import { useEffect, useState } from "react";
import {
  exitNativeApp,
  hasConfirmedAge,
  isNativeApp,
  persistAgeConfirmation,
} from "@/lib/native";

/**
 * First-launch 18+ gate for the native shells only.
 * Web visitors still see the existing in-page disclaimers.
 */
export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isNativeApp() && !hasConfirmedAge()) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/92 px-4 py-6 sm:items-center"
    >
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
          Age confirmation
        </p>
        <h2
          id="age-gate-title"
          className="mt-3 font-display text-2xl tracking-tight text-fg"
        >
          You must be 18 or older to use Volunteer Scratch Vault.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This is an independent remaining-prize information tool. It is not a
          lottery, does not sell tickets, and is not affiliated with the
          Tennessee Education Lottery Corporation. Remaining counts do not
          improve the odds of winning any prize.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          If gambling is a problem, call or text{" "}
          <a className="underline underline-offset-2" href="tel:18005224700">
            1-800-GAMBLER
          </a>{" "}
          or Tennessee REDLINE{" "}
          <a className="underline underline-offset-2" href="tel:18008899789">
            1-800-889-9789
          </a>
          .
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
            onClick={() => {
              persistAgeConfirmation();
              setOpen(false);
            }}
          >
            I am 18 or older — continue
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-line px-4 text-sm text-muted hover:text-fg"
            onClick={() => {
              void exitNativeApp();
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
