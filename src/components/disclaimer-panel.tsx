import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function DisclaimerLead() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted">
      <p>
        Volunteer Scratch Vault (“the Vault,” “we,” “us”) is an independent
        information product of Webb Spinner Visions. It publishes a heat
        ranking of Tennessee instant (scratch-off) games using publicly posted
        remaining-prize counts. It does not sell lottery tickets, process
        wagers, or pay prizes.
      </p>
      <p>
        <strong className="font-medium text-fg">
          This is not the Tennessee Lottery.
        </strong>{" "}
        The Vault is not affiliated with, endorsed by, sponsored by, or
        connected to the Tennessee Education Lottery Corporation (TELC), the
        Tennessee Lottery, any lottery retailer, or any other state lottery.
        Lottery names, game titles, and prize amounts are used only to
        identify publicly offered games.
      </p>
      <p>
        You must be <strong className="font-medium text-fg">18 or older</strong>{" "}
        to buy Tennessee Lottery tickets. Remaining-prize data does not
        improve, change, or guarantee your odds. Scratch-offs are gambling.
        Most players lose money. If you or someone you know may have a
        gambling problem, call or text{" "}
        <a className="underline underline-offset-2" href="tel:18005224700">
          1-800-GAMBLER
        </a>{" "}
        (1-800-522-4700) or the Tennessee REDLINE at{" "}
        <a className="underline underline-offset-2" href="tel:18008899789">
          1-800-889-9789
        </a>
        .
      </p>
    </div>
  );
}

export function DisclaimerPanel() {
  return (
    <Accordion
      type="multiple"
      defaultValue={[
        "what",
        "not",
        "odds",
        "age",
        "warranty",
        "play",
        "addiction",
        "help",
      ]}
      className="rounded-lg border border-line bg-surface px-4"
    >
      <AccordionItem value="what">
        <AccordionTrigger>What this app is</AccordionTrigger>
        <AccordionContent>
          <p>
            The Vault compiles publicly posted remaining-prize counts for
            Tennessee instant games and ranks them with a heat score. Grand
            heat looks at jackpots still in retail after subtracting
            Tennessee’s typical Play It Again holdback (one top prize per
            game). Medium heat looks at mid-tier prizes still posted. Bust /
            avoid flags games with no effective retail top prize or a drained
            mid-tier.
          </p>
          <p>
            It is operated independently by Webb Spinner Visions. It is a
            consumer information tool only. You cannot buy, scan, check, or
            redeem tickets here. No account on this site creates a lottery
            ticket, a wager, or a prize claim.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="not">
        <AccordionTrigger>What this app is not</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Not a lottery, casino, sportsbook, sweepstakes, or ticket
              seller.
            </li>
            <li>
              Not affiliated with, endorsed by, or sponsored by the Tennessee
              Education Lottery Corporation, the Tennessee Lottery, or any
              retailer.
            </li>
            <li>
              Not official Lottery artwork, logos, marks, or communications.
              Ticket faces shown in the Vault are independent reconstructions
              for store identification (game name, number, and price). They
              are not official scans and may not match a ticket in your hand.
            </li>
            <li>
              Not gambling advice, investment advice, tax advice, or legal
              advice.
            </li>
            <li>
              Not a prediction that any specific ticket, pack, store, or
              county will win.
            </li>
            <li>
              Not a system that improves, changes, or guarantees lottery odds.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="odds">
        <AccordionTrigger>Odds, data, and limits</AccordionTrigger>
        <AccordionContent>
          <p>
            The overall odds printed on a ticket are set when the game is
            printed. Those odds do not change when prizes are claimed. A game
            can still be sold after its top prizes are gone. Remaining-prize
            tables change as tickets sell and as winners are reported.
          </p>
          <p>
            Tennessee typically reserves one top prize per instant game for
            Play It Again. The Vault’s “effective retail top” subtracts that
            holdback. That figure is our estimate for what is left in stores.
            It is not a Lottery ruling and may be wrong for a given game or
            week.
          </p>
          <p>
            Sources include the Lottery’s public remaining-prizes table and
            other published public counts. Some games only list the top prize.
            Medium heat is then estimated. Counts can be late, incomplete,
            revised, or missing a store-level location. “2 left” does not mean
            a matching ticket is at a particular retailer.
          </p>
          <p>
            Using this app does not make a losing ticket more likely to win,
            and it does not make a winning ticket more likely. Lottery play is
            chance. Past remaining counts do not predict future results.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="age">
        <AccordionTrigger>Age and legality</AccordionTrigger>
        <AccordionContent>
          <p>
            You must be{" "}
            <strong className="font-medium text-fg">18 or older</strong> to
            purchase Tennessee Lottery tickets. Do not use this app to help a
            minor obtain tickets. Follow Tennessee law, retailer rules, and
            any self-exclusion you have chosen.
          </p>
          <p>
            The Vault is for personal, non-commercial information. You are
            responsible for how you use the rankings. Do not rely on this site
            as your only source before spending money.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="warranty">
        <AccordionTrigger>No warranty and limits of liability</AccordionTrigger>
        <AccordionContent>
          <p>
            The Vault is provided <strong className="font-medium text-fg">as
            is</strong> and <strong className="font-medium text-fg">as
            available</strong>, without warranties of any kind, express or
            implied, including accuracy, completeness, merchantability, or
            fitness for a particular purpose. We do not warrant that remaining
            counts, heat scores, ticket faces, or help links are current or
            error-free.
          </p>
          <p>
            To the fullest extent allowed by law, Webb Spinner Visions and its
            owners, employees, and contractors are not liable for losses,
            lost winnings, extra tickets purchased, or other damages that
            arise from using or being unable to use this information —
            including decisions to buy, skip, or keep playing a scratch-off
            game.
          </p>
          <p>
            Nothing on this site is an offer to sell a lottery ticket or a
            solicitation to gamble. Prize payment is solely the
            responsibility of the Tennessee Lottery under its rules.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="play">
        <AccordionTrigger>Responsible play</AccordionTrigger>
        <AccordionContent>
          <p>
            Scratch-off tickets are a form of gambling. The house edge is
            built into every game. Most players lose money over time. Play
            only for entertainment, only with money you can afford to lose,
            and only for a time you have already decided is enough.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Set a budget before you go to the store. Stop when it is gone.</li>
            <li>
              Do not chase losses. A “hot” ranking is not a reason to spend
              more than you planned.
            </li>
            <li>
              Do not borrow money, skip bills, or hide tickets and receipts
              from people who depend on you.
            </li>
            <li>
              Do not treat remaining-prize heat as a skill edge or a way to
              get even.
            </li>
            <li>Take breaks. Walking away is always allowed.</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="addiction">
        <AccordionTrigger>Gambling addiction</AccordionTrigger>
        <AccordionContent>
          <p>
            Problem gambling is a recognized behavioral addiction. It can harm
            finances, work, health, and relationships. It can happen to
            anyone, including people who “only play scratch-offs.” Tools like
            heat maps can make play feel more skilled than it is. That feeling
            is not a reason to keep spending.
          </p>
          <p>Warning signs include:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Spending more time or money than you planned</li>
            <li>Chasing losses or thinking the next ticket will fix it</li>
            <li>Borrowing, lying, or hiding tickets and receipts</li>
            <li>Feeling restless, irritable, or depressed when not playing</li>
            <li>Neglecting work, school, family, or bills</li>
            <li>Using lottery play to escape stress or other problems</li>
            <li>Others expressing concern about your play</li>
          </ul>
          <p>
            If these sound familiar — for you or someone you care about — get
            help. You do not have to wait until things get worse. Recovery is
            possible.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="help">
        <AccordionTrigger>Help is available 24/7</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-3">
            <li>
              <p className="text-fg">National Problem Gambling Helpline</p>
              <p>
                Call or text{" "}
                <a
                  className="underline underline-offset-2"
                  href="tel:18005224700"
                >
                  1-800-GAMBLER
                </a>{" "}
                (1-800-522-4700 / 1-800-MY-RESET). Confidential help, 24 hours
                a day.
              </p>
              <p>
                <a
                  className="underline underline-offset-2"
                  href="https://www.ncpgambling.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  ncpgambling.org
                </a>
              </p>
            </li>
            <li>
              <p className="text-fg">Tennessee REDLINE</p>
              <p>
                24/7 information and referral for alcohol, drugs, and problem
                gambling:{" "}
                <a
                  className="underline underline-offset-2"
                  href="tel:18008899789"
                >
                  1-800-889-9789
                </a>
              </p>
            </li>
            <li>
              <p className="text-fg">Tennessee resources</p>
              <p>
                <a
                  className="underline underline-offset-2"
                  href="https://www.tn.gov/behavioral-health/substance-abuse-services/treatment/problem-gambling-programs.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  TN Department of Mental Health — problem gambling programs
                </a>
              </p>
              <p>
                <a
                  className="underline underline-offset-2"
                  href="https://tnlottery.com/play-responsibly/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tennessee Lottery — Play Responsibly
                </a>
              </p>
              <p>
                University of Memphis Gambling Clinic:{" "}
                <a
                  className="underline underline-offset-2"
                  href="tel:19016787867"
                >
                  901-678-STOP
                </a>
              </p>
            </li>
          </ul>
          <p>
            If you are in immediate danger or thinking of harming yourself,
            call or text <strong className="font-medium text-fg">988</strong>{" "}
            (Suicide & Crisis Lifeline) or local emergency services.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
