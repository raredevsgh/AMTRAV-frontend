"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Calendar, Check } from "lucide-react";

interface StoreLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: "Europe" | "Americas" | "Asia & Pacific";
  address: string;
  hours: string;
  phone: string;
  services: string[];
}

const STORES: StoreLocation[] = [
  {
    id: "oslo",
    name: "AMTRAV Oslo Flagship Atelier",
    city: "Oslo",
    country: "Norway",
    continent: "Europe",
    address: "Karl Johans gate 22, 0159 Oslo",
    hours: "Mon – Sat: 10:00 – 19:00",
    phone: "+47 22 41 80 00",
    services: ["Official Repair Hub", "Hot Foil Monogramming", "3D Custom Studio"],
  },
  {
    id: "london",
    name: "AMTRAV London Mayfair",
    city: "London",
    country: "United Kingdom",
    continent: "Europe",
    address: "15 Old Bond Street, Mayfair, London W1S 4AX",
    hours: "Mon – Sat: 10:00 – 18:30",
    phone: "+44 20 7493 8312",
    services: ["Official Repair Hub", "VIP Private Salon", "Bespoke Monogramming"],
  },
  {
    id: "paris",
    name: "AMTRAV Paris Saint-Honoré",
    city: "Paris",
    country: "France",
    continent: "Europe",
    address: "73 Rue du Faubourg Saint-Honoré, 75008 Paris",
    hours: "Mon – Sat: 10:30 – 19:30",
    phone: "+33 1 42 68 00 20",
    services: ["Repair Service Center", "Leather Workshop", "Complimentary Sizing"],
  },
  {
    id: "new-york",
    name: "AMTRAV New York Madison Avenue",
    city: "New York",
    country: "United States",
    continent: "Americas",
    address: "535 Madison Ave, New York, NY 10022",
    hours: "Mon – Sat: 10:00 – 19:00, Sun: 12:00 – 18:00",
    phone: "+1 212 555 0199",
    services: ["Official Repair Hub", "Corporate Gifting", "Instant Monogramming"],
  },
  {
    id: "tokyo",
    name: "AMTRAV Tokyo Ginza 6",
    city: "Tokyo",
    country: "Japan",
    continent: "Asia & Pacific",
    address: "6-10-1 Ginza, Chuo-ku, Tokyo 104-0061",
    hours: "Daily: 10:30 – 20:30",
    phone: "+81 3 3572 1898",
    services: ["Craft Repair Center", "Limited Color Editions", "Tax-Free Services"],
  },
  {
    id: "berlin",
    name: "AMTRAV Berlin Kurfürstendamm",
    city: "Berlin",
    country: "Germany",
    continent: "Europe",
    address: "Kurfürstendamm 195, 10707 Berlin",
    hours: "Mon – Sat: 10:00 – 19:00",
    phone: "+49 30 889 1300",
    services: ["Engineering Atelier", "Luggage Registration", "Same-Day Wheel Swaps"],
  },
];

export default function StoresPage() {
  const [selectedContinent, setSelectedContinent] = useState<string>("All");

  // Appointment Modal
  const [bookingStore, setBookingStore] = useState<StoreLocation | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("2026-11-25");
  const [appointmentType, setAppointmentType] = useState("Bespoke Sizing & Consultation");
  const [booked, setBooked] = useState(false);

  const filteredStores = selectedContinent === "All"
    ? STORES
    : STORES.filter((s) => s.continent === selectedContinent);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <div className="min-h-screen bg-surface/30 pt-6 sm:pt-8 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-caption text-mid">
          <Link href="/" className="hover:text-navy">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-navy">Services</Link>
          <span>/</span>
          <span className="font-semibold text-navy">Store Locator</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider pb-8 text-center sm:text-left">
          <h1 className="text-display-m font-bold text-navy md:text-h1">
            AMTRAV Boutiques & Service Hubs
          </h1>
          <p className="mt-2 text-small text-mid max-w-2xl">
            Experience our suitcases in person, receive complimentary initial monogramming, or have your luggage inspected by certified craft technicians.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="my-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All", "Europe", "Americas", "Asia & Pacific"].map((cont) => (
              <button
                key={cont}
                type="button"
                onClick={() => setSelectedContinent(cont)}
                className={`rounded-full px-4 py-1.5 text-caption font-semibold transition-all ${
                  selectedContinent === cont
                    ? "bg-navy text-white shadow-xs"
                    : "bg-white border border-divider text-navy hover:bg-surface"
                }`}
              >
                {cont}
              </button>
            ))}
          </div>
          <span className="text-caption font-semibold text-mid">
            {filteredStores.length} Boutique Locations
          </span>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="flex flex-col justify-between rounded-3xl border border-divider bg-white p-6 shadow-card hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-sky font-semibold">
                    {store.city}, {store.country}
                  </span>
                  <h3 className="text-h3-m font-bold text-navy mt-1">{store.name}</h3>
                </div>

                <div className="space-y-2 text-caption text-mid">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-navy shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="size-4 text-navy shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="size-4 text-navy shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {store.services.map((srv) => (
                    <span
                      key={srv}
                      className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium text-navy border border-divider"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-divider">
                <button
                  type="button"
                  onClick={() => {
                    setBookingStore(store);
                    setBooked(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-2.5 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
                >
                  <Calendar className="size-3.5" />
                  <span>Book VIP In-Store Appointment</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Dialog Modal */}
        {bookingStore && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-lg rounded-3xl border border-divider bg-white p-6 sm:p-8 shadow-2xl">
              {booked ? (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="size-7" />
                  </div>
                  <h3 className="text-h3-m font-bold text-navy">Appointment Confirmed</h3>
                  <p className="text-small text-mid">
                    We look forward to welcoming you at <strong>{bookingStore.name}</strong> on{" "}
                    <strong>{appointmentDate}</strong> for your {appointmentType}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBookingStore(null)}
                    className="rounded-full bg-navy px-6 py-2.5 text-small font-semibold text-white hover:bg-navy-deep"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <span className="text-caption font-mono uppercase text-sky">VIP Reservation</span>
                    <h3 className="text-h3-m font-bold text-navy">Book at {bookingStore.city}</h3>
                    <p className="text-caption text-mid mt-0.5">{bookingStore.address}</p>
                  </div>

                  <div>
                    <label className="block text-caption-m font-semibold text-navy uppercase mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Henrik Ibsen"
                      className="w-full rounded-xl border border-divider px-3.5 py-2 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-caption-m font-semibold text-navy uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="henrik@example.com"
                      className="w-full rounded-xl border border-divider px-3.5 py-2 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-caption-m font-semibold text-navy uppercase mb-1">
                      Appointment Purpose
                    </label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      className="w-full rounded-xl border border-divider px-3.5 py-2 text-small text-navy focus:border-navy focus:outline-none"
                    >
                      <option value="Bespoke Sizing & Consultation">Bespoke Sizing & Range Consultation</option>
                      <option value="Hot Foil Monogramming Session">Hot Foil Leather Monogramming Session</option>
                      <option value="Luggage Inspection & Repair Check">Luggage Inspection & Repair Check</option>
                      <option value="VIP Private Shopping">VIP Private Shopping Salon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption-m font-semibold text-navy uppercase mb-1">
                      Date & Preferred Slot
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full rounded-xl border border-divider px-3.5 py-2 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
                    <button
                      type="button"
                      onClick={() => setBookingStore(null)}
                      className="rounded-full px-4 py-2 text-caption font-semibold text-mid hover:text-navy"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-navy px-5 py-2 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep"
                    >
                      Confirm Appointment
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}