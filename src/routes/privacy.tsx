import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    pageHead({
      title: "Privacy",
      description:
        "Privacy policy for Volunteer Scratch Vault. Email and purchases only. Independent remaining-prize desk. 18+.",
      path: "/privacy",
    }),
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
        Legal
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Privacy</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Volunteer Scratch Vault is an independent remaining-prize information
        product of Webb Spinner Visions. It is not a lottery, not a ticket
        seller, and not affiliated with the Tennessee Education Lottery
        Corporation. Last updated August 16, 2026.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">What we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>
            <span className="text-fg">Account email and display name</span> when
            you sign in (via our auth provider).
          </li>
          <li>
            <span className="text-fg">Auth session</span> (a signed cookie or
            bearer token) so you stay signed in.
          </li>
          <li>
            <span className="text-fg">Billing customer id</span> — Stripe
            customer id on the website, or the App Store / Play Billing /
            RevenueCat customer id in the native apps — so we can tell whether
            Full Access is active.
          </li>
          <li>
            <span className="text-fg">Subscription status</span> (trialing,
            active, canceled, past due) and the current period end date.
          </li>
          <li>
            <span className="text-fg">Session cookie</span> so you stay signed
            in, plus on-device storage for the 18+ confirmation and your last
            price filter. Hosting logs (IP, user agent) may be kept briefly by
            Vercel to run the site.
          </li>
          <li>
            <span className="text-fg">First-visit studio intro</span> may load
            a muted YouTube embed of the Webb Spinner Visions hero film
            (youtube-nocookie.com) so the clip can play. Reduced-motion
            visitors see a still instead.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">
          What we do not collect
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Precise location or GPS.</li>
          <li>Contacts, photos, camera, or microphone.</li>
          <li>Government ID, Social Security number, or payment card numbers
            (card details stay with Stripe or Apple/Google).</li>
          <li>Store-level inventory or any data from lottery retailers.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">18+</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          You must be 18 or older. The native apps ask you to confirm age on
          first launch. This product is information only. Remaining-prize
          counts do not improve the odds of winning any prize.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">How we use data</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We use the account and billing fields to sign you in, unlock Full
          Access when a trial or paid subscription is active, and let you
          manage or cancel that subscription. We do not sell personal
          information. We do not use your data to target lottery ads.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">
          How to delete your account
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Email Webb Spinner Visions at{" "}
          <a
            className="underline underline-offset-2 hover:text-fg"
            href="mailto:webbspinnervisions@gmail.com"
          >
            webbspinnervisions@gmail.com
          </a>{" "}
          from the address on the account and ask us to delete it. We will
          remove the auth profile and billing identifiers we store. If you
          have an App Store or Play subscription, cancel it in that store as
          well — we cannot cancel a store subscription on your behalf.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Contact</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Webb Spinner Visions
          <br />
          <a
            className="underline underline-offset-2 hover:text-fg"
            href="mailto:webbspinnervisions@gmail.com"
          >
            webbspinnervisions@gmail.com
          </a>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          If gambling is a problem, call or text{" "}
          <a className="underline underline-offset-2" href="tel:18005224700">
            1-800-GAMBLER
          </a>{" "}
          (1-800-522-4700) or Tennessee REDLINE{" "}
          <a className="underline underline-offset-2" href="tel:18008899789">
            1-800-889-9789
          </a>
          .
        </p>
      </section>

      <p className="mt-10 text-sm text-faint">
        <Link to="/" className="underline underline-offset-2 hover:text-fg">
          Back to the vault
        </Link>
        {" · "}
        <Link
          to="/terms"
          className="underline underline-offset-2 hover:text-fg"
        >
          Terms
        </Link>
        {" · "}
        <Link
          to="/disclaimer"
          className="underline underline-offset-2 hover:text-fg"
        >
          Disclaimer
        </Link>
      </p>
    </article>
  );
}
