import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () =>
    pageHead({
      title: "Terms of Service",
      description:
        "Terms of use for Volunteer Scratch Vault. Independent remaining-prize desk. 18+. Not affiliated with the Tennessee Education Lottery.",
      path: "/terms",
    }),
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs tracking-[0.16em] text-faint uppercase">
        Legal
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        These Terms govern your use of Volunteer Scratch Vault, an independent
        remaining-prize information product of Webb Spinner Visions. By using
        the website, the native apps, or starting a trial, you agree to these
        Terms and to the{" "}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-fg">
          Privacy Policy
        </Link>
        . Last updated August 16, 2026.
      </p>

      <Section title="1. Who we are">
        <p>
          Volunteer Scratch Vault is operated by Webb Spinner Visions. Contact:{" "}
          <a
            className="underline underline-offset-2 hover:text-fg"
            href="mailto:webbspinnervisions@gmail.com"
          >
            webbspinnervisions@gmail.com
          </a>
          .
        </p>
        <p className="mt-3">
          This product is not a lottery, not a ticket seller, and not affiliated
          with, endorsed by, sponsored by, or connected to the Tennessee
          Education Lottery Corporation or any other lottery operator.
        </p>
      </Section>

      <Section title="2. What this product is">
        <p>
          The Vault compiles remaining-prize counts from the publicly posted
          Tennessee Lottery remaining-prizes table and other published game
          information, usually once a week. Counts are not live store
          inventory. You cannot buy, scan, check, or redeem tickets here.
          Remaining counts change as tickets sell. Remaining counts do not
          improve the odds of winning any prize.
        </p>
        <p className="mt-3">
          Ticket faces shown in the product are independent reconstructions for
          identification. They are not official Lottery artwork.
        </p>
      </Section>

      <Section title="3. Eligibility">
        <p>
          You must be 18 or older. Tennessee Lottery tickets are 18+. If you
          are under 18, do not use this product. We may suspend or close an
          account if we reasonably believe the user is under 18.
        </p>
      </Section>

      <Section title="4. Accounts">
        <p>
          Some features require an account. You are responsible for the activity
          on that account and for keeping sign-in details to yourself. Tell us
          promptly if you think someone else used it.
        </p>
        <p className="mt-3">
          We may refuse, suspend, or close an account that violates these Terms,
          abuses trials, or attempts to bypass Full Access.
        </p>
      </Section>

      <Section title="5. Subscriptions, trials, and billing">
        <p>
          Full Access is a recurring subscription. Current advertised prices are
          $4.99 per month or $49.99 per year, each with a 30-day free trial,
          unless a store or checkout page shows a different price at the time
          you subscribe. Taxes may apply.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            On the website, billing runs through Stripe. Starting a trial
            authorizes Stripe to charge the selected plan if you do not cancel
            before the trial ends.
          </li>
          <li>
            In the iOS or Android app, billing runs through the App Store or
            Google Play (via RevenueCat). Those stores’ payment terms also
            apply. The native apps do not open a website checkout.
          </li>
        </ul>
        <p className="mt-3">
          After the trial, the subscription renews automatically until you
          cancel. You can cancel anytime: on the website use Manage billing; in
          the apps use Manage subscription (or the store’s subscription
          settings). Access continues through the paid or trial period already
          paid for.
        </p>
        <p className="mt-3">
          Unless required by law or by Apple / Google policy, fees are
          non-refundable. A charge made in error — tell us at{" "}
          <a
            className="underline underline-offset-2 hover:text-fg"
            href="mailto:webbspinnervisions@gmail.com"
          >
            webbspinnervisions@gmail.com
          </a>{" "}
          and we will review it.
        </p>
      </Section>

      <Section title="6. Acceptable use">
        <p>You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Scrape, harvest, or republish the desk at scale without written permission.</li>
          <li>Circumvent the paywall, trial limits, or age gate.</li>
          <li>Probe, overload, or attack the service, or attempt to access another user’s account.</li>
          <li>Use the product to sell tickets, take wagers, or imply official Lottery status.</li>
          <li>Claim that remaining counts make any ticket more likely to win.</li>
        </ul>
      </Section>

      <Section title="7. Intellectual property">
        <p>
          The Vault name, layout, rankings, copy, and reconstructed ticket faces
          are owned by Webb Spinner Visions or its licensors. Official Lottery
          names, game titles, and trademarks belong to their owners. We use
          public remaining-prize information; we do not claim those official
          marks.
        </p>
      </Section>

      <Section title="8. No warranty">
        <p>
          The product is provided “as is.” Public counts can be late, incomplete,
          or wrong. We do not warrant that the desk is current, error-free, or
          fit for any particular purpose. Information here is not financial,
          gambling, or legal advice.
        </p>
      </Section>

      <Section title="9. Limitation of liability">
        <p>
          To the fullest extent allowed by law, Webb Spinner Visions is not
          liable for lost tickets, lost winnings, lost profits, or any indirect
          or consequential damages arising from use of the desk. Our total
          liability for a claim relating to the product is limited to the
          amount you paid us for Full Access in the 12 months before the claim,
          or $50 if you paid nothing.
        </p>
        <p className="mt-3">
          Some states do not allow certain limitations. In those states, the
          limit applies only as far as the law allows. These Terms do not
          limit liability that cannot be limited under Tennessee or U.S. law.
        </p>
      </Section>

      <Section title="10. Indemnity">
        <p>
          You will defend and indemnify Webb Spinner Visions against claims
          arising from your misuse of the product, your violation of these
          Terms, or your violation of law.
        </p>
      </Section>

      <Section title="11. Third-party services">
        <p>
          Sign-in, hosting, and payments are provided by third parties (including
          Stripe, Vercel, Apple, Google, and our auth provider). Their terms
          govern their services. We are not responsible for an outage or
          decision by those providers.
        </p>
      </Section>

      <Section title="12. Changes and termination">
        <p>
          We may update these Terms. The “Last updated” date will change. If a
          change is material, we will post it on this page before it applies to
          you. Continued use after that date is acceptance. We may stop offering
          the product or a plan with reasonable notice where required.
        </p>
      </Section>

      <Section title="13. Governing law">
        <p>
          These Terms are governed by the laws of the State of Tennessee,
          without regard to conflict-of-law rules. Courts in Tennessee have
          exclusive venue, except that you may have additional rights in your
          home state that cannot be waived, and Apple or Google may require
          store disputes to follow their rules.
        </p>
      </Section>

      <Section title="14. Responsible play">
        <p>
          Play only with money you can afford to lose. Do not chase losses. If
          gambling is no longer fun, call or text{" "}
          <a className="underline underline-offset-2" href="tel:18005224700">
            1-800-GAMBLER
          </a>{" "}
          (1-800-522-4700) or Tennessee REDLINE{" "}
          <a className="underline underline-offset-2" href="tel:18008899789">
            1-800-889-9789
          </a>
          . See the{" "}
          <Link
            to="/disclaimer"
            className="underline underline-offset-2 hover:text-fg"
          >
            full disclaimer
          </Link>
          .
        </p>
      </Section>

      <p className="mt-10 text-sm text-faint">
        <Link to="/" className="underline underline-offset-2 hover:text-fg">
          Back to the vault
        </Link>
        {" · "}
        <Link
          to="/privacy"
          className="underline underline-offset-2 hover:text-fg"
        >
          Privacy
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

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
