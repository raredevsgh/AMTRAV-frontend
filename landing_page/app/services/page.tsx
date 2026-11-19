import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, KeyRound, Package, Wrench, MapPin, Plane, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Client Services & Post-Purchase Hub | AMTRAV",
  description:
    "Official AMTRAV client care: Digital luggage registration, combination lock tutorials, global order tracking, repair requests, and boutique store appointment bookings.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    title: "Luggage Registration",
    subtitle: "Lifetime Guarantee Activation",
    description: "Register your case serial number to activate your Lifetime Functional Guarantee and digital passport.",
    href: "/services/registration",
    icon: ShieldCheck,
    badge: "Essential",
  },
  {
    title: "TSA Lock Setup Tutorial",
    subtitle: "Interactive Combination Simulator",
    description: "Step-by-step interactive simulator to set or reset your secret 3-digit combination lock.",
    href: "/services/lock-tutorial",
    icon: KeyRound,
    badge: "Interactive",
  },
  {
    title: "Order & Return Tracking",
    subtitle: "DHL Luxury Logistics",
    description: "Follow your order through customs clearance, aircraft transit, and final courier delivery.",
    href: "/services/tracking",
    icon: Package,
    badge: "Live Status",
  },
  {
    title: "Official Repair Portal",
    subtitle: "100+ Global Service Hubs",
    description: "Submit a claim under our Lifetime Guarantee for free courier pick-up or boutique drop-off.",
    href: "/services/repairs",
    icon: Wrench,
    badge: "Free Service",
  },
  {
    title: "Boutique Store Locator",
    subtitle: "VIP Private Appointments",
    description: "Locate our flagship stores in Oslo, London, Paris, New York, and Tokyo for bespoke consultations.",
    href: "/services/stores",
    icon: MapPin,
    badge: "Global",
  },
  {
    title: "Airline Compatibility Matrix",
    subtitle: "50+ Global Carriers Tested",
    description: "Verify Cabin 55 compliance against overhead sizers for SAS, Lufthansa, Delta, Emirates, and more.",
    href: "/shop",
    icon: Plane,
    badge: "Flight Safe",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-surface/30 pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-divider pb-8 text-center sm:text-left">
          <span className="text-caption font-mono uppercase tracking-widest text-sky font-semibold">
            Client Concierge & Care
          </span>
          <h1 className="text-display-m font-bold text-navy md:text-h1 mt-1">
            AMTRAV Services & Support
          </h1>
          <p className="mt-2 text-small text-mid max-w-2xl">
            From lifetime warranty registration and combination lock tutorials to worldwide repair dispatch and VIP appointments, our team is dedicated to supporting your lifetime of journeys.
          </p>
        </div>

        {/* Services Grid */}
        <div className="my-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.title}
                href={srv.href}
                className="group flex flex-col justify-between rounded-3xl border border-divider bg-white p-6 shadow-card hover:shadow-xl transition-all hover:border-navy"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-navy/5 text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                      <Icon className="size-6" />
                    </div>
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy border border-divider">
                      {srv.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-h3-m font-bold text-navy group-hover:text-brand transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-caption font-semibold text-mid mt-0.5">{srv.subtitle}</p>
                    <p className="text-caption text-mid mt-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-divider flex items-center justify-between text-caption font-semibold text-navy group-hover:text-brand">
                  <span>Access Portal</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}