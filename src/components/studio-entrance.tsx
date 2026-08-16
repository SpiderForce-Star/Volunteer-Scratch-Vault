import { useEffect, useState } from "react";

const SHOWN_KEY = "vsv.studio.entrance";
const HOLD_MS = 5500;
const FORCE_MS = 7200;
const HERO_ID = "8nsN5ESSrY0";
const HERO_EMBED = `https://www.youtube-nocookie.com/embed/${HERO_ID}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&end=6`;

/** First-session studio intro: a few seconds of the WSV homepage hero. */
export function StudioEntrance() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SHOWN_KEY)) return;
    } catch {
      /* private mode — still show once this mount */
    }
    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(prefersReduce);
    setVisible(true);
    const hold = window.setTimeout(() => hide(), prefersReduce ? 900 : HOLD_MS);
    const force = window.setTimeout(() => hide(), prefersReduce ? 1100 : FORCE_MS);
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
    }, 420);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Webb Spinner Visions"
      className="fixed inset-0 z-50 overflow-hidden bg-bg"
      style={{ opacity: leaving ? 0 : 1, transition: "opacity 420ms ease" }}
      onClick={hide}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") hide();
      }}
    >
      <img
        src="/studio/hero-poster.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />

      {!reduce ? (
        <iframe
          title="Webb Spinner Visions hero film"
          src={HERO_EMBED}
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
          style={{
            width: "177.78vh",
            height: "56.25vw",
            minWidth: "100vw",
            minHeight: "100vh",
          }}
        />
      ) : null}

      <div className="absolute inset-0 bg-bg/50" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-14 text-center sm:justify-center sm:pb-0">
        <img
          src="/studio/shield-logo.jpg"
          alt=""
          width={56}
          height={56}
          className="size-14 rounded-md border border-gold/40 bg-raised object-contain p-1"
        />
        <p className="mt-4 font-display text-2xl tracking-tight text-paper sm:text-3xl">
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
          className="mt-3 inline-flex min-h-11 items-center font-mono text-sm text-muted underline underline-offset-4 hover:text-gold"
        >
          webbspinnervisions.net
        </a>
        <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
          Tap to enter
        </p>
      </div>
    </div>
  );
}
