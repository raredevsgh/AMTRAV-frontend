"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import Button from "./_components/Button";
import FaqList from "./_components/FaqList";
import PhotoTile from "./_components/PhotoTile";
import ProductVideo from "./_components/ProductVideo";
import ScrollBackdrop from "./_components/ScrollBackdrop";
import Tag from "./_components/Tag";
import Testimonials, { type Testimonial } from "./_components/Testimonials";
import FilmModal from "./_components/FilmModal";
import LuxurySpecs from "./_components/LuxurySpecs";
import { GET_THE_APP_HREF } from "./_components/nav";
import { useI18n } from "@/lib/i18n/context";

const ROUTES = [
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

function Hero({ onWatchFilm }: { onWatchFilm: () => void }) {
  const { t } = useI18n();

  return (
    <section className="relative flex flex-col gap-8 overflow-clip rounded-3xl bg-navy px-5 py-8 xl:flex-row xl:items-center xl:gap-8 xl:rounded-[32px] xl:px-14 xl:py-16">
      <ProductVideo />
      <div className="absolute inset-0 bg-linear-to-r from-[rgba(0,31,77,0.94)] via-[rgba(0,31,77,0.82)] via-45% to-[rgba(0,31,77,0.55)]" />

      <div data-stagger className="relative flex w-full flex-col items-start gap-5 xl:max-w-[588px] xl:min-w-0 xl:flex-1 xl:gap-[26px]">
        <p data-enter className="flex h-9 items-center gap-2.5 rounded-full bg-navy-deep pr-4 pl-2 text-caption-m whitespace-nowrap text-blue-pale xl:text-caption">
          <Image src="/icons/eyebrow-new.svg" alt="" width={26} height={24} />
          {t("landing.heroEyebrow", "Smart luggage, paired to your phone")}
        </p>
        <h1 data-enter className="text-display-m font-bold text-white xl:text-display">
          {t("landing.heroTitleLead", "Travel with a")}{" "}
          <span className="relative text-sky">
            {t("landing.heroTitleBetter", "better")}
            {/* The underline draws in once the heading has risen. */}
            <span data-enter="grow" className="absolute inset-0 [--motion-delay:550ms]">
              <Image src="/icons/hero-underline-m.svg" alt="" width={121} height={3} className="absolute top-[51px] left-0 max-w-none xl:hidden" />
              <Image src="/icons/hero-underline.svg" alt="" width={231} height={6} className="absolute top-[67px] left-0 hidden max-w-none xl:block" />
            </span>
          </span>{" "}
          {t("landing.heroTitleEnd", "sense of control")}
        </h1>
        <p data-enter className="text-small text-blue-pale xl:w-[500px] xl:text-lead xl:tracking-normal">
          {t("landing.heroSubhead", "Amortrav bags pair to your account in seconds, stay flight-safe on the plane and keep their papers right in the app.")}
        </p>
        <div data-enter className="flex w-full flex-col gap-3 xl:hidden">
          <Button href={GET_THE_APP_HREF} label={t("landing.heroGetApp", "Get the app")} style="sky" size="m" arrow className="w-full" />
          <Button href="/how-it-works" label={t("landing.heroSeeHow", "See how it works")} style="outline" size="m" className="w-full" />
          <button
            type="button"
            onClick={onWatchFilm}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-btn-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            <Play className="size-4 fill-white" />
            <span>{t("landing.watch", "Watch the film")}</span>
          </button>
        </div>
        <div data-enter className="hidden w-full flex-wrap items-center gap-3 xl:flex">
          <Button href={GET_THE_APP_HREF} label={t("landing.heroGetApp", "Get the app")} style="sky" size="l" arrow />
          <Button href="/how-it-works" label={t("landing.heroSeeHow", "See how it works")} style="outline" size="l" />
          <button
            type="button"
            onClick={onWatchFilm}
            className="flex h-13 items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 text-btn font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            <Play className="size-4 fill-white" />
            <span>{t("landing.watch", "Watch the film")}</span>
          </button>
        </div>
      </div>

      <HeroVisual />
    </section>
  );
}

function HeroVisual() {
  return (
    <div data-enter className="relative hidden h-[600px] w-[668px] shrink-0 [--motion-delay:240ms] xl:block">
      <Image src="/img/hero-glow.svg" alt="" width={520} height={520} className="absolute top-5 left-[74px] max-w-none animate-pulse-subtle" />
      <Image src="/img/hero-orbit.png" alt="" width={600} height={600} className="absolute top-[-20px] left-[34px] max-w-none animate-float-slow" />
      <div className="absolute top-[-22.34px] left-32 h-[582.34px] w-[412px] overflow-clip rounded-[32px] border-4 border-white bg-navy-deep shadow-hero transition-transform duration-500 ease-out-soft hover:scale-[1.015]">
        <div className="absolute inset-[-3.66px_-50px_-76px_-10px] bg-[#bcd5fa]">
          <Image src="/img/hero-photo.png" alt="A traveller sitting on his AMORTRAV suitcase" fill sizes="480px" className="object-cover" preload />
        </div>
        <div className="absolute inset-[-4px] bg-linear-to-b from-[rgba(0,31,77,0)] from-60% to-[rgba(0,31,77,0.55)]" />
      </div>
      <Image src="/img/hero-flight-path.svg" alt="" width={668} height={601} className="absolute top-[-0.6px] left-0 h-[601.2px] w-[668px] max-w-none" />
    </div>
  );
}

function RouteTicker() {
  const { t } = useI18n();

  return (
    <div className="ticker overflow-clip rounded-full bg-white py-4 [--ticker-duration:30s] xl:[--ticker-duration:45s]">
      <p className="sr-only">{t("landing.routesSr", "Example routes: {routes}", { routes: ROUTES.join(", ") })}</p>
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

const CARD_HOVER =
  "transition-[translate,box-shadow] duration-300 ease-out-soft hover:shadow-card-hover motion-safe:hover:-translate-y-1.5";

function CardIcon({ kind }: { kind: "journey" | "impact" | "weight" | "location" | "security" | "status" }) {
  return (
    <div className="relative h-[89px] w-[68.74px] shrink-0 transition-transform duration-300 ease-out-soft group-hover:scale-105 group-hover:-translate-y-1">
      <div className="absolute top-10 left-[18.74px] h-[49px] w-[50px] rounded-[10px_5px_18px_5px] bg-blue-faint transition-all duration-300 ease-out-soft group-hover:bg-sky/35 group-hover:rotate-3" />
      {kind === "journey" && <Image src="/icons/card-journey.svg" alt="" width={61} height={61} className="absolute top-0 left-0 transition-transform duration-300 ease-out-soft group-hover:scale-105" />}
      {kind === "impact" && <Image src="/icons/card-impact.svg" alt="" width={61} height={61} className="absolute top-0 left-0 transition-transform duration-300 ease-out-soft group-hover:scale-105" />}
      {kind === "weight" && <Image src="/icons/card-weight.svg" alt="" width={61} height={61} className="absolute top-0 left-0 transition-transform duration-300 ease-out-soft group-hover:scale-105" />}
      {kind === "location" && (
        <>
          <Image src="/icons/card-location-pin.svg" alt="" width={46} height={65} className="absolute top-1.5 left-[7px] transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5" />
          <Image src="/icons/card-location-dot.svg" alt="" width={19} height={18} className="absolute top-[18px] left-[21px] transition-transform duration-300 ease-out-soft group-hover:scale-125" />
        </>
      )}
      {kind === "security" && <Image src="/icons/card-security.svg" alt="" width={45} height={54} className="absolute top-0 left-2 transition-transform duration-300 ease-out-soft group-hover:scale-105" />}
      {kind === "status" && <Image src="/icons/card-status.svg" alt="" width={61} height={61} className="absolute top-0 left-0 transition-transform duration-300 ease-out-soft group-hover:scale-105" />}
    </div>
  );
}

function Experience() {
  const { t } = useI18n();

  const cards = [
    {
      kind: "journey" as const,
      title: t("landing.expJourneyTitle", "Journey Log"),
      text: t("landing.expJourneyText", "Follow your luggage journey through a clear timeline of location, separation, impact, weight and security events."),
    },
    {
      kind: "impact" as const,
      title: t("landing.expImpactTitle", "Impact Detection"),
      text: t("landing.expImpactText", "Get a time-stamped record when your luggage takes a significant handling impact during travel."),
    },
    {
      kind: "weight" as const,
      title: t("landing.expWeightTitle", "Accurate Weight"),
      text: t("landing.expWeightText", "Lift, check and travel with confidence. See your luggage weight on the case and inside the app."),
    },
    {
      kind: "location" as const,
      title: t("landing.expLocationTitle", "TRACE Location"),
      text: t("landing.expLocationText", "Nearby Bluetooth, GNSS and cellular positioning combine for live and last-known luggage visibility."),
    },
    {
      kind: "security" as const,
      title: t("landing.expSecurityTitle", "Theft & Tamper"),
      text: t("landing.expSecurityText", "Activate Theft Mode, monitor unexpected movement and keep a record of important security events."),
    },
    {
      kind: "status" as const,
      title: t("landing.expStatusTitle", "One Connected View"),
      text: t("landing.expStatusText", "Location, weight, impact history, lock status, battery and alerts, all managed from one app."),
    },
  ];

  return (
    <section data-backdrop="blue-pale" className="flex flex-col items-center px-5 py-8 xl:px-[140px] xl:py-2.5">
      <div className="flex w-full flex-col items-center gap-6 xl:gap-8 xl:py-[66px]">
        <div data-reveal className="flex w-full flex-col items-center gap-2 text-center xl:w-auto xl:min-w-[505px] xl:gap-5 xl:whitespace-nowrap">
          <p className="text-caption-m text-brand font-semibold uppercase xl:text-small">
            {t("landing.expEyebrow", "THE EXPERIENCE")}
          </p>
          <h2 className="text-h1-m font-bold text-navy xl:text-h1">
            {t("landing.expTitle", "Know where things stand")}
          </h2>
        </div>
        <div data-stagger className="-mx-5 flex w-[calc(100%+40px)] gap-4 overflow-x-auto px-5 pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:mx-0 md:w-full md:grid md:grid-cols-2 xl:grid-cols-3 xl:gap-6 xl:overflow-visible xl:p-0">
          {cards.map(({ kind, title, text }) => (
            <div
              key={kind}
              data-reveal
              className={`group w-[280px] shrink-0 snap-center md:w-auto md:shrink flex flex-col items-center gap-5 rounded-3xl bg-white px-6 py-8 text-center shadow-card xl:h-[359px] xl:justify-center xl:gap-3 xl:rounded-[32px] xl:px-8 xl:py-11 ${CARD_HOVER}`}
            >
              <CardIcon kind={kind} />
              <div className="flex flex-col gap-2">
                <h3 className="text-h3-m font-semibold text-brand transition-colors duration-200 group-hover:text-navy xl:text-h3">{title}</h3>
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
  const { t } = useI18n();

  return (
    <section data-backdrop="navy" className="flex flex-col gap-6 overflow-clip rounded-3xl bg-white px-5 py-8 xl:gap-8 xl:rounded-[32px] xl:px-14 xl:py-16">
      <div data-reveal className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
        <h2 className="text-h1-m font-bold text-navy xl:w-[620px] xl:text-h1">
          {t("landing.travelTitle", "Built for the walk to the gate.")}
        </h2>
        <p className="text-small text-mid xl:w-[380px] xl:shrink-0 xl:text-body">
          {t("landing.travelSubhead", "Curbside, concourse, carousel. Your bag stays paired to you the whole way, and its papers ride along in the app.")}
        </p>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:gap-4">
        <PhotoTile caption={t("landing.captionPair", "Pair")} data-reveal className="h-[280px] xl:h-[440px] xl:flex-[608_1_0]">
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
          <PhotoTile caption={t("landing.captionTravel", "Travel")} data-reveal className="h-[220px] flex-1 [--motion-delay:80ms] xl:h-[440px] xl:flex-[324_1_0]">
            <Image src="/img/tile-carryon.jpg" alt="A traveller wheeling a silver suitcase" fill sizes="(min-width: 1280px) 324px, 50vw" className="object-cover" />
          </PhotoTile>
          <PhotoTile caption={t("landing.captionCheckIn", "Check in")} data-reveal className="h-[220px] flex-1 [--motion-delay:160ms] xl:h-[440px] xl:flex-[324_1_0]">
            <Image src="/img/tile-gate.jpg" alt="A teal suitcase at an airport gate" fill sizes="(min-width: 1280px) 324px, 50vw" className="object-cover" />
          </PhotoTile>
        </div>
      </div>
    </section>
  );
}

function Explore() {
  const { t } = useI18n();

  const exploreItems = [
    {
      href: "/features",
      label: t("landing.exploreFeaturesLabel", "Features"),
      title: t("landing.exploreFeaturesTitle", "Everything your bag should've done already."),
      text: t("landing.exploreFeaturesText", "Journey Log, impact detection, accurate weight, location and theft protection in one app."),
      tags: ["Journey Log", "Weight", "Theft Mode"],
      buttonLabel: t("landing.exploreFeaturesBtn", "Explore"),
      dark: true,
    },
    {
      href: "/how-it-works",
      label: t("landing.exploreHowLabel", "How it works"),
      title: t("landing.exploreHowTitle", "Box to boarding in three steps."),
      text: t("landing.exploreHowText", "Unbox, pair in the app, fly. No Bluetooth menus."),
      tags: ["1 · Unbox", "2 · Pair", "3 · Fly"],
      buttonLabel: t("landing.exploreHowBtn", "Find more"),
      dark: false,
    },
    {
      href: "/for-brands",
      label: t("landing.exploreBrandsLabel", "For brands"),
      title: t("landing.exploreBrandsTitle", "Bring more to the bags you make."),
      text: t("landing.exploreBrandsText", "Explore connected features for your luggage, from location to security and ownership."),
      tags: ["Location", "Security", "Ownership"],
      buttonLabel: t("landing.exploreBrandsBtn", "Talk to us"),
      dark: false,
    },
  ];

  return (
    <section data-backdrop="surface" className="flex flex-col gap-6 overflow-clip px-5 py-8 xl:gap-8 xl:rounded-[32px] xl:px-14 xl:py-16">
      <h2 data-reveal className="text-h1-m font-bold text-navy xl:text-h1">
        {t("landing.exploreTitle", "Find more about AMORTRAV")}
      </h2>
      <div data-stagger className="flex flex-col gap-4 xl:flex-row xl:gap-[18px]">
        {exploreItems.map(({ href, label, title, text, tags, buttonLabel, dark }) => (
          <div
            key={href}
            data-reveal
            className={`group relative flex flex-col items-start gap-4 overflow-clip rounded-3xl p-6 xl:h-[407px] xl:flex-1 xl:rounded-[28px] xl:p-7 ${dark ? "bg-navy" : "bg-white shadow-card"} ${CARD_HOVER}`}
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
            <Button href={href} label={buttonLabel} style={dark ? "sky" : "navy"} size="s" arrow stretch />
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useI18n();

  const faqItems = [
    {
      question: t("landing.faqQ1", "Does it work in the air?"),
      answer: t("landing.faqA1", "Not while you fly. Flight-safe mode turns the radios off for takeoff, and the bag checks in again once you land."),
    },
    {
      question: t("landing.faqQ2", "Is it live tracking?"),
      answer: t("landing.faqA2", "Position depends on GPS and mobile signal, and a hold or a basement can block both. When live signal is missing, the app shows the last known position with its time."),
    },
    {
      question: t("landing.faqQ3", "Will it tell me if my bag is stolen?"),
      answer: t("landing.faqA3", "It won't call it theft. The app shows movement and security events reported by the device, with the details you need to decide what to do next."),
    },
    {
      question: t("landing.faqQ4", "Who can see where my bag is?"),
      answer: t("landing.faqA4", "Only the account the bag is paired to. Your receipts and files stay private to you, not the brand."),
    },
  ];

  return (
    <section id="faq" className="flex flex-col gap-6 overflow-clip px-5 py-8 xl:gap-[34px] xl:px-10 xl:py-12">
      <h2 data-reveal className="text-h2-m font-semibold text-navy xl:text-h2">
        {t("landing.faqTitle", "Frequently Asked Questions")}
      </h2>
      <FaqList items={faqItems} initialOpen={1} />
    </section>
  );
}

export default function Home() {
  const { t } = useI18n();
  const [filmOpen, setFilmOpen] = useState(false);

  const testimonials: readonly Testimonial[] = [
    {
      quote: t("landing.t1Quote", "“I watched my bag go through the flap at check-in. Eleven hours later, in Lisbon, I still didn't know if it was on my plane.”"),
      name: t("landing.t1Name", "B. Young"),
      label: t("landing.t1Label", "An overwhelmed traveller"),
      avatar: "/img/testimonial-avatar.png",
      avatarMobile: "/img/testimonial-avatar-m.png",
    },
    {
      quote: t("landing.t2Quote", "“Three airports in one day. At every connection, I kept wondering whether my suitcase had made the same journey.”"),
      name: t("landing.t2Name", "The connecting traveller"),
      label: t("landing.t2Label", "Illustrative traveller story"),
      avatar: "/img/traveller-connecting.webp",
    },
    {
      quote: t("landing.t3Quote", "“With the kids, the passports and the gate change to manage, worrying about our bags was one more thing on my list.”"),
      name: t("landing.t3Name", "The family trip organiser"),
      label: t("landing.t3Label", "Illustrative traveller story"),
      avatar: "/img/traveller-family.webp",
    },
    {
      quote: t("landing.t4Quote", "“I kept checking the carousel long after it stopped. A clear update would have helped me decide what to do next.”"),
      name: t("landing.t4Name", "The frequent flyer"),
      label: t("landing.t4Label", "Illustrative traveller story"),
      avatar: "/img/traveller-frequent.webp",
    },
  ];

  return (
    <>
      <Hero onWatchFilm={() => setFilmOpen(true)} />
      <RouteTicker />
      <Experience />
      <Travel />
      <LuxurySpecs />
      <Testimonials items={testimonials} />
      <Explore />
      <Faq />
      <ScrollBackdrop />
      <FilmModal isOpen={filmOpen} onClose={() => setFilmOpen(false)} />
    </>
  );
}
