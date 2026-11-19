"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface MegaMenuColumn {
  title: string;
  links: { label: string; href: string; badge?: string }[];
}

export interface MegaMenuItem {
  id: string;
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  card: {
    title: string;
    description: string;
    image: string;
    linkText: string;
    linkHref: string;
  };
}

export const MEGA_MENU_DATA: MegaMenuItem[] = [
  {
    id: "gifts",
    label: "Gifts",
    href: "/shop?category=gifts",
    columns: [
      {
        title: "Curated Gift Guides",
        links: [
          { label: "The Luxury Gift Finder", href: "/shop?gift=finder", badge: "Interactive" },
          { label: "For the Frequent Flyer", href: "/shop?gift=frequent-flyer" },
          { label: "Short Trips & Weekend Getaways", href: "/shop?gift=short-trips" },
          { label: "Emblematic Pieces", href: "/shop?gift=emblematic" },
        ],
      },
      {
        title: "Bespoke Personalisation",
        links: [
          { label: "Monogrammed Luggage Tags", href: "/customise?step=tag" },
          { label: "Custom Wheel Sets", href: "/customise?step=wheels" },
          { label: "Engraved Leather Handles", href: "/customise?step=handles" },
        ],
      },
    ],
    card: {
      title: "The Art of Giving",
      description: "Timeless German engineering paired with personalized monogramming.",
      image: "/images/trace/range-pro.png",
      linkText: "Explore Gift Guide",
      linkHref: "/shop?category=gifts",
    },
  },
  {
    id: "luggage",
    label: "Luggage",
    href: "/shop",
    columns: [
      {
        title: "By Silhouette & Size",
        links: [
          { label: "Cabin 55 (Overhead Bin)", href: "/shop?size=cabin", badge: "Carry-On" },
          { label: "Check-In M (68 cm)", href: "/shop?size=check-in-m" },
          { label: "Check-In 76 (Long Haul)", href: "/shop?size=check-in-76" },
          { label: "Trunk 90 (Iconic Silhouette)", href: "/shop?size=trunk", badge: "Signature" },
          { label: "The Pair (Bundle Savings)", href: "/shop?product=The+Pair" },
        ],
      },
      {
        title: "By Material & Finish",
        links: [
          { label: "Brushed Aerospace Aluminium", href: "/shop?material=aluminium" },
          { label: "High-Gloss Polycarbonate", href: "/shop?material=polycarbonate" },
          { label: "Executive Obsidian Matte", href: "/shop?finish=obsidian" },
          { label: "Navy Flagship Edition", href: "/shop?finish=navy" },
        ],
      },
      {
        title: "Smart Core Features",
        links: [
          { label: "Built-In Self-Weighing Handle", href: "/how-it-works#weighing" },
          { label: "Drop & Impact Log", href: "/how-it-works#impacts" },
          { label: "Dual TSA-Approved Locks", href: "/services/lock-tutorial" },
          { label: "TRACE Cellular & GNSS Track", href: "/how-it-works#location" },
        ],
      },
    ],
    card: {
      title: "Engineered for a Lifetime",
      description: "Aerospace-grade ribbed alloys backed by the AMTRAV Lifetime Guarantee.",
      image: "/images/trace/range-flagship.png",
      linkText: "Shop All Luggage",
      linkHref: "/shop",
    },
  },
  {
    id: "bags",
    label: "Bags",
    href: "/shop?category=bags",
    columns: [
      {
        title: "Spotlight Innovation",
        links: [
          {
            label: "AMTRAV Suede & Aluminium Duffel Side Bag",
            href: "/shop?product=duffel-side-bag",
            badge: "New Signature",
          },
          { label: "RFID-Shielded Travel Compartments", href: "/shop?feature=rfid" },
          { label: "Suede Colorways (5 Shades)", href: "/shop?product=duffel-side-bag#swatches" },
        ],
      },
      {
        title: "Everyday & Weekender",
        links: [
          { label: "Executive Travel Backpacks", href: "/shop?category=backpacks" },
          { label: "Aluminium Frame Crossbody Bags", href: "/shop?category=crossbody" },
          { label: "Weekend Duffle Bags", href: "/shop?category=duffle" },
          { label: "Briefcases & Work Totes", href: "/shop?category=briefcases" },
        ],
      },
    ],
    card: {
      title: "AMTRAV Premium Duffel",
      description: "Handcrafted suede with aerospace aluminium stripes and RFID security.",
      image: "/images/trace/duffel-side-bag.jpg",
      linkText: "Discover the Duffel",
      linkHref: "/shop?product=duffel-side-bag",
    },
  },
  {
    id: "accessories",
    label: "Accessories",
    href: "/shop?category=accessories",
    columns: [
      {
        title: "Customisation Accessories",
        links: [
          { label: "Interchangeable Leather Luggage Tags", href: "/customise?step=tag" },
          { label: "Multiwheel® Color Accent Sets", href: "/customise?step=wheels" },
          { label: "Luggage Belts & Security Straps", href: "/shop?category=belts" },
        ],
      },
      {
        title: "Travel Organizers",
        links: [
          { label: "Flex Divider Compression Packing Cubes", href: "/shop?category=packing" },
          { label: "RFID Passport & Card Holders", href: "/shop?category=leather-goods" },
          { label: "Protective Luggage Covers", href: "/shop?category=covers" },
        ],
      },
    ],
    card: {
      title: "Fine Leather Goods",
      description: "Elevate your journey with Italian leather accessories and custom hardware.",
      image: "/images/trace/range-essential.png",
      linkText: "Explore Accessories",
      linkHref: "/shop?category=accessories",
    },
  },
  {
    id: "specialties",
    label: "Specialties",
    href: "/shop?category=specialties",
    columns: [
      {
        title: "Collector Cases",
        links: [
          { label: "Aluminium Watch & Jewelry Case", href: "/shop?category=watch-cases", badge: "Exclusive" },
          { label: "Wine & Spirits Travel Hard-Case", href: "/shop?category=wine-cases" },
          { label: "Acoustic & Electronic Instrument Cases", href: "/shop?category=instruments" },
        ],
      },
    ],
    card: {
      title: "Bespoke Specialty Cases",
      description: "Ultra-secure grooved hard-cases designed for high-value collectors' items.",
      image: "/images/trace/range-executive.png",
      linkText: "View Specialties",
      linkHref: "/shop?category=specialties",
    },
  },
  {
    id: "new",
    label: "New",
    href: "/shop?filter=new",
    columns: [
      {
        title: "Recent Drops",
        links: [
          { label: "Suede & Aluminium Duffel Collection", href: "/shop?product=duffel-side-bag", badge: "New" },
          { label: "Titanium Check-In 76", href: "/shop?product=Check-in+76" },
          { label: "Cognac Brown & Charcoal Grey Editions", href: "/shop?color=cognac" },
        ],
      },
    ],
    card: {
      title: "Seasonal Innovations",
      description: "Discover our newest luxury colorways and technical materials.",
      image: "/images/trace/hero-pair.jpg",
      linkText: "Shop New Arrivals",
      linkHref: "/shop?filter=new",
    },
  },
  {
    id: "services",
    label: "Services",
    href: "/services",
    columns: [
      {
        title: "Ownership & Care",
        links: [
          { label: "Register Your Luggage", href: "/services/registration", badge: "Lifetime Guarantee" },
          { label: "Lock Setup & Reset Tutorial", href: "/services/lock-tutorial" },
          { label: "Track Your Order & Returns", href: "/services/tracking" },
          { label: "Global Repair Center Request", href: "/services/repairs" },
        ],
      },
      {
        title: "In-Store Experience",
        links: [
          { label: "Find an AMTRAV Boutique Store", href: "/services/stores" },
          { label: "Book a VIP In-Store Appointment", href: "/services/stores#appointment" },
          { label: "Airline Carry-On Compatibility Guide", href: "/shop#airline-matrix" },
        ],
      },
    ],
    card: {
      title: "Post-Purchase Excellence",
      description: "Enjoy our 100+ global service hubs, lifetime repairs and direct support.",
      image: "/images/trace/film-poster.jpg",
      linkText: "Client Services Portal",
      linkHref: "/services/registration",
    },
  },
  {
    id: "discover",
    label: "Discover",
    href: "/how-it-works",
    columns: [
      {
        title: "Heritage & Craft",
        links: [
          { label: "Since Foundation: Crafting TRACE", href: "/how-it-works" },
          { label: "Aerospace Aluminium Engineering", href: "/how-it-works#materials" },
          { label: "Sustainability & Circular Repairs", href: "/services/repairs#sustainability" },
          { label: "Commercial Flight Safety Compliance", href: "/#faq" },
        ],
      },
    ],
    card: {
      title: "Quiet Luxury, Loud Precision",
      description: "Experience how smart intelligence seamlessly melds into high-end aesthetics.",
      image: "/images/trace/spot-poster.jpg",
      linkText: "Discover Our Story",
      linkHref: "/how-it-works",
    },
  },
  {
    id: "customise",
    label: "Customise",
    href: "/customise",
    columns: [
      {
        title: "AMTRAV UNIQUE Studio",
        links: [
          { label: "Interactive 3D Product Builder", href: "/customise", badge: "3D Studio" },
          { label: "Choose Base Shell & Silhouette", href: "/customise?step=shell" },
          { label: "Custom Leather Tag Monogramming", href: "/customise?step=tag" },
          { label: "Colored Wheels & Accent Handles", href: "/customise?step=accents" },
        ],
      },
    ],
    card: {
      title: "AMTRAV UNIQUE Configurator",
      description: "Personalize your suitcase shell, leather tag, handle, and wheels in real time.",
      image: "/images/trace/range-pro.png",
      linkText: "Launch 3D Configurator",
      linkHref: "/customise",
    },
  },
];

export default function MegaMenu() {
  const [activeItem, setActiveItem] = useState<MegaMenuItem | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMouseEnter = (item: MegaMenuItem) => {
    clearTimeout(timeoutRef.current);
    setActiveItem(item);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveItem(null);
    }, 180);
  };

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      {/* Pillar Bar */}
      <nav aria-label="Main Navigation" className="flex items-center gap-1 xl:gap-2">
        {MEGA_MENU_DATA.map((item) => {
          const isActive = activeItem?.id === item.id;
          return (
            <div key={item.id} onMouseEnter={() => handleMouseEnter(item)}>
              <Link
                href={item.href}
                className={`relative px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "text-brand after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-brand"
                    : "text-navy hover:text-brand"
                }`}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Flyout Dropdown Drawer */}
      {activeItem && (
        <div
          onMouseEnter={() => clearTimeout(timeoutRef.current)}
          onMouseLeave={handleMouseLeave}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[92vw] max-w-6xl rounded-3xl border border-divider bg-white/95 p-8 shadow-2xl backdrop-blur-xl z-40 transition-all animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            {/* Columns Area */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {activeItem.columns.map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <h4 className="text-caption-m font-bold uppercase tracking-wider text-mid border-b border-divider pb-2">
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setActiveItem(null)}
                          className="group flex items-center justify-between text-small text-navy hover:text-brand transition-colors"
                        >
                          <span className="group-hover:translate-x-1 transition-transform">
                            {link.label}
                          </span>
                          {link.badge && (
                            <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy group-hover:bg-brand group-hover:text-white transition-colors">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Editorial Showcase Card */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-divider p-5">
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white mb-4">
                  <Image
                    src={activeItem.card.image}
                    alt={activeItem.card.title}
                    fill
                    sizes="320px"
                    className="object-contain p-2"
                  />
                </div>
                <h5 className="text-small font-bold text-navy">{activeItem.card.title}</h5>
                <p className="mt-1 text-caption text-mid leading-relaxed">
                  {activeItem.card.description}
                </p>
              </div>

              <Link
                href={activeItem.card.linkHref}
                onClick={() => setActiveItem(null)}
                className="mt-4 flex items-center justify-between rounded-xl bg-navy px-4 py-2 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep transition-all"
              >
                <span>{activeItem.card.linkText}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}