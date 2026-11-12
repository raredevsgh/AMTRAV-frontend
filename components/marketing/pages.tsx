// The site's inner pages in the landing page's style: Features, For brands, About, and the
// policy pages from the footer. Copy matches what the app and console do today.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Ban,
  BatteryCharging,
  Bell,
  Check,
  Cpu,
  FileText,
  Globe,
  Languages,
  LayoutGrid,
  Link2,
  Lock,
  Map as MapIcon,
  MapPin,
  MessageSquare,
  PackageCheck,
  Plane,
  QrCode,
  Route,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";
import { brand } from "@/lib/brand";
import type { LegalDocument } from "@/lib/legal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Float } from "./motion";
import { Voices } from "./voices";
import "@/app/trace.css";
import "@/app/pages.css";

const T = brand.shortProduct;

/** The top of an inner page: eyebrow, headline, a line of copy, and an optional photo. */
function PageHero({
  eyebrow,
  title,
  children,
  image,
  alt,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  image?: string;
  alt?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`trace-panel night page-hero${image ? " with-image" : ""}`}>
      <div className="page-hero-copy">
        <span className="trace-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{children}</p>
        {actions ? <div className="trace-buttons">{actions}</div> : null}
      </div>
      {image ? (
        <figure className="page-hero-image">
          <Image
            src={image}
            alt={alt ?? ""}
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            priority
          />
        </figure>
      ) : null}
    </section>
  );
}

function Head({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="trace-head">
      <span className="trace-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </header>
  );
}

type Card = { icon: ReactNode; title: string; body: string };

function Cards({ items, columns = 3 }: { items: Card[]; columns?: 2 | 3 }) {
  return (
    <div className={`page-cards cols-${columns}`}>
      {items.map((item) => (
        <article key={item.title}>
          <span className="page-card-icon">{item.icon}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

function Cta({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="trace-panel soft page-cta">
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="trace-buttons">{children}</div>
    </section>
  );
}

// ---- Features ----

/** The app, screen by screen: what a traveller can do in each part of it. */
const appScreens: { title: string; body: string; points: string[] }[] = [
  {
    title: "Home",
    body: "How every bag is doing, the moment you open the app.",
    points: [
      "Bag health: which bags reported in the last hour, and which have gone quiet",
      "Distance travelled this week, day by day",
      "Live flights around you when you’re at an airport",
    ],
  },
  {
    title: "Your bag",
    body: "Each bag’s own page, built around the bag itself, turning in 3D.",
    points: [
      "Battery at a glance, with charging status",
      "Location, Security, Battery and Weight controls, each with its own card",
      "Set your airline’s weight limit right from the page",
      "Theft Mode on or off in one tap",
    ],
  },
  {
    title: "Map",
    body: "Every bag on one map, with the route each one took.",
    points: [
      "Search live flights by airline or callsign",
      "Swipe the bag cards away into a floating bubble",
      "Directions to a bag in your maps app",
    ],
  },
  {
    title: "Activity and alerts",
    body: "Everything that happened, as it happens.",
    points: [
      "Moves, impacts, weigh-ins, openings and arrivals on one timeline",
      "Push notifications, even when the app is closed",
      "Messages from the Amortrav team in your inbox",
    ],
  },
  {
    title: "Journeys",
    body: "Start one before you fly; end it when the bag’s back with you.",
    points: [
      "Every position, impact and weigh-in in one journey log",
      "A summary at the end, in the app and by email",
    ],
  },
  {
    title: "Your account",
    body: "Private by default, and yours to control.",
    points: [
      "Two-step verification with any authenticator app",
      "English, Spanish, French, German and Chinese (Simplified and Traditional)",
      "Light and dark appearance, kilograms or pounds",
      "Download your data, or delete your account, at any time",
    ],
  },
];

function AppTour() {
  return (
    <section className="trace-panel" aria-labelledby="app-tour-title">
      <header className="trace-head">
        <span className="trace-eyebrow">The app</span>
        <h2 id="app-tour-title">Your bag, in your pocket.</h2>
        <p>
          {brand.app[0].toUpperCase() + brand.app.slice(1)}, for iPhone and Android,
          screen by screen.
        </p>
      </header>
      <div className="app-tour">
        {appScreens.map((screen) => (
          <article key={screen.title}>
            <h3>{screen.title}</h3>
            <p>{screen.body}</p>
            <ul>
              {screen.points.map((point) => (
                <li key={point}>
                  <Check size={16} /> {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FeaturesPage() {
  return (
    <div className="trace page">
      <PageHero
        eyebrow="Features"
        title="Everything your bag should’ve done already."
        image="/images/traveler.jpg"
        alt="A traveller pulls her suitcase across an airport drop-off lane"
        actions={
          <Link className="trace-button signal" href="/shop">
            Shop the range <ArrowRight size={18} />
          </Link>
        }
      >
        Journey Log, impact detection, accurate weight, location and theft protection, in
        one app. Every bag in the range has the same {brand.core}, so every one does all
        of it.
      </PageHero>

      <section className="trace-panel">
        <Head eyebrow={`What ${T} does`} title="Know where things stand.">
          Six things your bag tells you, from your door to the carousel.
        </Head>
        <Cards
          items={[
            {
              icon: <Route size={20} />,
              title: "Journey Log",
              body: "Every position, impact, weigh-in and alert on one timeline, with a summary when the trip ends.",
            },
            {
              icon: <Zap size={20} />,
              title: "Impact detection",
              body: "Each knock graded light, moderate or severe, with the time and how the bag landed.",
            },
            {
              icon: <Scale size={20} />,
              title: "Accurate weight",
              body: "Lift it by the handle to weigh it, against your airline’s limit, before you leave home.",
            },
            {
              icon: <MapPin size={20} />,
              title: `${T} Location`,
              body: "Satellite, cellular and Bluetooth positioning for live and last-known position, with how fresh it is.",
            },
            {
              icon: <Lock size={20} />,
              title: "Theft & Tamper",
              body: "Theft Mode alerts you to any movement; zip, lid and casing sensors record every opening.",
            },
            {
              icon: <ShieldCheck size={20} />,
              title: "Travel-Ready",
              body: "One check before you fly: battery, connection, lock, weight and calibration.",
            },
          ]}
        />
      </section>

      <AppTour />

      <section className="trace-panel soft">
        <Head eyebrow="In the app" title="The details that make it easy.">
          {brand.app[0].toUpperCase() + brand.app.slice(1)} on iPhone and Android, in
          light and dark.
        </Head>
        <Cards
          items={[
            {
              icon: <Link2 size={20} />,
              title: "Lost Mode and live links",
              body: "Mark a bag lost with a note for whoever helps, and share a live location link that expires when you choose.",
            },
            {
              icon: <MapIcon size={20} />,
              title: "Safe zones",
              body: "Draw a circle around home or your hotel, and get an alert when the bag leaves it.",
            },
            {
              icon: <Users size={20} />,
              title: "Give it to someone",
              body: "Transfer a bag to another traveller’s account, history and settings included.",
            },
            {
              icon: <LayoutGrid size={20} />,
              title: "Home-screen widgets",
              body: "Travel-Ready status, battery and journey at a glance, on iPhone and Android.",
            },
            {
              icon: <Languages size={20} />,
              title: "Six languages",
              body: "English, Spanish, French, German and Chinese, Simplified and Traditional.",
            },
            {
              icon: <Bell size={20} />,
              title: "Alerts your way",
              body: "Choose which events alert you per bag: in the app, as a notification and by email.",
            },
          ]}
        />
      </section>

      <section className="trace-panel page-split">
        <div>
          <Head
            eyebrow="Flight-safe battery"
            title="Quiet in the air. Awake on the ground."
          >
            The {brand.core} notices take-off and turns its radios off for the flight,
            then reports again after landing. Anything it records without signal is saved
            and sent as soon as it can.
          </Head>
          <ul className="page-ticks">
            <li>
              <BatteryCharging size={18} /> Tells you before a trip when it needs charging
            </li>
            <li>
              <Cpu size={18} /> Gets better over time with signed over-the-air updates
            </li>
          </ul>
        </div>
        <figure className="page-photo">
          <Image
            src="/images/airliner.jpg"
            alt="A white airliner seen from below, climbing against a clear blue sky"
            fill
            sizes="(max-width: 900px) 100vw, 40vw"
          />
        </figure>
      </section>

      <Cta
        title="See it for yourself."
        body={`Four bags, one ${brand.core}. Secure checkout and tracked shipping.`}
      >
        <Link className="trace-button ink" href="/shop">
          Shop the range <ArrowRight size={18} />
        </Link>
        <Link className="trace-button ghost-ink" href="/how-it-works">
          How it works
        </Link>
      </Cta>
    </div>
  );
}

// ---- For brands ----

export function ForBrandsPage() {
  return (
    <div className="trace page">
      <PageHero
        eyebrow="For luggage makers"
        title="Bring more to the bags you make."
        image="/images/concourse.jpg"
        alt="Black-and-white airport concourse with travellers wheeling bags"
        actions={
          <Link className="trace-button signal" href="/contact#enquiry">
            Talk to us <ArrowRight size={18} />
          </Link>
        }
      >
        Put the {brand.core} in your range and get location, security and ownership
        without building the cloud. Your team runs it all from one console.
      </PageHero>

      <section className="trace-panel">
        <Head eyebrow="The console" title="Everything your team needs, in one place.">
          A web console for manufacturing, operations and support.
        </Head>
        <Cards
          items={[
            {
              icon: <QrCode size={20} />,
              title: "Register and provision",
              body: "Add serials one by one or by the batch, and print one-time claim codes for the box.",
            },
            {
              icon: <ShieldCheck size={20} />,
              title: "Ownership you can trust",
              body: "A code works once; revoke a bag in one click; every action is in the audit trail.",
            },
            {
              icon: <Cpu size={20} />,
              title: "Signed firmware updates",
              body: "Publish releases signed with your key, roll them out, and see which version each bag runs.",
            },
            {
              icon: <MapIcon size={20} />,
              title: "Fleet map and health",
              body: "Where bags are, with battery and how fresh each position is, and which have gone quiet.",
            },
            {
              icon: <Zap size={20} />,
              title: "Impacts and alerts",
              body: "Severe impacts and security alerts across the fleet, with the readings behind them.",
            },
            {
              icon: <MessageSquare size={20} />,
              title: "Travellers and messages",
              body: "Help an owner from their bag’s history, and send announcements to the app.",
            },
          ]}
        />
      </section>

      <section className="trace-panel soft">
        <Head eyebrow="Getting started" title="Live in a week, not a quarter." />
        <ol className="page-steps">
          {[
            [
              "Get your account",
              "We set up your manufacturer login and two-step sign-in for your team.",
            ],
            [
              "Register your bags",
              `Add serials as they come off the line, with a claim code for each box and a ${brand.core} inside.`,
            ],
            [
              "Ship it",
              "Owners add the bag in the app with the code. You see claims, health and alerts as they happen.",
            ],
          ].map(([title, body], index) => (
            <li key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="trace-panel page-split">
        <div>
          <Head eyebrow="Sell direct" title="A shop that knows your stock.">
            Orders on the web shop hold real bags from your registered stock, take payment
            through Stripe, and land in the console with the serials to pack.
          </Head>
          <ul className="page-ticks">
            <li>
              <ShoppingBag size={18} /> Card, Apple Pay and Google Pay, on a secure hosted
              page
            </li>
            <li>
              <PackageCheck size={18} /> Mark it shipped and the buyer gets tracking by
              email
            </li>
            <li>
              <FileText size={18} /> Private files for spec sheets, certificates and
              manuals
            </li>
          </ul>
        </div>
        <figure className="page-photo">
          <Image
            src="/images/gate.jpg"
            alt="A teal carry-on with a passport on top, waiting at gate 2"
            fill
            sizes="(max-width: 900px) 100vw, 40vw"
          />
        </figure>
      </section>

      <Cta
        title="Let’s build it together."
        body="Tell us about your range and we’ll show you the console with your bags in it."
      >
        <Link className="trace-button ink" href="/contact#enquiry">
          Talk to us <ArrowRight size={18} />
        </Link>
      </Cta>
    </div>
  );
}

// ---- How it works ----

/** The card in the box: the serial printed, the one-time code under a scratch strip. */
function ClaimCard() {
  return (
    <Float className="claim-card navy">
      <div>
        <Image src="/images/brand-mark.png" alt="" width={36} height={36} />
        <span>Claim card</span>
      </div>
      <div>
        <small>Serial</small>
        <span className="mono">AMT-CO55-00F3A1</span>
      </div>
      <div>
        <small>Claim code · scratch to reveal</small>
        <span className="scratch-strip" />
      </div>
    </Float>
  );
}

/** A screen from the app, in a phone frame (the same screenshots as the app page). */
function AppScreen({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="app-phone">
      <Image
        src={src}
        alt={alt}
        width={780}
        height={1688}
        sizes="(max-width: 734px) 60vw, 260px"
      />
    </figure>
  );
}

const howSteps = [
  {
    icon: <QrCode size={22} />,
    title: "Pair it",
    body: `Scan the QR code on the ${brand.core} in ${brand.app}. It’s yours in seconds.`,
  },
  {
    icon: <Route size={22} />,
    title: "Start a journey",
    body: "Name the trip, set your airline’s limit, and lift the bag once to weigh it.",
  },
  {
    icon: <Plane size={22} />,
    title: "Travel",
    body: "It reports as it goes, goes quiet in the air, and catches up after landing. Alerts reach you wherever you are.",
  },
  {
    icon: <Check size={22} />,
    title: "Arrive",
    body: "End the journey for a summary: distance, impacts, weight and battery, in the app and by email.",
  },
];

const howFaq = [
  [
    "I lost the claim card. Now what?",
    "Contact the brand you bought from. They can issue a fresh claim code for your serial from their console.",
  ],
  [
    "Can I pair one bag to two phones?",
    "One owner per bag. Sign in to the same account on both phones and you’re set.",
  ],
  [
    "I bought it secondhand.",
    "Ask the previous owner to transfer it to you from the app. Its history and settings come with it.",
  ],
  [
    "Does it work without the app?",
    "It’s still a great bag. The app adds pairing, journeys and alerts.",
  ],
];

export function HowItWorksPage() {
  return (
    <div className="trace page">
      <PageHero
        eyebrow="How it works"
        title="From the box to the carousel."
        image="/images/gate.jpg"
        alt="A teal carry-on with a passport on top, waiting at gate 2"
      >
        Pair the bag once, start a journey before you fly, and {T} does the rest. Here’s
        every step, and what happens behind it.
      </PageHero>

      <section className="trace-panel">
        <Head eyebrow="Four steps" title="Pair, pack, fly, arrive." />
        <ol className="trace-steps">
          {howSteps.map((step, index) => (
            <li key={step.title}>
              <span className="trace-step-icon">{step.icon}</span>
              <small>Step {index + 1}</small>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="trace-panel page-split">
        <div>
          <Head eyebrow="Pairing" title="One code, and the bag is yours.">
            Every bag ships with a claim card: the serial is printed, and the one-time
            code hides under a scratch strip, so nobody in the supply chain can use it.
            Once you’ve claimed the bag, that code stops working for good.
          </Head>
          <ul className="page-ticks">
            <li>
              <QrCode size={18} /> Scan it in the app, or type the code instead
            </li>
            <li>
              <Lock size={18} /> One owner per bag, from the moment you claim it
            </li>
          </ul>
        </div>
        <div className="how-visual">
          <AppScreen
            src="/images/app/bags.jpg"
            alt="The Bags screen, where you add a bag by scanning its QR code"
          />
          <ClaimCard />
        </div>
      </section>

      <section className="trace-panel page-split reverse">
        <div className="how-visual">
          <AppScreen
            src="/images/app/weight.jpg"
            alt="The Weight screen: lift to weigh, airline limits from 7 to 32 kg, kilograms or pounds"
          />
        </div>
        <div>
          <Head eyebrow="Before you fly" title="Weigh it before the check-in desk does.">
            Lift the bag by its handle and it weighs itself. Set your airline’s allowance
            when you start the journey, and you’ll know it’s over before you reach the
            desk.
          </Head>
          <ul className="page-ticks">
            <li>
              <Scale size={18} /> Airline limits from 7 to 32 kg
            </li>
            <li>
              <Route size={18} /> Set as you start each journey
            </li>
          </ul>
        </div>
      </section>

      <section className="trace-panel page-split">
        <div>
          <Head eyebrow="In the air" title="Quiet in the air. Awake on the ground.">
            The {brand.core} notices take-off and turns its radios off for the flight,
            then reports again after landing. Anything it records without signal is saved
            and sent as soon as it can.
          </Head>
          <ul className="page-ticks">
            <li>
              <Plane size={18} /> Radios off in flight, automatically
            </li>
            <li>
              <BatteryCharging size={18} /> Tells you before a trip when it needs charging
            </li>
          </ul>
        </div>
        <div className="how-visual">
          <AppScreen
            src="/images/app/bag.jpg"
            alt="A bag’s screen: the suitcase, its last known address, battery and lock"
          />
        </div>
      </section>

      <section className="trace-panel page-split reverse">
        <div className="how-visual">
          <AppScreen
            src="/images/app/activity.jpg"
            alt="The Activity screen: journeys started and ended, Theft Mode switched on and off"
          />
        </div>
        <div>
          <Head eyebrow="When you land" title="A summary of the whole trip.">
            End the journey for a summary: distance, impacts, weight and battery, in the
            app and by email. Every move, impact and alert stays on the bag’s timeline.
          </Head>
          <ul className="page-ticks">
            <li>
              <Check size={18} /> Journeys with a summary when they end
            </li>
            <li>
              <Lock size={18} /> Theft Mode on and off, recorded
            </li>
          </ul>
        </div>
      </section>

      <section className="trace-panel soft">
        <Head eyebrow="Under the hood" title="Built so nobody else can claim your bag." />
        <Cards
          columns={2}
          items={[
            {
              icon: <Lock size={20} />,
              title: "One code, one owner",
              body: "A claim code works exactly once. After that, nobody else can pair your bag.",
            },
            {
              icon: <FileText size={20} />,
              title: "Every change is logged",
              body: "Registering, claiming, edits and revokes all land in an audit trail.",
            },
            {
              icon: <ShieldCheck size={20} />,
              title: "Files stay private",
              body: "Your receipts are scoped to your account, not the brand’s.",
            },
            {
              icon: <Ban size={20} />,
              title: "Revoked means revoked",
              body: "If a brand pulls a bag from service, it can’t be paired again.",
            },
          ]}
        />
      </section>

      <section className="trace-panel how-faq">
        <Head eyebrow="Questions" title="Questions people actually ask." />
        <Accordion type="single" collapsible className="faq-list">
          {howFaq.map(([question, answer], index) => (
            <AccordionItem key={question} value={`question-${index}`}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Cta
        title="Pick your bag."
        body={`Every bag in the range carries the same ${brand.core}.`}
      >
        <Link className="trace-button ink" href="/shop">
          Shop the range <ArrowRight size={16} />
        </Link>
        <Link className="trace-button ghost-ink" href="/features">
          See every feature
        </Link>
      </Cta>
    </div>
  );
}

// ---- About ----

export function AboutPage() {
  return (
    <div className="trace page">
      <PageHero
        eyebrow="About"
        title="Smart luggage, paired to your phone."
        image="/images/airliner.jpg"
        alt="A white airliner seen from below, climbing against a clear blue sky"
      >
        {brand.company} makes bags that tell you where they are and what’s happened to
        them, so the walk to the gate is the only part of the journey you have to think
        about.
      </PageHero>

      <Voices />

      <section className="trace-panel">
        <Head eyebrow="What we believe" title="Built to be trusted with where you are." />
        <Cards
          items={[
            {
              icon: <Lock size={20} />,
              title: "Your data is yours",
              body: "Only you, and people you send a link to, see where your bag is. We don’t sell data or show ads.",
            },
            {
              icon: <ShieldCheck size={20} />,
              title: "Honest about signal",
              body: "When a bag can’t report, the app says so, and shows the last known position with its time.",
            },
            {
              icon: <Globe size={20} />,
              title: "Made for real trips",
              body: "Flight-safe in the air, quiet on the ground, and useful from the curb to the carousel.",
            },
          ]}
        />
      </section>

      <Cta
        title="Talk to us."
        body={`Press, partnerships or anything else: ${brand.email}.`}
      >
        <a className="trace-button ink" href={`mailto:${brand.email}`}>
          Email us <ArrowRight size={18} />
        </a>
        <Link className="trace-button ghost-ink" href="/for-brands">
          For brands
        </Link>
      </Cta>
    </div>
  );
}

// ---- Policies ----

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** A policy page: its title and date, a contents list, then each section. */
export function PolicyPage({
  document,
  updated,
  eyebrow = "Legal",
}: {
  document: LegalDocument;
  updated: string;
  eyebrow?: string;
}) {
  return (
    <div className="trace page">
      <PageHero eyebrow={eyebrow} title={document.title}>
        {document.intro}
      </PageHero>
      <section className="trace-panel policy">
        <nav className="policy-contents" aria-label="On this page">
          <p>Last updated {updated}</p>
          <ol>
            {document.sections.map((section) => (
              <li key={section.heading}>
                <a href={`#${slug(section.heading)}`}>{section.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="policy-body">
          {document.sections.map((section) => (
            <section key={section.heading} id={slug(section.heading)}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
