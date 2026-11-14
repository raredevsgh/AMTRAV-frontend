"use client";

// The AMTRAV TRACE landing page. Names, logos, colours and the range come from
// lib/brand.ts, so the page can be rebranded without editing it.
import Image from "next/image";
import Link from "next/link";
import { Accordion as AccordionPrimitive, Dialog as DialogPrimitive } from "radix-ui";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowRight,
  BatteryCharging,
  BellRing,
  Bluetooth,
  Check,
  CircleCheck,
  Cpu,
  Flag,
  KeyRound,
  Lock,
  LockOpen,
  MapPin,
  Pause,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Play,
  Radio,
  Scale,
  ShieldCheck,
  Siren,
  Waves,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { useI18n } from "@/lib/i18n/client";
import { discovery } from "@/lib/i18n/discovery";
import { fields, Honeypot, sendLead, type Status } from "./enquiry-form";
import { MotionControl, Parallax, Stagger, useMotionPaused } from "./motion";
import { Itinerary } from "./itinerary";
import { Voices } from "./voices";
import { BagViewer } from "./bag-viewer";
import { bags, DiscoveryLinks, RangeExplorer } from "./landing-discovery";
import "@/app/trace.css";
import "@/app/film.css";
import "@/app/trace-routes.css";
import "@/app/trace-ledger.css";

const T = brand.shortProduct;

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="trace-eyebrow">{children}</span>;
}

function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Stagger as="header" className="trace-head">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </Stagger>
  );
}

/**
 * Copy and product share the first screen. The product is the Flagship in live 3D on the
 * page itself, with no backdrop; the sample journey sits below it so it never covers the
 * luggage. The bag holds still while the film plays.
 */
function Hero({
  onWatch,
  watchRef,
  filmOpen,
}: {
  onWatch: () => void;
  watchRef: RefObject<HTMLButtonElement | null>;
  filmOpen: boolean;
}) {
  const { m, href, locale } = useI18n();
  const copy = discovery[locale];
  const flagship = brand.range.find((item) => item.key === "flagship") ?? brand.range[0];

  return (
    <section className="trace-hero" aria-labelledby="trace-hero-title">
      <div className="trace-hero-copy">
        <span className="trace-hero-intro">
          <span aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <h1 id="trace-hero-title">
          {copy.title}
          <br />
          <span>{copy.titleEnd}</span>
        </h1>
        <p>{m.landing.body}</p>
        <div className="trace-buttons">
          <a className="trace-button ink" href="#range">
            {m.landing.range} <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button
            ref={watchRef}
            type="button"
            className="trace-button ghost-ink"
            onClick={onWatch}
            aria-haspopup="dialog"
          >
            <Play size={14} aria-hidden="true" /> {m.landing.watch}
          </button>
        </div>
        <ul className="trace-hero-capabilities">
          <li>
            <MapPin size={14} aria-hidden="true" /> {m.landing.location}
          </li>
          <li>
            <ShieldCheck size={14} aria-hidden="true" /> {m.landing.impacts}
          </li>
          <li>
            <Scale size={14} aria-hidden="true" /> {m.landing.weighing}
          </li>
        </ul>
        <p className="trace-hero-note">
          <Cpu size={14} aria-hidden="true" />
          {copy.note}
        </p>
      </div>
      <div className="trace-product-showcase">
        <div className="trace-showcase-toolbar">
          <span>
            <span className="trace-showcase-dot" aria-hidden="true" />
            {m.landing.filmTitle}
          </span>
          <MotionControl />
        </div>
        <div className="trace-hero-stage">
          <BagViewer
            className="trace-hero-visual"
            model={bags[flagship.key].model}
            finish={bags[flagship.key].finish}
            label={`${brand.company} ${flagship.name} · ${copy.finishes[flagship.key]}`}
            description={copy.model}
            hint={copy.turn}
            poster={flagship.image}
            paused={filmOpen}
          />
          <LiveCard />
        </div>
        <div className="trace-showcase-caption">
          <span>{m.landing.example}</span>
          <Link href={href("/#range")}>
            {m.landing.range} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * An explicitly labelled sample, formatted using the visitor's selected locale: the bag
 * and its status, the flight as a route with the plane partway along it, three readings,
 * and the latest alert.
 */
function LiveCard() {
  const { m, tag } = useI18n();
  const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
  const battery = 0.78;
  return (
    <aside className="trace-live-card" aria-label={m.landing.example}>
      <div className="trace-live-head">
        <strong>Tahoe</strong>
        <span className="trace-live-status">
          <span className="trace-dot" aria-hidden="true" />
          {m.landing.travelling}
        </span>
      </div>
      <p className="trace-live-route" dir="ltr">
        <b>ACC</b>
        <span className="trace-live-path" aria-hidden="true">
          <span className="trace-live-flown" />
          <Plane size={14} />
        </span>
        <span className="trace-live-sr">→</span>
        <b>LHR</b>
      </p>
      <dl>
        <div>
          <dt>{m.landing.weight}</dt>
          <dd>
            {number.format(21.4)} <small>kg</small>
          </dd>
        </div>
        <div>
          <dt>{m.landing.impactCount}</dt>
          <dd>{number.format(2)}</dd>
        </div>
        <div>
          <dt>{m.landing.battery}</dt>
          <dd>
            {new Intl.NumberFormat(tag, { style: "percent" }).format(battery)}
            <span className="trace-live-meter" aria-hidden="true">
              <span style={{ width: `${battery * 100}%` }} />
            </span>
          </dd>
        </div>
      </dl>
      <p className="trace-live-alert">
        <span className="trace-live-alert-icon" aria-hidden="true">
          <Zap size={13} />
        </span>
        <span>
          {m.landing.impactAlert} <b>{number.format(11.8)} g</b>
        </span>
      </p>
    </aside>
  );
}

function FilmDialog({
  open,
  onClose,
  trigger,
}: {
  open: boolean;
  onClose: () => void;
  trigger: RefObject<HTMLButtonElement | null>;
}) {
  const { m } = useI18n();
  const close = useRef<HTMLButtonElement>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="trace-film-overlay" />
        <DialogPrimitive.Content
          className="trace-film-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            close.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <div className="trace-film-heading">
            <DialogPrimitive.Title>
              {brand.product} · {m.landing.filmLabel}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <button
                ref={close}
                type="button"
                className="trace-film-dismiss"
                aria-label={m.landing.close}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <video
            autoPlay
            controls
            playsInline
            preload="metadata"
            poster={brand.film.poster}
            aria-label={m.landing.filmLabel}
          >
            <source src={brand.film.webm} type="video/webm" />
            <source src={brand.film.mp4} type="video/mp4" />
          </video>
          <DialogPrimitive.Description className="trace-film-description">
            {m.landing.filmDescription}
          </DialogPrimitive.Description>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const features: { title: string; body: string; visual: ReactNode }[] = [
  {
    title: "Journey Log",
    body: "Start a journey and every position, knock, weigh-in and alert lands in one log. End it and you get a summary in the app and by email.",
    visual: (
      <ol className="viz-log">
        <li>
          <i className="signal" /> Journey started <small>07:12</small>
        </li>
        <li>
          <i /> Checked in, Kotoka T3 <small>09:40</small>
        </li>
        <li>
          <i className="warn" /> Dropped · 11.8 g <small>10:05</small>
        </li>
        <li>
          <i /> Landed, Heathrow T5 <small>16:55</small>
        </li>
      </ol>
    ),
  },
  {
    title: "Impact detection",
    body: "The Smart Core measures the force of every knock and grades it light, moderate or severe, with how the bag came to rest. Severe hits alert you at once.",
    visual: (
      <div className="viz-impact" aria-hidden>
        <div className="viz-impact-bar">
          <span style={{ width: "74%" }} />
        </div>
        <div className="viz-impact-scale">
          <span>Light</span>
          <span>Moderate</span>
          <span className="severe">Severe</span>
        </div>
        <strong>11.8 g</strong>
        <small>Ended up on its side</small>
      </div>
    ),
  },
  {
    title: "Accurate weight",
    body: "Lift the bag by its handle and it weighs itself. Set your airline’s allowance and you’ll know it’s over before the check-in desk does.",
    visual: (
      <div className="viz-weight" aria-hidden>
        <strong>
          21.4<span> kg</span>
        </strong>
        <div className="viz-weight-bar">
          <span style={{ width: "93%" }} />
        </div>
        <small>1.6 kg under your 23 kg limit</small>
      </div>
    ),
  },
  {
    title: "Location and separation",
    body: "See where it is from anywhere, through its own cellular radio, Wi-Fi or your phone. Walk away from it and your phone tells you before you reach the gate.",
    visual: (
      <svg className="viz-map" viewBox="0 0 220 120" aria-hidden>
        <path d="M14 98 C 60 90, 70 40, 120 46 S 190 22, 206 18" />
        <circle cx="14" cy="98" r="5" className="start" />
        <circle cx="206" cy="18" r="7" className="end" />
        <circle cx="120" cy="46" r="18" className="ping" />
      </svg>
    ),
  },
  {
    title: "Tamper and security",
    body: "Sensors on the zip and lid notice when the bag is opened. Turn on Theft Mode and any movement alerts you, with its position every minute.",
    visual: (
      <div className="viz-tamper" aria-hidden>
        <Lock size={30} />
        <div>
          <strong>Zip opened</strong>
          <small>Baggage hall · 17:21</small>
        </div>
      </div>
    ),
  },
  {
    title: "Travel-Ready status",
    body: "One glance before you leave: charged, in touch, locked, within your limit and calibrated. If something needs you, it says what.",
    visual: (
      <ul className="viz-ready" aria-hidden>
        {[
          "Battery 78%",
          "In touch",
          "Locked",
          "21.4 kg of 23 kg",
          "Scale calibrated",
        ].map((item) => (
          <li key={item}>
            <Check size={14} /> {item}
          </li>
        ))}
      </ul>
    ),
  },
];

function Features() {
  return (
    <section className="trace-panel" id="features" aria-labelledby="features-title">
      <SectionHead
        eyebrow="What it does"
        title={
          <span id="features-title">
            Six things your bag should always have told you.
          </span>
        }
      />
      <Stagger className="trace-features">
        {features.map((feature, index) => (
          <article key={feature.title} className="trace-feature">
            <span className="trace-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
            <div className="trace-visual">{feature.visual}</div>
          </article>
        ))}
      </Stagger>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="trace-panel soft" id="how" aria-labelledby="how-title">
      <SectionHead
        eyebrow={`How ${T} works`}
        title={<span id="how-title">From your door to the carousel.</span>}
      />
      <Itinerary />
    </section>
  );
}

function SmartCore() {
  const parts = [
    {
      icon: <MapPin size={18} />,
      title: "Positioning",
      body: "Satellite positioning, with Wi-Fi and Bluetooth when indoors.",
    },
    {
      icon: <Waves size={18} />,
      title: "Motion sensor",
      body: "Grades every knock and notices when the bag moves.",
    },
    {
      icon: <Scale size={18} />,
      title: "Load cell",
      body: "Weighs the bag as you lift it by the handle.",
    },
    {
      icon: <Lock size={18} />,
      title: "Tamper sensors",
      body: "On the zip and lid, and the casing itself.",
    },
    {
      icon: <Bluetooth size={18} />,
      title: "Bluetooth link",
      body: "Knows when it’s with your phone, and when it isn’t.",
    },
    {
      icon: <KeyRound size={18} />,
      title: "Secure element",
      body: "Signs every report with a key that never leaves the chip.",
    },
  ];
  return (
    <section
      className="trace-panel night trace-core"
      id="core"
      aria-labelledby="core-title"
    >
      <div className="trace-core-image">
        <Image
          src="/images/trace/smart-core.jpg"
          alt={`The ${brand.core}: a dark module with a light blue status light`}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
        />
      </div>
      <div className="trace-core-copy">
        <SectionHead
          eyebrow={`The ${brand.core}`}
          title={
            <span id="core-title">Small enough to forget. Clever enough not to.</span>
          }
        >
          Everything {T} knows comes from one removable module, built into the shell of
          every bag in the range.
        </SectionHead>
        <ul className="trace-parts">
          {parts.map((part) => (
            <li key={part.title}>
              <span>{part.icon}</span>
              <div>
                <strong>{part.title}</strong>
                <p>{part.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Actual mobile-app captures, shared with the app tour. */
function AppPreview() {
  return (
    <section className="trace-panel trace-app" aria-labelledby="app-title">
      <div className="trace-app-copy">
        <SectionHead
          eyebrow="The app"
          title={<span id="app-title">Everything about your bag, on one screen.</span>}
        >
          Where it is, whether it’s ready, what happened on the way, in {brand.app} for
          iPhone and Android.
        </SectionHead>
        <ul className="trace-checklist">
          <li>
            <Check size={16} /> Live position and route
          </li>
          <li>
            <Check size={16} /> Journey summaries
          </li>
          <li>
            <Check size={16} /> Alerts in the app and by email
          </li>
          <li>
            <Check size={16} /> Share a live link with family or the airline
          </li>
        </ul>
      </div>
      <div className="trace-app-captures">
        <figure className="trace-app-capture">
          <div className="trace-app-device">
            <Image
              src="/images/app/bag.jpg"
              alt="Amortrav’s bag screen showing Tahoe, its status checks, last known address, and location map."
              width={780}
              height={1688}
              sizes="(max-width: 600px) 42vw, (max-width: 900px) 240px, 20vw"
            />
          </div>
          <figcaption>Your bag, at a glance</figcaption>
        </figure>
        <figure className="trace-app-capture">
          <div className="trace-app-device">
            <Image
              src="/images/app/activity.jpg"
              alt="Amortrav’s Activity screen with bag filters and a timeline of journeys and Theft Mode events."
              width={780}
              height={1688}
              sizes="(max-width: 600px) 42vw, (max-width: 900px) 240px, 20vw"
            />
          </div>
          <figcaption>Every journey, recorded</figcaption>
        </figure>
      </div>
    </section>
  );
}

/**
 * The demo flight's log. `kind` colours its node: alerts amber, good news light blue, the rest
 * plain; `impact` counts towards the pass's impacts.
 */
const demo: {
  time: string;
  place: string;
  event: string;
  alert: string | null;
  progress: number;
  icon: LucideIcon;
  kind: "plain" | "alert" | "good";
  impact?: boolean;
}[] = [
  {
    time: "07:12",
    place: "East Legon, Accra",
    event: "Journey started",
    alert: null,
    progress: 0,
    icon: Flag,
    kind: "plain",
  },
  {
    time: "07:14",
    place: "East Legon, Accra",
    event: "Weighed 21.4 kg, under your 23 kg limit",
    alert: null,
    progress: 4,
    icon: Scale,
    kind: "good",
  },
  {
    time: "08:31",
    place: "Kotoka T3 café",
    event: "Left behind",
    alert: "You left Tahoe behind",
    progress: 14,
    icon: BellRing,
    kind: "alert",
  },
  {
    time: "09:58",
    place: "Baggage make-up",
    event: "Dropped · 11.8 g, on its side",
    alert: "Tahoe took a hard hit",
    progress: 22,
    icon: Zap,
    kind: "alert",
    impact: true,
  },
  {
    time: "10:40",
    place: "Stand 12",
    event: "Take-off: radios off for the flight",
    alert: null,
    progress: 30,
    icon: PlaneTakeoff,
    kind: "plain",
  },
  {
    time: "16:55",
    place: "Heathrow T5",
    event: "Landed: back in touch",
    alert: null,
    progress: 82,
    icon: PlaneLanding,
    kind: "plain",
  },
  {
    time: "17:21",
    place: "Baggage hall",
    event: "Zip opened",
    alert: "Tahoe’s zip was opened",
    progress: 88,
    icon: LockOpen,
    kind: "alert",
  },
  {
    time: "17:30",
    place: "Carousel 7",
    event: "Moving in Theft Mode",
    alert: "Tahoe is moving",
    progress: 92,
    icon: Siren,
    kind: "alert",
  },
  {
    time: "17:34",
    place: "Carousel 7",
    event: "Back with you",
    alert: "Tahoe is back with you",
    progress: 96,
    icon: ShieldCheck,
    kind: "good",
  },
  {
    time: "18:50",
    place: "Kensington",
    event: "Journey complete: 5,124 km, 2 impacts",
    alert: "Journey complete",
    progress: 100,
    icon: CircleCheck,
    kind: "good",
  },
];

/** The demo flight, step by step: what the log records and what your phone says. */
function JourneyDemo() {
  const reduce = useMotionPaused();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const auto = playing && !reduce;
  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(
      () => setStep((current) => (current + 1) % demo.length),
      2600,
    );
    return () => clearInterval(timer);
  }, [auto]);
  const current = demo[step];
  const seen = demo.slice(0, step + 1);
  const lastAlert = [...seen].reverse().find((item) => item.alert);
  const alerts = seen.filter((item) => item.kind === "alert").length;
  const impacts = seen.filter((item) => item.impact).length;
  return (
    <section className="trace-panel night trace-demo" aria-labelledby="demo-title">
      <SectionHead
        eyebrow="Journey Log"
        title={<span id="demo-title">Accra to London, as {T} saw it.</span>}
      >
        A sample trip: one bag, one flight, and everything it noticed on the way.
      </SectionHead>
      <div className="trace-demo-grid">
        <ol className="journey-log">
          {demo.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.event}
                aria-current={index === step ? "step" : undefined}
                className={`journey-entry ${item.kind}${index <= step ? " done" : ""}`}
              >
                <button
                  onClick={() => {
                    setStep(index);
                    setPlaying(false);
                  }}
                >
                  <span className="journey-node" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span className="journey-text">
                    <strong>{item.event}</strong>
                    <small>{item.place}</small>
                  </span>
                  <time>{item.time}</time>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="trace-demo-side">
          {/* The trip as a boarding pass: where it's got to, and what's happened so far. */}
          <div className="journey-pass">
            <div className="journey-pass-head">
              <span>Tahoe · Journey Log</span>
              <span className="journey-live">
                <i aria-hidden="true" />
                {current.progress === 100 ? "Arrived" : "Live"}
              </span>
            </div>
            <div
              className="journey-pass-route"
              role="img"
              aria-label={`Journey ${current.progress}% complete`}
            >
              <span>
                <strong>ACC</strong>
                <small>Accra</small>
              </span>
              <span className="journey-pass-track">
                <span style={{ width: `${current.progress}%` }} />
                <Plane size={16} style={{ left: `${current.progress}%` }} />
              </span>
              <span className="journey-pass-to">
                <strong>LHR</strong>
                <small>London</small>
              </span>
            </div>
            <dl className="journey-pass-stats">
              <div>
                <dt>Time</dt>
                <dd>{current.time}</dd>
              </div>
              <div>
                <dt>Impacts</dt>
                <dd>{impacts}</dd>
              </div>
              <div>
                <dt>Alerts</dt>
                <dd>{alerts}</dd>
              </div>
            </dl>
          </div>
          <div className="trace-notification" aria-live={auto ? "off" : "polite"}>
            <div className="trace-notification-top">
              <Image src={brand.logos.mark} alt="" width={22} height={18} />
              <span>{brand.company}</span>
              <small>{lastAlert?.time ?? "now"}</small>
            </div>
            <strong>{lastAlert?.alert ?? "No alerts yet"}</strong>
            <p>{lastAlert ? lastAlert.place : "TRACE is watching quietly."}</p>
          </div>
          <button
            className="trace-button ghost small"
            onClick={() => setPlaying((value) => !value)}
            disabled={!!reduce}
          >
            {auto ? <Pause size={15} /> : <Play size={15} />} {auto ? "Pause" : "Play"}{" "}
            the journey
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Security and privacy as a spec sheet rather than six cards: three rows (the bag, your
 * account, who else sees it), each with its two promises, ruled off with hairlines
 * (app/trace-ledger.css).
 */
function Security() {
  const rows = [
    {
      label: "The bag",
      points: [
        {
          title: "Signed at the source",
          body: "Every report is signed by a key in the bag’s secure element, and a replayed or forged one is refused.",
        },
        {
          title: "Only you see your bag",
          body: "Its position and history belong to your account. Remove the bag and they’re deleted.",
        },
      ],
    },
    {
      label: "Your account",
      points: [
        {
          title: "Locked down",
          body: "Two-step verification with an authenticator app or a passkey, and sign out of every device at once.",
        },
        {
          title: "Take it or delete it",
          body: "Download everything we hold about you as a file, or delete your account from the app.",
        },
      ],
    },
    {
      label: "Who else sees it",
      points: [
        {
          title: "Sharing that expires",
          body: "Share a live link for up to a week; turn it off any time. It never shows your contact details.",
        },
        {
          title: "Staff access is recorded",
          body: "When our support team looks at an account, it’s written to an audit trail.",
        },
      ],
    },
  ];
  return (
    <section className="trace-panel soft" id="security" aria-labelledby="security-title">
      <SectionHead
        eyebrow="Security and privacy"
        title={<span id="security-title">Built to be trusted with where you are.</span>}
      />
      <Stagger as="dl" className="trace-ledger">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            {row.points.map((point) => (
              <dd key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </dd>
            ))}
          </div>
        ))}
      </Stagger>
    </section>
  );
}

function Battery() {
  return (
    <section className="trace-panel trace-battery" aria-labelledby="battery-title">
      <div>
        <SectionHead
          eyebrow="Airline-conscious battery"
          title={<span id="battery-title">Quiet in the air. Awake on the ground.</span>}
        >
          The {brand.core} notices take-off from air pressure and acceleration and
          switches its radios off for the flight. After landing it wakes up and sends
          everything it saved. If an airline asks, it lifts out of the bag in seconds.
        </SectionHead>
        <figure className="trace-battery-photo">
          <Image
            src="/images/airliner.jpg"
            alt="A white airliner seen from below, climbing against a clear blue sky"
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
          />
        </figure>
      </div>
      <Stagger as="ul" className="trace-battery-facts">
        <li>
          <Plane size={20} />
          <strong>Radios off in flight</strong>
          <span>Automatically, every flight.</span>
        </li>
        <li>
          <Cpu size={20} />
          <strong>Removable module</strong>
          <span>Carry it in the cabin if asked.</span>
        </li>
        <li>
          <BatteryCharging size={20} />
          <strong>Rechargeable</strong>
          <span>The app tells you when it’s getting low.</span>
        </li>
        <li>
          <Radio size={20} />
          <strong>Sips power</strong>
          <span>Reports more often only on a journey or in Theft Mode.</span>
        </li>
      </Stagger>
    </section>
  );
}

const questions = [
  {
    q: `Does ${T} work abroad?`,
    a: "It reports through its own cellular radio where there’s coverage, and through Wi-Fi or your phone where there isn’t. Anything it records offline is sent when it’s back in touch.",
  },
  {
    q: "How accurate is the weight?",
    a: "Accurate enough to plan around an airline limit. Calibrate the scale when you first get the bag and whenever readings look off; the app walks you through it.",
  },
  {
    q: "What counts as a severe impact?",
    a: "A hit hard enough to risk the shell or what’s inside. Light knocks and moderate drops are logged too, and you choose which ones alert you.",
  },
  {
    q: "Is it allowed on flights?",
    a: "The Smart Core switches its radios off in flight, and it’s removable for airlines that ask. Rules for smart luggage differ between airlines, so check yours before you fly.",
  },
  {
    q: "Is it live tracking?",
    a: "Position depends on GPS and mobile signal, and a hold or a basement can block both. When live signal is missing, the app shows the last known position with its time.",
  },
  {
    q: "Will it tell me if my bag is stolen?",
    a: "It won’t call it theft. The app shows movement and security events reported by the device, with the details you need to decide what to do next.",
  },
  {
    q: "Who can see where my bag is?",
    a: "You, and anyone you send a share link to until it expires or you turn it off. Our support team can look at an account to help you, and that access is recorded.",
  },
  {
    q: "What is a Founding Traveller?",
    a: "One of the first people to travel with TRACE. Sign up and we’ll tell you first when the range is available, and ask what you think before we build what’s next.",
  },
];

/** From and to, as an airport code and its city. */
const routes = [
  ["LOS", "Lagos", "LHR", "London"],
  ["JFK", "New York", "CDG", "Paris"],
  ["ACC", "Accra", "DXB", "Dubai"],
  ["NRT", "Tokyo", "SFO", "San Francisco"],
  ["LHR", "London", "JNB", "Johannesburg"],
  ["DXB", "Dubai", "SIN", "Singapore"],
  ["CDG", "Paris", "YYZ", "Toronto"],
  ["SIN", "Singapore", "SYD", "Sydney"],
  ["ABV", "Abuja", "IST", "Istanbul"],
  ["GRU", "São Paulo", "LIS", "Lisbon"],
] as const;

/**
 * Routes the range is made for, under the hero, as a row of a departure board: each the two
 * airports with their cities and a dashed flight path between, drifting slowly inside the
 * content column (still for reduced motion, paused under the pointer).
 */
function Routes() {
  return (
    <div className="trace-routes">
      <p className="trace-routes-label">Made for the routes you fly</p>
      <p className="sr-only">
        {routes.map(([, from, , to]) => `${from} to ${to}`).join(", ")}
      </p>
      <div className="trace-routes-window" aria-hidden="true">
        <ul className="trace-routes-track">
          {[...routes, ...routes].map(([from, fromCity, to, toCity], index) => (
            <li key={index}>
              <span className="trace-route-end">
                <b>{from}</b>
                <small>{fromCity}</small>
              </span>
              <span className="trace-route-path">
                <Plane size={14} />
              </span>
              <span className="trace-route-end">
                <b>{to}</b>
                <small>{toCity}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Gate() {
  const photos = [
    {
      src: "/images/carry-on.jpg",
      caption: "Pair",
      alt: "Close-up of a grey hard-shell carry-on held by its handle",
    },
    {
      src: "/images/concourse.jpg",
      caption: "Travel",
      alt: "Black-and-white airport concourse with travellers wheeling bags",
    },
    {
      src: "/images/gate.jpg",
      caption: "Check in",
      alt: "A teal carry-on with a passport on top, waiting at gate 2",
    },
  ];
  return (
    <section className="trace-panel" aria-labelledby="gate-title">
      <SectionHead
        eyebrow="On the way"
        title={<span id="gate-title">Built for the walk to the gate.</span>}
      >
        Curbside, concourse, carousel. Your bag stays paired to you the whole way, and its
        papers ride along in the app.
      </SectionHead>
      <Stagger className="trace-gate">
        {photos.map((photo) => (
          <figure key={photo.caption}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 700px) 100vw, 33vw"
            />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </Stagger>
    </section>
  );
}

/** Why the company exists, in a traveller's words. */
/** One answer open at a time; the heading and a way to ask us stay beside the list. */
function Faq() {
  const { m, href } = useI18n();
  return (
    <section
      className="trace-panel trace-faq-section"
      id="faq"
      aria-labelledby="faq-title"
    >
      <div className="trace-faq-intro">
        <SectionHead
          eyebrow="Questions"
          title={<span id="faq-title">Good questions, straight answers.</span>}
        >
          What travellers ask before their first trip with {T}.
        </SectionHead>
        <div className="trace-faq-help">
          <strong>Still have a question?</strong>
          <span>{m.contact.reply}</span>
          <Link href={href("/contact")}>
            {m.nav.contact} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <AccordionPrimitive.Root
        type="single"
        collapsible
        defaultValue="0"
        className="trace-faq"
      >
        {questions.map((item, index) => (
          <AccordionPrimitive.Item
            key={item.q}
            value={String(index)}
            className="trace-faq-item"
          >
            <AccordionPrimitive.Header asChild>
              <h3>
                <AccordionPrimitive.Trigger className="trace-faq-trigger">
                  <span>{item.q}</span>
                  <span className="trace-faq-toggle" aria-hidden="true" />
                </AccordionPrimitive.Trigger>
              </h3>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="trace-faq-answer">
              <p>{item.a}</p>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  );
}

/** The closing call: join the Founding Travellers over a photo; partners go to Contact. */
function Founding() {
  const { m, href } = useI18n();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "sending" });
    setStatus(
      await sendLead(
        { ...fields(event.currentTarget), kind: "founding_traveller" },
        { failed: m.contact.failed, offline: m.contact.offline },
      ),
    );
  }

  return (
    <section className="trace-founding" id="founding" aria-labelledby="founding-title">
      <Parallax className="trace-founding-media">
        <Image
          src="/images/terminal-sunset.jpg"
          alt=""
          fill
          sizes="100vw"
          className="trace-founding-photo"
        />
      </Parallax>
      <Stagger className="trace-founding-inner" gap={0.12}>
        <div className="trace-founding-copy">
          <Eyebrow>Founding Travellers</Eyebrow>
          <h2 id="founding-title">Be one of the first to travel with {T}.</h2>
          <ul className="trace-founding-perks">
            <li>
              <Check size={18} aria-hidden="true" /> First to know when the range is
              available
            </li>
            <li>
              <Check size={18} aria-hidden="true" /> A say in what we build next
            </li>
            <li>
              <Check size={18} aria-hidden="true" /> Only emails about {brand.product}
            </li>
          </ul>
        </div>
        <div className="trace-founding-card">
          {status.state === "sent" ? (
            <p className="trace-founding-done" role="status">
              <Check size={20} aria-hidden="true" />
              <span>
                <strong>You’re on the list.</strong> We’ll be in touch before the range is
                out.
              </span>
            </p>
          ) : (
            <form onSubmit={join} className="trace-founding-form">
              <label>
                Your name
                <input name="name" required maxLength={120} autoComplete="name" />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </label>
              <Honeypot />
              {status.state === "error" ? (
                <p className="trace-form-error" role="alert">
                  {status.message}
                </p>
              ) : null}
              <button
                className="trace-button signal"
                disabled={status.state === "sending"}
              >
                {status.state === "sending"
                  ? "Signing you up…"
                  : "Join the Founding Travellers"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <small>Unsubscribe any time.</small>
            </form>
          )}
          <p className="trace-founding-partners">
            Brand, airline, insurer or investor?{" "}
            <Link href={href("/contact#enquiry")}>
              Talk to us <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </Stagger>
    </section>
  );
}

export function TraceLanding() {
  const [film, setFilm] = useState(false);
  const watch = useRef<HTMLButtonElement>(null);
  const style = {
    "--trace-ink": brand.colors.ink,
    "--trace-night": brand.colors.night,
    "--trace-signal": brand.colors.signal,
    "--trace-accent": brand.colors.accent,
  } as CSSProperties;
  return (
    <div className="trace" style={style}>
      <Hero onWatch={() => setFilm(true)} watchRef={watch} filmOpen={film} />
      <DiscoveryLinks />
      <RangeExplorer />
      <Features />
      <Voices />
      <HowItWorks />
      <Routes />
      <Gate />
      <SmartCore />
      <AppPreview />
      <JourneyDemo />
      <Security />
      <Battery />
      <Faq />
      <Founding />
      <FilmDialog open={film} onClose={() => setFilm(false)} trigger={watch} />
    </div>
  );
}
