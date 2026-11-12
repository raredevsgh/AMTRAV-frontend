"use client";

// Contact: when to expect a reply and in which languages, who to write to for what, the
// partner and investor enquiry form with what happens next, and answers people can find
// without writing at all.
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Handshake,
  Languages,
  LifeBuoy,
  Lock,
  Newspaper,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { PRIVACY_CONTACT, SUPPORT_CONTACT } from "@/lib/legal";
import { useI18n } from "@/lib/i18n/client";
import { localeNames, locales } from "@/lib/i18n/config";
import { EnquiryForm } from "./enquiry-form";
import "@/app/trace.css";
import "@/app/pages.css";

export function ContactPage() {
  const { m, href } = useI18n();
  const ways = [
    {
      icon: <LifeBuoy size={20} />,
      title: m.contact.supportTitle,
      body: m.contact.supportBody,
      email: SUPPORT_CONTACT,
    },
    {
      icon: <Handshake size={20} />,
      title: m.contact.partnersTitle,
      body: m.contact.partnersBody,
      email: brand.email,
    },
    {
      icon: <Newspaper size={20} />,
      title: m.contact.pressTitle,
      body: m.contact.pressBody,
      email: brand.email,
    },
    {
      icon: <Lock size={20} />,
      title: m.contact.privacyTitle,
      body: m.contact.privacyBody,
      email: PRIVACY_CONTACT,
    },
  ];
  const answers = [
    { label: m.contact.selfFaq, path: "/#faq" },
    { label: m.contact.selfShipping, path: "/shipping-returns" },
    { label: m.contact.selfWarranty, path: "/warranty" },
    { label: m.contact.selfPairing, path: "/how-it-works" },
  ];

  return (
    <div className="trace page contact">
      <section className="trace-panel night contact-hero">
        <div className="contact-hero-copy">
          <span className="trace-eyebrow">{m.contact.eyebrow}</span>
          <h1>{m.contact.title}</h1>
          <p>{m.contact.body}</p>
        </div>
        <dl className="contact-facts">
          <div>
            <dt>
              <Clock size={18} aria-hidden="true" />
            </dt>
            <dd>{m.contact.reply}</dd>
          </div>
          <div>
            <dt>
              <Languages size={18} aria-hidden="true" />
              <span className="sr-only">{m.contact.languages}</span>
            </dt>
            <dd>
              <ul className="contact-languages" aria-label={m.contact.languages}>
                {locales.map((code) => (
                  <li key={code} lang={code}>
                    {localeNames[code]}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="trace-panel contact-ways-section"
        aria-labelledby="contact-write"
      >
        <h2 id="contact-write" className="contact-section-title">
          {m.contact.write}
        </h2>
        <div className="contact-ways">
          {ways.map((way) => (
            <a key={way.title} className="contact-way" href={`mailto:${way.email}`}>
              <span className="page-card-icon">{way.icon}</span>
              <h3>{way.title}</h3>
              <p>{way.body}</p>
              <span className="contact-email">
                {way.email} <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        className="trace-panel soft contact-enquiry"
        id="enquiry"
        aria-labelledby="enquiry-title"
      >
        <div className="contact-enquiry-copy">
          <span className="trace-eyebrow">{m.contact.partnersTitle}</span>
          <h2 id="enquiry-title">{m.contact.formTitle}</h2>
          <p>{m.contact.formBody}</p>
          <h3>{m.contact.nextTitle}</h3>
          <ol className="contact-next">
            {[m.contact.next1, m.contact.next2, m.contact.next3].map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="contact-form-panel">
          <EnquiryForm />
        </div>
      </section>

      <section className="trace-panel contact-answers" aria-labelledby="contact-answers">
        <h2 id="contact-answers" className="contact-section-title">
          {m.contact.selfTitle}
        </h2>
        <ul>
          {answers.map((answer) => (
            <li key={answer.path}>
              <Link href={href(answer.path)}>
                {answer.label} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
