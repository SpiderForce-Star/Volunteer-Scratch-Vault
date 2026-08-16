import { useEffect, useState } from "react";
import { MechanicalSpider } from "@/components/mechanical-spider";

const SHOWN_KEY = "vsv.studio.entrance";
const HOLD_MS = 2600;
const FORCE_MS = 3400;

/** First-session studio mark: mechanical spider, then the desk. */
export function StudioEntrance() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SHOWN_KEY)) return;
    } catch {
      /* private mode — still show once this mount */
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setVisible(true);
    const hold = window.setTimeout(() => hide(), reduce ? 700 : HOLD_MS);
    const force = window.setTimeout(() => hide(), reduce ? 900 : FORCE_MS);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(force);
    };
  }, []);

  function hide() {
    setLeaving(true);
    window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SHOWN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 380);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Webb Spinner Visions"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-6"
      style={{ opacity: leaving ? 0 : 1, transition: "opacity 380ms ease" }}
      onClick={hide}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") hide();
      }}
    >
      <MechanicalSpider className="w-40 sm:w-48" />
      <p className="mt-6 font-display text-2xl tracking-tight text-paper sm:text-3xl">
        Webb Spinner Visions
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
        Websites · Software · AI
      </p>
      <a
        href="https://webbspinnervisions.net"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="mt-4 inline-flex min-h-11 items-center font-mono text-sm text-muted underline underline-offset-4 hover:text-gold"
      >
        webbspinnervisions.net
      </a>
      <p className="mt-8 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
        Tap to enter
      </p>
    </div>
  );
}
