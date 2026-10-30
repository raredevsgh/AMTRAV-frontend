import Image from "next/image";
import Button from "./_components/Button";
import FaqList from "./_components/FaqList";
import PhotoTile from "./_components/PhotoTile";
import ProductVideo from "./_components/ProductVideo";
import Tag from "./_components/Tag";
import Testimonials, { type Testimonial } from "./_components/Testimonials";
import { GET_THE_APP_HREF } from "./_components/nav";

// Figma "Landing page — Desktop 1440" (120:126) and "— Mobile 390" (2005:396).

const ROUTES = ["LOS → LHR", "JFK → CDG", "ACC → DXB", "NRT → SFO", "LHR → JNB", "DXB → SIN", "CDG → YYZ", "SIN → SYD", "ABV → IST", "GRU → LIS"];

const FAQ = [
  {
    question: "Does it work in the air?",
    answer: "Not while you fly. Flight-safe mode turns the radios off for takeoff, and the bag checks in again once you land.",
  },
  {
    question: "Is it live tracking?",
    answer:
      "Position depends on GPS and mobile signal, and a hold or a basement can block both. When live signal is missing, the app shows the last known position with its time.",
  },
  {
    question: "Will it tell me if my bag is stolen?",
    answer:
      "It won't call it theft. The app shows movement and security events reported by the device, with the details you need to decide what to do next.",
  },
  {
    question: "Who can see where my bag is?",
    answer: "Only the account the bag is paired to. Your receipts and files stay private to you, not the brand.",
  },
] as const;

function Hero() {
  return (
    <section className="relative flex flex-col gap-8 overflow-clip rounded-3xl bg-navy px-5 pt-8 xl:flex-row xl:items-center xl:gap-8 xl:rounded-[32px] xl:px-14 xl:pt-16">
      <ProductVideo />
      <div className="absolute inset-0 bg-linear-to-r from-[rgba(0,31,77,0.94)] via-[rgba(0,31,77,0.82)] via-45% to-[rgba(0,31,77,0.55)]" />

      <div data-stagger className="relative flex w-full flex-col items-start gap-5 xl:max-w-[588px] xl:min-w-0 xl:flex-1 xl:gap-[26px] xl:pb-16">
        <p data-enter className="flex h-9 items-center gap-2.5 rounded-full bg-navy-deep pr-4 pl-2 text-caption-m whitespace-nowrap text-blue-pale xl:text-caption">
          <Image src="/icons/eyebrow-new.svg" alt="" width={26} height={24} />
          Smart luggage, paired to your phone
        </p>
        <h1 data-enter className="text-display-m font-bold text-white xl:text-display">
          Travel with a{" "}
          <span className="relative text-sky">
            better
            {/* The underline draws in once the heading has risen. */}
            <span data-enter="grow" className="absolute inset-0 [--motion-delay:550ms]">
              <Image src="/icons/hero-underline-m.svg" alt="" width={121} height={3} className="absolute top-[51px] left-0 max-w-none xl:hidden" />
              <Image src="/icons/hero-underline.svg" alt="" width={231} height={6} className="absolute top-[67px] left-0 hidden max-w-none xl:block" />
            </span>
          </span>{" "}
          sense <br className="xl:hidden" />
          of control
        </h1>
        <p data-enter className="text-small text-blue-pale xl:w-[500px] xl:text-lead xl:tracking-normal">
          Amortrav bags pair to your account in seconds, stay flight-safe on the plane and keep their papers right in the app.
        </p>
        <div data-enter className="flex w-full flex-col gap-3 xl:hidden">
          <Button href={GET_THE_APP_HREF} label="Get the app" style="sky" size="m" arrow className="w-full" />
          <Button href="/how-it-works" label="See how it works" style="outline" size="m" className="w-full" />
        </div>
        <div data-enter className="hidden w-full flex-wrap gap-3 xl:flex">
          <Button href={GET_THE_APP_HREF} label="Get the app" style="sky" size="l" arrow />
          <Button href="/how-it-works" label="See how it works" style="outline" size="l" />
        </div>
      </div>

      <HeroVisual />
    </section>
  );
}

function Badge({ subtitle }: { subtitle: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-white/51 py-3 pr-[18px] pl-3 drop-shadow-[0_20px_20px_rgba(0,10,31,0.3)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy">
        <Image src="/icons/plane.svg" alt="" width={20} height={20} />
      </span>
      <span className="flex flex-col gap-0.5 text-caption whitespace-nowrap">
        <span className="text-navy">Flight-safe mode</span>
        <span className="text-mid">{subtitle}</span>
      </span>
    </div>
  );
}

function RoutePill({ className }: { className: string }) {
  return (
    <div className={`absolute flex h-[37px] items-center gap-2.5 rounded-full bg-brand px-[18px] shadow-float ${className}`}>
      <Image src="/icons/dot-route.svg" alt="" width={8} height={8} />
      <span className="font-mono text-mono-m font-medium whitespace-nowrap text-white xl:text-mono">LOS → LHR · on board</span>
    </div>
  );
}

function HeroVisual() {
  return (
    <>
      {/* Mobile art: a 414 × 372 composition centred on the hero. */}
      <div data-enter className="relative h-[372px] w-full [--motion-delay:240ms] xl:hidden">
        <div className="absolute top-0 left-1/2 h-[372px] w-[414.16px] -translate-x-1/2">
          <Image src="/img/hero-glow-m.svg" alt="" width={322} height={322} className="absolute top-[12.4px] left-[45.88px] size-[322.4px] max-w-none" />
          <Image src="/img/hero-orbit-m.png" alt="" width={372} height={372} className="absolute top-[-12.4px] left-[21.08px] max-w-none" />
          <div className="absolute top-[-23.77px] left-[79.36px] h-[361.05px] w-[255.44px] overflow-clip rounded-[19.84px] border-[3.72px] border-white bg-navy-deep shadow-hero">
            <div className="absolute inset-[-3.51px_-32.24px_-48.36px_-7.44px] bg-[#bcd5fa]">
              <Image src="/img/hero-photo.png" alt="A traveller sitting on his AMORTRAV suitcase" fill sizes="300px" className="object-cover" />
            </div>
            <div className="absolute inset-[-3.72px] bg-linear-to-b from-[rgba(0,31,77,0)] from-60% to-[rgba(0,31,77,0.55)]" />
          </div>
          <Image src="/img/hero-flight-path-m.svg" alt="" width={414} height={373} className="absolute top-[-0.37px] left-0 h-[372.74px] w-[414.16px] max-w-none" />
          <div className="absolute top-24 left-10">
            <Badge subtitle="Radios off, ready to board" />
          </div>
          <RoutePill className="top-[300px] left-[164px]" />
        </div>
      </div>

      {/* Desktop art: 668 × 600. */}
      <div data-enter className="relative hidden h-[600px] w-[668px] shrink-0 [--motion-delay:240ms] xl:block">
        <Image src="/img/hero-glow.svg" alt="" width={520} height={520} className="absolute top-5 left-[74px] max-w-none" />
        <Image src="/img/hero-orbit.png" alt="" width={600} height={600} className="absolute top-[-20px] left-[34px] max-w-none" />
        <div className="absolute top-[-22.34px] left-32 h-[582.34px] w-[412px] overflow-clip rounded-[32px] border-4 border-white bg-navy-deep shadow-hero">
          <div className="absolute inset-[-3.66px_-50px_-76px_-10px] bg-[#bcd5fa]">
            <Image src="/img/hero-photo.png" alt="A traveller sitting on his AMORTRAV suitcase" fill sizes="480px" className="object-cover" preload />
          </div>
          <div className="absolute inset-[-4px] bg-linear-to-b from-[rgba(0,31,77,0)] from-60% to-[rgba(0,31,77,0.55)]" />
        </div>
        <Image src="/img/hero-flight-path.svg" alt="" width={668} height={601} className="absolute top-[-0.6px] left-0 h-[601.2px] w-[668px] max-w-none" />
        <div className="absolute top-[124px] left-6">
          <Badge subtitle="Radios off, ready to go" />
        </div>
        <RoutePill className="top-[479px] left-[444.64px]" />
      </div>
    </>
  );
}

// The design repeats the route list twice across the bar. Each copy ends with the same gap that
// separates its items, so the track is exactly two copies wide and the marquee (globals.css,
// "ticker") loops by moving half its width. Reduced motion leaves it as the static bar.
function RouteTicker() {
  return (
    <div className="ticker overflow-clip rounded-full bg-white py-4 [--ticker-duration:30s] xl:[--ticker-duration:45s]">
      <p className="sr-only">Example routes: {ROUTES.join(", ")}</p>
      <div aria-hidden className="ticker-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-6 pr-6 xl:gap-10 xl:pr-10">
            {ROUTES.map((route) => (
              <span key={route} className="flex shrink-0 items-center gap-6 xl:gap-10">
                <span className="font-mono text-mono-m font-medium whitespace-nowrap text-mid xl:text-mono">{route}</span>
                <Image src="/icons/dot-ticker.svg" alt="" width={6} height={6} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hover lift for content cards (hover-capable pointers only; Tailwind's hover variant
// already excludes touch screens).
const CARD_HOVER =
  "transition-[translate,box-shadow] duration-300 ease-out-soft hover:shadow-card-hover motion-safe:hover:-translate-y-1";

// Experience card icons: a light-blue tile sits behind the icon, offset down and to the right.
function CardIcon({ kind }: { kind: "location" | "status" | "security" }) {
  return (
    <div className="relative h-[89px] w-[68.74px] shrink-0">
      <div className="absolute top-10 left-[18.74px] h-[49px] w-[50px] rounded-[10px_5px_18px_5px] bg-blue-faint" />
      {kind === "location" && (
        <>
          <Image src="/icons/card-location-pin.svg" alt="" width={46} height={65} className="absolute top-1.5 left-[7px]" />
          <Image src="/icons/card-location-dot.svg" alt="" width={19} height={18} className="absolute top-[18px] left-[21px]" />
        </>
      )}
      {kind === "status" && <Image src="/icons/card-status.svg" alt="" width={61} height={61} className="absolute top-0 left-0" />}
      {kind === "security" && <Image src="/icons/card-security.svg" alt="" width={45} height={54} className="absolute top-0 left-2" />}
    </div>
  );
}

const EXPERIENCE = [
  {
    kind: "location",
    title: "Location",
    text: "See the latest reported location of your connected luggage, with an indication of when that information was recorded.",
  },
  {
    kind: "status",
    title: "Device Status",
    text: "Check available battery and connection information so you can better understand your luggage's current status.",
  },
  {
    kind: "security",
    title: "Security Events",
    text: "Review relevant movement and security events when supported by the device, with information to help you decide what to do next.",
  },
] as const;

function Experience() {
  return (
    <section className="flex flex-col items-center px-5 py-8 xl:px-[140px] xl:py-2.5">
      <div className="flex w-full flex-col items-center gap-6 xl:max-w-[972px] xl:gap-8 xl:py-[66px]">
        <div data-reveal className="flex w-full flex-col items-center gap-2 text-center xl:w-auto xl:min-w-[505px] xl:gap-5 xl:whitespace-nowrap">
          <p className="text-caption-m text-mid xl:text-small">THE EXPERIENCE</p>
          <h2 className="text-h1-m font-bold text-navy xl:text-h1">
            Know where <br className="xl:hidden" />
            things stand
          </h2>
        </div>
        <div data-stagger className="flex w-full flex-col gap-4 xl:flex-row xl:gap-6">
          {EXPERIENCE.map(({ kind, title, text }) => (
            <div
              key={kind}
              data-reveal
              className={`flex flex-col items-center gap-5 rounded-3xl bg-white px-6 py-8 text-center shadow-card xl:h-[359px] xl:flex-1 xl:justify-center xl:gap-3 xl:rounded-[32px] xl:px-8 xl:py-11 ${CARD_HOVER}`}
            >
              <CardIcon kind={kind} />
              <div className="flex flex-col gap-2">
                <h3 className="text-h3-m font-semibold text-brand xl:text-h3">{title}</h3>
                <p className="text-body-m text-mid xl:text-body">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Travel() {
  return (
    <section className="flex flex-col gap-6 overflow-clip rounded-3xl bg-white px-5 py-8 xl:gap-8 xl:rounded-[32px] xl:px-14 xl:py-16">
      <div data-reveal className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
        <h2 className="text-h1-m font-bold text-navy xl:w-[620px] xl:text-h1">
          Built for the walk <br className="xl:hidden" />
          to the gate.
        </h2>
        <p className="text-small text-mid xl:w-[380px] xl:shrink-0 xl:text-body">
          Curbside, concourse, carousel. Your bag stays paired to you the whole way, and its papers ride along in the app.
        </p>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:gap-4">
        <PhotoTile caption="Pair" data-reveal className="h-[280px] xl:h-[440px] xl:flex-[608_1_0]">
          <Image src="/img/tile-dropoff-m.jpg" alt="A traveller with her bags outside the terminal" fill sizes="100vw" className="object-cover xl:hidden" />
          <Image
            src="/img/tile-dropoff.png"
            alt="A black AMORTRAV suitcase"
            fill
            sizes="660px"
            className="hidden max-w-none object-cover xl:block xl:top-[0.11%]! xl:left-[-4.33%]! xl:w-[108.55%]!"
          />
        </PhotoTile>
        <div className="flex gap-3 xl:contents">
          <PhotoTile caption="Travel" data-reveal className="h-[220px] flex-1 [--motion-delay:80ms] xl:h-[440px] xl:flex-[324_1_0]">
            <Image src="/img/tile-carryon.jpg" alt="A traveller wheeling a silver suitcase" fill sizes="(min-width: 1280px) 324px, 50vw" className="object-cover" />
          </PhotoTile>
          <PhotoTile caption="Check in" data-reveal className="h-[220px] flex-1 [--motion-delay:160ms] xl:h-[440px] xl:flex-[324_1_0]">
            <Image src="/img/tile-gate.jpg" alt="A teal suitcase at an airport gate" fill sizes="(min-width: 1280px) 324px, 50vw" className="object-cover" />
          </PhotoTile>
        </div>
      </div>
    </section>
  );
}

// New stories were authored for this preview at the owner's request. They are labelled as
// illustrative scenarios, not attributed to customers or presented as product endorsements.
const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: "“I watched my bag go through the flap at check-in. Eleven hours later, in Lisbon, I still didn't know if it was on my plane.”",
    name: "B. Young",
    label: "An overwhelmed traveller",
    avatar: "/img/testimonial-avatar.png",
    avatarMobile: "/img/testimonial-avatar-m.png",
  },
  {
    quote: "“Three airports in one day. At every connection, I kept wondering whether my suitcase had made the same journey.”",
    name: "The connecting traveller",
    label: "Illustrative traveller story",
    avatar: "/img/traveller-connecting.webp",
  },
  {
    quote: "“With the kids, the passports and the gate change to manage, worrying about our bags was one more thing on my list.”",
    name: "The family trip organiser",
    label: "Illustrative traveller story",
    avatar: "/img/traveller-family.webp",
  },
  {
    quote: "“I kept checking the carousel long after it stopped. A clear update would have helped me decide what to do next.”",
    name: "The frequent flyer",
    label: "Illustrative traveller story",
    avatar: "/img/traveller-frequent.webp",
  },
];

const EXPLORE = [
  {
    href: "/features",
    label: "Features",
    title: "Everything your bag should've done already.",
    text: "Journey Log, impact detection, accurate weight, location and theft protection in one app.",
    tags: ["Journey Log", "Weight", "Theft Mode"],
    buttonLabel: "Explore",
    dark: true,
  },
  {
    href: "/how-it-works",
    label: "How it works",
    title: "Box to boarding in three steps.",
    text: "Unbox, pair in the app, fly. No Bluetooth menus.",
    tags: ["1 · Unbox", "2 · Pair", "3 · Fly"],
    buttonLabel: "Find more",
    dark: false,
  },
  {
    href: "/for-brands",
    label: "For brands",
    title: "Bring more to the bags you make.",
    text: "Explore connected features for your luggage, from location to security and ownership.",
    tags: ["Location", "Security", "Ownership"],
    buttonLabel: "Talk to us",
    dark: false,
  },
];

function Explore() {
  return (
    <section className="flex flex-col gap-6 overflow-clip px-5 py-8 xl:gap-8 xl:rounded-[32px] xl:px-14 xl:py-16">
      <h2 data-reveal className="text-h1-m font-bold text-navy xl:text-h1">
        Find more about AMORTRAV
      </h2>
      <div data-stagger className="flex flex-col gap-4 xl:flex-row xl:gap-[18px]">
        {EXPLORE.map(({ href, label, title, text, tags, buttonLabel, dark }) => (
          <div
            key={href}
            data-reveal
            className={`relative flex flex-col items-start gap-4 overflow-clip rounded-3xl p-6 xl:h-[407px] xl:flex-1 xl:rounded-[28px] xl:p-7 ${dark ? "bg-navy" : "bg-white shadow-card"} ${CARD_HOVER}`}
          >
            <p className={`text-caption-m xl:text-caption ${dark ? "text-blue-faint" : "text-brand"}`}>{label}</p>
            <h3 className={`text-h2-m font-semibold xl:text-h2 ${dark ? "text-white" : "text-navy"}`}>{title}</h3>
            <p className={`text-body-m xl:text-body ${dark ? "text-blue-pale" : "text-mid"}`}>{text}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag key={tag} label={tag} tone={dark ? "navy" : "light"} />
              ))}
            </div>
            <div className="hidden flex-1 xl:block" />
            {/* The link stretches over the card, so a click anywhere on it opens the page. */}
            <Button href={href} label={buttonLabel} style={dark ? "sky" : "navy"} size="s" arrow stretch />
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="flex flex-col gap-6 overflow-clip px-5 py-8 xl:gap-[34px] xl:px-10 xl:py-12">
      <h2 data-reveal className="text-h2-m font-semibold text-navy xl:text-h2">
        Frequently Asked Questions
      </h2>
      <FaqList items={FAQ} initialOpen={1} />
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <RouteTicker />
      <Experience />
      <Travel />
      <Testimonials items={TESTIMONIALS} />
      <Explore />
      <Faq />
    </>
  );
}
