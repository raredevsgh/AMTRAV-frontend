"use client";

import Image from "next/image";
import Link from "next/link";
import { Tabs } from "radix-ui";
import { ArrowDown, ArrowRight, Cpu, Luggage, Route, ScanLine } from "lucide-react";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { useI18n } from "@/lib/i18n/client";
import { discovery } from "@/lib/i18n/discovery";
import { Stagger } from "./motion";
import "@/app/landing-discovery.css";

export function DiscoveryLinks() {
  const { locale } = useI18n();
  const copy = discovery[locale];
  const links = [
    { href: "#range", title: copy.choose, body: copy.chooseBody, icon: Luggage },
    {
      href: "#features",
      title: copy.understand,
      body: copy.understandBody,
      icon: ScanLine,
    },
    { href: "#how", title: copy.experience, body: copy.experienceBody, icon: Route },
  ];
  return (
    <nav className="ld-discovery" aria-label={copy.shortcuts}>
      {links.map(({ href, title, body, icon: Icon }, index) => (
        <a key={href} href={href} className="ld-discoveryLink">
          <span className="ld-linkTop">
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            <span aria-hidden="true">0{index + 1}</span>
          </span>
          <strong>{title}</strong>
          <span className="ld-linkBody">{body}</span>
          <ArrowDown className="ld-linkArrow" size={17} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}

const finishes = {
  essential: "#555c65",
  flagship: "#17314f",
  pro: "#a8afb9",
  executive: "#202124",
};

/** Manual selection keeps the product still until the visitor chooses to explore it. */
export function RangeExplorer() {
  const { locale, m, href } = useI18n();
  const copy = discovery[locale];
  const [selected, setSelected] = useState<string>(brand.range[0].key);
  return (
    <section className="trace-panel ld-range" id="range" aria-labelledby="range-title">
      <Stagger as="header" className="ld-rangeHeading">
        <span className="ld-eyebrow">{m.nav.range}</span>
        <h2 id="range-title">{copy.rangeTitle}</h2>
        <p>{copy.rangeBody}</p>
      </Stagger>
      <Tabs.Root value={selected} onValueChange={setSelected} className="ld-explorer">
        <Tabs.List className="ld-options" aria-label={copy.select}>
          {brand.range.map((item, index) => (
            <Tabs.Trigger key={item.key} value={item.key} className="ld-option">
              <span className="ld-optionNumber" aria-hidden="true">
                0{index + 1}
              </span>
              <span
                className="ld-swatch"
                style={{ background: finishes[item.key] }}
                aria-hidden="true"
              />
              <span>{item.name}</span>
              <span className="ld-optionKind">
                {item.key === "essential" || item.key === "pro"
                  ? copy.carry
                  : copy.checked}
              </span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {brand.range.map((item, index) => (
          <Tabs.Content key={item.key} value={item.key} className="ld-product">
            <div className="ld-productStage">
              <div className="ld-stageLabel">
                <span>
                  {brand.company} / {item.name}
                </span>
                <span aria-hidden="true">0{index + 1} — 04</span>
              </div>
              <span className="ld-stageWord" aria-hidden="true">
                {item.name}
              </span>
              <div className="ld-productImage">
                <Image
                  src={item.image}
                  alt={`${brand.company} ${item.name} · ${copy.finishes[item.key]}`}
                  fill
                  sizes="(max-width: 800px) 88vw, (max-width: 1440px) 48vw, 690px"
                />
              </div>
              <span className="ld-stageFoot">
                <Cpu size={14} aria-hidden="true" /> {brand.core}
              </span>
            </div>
            <div className="ld-productCopy">
              <span className="ld-category">
                <Luggage size={14} aria-hidden="true" />
                {item.key === "essential" || item.key === "pro"
                  ? copy.carry
                  : copy.checked}
              </span>
              <h3>{item.name}</h3>
              <p className="ld-productStory">{copy.stories[item.key]}</p>
              <dl className="ld-specs">
                <div>
                  <dt>{copy.finish}</dt>
                  <dd>{copy.finishes[item.key]}</dd>
                </div>
                <div>
                  <dt>{copy.dimensions}</dt>
                  <dd dir="ltr">{item.size}</dd>
                </div>
              </dl>
              <div className="ld-core">
                <span className="ld-coreIcon">
                  <Cpu size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <span>{copy.included}</span>
                  <strong>{brand.core}</strong>
                  <p>{copy.coreBody}</p>
                </div>
              </div>
              <Link className={`trace-button ink ld-shop`} href={href("/shop")}>
                {m.nav.shop} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <p className="ld-airlineNote">{copy.airlineNote}</p>
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}
