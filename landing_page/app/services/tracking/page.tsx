"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Search, CheckCircle, AlertCircle, Package, MapPin, Tag } from "lucide-react";

interface Milestone {
  step: string;
  date: string;
  completed: boolean;
  detail: string;
}

interface TrackingResult {
  orderReference: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  isReservation?: boolean;
  milestones: Milestone[];
}

interface LocalReservation {
  reservation_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: {
    country: string;
    street: string;
    apartment?: string;
    city: string;
    postal_code: string;
    method?: string;
  };
  product?: {
    sku: string;
    name: string;
    size: string;
    color: string;
    tag_addon?: {
      initials: string;
      foil: string;
      color: string;
      price_minor: number;
    } | null;
  };
  created_at?: string;
}

const emptySubscribe = () => () => {};
const EMPTY_RESERVATIONS: LocalReservation[] = [];
let cachedRawReservations: string | null = null;
let cachedParsedReservations: LocalReservation[] = EMPTY_RESERVATIONS;

function getReservationsSnapshot(): LocalReservation[] {
  if (typeof window === "undefined") return EMPTY_RESERVATIONS;
  try {
    const raw = localStorage.getItem("amortrav.reservations");
    if (raw === cachedRawReservations) return cachedParsedReservations;
    cachedRawReservations = raw;
    if (!raw) {
      cachedParsedReservations = EMPTY_RESERVATIONS;
      return cachedParsedReservations;
    }
    const parsed = JSON.parse(raw);
    cachedParsedReservations = Array.isArray(parsed) ? parsed : EMPTY_RESERVATIONS;
    return cachedParsedReservations;
  } catch {
    return EMPTY_RESERVATIONS;
  }
}

function getServerReservationsSnapshot(): LocalReservation[] {
  return EMPTY_RESERVATIONS;
}

export default function TrackingPage() {
  const [orderReference, setOrderReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const savedReservations = useSyncExternalStore(
    emptySubscribe,
    getReservationsSnapshot,
    getServerReservationsSnapshot
  );
  const [matchedReservation, setMatchedReservation] = useState<LocalReservation | null>(null);

  const handleTrack = async (e?: React.FormEvent, refOverride?: string, emailOverride?: string) => {
    if (e) e.preventDefault();
    const targetRef = (refOverride || orderReference).trim().toUpperCase();
    const targetEmail = (emailOverride || email).trim();

    if (!targetRef) {
      setError("Please enter a valid reference number.");
      return;
    }

    setLoading(true);
    setError(null);
    setMatchedReservation(null);

    // Check if matched in local reservations
    const matched = savedReservations.find(
      (r) => r.reservation_id?.toUpperCase() === targetRef
    );
    if (matched) {
      setMatchedReservation(matched);
      if (!targetEmail && matched.customer_email) {
        setEmail(matched.customer_email);
      }
    }

    try {
      const res = await fetch("/api/services/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderReference: targetRef,
          email: targetEmail || matched?.customer_email || "traveler@amortrav.com",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found.");
      }
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to track order.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (res: LocalReservation) => {
    setOrderReference(res.reservation_id);
    setEmail(res.customer_email || "");
    handleTrack(undefined, res.reservation_id, res.customer_email);
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
          <span className="font-semibold text-navy">Order & Reservation Tracking</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider pb-8 text-center sm:text-left">
          <h1 className="text-display-m font-bold text-navy md:text-h1">
            Track Your Order & Reservation
          </h1>
          <p className="mt-2 text-small text-mid max-w-2xl">
            Check the real-time allocation, atelier assembly, customs clearance, and white-glove courier delivery of your AMTRAV luggage order or reservation reference ID.
          </p>
        </div>

        {/* Quick Selection for Local Reservations */}
        {savedReservations.length > 0 && (
          <div className="mt-6 rounded-2xl border border-sky/30 bg-sky/5 p-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-mid block mb-2">
              Recent Reservations on this Device:
            </span>
            <div className="flex flex-wrap gap-2">
              {savedReservations.map((item) => (
                <button
                  key={item.reservation_id}
                  type="button"
                  onClick={() => handleQuickSelect(item)}
                  className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-caption font-bold text-navy hover:border-navy hover:shadow-xs active:scale-95 transition-all"
                >
                  <Package className="size-3.5 text-brand" />
                  <span>{item.reservation_id}</span>
                  <span className="text-[11px] font-normal text-mid font-mono">
                    ({item.product?.name || "Luggage"})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lookup Form */}
        <div className="mt-8 rounded-3xl border border-divider bg-white p-6 sm:p-8 shadow-card">
          <form onSubmit={handleTrack} className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end">
            <div className="sm:col-span-5">
              <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                Reference Number (Order or Reservation ID) *
              </label>
              <input
                type="text"
                required
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value.toUpperCase())}
                placeholder="e.g. AMT-RES-84920 or AMT-72819"
                className="w-full rounded-xl border border-divider px-4 py-2.5 font-mono text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none uppercase"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                Email Address on Record *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. traveler@example.com"
                className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-small font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Checking..." : "Verify & Track"}
                <Search className="size-4" />
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-caption font-medium text-rose-800">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Timeline Output */}
        {result && (
          <div className="mt-8 rounded-3xl border border-divider bg-white p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Top Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-6">
              <div>
                <span className="text-caption font-mono uppercase text-sky font-bold">
                  {result.isReservation ? "Atelier Allocation Verified" : "Direct Order Dispatched"} · {result.carrier}
                </span>
                <h3 className="text-h3-m font-bold text-navy mt-1">
                  Reference: {result.orderReference}
                </h3>
                <span className="text-caption font-mono text-mid">
                  Courier Tracking: {result.trackingNumber}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-mid">Estimated Delivery</span>
                <p className="text-small font-bold text-emerald-600">{result.estimatedDelivery}</p>
              </div>
            </div>

            {/* Matched Reservation Detailed Breakdown */}
            {matchedReservation && (
              <div className="rounded-2xl bg-surface border border-divider p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-mid font-bold flex items-center gap-1.5">
                    <Package className="size-3.5 text-brand" /> Reserved Item Details
                  </span>
                  <p className="text-small font-bold text-navy">
                    {matchedReservation.product?.name || "AMTRAV Luggage"}
                  </p>
                  <p className="text-caption text-mid">
                    Size: {matchedReservation.product?.size} · Color: {matchedReservation.product?.color}
                  </p>
                  {matchedReservation.product?.tag_addon && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-white border border-divider px-3 py-1.5 text-caption text-navy">
                      <Tag className="size-3.5 text-brand" />
                      <span>
                        Tag: {matchedReservation.product.tag_addon.color} · {matchedReservation.product.tag_addon.foil}
                      </span>
                      <span className="font-bold font-mono">
                        [{matchedReservation.product.tag_addon.initials}]
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-mid font-bold flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-brand" /> Delivery Destination
                  </span>
                  <p className="text-small font-bold text-navy">
                    {matchedReservation.customer_name}
                  </p>
                  {matchedReservation.delivery_address && (
                    <p className="text-caption text-mid">
                      {matchedReservation.delivery_address.street}
                      {matchedReservation.delivery_address.apartment && `, ${matchedReservation.delivery_address.apartment}`}
                      <br />
                      {matchedReservation.delivery_address.city}, {matchedReservation.delivery_address.postal_code}
                      <br />
                      {matchedReservation.delivery_address.country}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Milestones Vertical Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-divider">
              {result.milestones.map((m) => (
                <div key={m.step} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 flex size-5 items-center justify-center rounded-full text-white ring-4 ring-white ${
                      m.completed ? "bg-emerald-600" : "bg-mid/40"
                    }`}
                  >
                    {m.completed && <CheckCircle className="size-3.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-small font-bold text-navy">{m.step}</h4>
                      <span className="text-caption font-mono text-mid">{m.date}</span>
                    </div>
                    <p className="text-caption text-mid">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assistance link */}
            <div className="border-t border-divider pt-4 flex items-center justify-between text-caption text-mid">
              <span>Need help with delivery or rescheduling?</span>
              <Link href="/services/repairs" className="font-semibold text-brand hover:text-navy">
                Contact Client Concierge →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}