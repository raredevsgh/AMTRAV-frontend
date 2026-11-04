// The site's inner pages in the landing page's style: Features, For brands, About, and the
// policy pages from the footer. Copy matches what the app and console do today.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
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

      <section className="trace-panel night trace-quote">
        <span className="trace-eyebrow">Why we’re obsessed with the problem</span>
        <blockquote>
          <p>
            “I watched my bag go through the flap at check-in. Eleven hours later, in
            Lisbon, I still didn’t know if it was on my plane.”
          </p>
          <footer>
            <strong>B. Young</strong> · An overwhelmed traveller
          </footer>
        </blockquote>
      </section>

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
