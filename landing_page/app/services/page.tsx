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
    <div className="min-h-screen bg-surface/30 dark:bg-transparent pt-6 sm:pt-8 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-caption text-mid dark:text-blue-pale/70">
          <Link href="/" className="hover:text-navy dark:hover:text-white">Home</Link>
          <span className="text-light-white dark:text-white/30">/</span>
          <span className="font-semibold text-navy dark:text-white">Client Services</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider dark:border-white/15 pb-8 text-center sm:text-left">
          <span className="text-caption font-mono uppercase tracking-widest text-sky font-semibold">
            Client Concierge & Care
          </span>
          <h1 className="text-display-m font-bold text-navy dark:text-white md:text-h1 mt-1">
            AMTRAV Services & Support
          </h1>
          <p className="mt-2 text-small text-mid dark:text-blue-pale/80 max-w-2xl">
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
                className="group flex flex-col justify-between rounded-3xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-6 shadow-card hover:shadow-xl transition-all hover:border-navy dark:hover:border-sky"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-navy/5 dark:bg-white/10 text-navy dark:text-sky group-hover:bg-navy dark:group-hover:bg-sky group-hover:text-white dark:group-hover:text-navy transition-colors">
                      <Icon className="size-6" />
                    </div>
                    <span className="rounded-full bg-surface dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy dark:text-white border border-divider dark:border-white/15">
                      {srv.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-h3-m font-bold text-navy dark:text-white group-hover:text-brand dark:group-hover:text-sky transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-caption font-semibold text-mid dark:text-blue-pale/70 mt-0.5">{srv.subtitle}</p>
                    <p className="text-caption text-mid dark:text-blue-pale/80 mt-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-divider dark:border-white/15 flex items-center justify-between text-caption font-semibold text-navy dark:text-white group-hover:text-brand dark:group-hover:text-sky">
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