"use client";

// The mobile app: what it does and how to get started, shown with screens from the app.
// The screenshots are real; personal details (name, photo, location) were removed.
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Plane,
  ShieldAlert,
  Download,
  FileText,
  Globe,
  MoonStar,
  QrCode,
  Route,
  Ruler,
  UserRound,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { ActionButton } from "./site-shell";
import { Stagger } from "./motion";
import "@/app/pages.css";

function Phone({
  src,
  alt,
  className = "",
  width = 780,
  height = 1688,
  sizes = "(max-width: 760px) 60vw, 300px",
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  return (
    <figure className={`app-phone ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
      />
    </figure>
  );
}

const steps = [
  {
    icon: Download,
    title: "Get the app",
    body: "On iPhone and Android, from the App Store or Google Play.",
  },
  {
    icon: UserRound,
    title: "Create your account",
    body: "With your email or Google. Add two-step sign-in so a stolen password alone can’t open your bags.",
  },
  {
    icon: QrCode,
    title: "Scan your bag",
    body: "Tap + on Bags and scan the QR code on the Smart Core. The bag is yours from then on.",
  },
  {
    icon: Route,
    title: "Start a journey",
    body: "Before you leave, start a journey. The bag logs everything until you end it.",
  },
];

const tour: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}[] = [
  {
    src: "/images/app/home.jpg",
    alt: "The app’s Home screen: bag health, flights nearby and distance travelled",
    eyebrow: "Home",
    title: "Every bag’s health at a glance.",
    body: "Home shows how many of your bags have reported in the last hour, which have gone quiet, and how far they’ve travelled this week.",
    points: [
      "Bag health across all your bags",
      "Live aircraft around you at the airport",
      "Distance travelled, day by day",
    ],
  },
  {
    src: "/images/app/bags.jpg",
    alt: "The Bags screen: a summary of every bag, a search, and a card for each bag",
    eyebrow: "Bags",
    title: "All your luggage, one list.",
    body: "See how many bags are on the move, which need a look and which are off, then search by name, model or serial. Tap + to add a new one.",
    points: [
      "On the move, quiet or off, at a glance",
      "Search by name, model or serial",
      "Add a bag by scanning its QR code",
    ],
  },
  {
    src: "/images/app/bag.jpg",
    alt: "A bag’s screen: the suitcase, its last known address and a small map",
    eyebrow: "Your bag",
    title: "Where it is, and how sure we are.",
    body: "Open a bag to see its last position with how accurate it was, when it was seen, and what needs your attention, from the lock to the battery.",
    points: [
      "Last seen, with accuracy",
      "Lock, battery and weight in one place",
      "Open the full map from any bag",
    ],
  },
  {
    src: "/images/app/activity.jpg",
    alt: "The Activity screen: journeys started and ended, Theft Mode switched on and off",
    eyebrow: "Activity",
    title: "A timeline of everything it did.",
    body: "Journeys, Theft Mode, impacts and alerts land in one timeline, for every bag or just one. Load older events whenever you need them.",
    points: [
      "Filter by bag",
      "Theft Mode on and off, recorded",
      "Journeys with a summary when they end",
    ],
  },
  {
    src: "/images/app/packing.jpg",
    alt: "Packing lists: templates for a weekend, business trip or long-haul flight",
    eyebrow: "Packing lists",
    title: "Pack once, remember always.",
    body: "Start from a weekend, business or long-haul template, tick things off as they go in, and set a reminder for the morning you leave.",
    points: [
      "Ready-made templates",
      "Reminders before you go",
      "Progress you can see at a glance",
    ],
  },
];

const android = [
  {
    src: "/images/app/android-home.jpg",
    alt: "Home on an Android phone: bag health, flights around you and distance travelled",
    title: "Home",
    body: "Bag health, flights around you and distance travelled, as soon as you sign in.",
  },
  {
    src: "/images/app/android-bags.jpg",
    alt: "Bags on an Android phone: no bags yet, with a button to scan a bag",
    title: "Your first bag",
    body: "Scan its QR code, give it a name and follow it live.",
  },
  {
    src: "/images/app/android-map.jpg",
    alt: "The map on an Android phone, with a search for flights and airlines",
    title: "The map",
    body: "Search flights and airlines, then zoom in to see them live.",
  },
];

const extras = [
  {
    icon: ShieldAlert,
    title: "Theft Mode",
    body: "Sensors on the zip and lid notice when the bag is opened. Turn on Theft Mode and any movement alerts you, with its position every minute.",
  },
  {
    icon: Plane,
    title: "Flights around you",
    body: "At the airport, turn on location to see the aircraft live around you.",
  },
  {
    icon: FileText,
    title: "Lost-bag report",
    body: "The app builds a report for the airline’s baggage desk: bag tag, flight, serial number, last position and every impact, with your rights under the Montreal Convention.",
  },
];

const everywhere = [
  {
    icon: Globe,
    title: "Six languages",
    body: "English, Spanish, French, German and Chinese (Simplified and Traditional).",
  },
  { icon: MoonStar, title: "Light or dark", body: "Follows your phone, or pick one." },
  {
    icon: Ruler,
    title: "Your units",
    body: "Metric or imperial, set from your phone’s region.",
  },
  {
    icon: BellRing,
    title: "Alerts that matter",
    body: "Push and email, for the events you choose.",
  },
];

export function AppPage() {
  const { m, href } = useI18n();
  return (
    <>
      <section className="panel app-hero" aria-labelledby="app-title">
        <Stagger className="app-hero-copy">
          <span className="eyebrow">The Amortrav app</span>
          <h1 id="app-title">Your bag, in your pocket.</h1>
          <p>
            Pair your bag in seconds, then see where it is, how it was handled and what it
            weighs, and hear about it the moment something’s wrong.
          </p>
          <div className="button-row">
            <ActionButton action="ios">{m.download.ios}</ActionButton>
            <ActionButton action="android" className="light">
              {m.download.android}
            </ActionButton>
          </div>
        </Stagger>
        <div className="app-hero-phones" aria-hidden="true">
          <Phone src="/images/app/bag.jpg" alt="" className="behind" />
          <Phone src="/images/app/home.jpg" alt="" className="front" />
        </div>
      </section>

      <section className="panel app-steps" aria-labelledby="steps-title">
        <header className="app-section-head">
          <span className="eyebrow">Getting started</span>
          <h2 id="steps-title">Up and running in four steps.</h2>
        </header>
        <Stagger as="ol" className="app-step-list">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title}>
              <span className="app-step-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon size={22} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </Stagger>
      </section>

      {tour.map((item, index) => (
        <section
          key={item.src}
          className={`panel app-tour ${index % 2 ? "flip" : ""}`}
          aria-labelledby={`tour-${index}`}
        >
          <Phone src={item.src} alt={item.alt} />
          <Stagger className="app-tour-copy">
            <span className="eyebrow">{item.eyebrow}</span>
            <h2 id={`tour-${index}`}>{item.title}</h2>
            <p>{item.body}</p>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Stagger>
        </section>
      ))}

      <section className="panel app-pair" aria-labelledby="pair-title">
        <header className="app-section-head">
          <span className="eyebrow">Weight and impacts</span>
          <h2 id="pair-title">Know what it weighs, and how it was handled.</h2>
        </header>
        <Stagger className="app-pair-grid">
          <article>
            <Phone
              src="/images/app/weight.jpg"
              alt="The Weight screen: lift to weigh, airline limits from 7 to 32 kg, kilograms or pounds"
            />
            <h3>Weigh it by lifting it</h3>
            <p>
              Hold the bag by its top handle for two seconds. The app shows the weight
              against the limit you pick (7, 10, 23 or 32 kg), in kilograms or pounds.
            </p>
          </article>
          <article>
            <Phone
              src="/images/app/impacts.jpg"
              alt="The Impacts screen: severe hits, moderate drops and light bumps counted separately"
            />
            <h3>Impacts, graded</h3>
            <p>
              Light bumps, moderate drops and severe hits are counted separately, with how
              hard each one was. You choose which ones alert you.
            </p>
          </article>
        </Stagger>
      </section>

      <section className="panel app-pair" aria-labelledby="android-title">
        <header className="app-section-head">
          <span className="eyebrow">On Android</span>
          <h2 id="android-title">The same app on Android.</h2>
        </header>
        <Stagger className="app-pair-grid three">
          {android.map((item) => (
            <article key={item.src}>
              <Phone src={item.src} alt={item.alt} width={780} height={1733} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </Stagger>
      </section>

      <section className="panel app-pair" aria-labelledby="duo-title">
        <header className="app-section-head">
          <span className="eyebrow">On iPhone Duo</span>
          <h2 id="duo-title">Fits the screen you’re using.</h2>
        </header>
        <Stagger className="app-pair-grid duo">
          <article>
            <Phone
              src="/images/app/duo-closed.jpg"
              alt="The app’s welcome screen on a closed iPhone Duo"
              width={780}
              height={1135}
            />
            <h3>Closed</h3>
          </article>
          <article>
            <Phone
              src="/images/app/duo-open.jpg"
              alt="The app’s welcome screen filling the large display of an open iPhone Duo"
              className="wide"
              width={1000}
              height={1422}
              sizes="(max-width: 760px) 60vw, 440px"
            />
            <h3>Open</h3>
          </article>
        </Stagger>
      </section>

      <section className="panel app-extras" aria-labelledby="extras-title">
        <header className="app-section-head">
          <span className="eyebrow">And more</span>
          <h2 id="extras-title">The details that save a trip.</h2>
        </header>
        <Stagger className="app-extra-grid">
          {extras.map(({ icon: Icon, title, body }) => (
            <article key={title}>
              <Icon size={22} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </Stagger>
      </section>

      <section className="panel app-everywhere" aria-labelledby="everywhere-title">
        <header className="app-section-head">
          <span className="eyebrow">Wherever you fly</span>
          <h2 id="everywhere-title">Made for travellers everywhere.</h2>
        </header>
        <Stagger className="app-everywhere-grid">
          {everywhere.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon size={20} aria-hidden="true" />
              <strong>{title}</strong>
              <span>{body}</span>
            </div>
          ))}
        </Stagger>
        <p className="app-more">
          Questions about pairing or your account?{" "}
          <Link href={href("/contact")}>
            Talk to us <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </p>
      </section>
    </>
  );
}
