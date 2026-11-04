import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Float } from "./motion";
import { FlightPath, Modes } from "./visuals";
import type { ReactNode } from "react";
export function SubHero({
  label,
  title,
  body,
  image,
  alt,
  children,
}: {
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  children?: ReactNode;
}) {
  return (
    <section className="panel navy sub-hero">
      <FlightPath variant="wide" />
      <div className="sub-hero-copy">
        <span className="section-label">{label}</span>
        <h1>{title}</h1>
        <p>{body}</p>
        {children}
      </div>
      <figure>
        <Image
          src={`/images/${image}`}
          alt={alt}
          fill
          priority
          sizes="(max-width: 700px) 90vw, 600px"
        />
      </figure>
    </section>
  );
}
export function Status({ live = false }: { live?: boolean }) {
  return (
    <Badge variant="secondary" className={`status-badge ${live ? "live" : ""}`}>
      {live ? "Live" : "Soon"}
    </Badge>
  );
}
const faq = [
  [
    "I lost the claim card. Now what?",
    "Contact the brand you bought from. They can issue a fresh claim code for your serial from their console.",
  ],
  [
    "Can I pair one bag to two phones?",
    "One owner per bag. Sign in with the same Google account on both phones and you’re set.",
  ],
  [
    "I bought it secondhand.",
    "The previous owner needs to release it first. Transfers inside the app are coming soon.",
  ],
  [
    "Does it work without the app?",
    "It’s still a great bag. The app just adds pairing, docs and alerts.",
  ],
];
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
function Phone({ flight = false }: { flight?: boolean }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <strong>{flight ? "Blue carry-on" : "Claim a bag"}</strong>
        {flight ? (
          <>
            <div className="phone-power navy">
              <small>Power mode</small>
              <strong>Flight safe</strong>
              <small>Radios off until landing</small>
            </div>
            <Modes compact />
          </>
        ) : (
          <>
            <span className="phone-input mono">AMT-CO55-00F3A1</span>
            <span className="phone-input mono">7QF2-KD9M-X4AP</span>
            <span className="phone-submit">Claim this bag</span>
          </>
        )}
      </div>
    </div>
  );
}
export function HowItWorksPage() {
  return (
    <>
      <SubHero
        label="How it works"
        title="Box to boarding in three steps."
        body="No pairing dance, no Bluetooth menus. A card in the box and the Amortrav app do the work."
        image="gate.jpg"
        alt="A teal carry-on with a passport on top, waiting at gate 2"
      />
      {[
        {
          title: "Unbox",
          body: "Every Amortrav bag ships with a claim card. The serial is printed; the one-time code hides under a scratch strip so nobody in the supply chain can grab it.",
          visual: <ClaimCard />,
        },
        {
          title: "Pair",
          body: "Open the app, sign in with Google and type both. The bag becomes yours on the spot and that code stops working forever.",
          visual: <Phone />,
        },
        {
          title: "Fly",
          body: "At the gate, flip to flight-safe mode. Radios go quiet for the flight and wake up when you land.",
          visual: <Phone flight />,
        },
      ].map((step, i) => (
        <section
          className={`panel step-section ${i === 1 ? "reverse soft" : ""}`}
          key={step.title}
        >
          <div className="step-copy">
            <div className="step-number">
              <span>{i + 1}</span>
              {i === 2 && <Status />}
            </div>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </div>
          <div className="step-visual">{step.visual}</div>
        </section>
      ))}
      <section className="panel navy under-hood">
        <h2>Under the hood</h2>
        <div>
          {[
            [
              "One code, one owner",
              "A claim code works exactly once. After that, nobody else can pair your bag.",
            ],
            [
              "Every change is logged",
              "Registering, claiming, edits and revokes all land in an audit trail.",
            ],
            [
              "Files stay private",
              "Your receipts are scoped to your account, not the brand’s.",
            ],
            [
              "Revoked means revoked",
              "If a brand pulls a bag from service, it can’t be paired again.",
            ],
          ].map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="panel soft faq-section">
        <h2>Questions people actually ask</h2>
        <Accordion type="single" collapsible className="faq-list">
          {faq.map(([question, answer], i) => (
            <AccordionItem key={question} value={`question-${i}`}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
