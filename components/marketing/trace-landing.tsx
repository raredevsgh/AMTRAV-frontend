"use client";

// The AMTRAV TRACE landing page. Names, logos, colours and the range come from
// lib/brand.ts, so the page can be rebranded without editing it.
import Image from "next/image";
import Link from "next/link";
import { Accordion as AccordionPrimitive } from "radix-ui";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BatteryCharging,
  Bluetooth,
  Check,
  Cpu,
  Fingerprint,
  KeyRound,
  Link2,
  Lock,
  MapPin,
  Pause,
  Play,
  Plane,
  Radio,
  Scale,
  ScanLine,
  ShieldCheck,
  Siren,
  Smartphone,
  Trash2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { brand, type RangeItem } from "@/lib/brand";
import { useI18n } from "@/lib/i18n/client";
import { fields, Honeypot, sendLead, type Status } from "./enquiry-form";
import { Parallax, Stagger } from "./motion";
import "@/app/trace.css";

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

/** The film, muted and looping behind the hero; a still for people who prefer less motion. */
function Hero({ onWatch }: { onWatch: () => void }) {
  const reduce = useReducedMotion();
  return (
    <section className="trace-hero" aria-labelledby="trace-hero-title">
      {reduce ? (
        <Image
          className="trace-hero-media"
          src={brand.film.poster}
          alt=""
          fill
          priority
          sizes="100vw"
        />
      ) : (
        <video
          className="trace-hero-media"
          autoPlay
          muted
          loop
          playsInline
          poster={brand.film.poster}
          aria-hidden
        >
          <source src={brand.film.webm} type="video/webm" />
          <source src={brand.film.mp4} type="video/mp4" />
        </video>
      )}
      <div className="trace-hero-shade" />
      <div className="trace-hero-copy">
        <Eyebrow>{brand.product}</Eyebrow>
        <h1 id="trace-hero-title">
          Every journey.
          <br />
          Every impact.
          <br />
          Every kilogram.
          <br />
          <span>In one view.</span>
        </h1>
        <p>
          {T} is the {brand.core} inside every {brand.company} bag. It keeps a log of
          where your bag goes, how it’s handled and what it weighs, and tells you the
          moment something’s wrong.
        </p>
        <div className="trace-buttons">
          <a className="trace-button signal" href="#founding">
            Become a Founding Traveller <ArrowRight size={18} />
          </a>
          <button className="trace-button ghost" onClick={onWatch}>
            <Play size={16} /> Watch the film
          </button>
        </div>
      </div>
      <LiveCard />
    </section>
  );
}

/** A glimpse of the app's live view, floating over the film. */
function LiveCard() {
  const reduce = useReducedMotion();
  return (
    <motion.aside
      className="trace-live-card"
      aria-label="Example: a bag on a journey"
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="trace-live-top">
        <span className="trace-dot" /> On a journey
        <b>ACC → LHR</b>
      </div>
      <strong>Tahoe</strong>
      <dl>
        <div>
          <dt>Weight</dt>
          <dd>21.4 kg</dd>
        </div>
        <div>
          <dt>Impacts</dt>
          <dd>2</dd>
        </div>
        <div>
          <dt>Battery</dt>
          <dd>78%</dd>
        </div>
      </dl>
      <p className="trace-live-alert">
        <Zap size={14} /> Dropped at baggage make-up · 11.8 g
      </p>
    </motion.aside>
  );
}

function FilmDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!open) return;
    video.current?.play().catch(() => {});
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="trace-film"
      role="dialog"
      aria-modal="true"
      aria-label={`${brand.product} film`}
      onClick={onClose}
    >
      <div className="trace-film-frame" onClick={(event) => event.stopPropagation()}>
        <video ref={video} controls playsInline poster={brand.film.poster}>
          <source src={brand.film.webm} type="video/webm" />
          <source src={brand.film.mp4} type="video/mp4" />
        </video>
        <button
          className="trace-film-close"
          onClick={onClose}
          aria-label="Close the film"
        >
          <X size={20} />
        </button>
      </div>
    </div>
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
  const steps = [
    {
      icon: <ScanLine size={22} />,
      title: "Pair it",
      body: `Scan the QR code on the ${brand.core} in ${brand.app}. It’s yours in seconds.`,
    },
    {
      icon: <Play size={22} />,
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
  return (
    <section className="trace-panel soft" id="how" aria-labelledby="how-title">
      <SectionHead
        eyebrow={`How ${T} works`}
        title={<span id="how-title">From your door to the carousel.</span>}
      />
      <Stagger as="ol" className="trace-steps">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="trace-step-icon">{step.icon}</span>
            <small>Step {index + 1}</small>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </Stagger>
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
          alt={`The ${brand.core}: a dark module with a lime status light`}
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

/** The app's bag page, drawn in HTML so it stays sharp at any size. */
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
      <div className="trace-phone" aria-label="The bag page in the app" role="img">
        <div className="phone-map">
          <svg viewBox="0 0 300 180" aria-hidden>
            <path d="M-10 150 C 60 140, 90 90, 150 96 S 250 40, 320 30" />
          </svg>
          <span className="phone-pin" />
        </div>
        <div className="phone-sheet">
          <b className="phone-name">Tahoe</b>
          <small>Heathrow Terminal 5, London</small>
          <div className="phone-journey">
            <small>● ON A JOURNEY</small>
            <b>Accra to London</b>
            <div>
              <span>
                <i>So far</i>11 h 20 min
              </span>
              <span>
                <i>Impacts</i>2
              </span>
            </div>
            <em>End journey</em>
          </div>
          <div className="phone-ready">
            <b>Travel-Ready</b>
            <span>
              <Check size={10} /> Battery 78%
            </span>
            <span>
              <Check size={10} /> 21.4 kg of 23 kg
            </span>
          </div>
          <div className="phone-tiles">
            <span>
              <i>Weight</i>21.4 kg
            </span>
            <span className="on">
              <i>Theft Mode</i>On
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const demo = [
  {
    time: "07:12",
    place: "East Legon, Accra",
    event: "Journey started",
    alert: null,
    progress: 0,
  },
  {
    time: "07:14",
    place: "East Legon, Accra",
    event: "Weighed 21.4 kg, under your 23 kg limit",
    alert: null,
    progress: 4,
  },
  {
    time: "08:31",
    place: "Kotoka T3 café",
    event: "Left behind",
    alert: "You left Tahoe behind",
    progress: 14,
  },
  {
    time: "09:58",
    place: "Baggage make-up",
    event: "Dropped · 11.8 g, on its side",
    alert: "Tahoe took a hard hit",
    progress: 22,
  },
  {
    time: "10:40",
    place: "Stand 12",
    event: "Take-off: radios off for the flight",
    alert: null,
    progress: 30,
  },
  {
    time: "16:55",
    place: "Heathrow T5",
    event: "Landed: back in touch",
    alert: null,
    progress: 82,
  },
  {
    time: "17:21",
    place: "Baggage hall",
    event: "Zip opened",
    alert: "Tahoe’s zip was opened",
    progress: 88,
  },
  {
    time: "17:30",
    place: "Carousel 7",
    event: "Moving in Theft Mode",
    alert: "Tahoe is moving",
    progress: 92,
  },
  {
    time: "17:34",
    place: "Carousel 7",
    event: "Back with you",
    alert: "Tahoe is back with you",
    progress: 96,
  },
  {
    time: "18:50",
    place: "Kensington",
    event: "Journey complete: 5,124 km, 2 impacts",
    alert: "Journey complete",
    progress: 100,
  },
];

/** The demo flight, step by step: what the log records and what your phone says. */
function JourneyDemo() {
  const reduce = useReducedMotion();
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
  const lastAlert = [...demo.slice(0, step + 1)].reverse().find((item) => item.alert);
  return (
    <section className="trace-panel night trace-demo" aria-labelledby="demo-title">
      <SectionHead
        eyebrow="Journey Log"
        title={<span id="demo-title">Accra to London, as {T} saw it.</span>}
      >
        A sample trip: one bag, one flight, and everything it noticed on the way.
      </SectionHead>
      <div className="trace-demo-grid">
        <ol className="trace-demo-log">
          {demo.map((item, index) => (
            <li
              key={item.event}
              aria-current={index === step ? "step" : undefined}
              className={index <= step ? "done" : ""}
            >
              <button
                onClick={() => {
                  setStep(index);
                  setPlaying(false);
                }}
              >
                <time>{item.time}</time>
                <span>
                  <strong>{item.event}</strong>
                  <small>{item.place}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="trace-demo-side">
          <div
            className="trace-route"
            aria-label={`Journey ${current.progress}% complete`}
          >
            <span className="trace-route-from">ACC</span>
            <div className="trace-route-track">
              <span style={{ width: `${current.progress}%` }} />
              <Plane size={18} style={{ left: `${current.progress}%` }} />
            </div>
            <span className="trace-route-to">LHR</span>
          </div>
          <div className="trace-notification" aria-live="polite">
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

function RangeCard({ item }: { item: RangeItem }) {
  return (
    <article className="trace-range-card">
      <div className="trace-range-image">
        <Image
          src={item.image}
          alt={`${brand.company} ${item.name}: ${item.shell}`}
          fill
          sizes="(max-width: 700px) 50vw, 25vw"
        />
      </div>
      <h3>{item.name}</h3>
      <p className="trace-range-shell">
        {item.shell} · {item.size}
      </p>
      <p>{item.summary}</p>
    </article>
  );
}

function Range() {
  return (
    <section className="trace-panel" id="range" aria-labelledby="range-title">
      <SectionHead
        eyebrow="The range"
        title={<span id="range-title">Four bags. One {brand.core}.</span>}
      >
        Every bag in the range carries the same {brand.core}, so every one does everything
        on this page. Choose the shell that suits how you travel.
      </SectionHead>
      <Stagger className="trace-range">
        {brand.range.map((item) => (
          <RangeCard key={item.key} item={item} />
        ))}
      </Stagger>
    </section>
  );
}

function Security() {
  const points = [
    {
      icon: <Fingerprint size={20} />,
      title: "Signed at the source",
      body: "Every report is signed by a key in the bag’s secure element, and a replayed or forged one is refused.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Your account, locked down",
      body: "Two-step verification with an authenticator app or a passkey, and sign out of every device at once.",
    },
    {
      icon: <Link2 size={20} />,
      title: "Sharing that expires",
      body: "Share a live link for up to a week; turn it off any time. It never shows your contact details.",
    },
    {
      icon: <Smartphone size={20} />,
      title: "Only you see your bag",
      body: "Its position and history belong to your account. Remove the bag and they’re deleted.",
    },
    {
      icon: <Trash2 size={20} />,
      title: "Take it or delete it",
      body: "Download everything we hold about you as a file, or delete your account from the app.",
    },
    {
      icon: <Siren size={20} />,
      title: "Staff access is recorded",
      body: "When our support team looks at an account, it’s written to an audit trail.",
    },
  ];
  return (
    <section className="trace-panel soft" id="security" aria-labelledby="security-title">
      <SectionHead
        eyebrow="Security and privacy"
        title={<span id="security-title">Built to be trusted with where you are.</span>}
      />
      <div className="trace-points">
        {points.map((point) => (
          <article key={point.title}>
            <span>{point.icon}</span>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </article>
        ))}
      </div>
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

const routes = [
  "LOS → LHR",
  "JFK → CDG",
  "ACC → DXB",
  "NRT → SFO",
  "LHR → JNB",
  "DXB → SIN",
  "CDG → YYZ",
  "SIN → SYD",
  "ABV → IST",
  "GRU → LIS",
];

/** Routes the range is made for, drifting past under the hero (still for reduced motion). */
function Routes() {
  return (
    <div
      className="trace-routes"
      aria-label={`Routes travelled with ${brand.company}: ${routes.join(", ")}`}
    >
      <div className="trace-routes-track" aria-hidden="true">
        {[...routes, ...routes].map((route, index) => (
          <span key={index}>
            <Plane size={14} /> {route}
          </span>
        ))}
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
function Problem() {
  return (
    <section className="trace-panel night trace-quote" aria-labelledby="problem-title">
      <span className="trace-eyebrow" id="problem-title">
        Why we’re obsessed with the problem
      </span>
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
  );
}

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
  const style = {
    "--trace-ink": brand.colors.ink,
    "--trace-night": brand.colors.night,
    "--trace-signal": brand.colors.signal,
    "--trace-accent": brand.colors.accent,
  } as CSSProperties;
  return (
    <div className="trace" style={style}>
      <Hero onWatch={() => setFilm(true)} />
      <Routes />
      <Features />
      <Problem />
      <HowItWorks />
      <Gate />
      <SmartCore />
      <AppPreview />
      <JourneyDemo />
      <Range />
      <Security />
      <Battery />
      <Faq />
      <Founding />
      <FilmDialog open={film} onClose={() => setFilm(false)} />
    </div>
  );
}
