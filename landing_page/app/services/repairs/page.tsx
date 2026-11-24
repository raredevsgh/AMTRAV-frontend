"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, AlertCircle, Download, ArrowRight, MapPin } from "lucide-react";

export default function RepairsPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [damageCategory, setDamageCategory] = useState("Wheels");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [dropoffType, setDropoffType] = useState<"COURIER_PICKUP" | "STORE_DROPOFF">("COURIER_PICKUP");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<{
    claimId: string;
    message: string;
    estimatedTurnaround: string;
    prepaidLabelUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/services/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialNumber,
          damageCategory,
          description,
          customerName,
          customerEmail,
          dropoffType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit repair claim.");
      }
      setClaimResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
          <span className="font-semibold text-navy">Repair Request Portal</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider pb-8 text-center sm:text-left">
          <h1 className="text-display-m font-bold text-navy md:text-h1">
            Request an Official Repair
          </h1>
          <p className="mt-2 text-small text-mid max-w-2xl">
            Under the AMTRAV Lifetime Functional Guarantee, all damages to wheels, handles, locks, and cracked shells are serviced by our certified craft technicians free of charge.
          </p>
        </div>

        {claimResult ? (
          /* Claim Confirmed Card */
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="size-8" />
            </div>

            <div className="space-y-2">
              <span className="text-caption font-mono uppercase text-emerald-700 font-bold">
                Repair Claim Approved
              </span>
              <h2 className="text-h2-m font-bold text-navy">Claim Reference: {claimResult.claimId}</h2>
              <p className="text-small text-mid max-w-md mx-auto">
                {claimResult.message}
              </p>
            </div>

            <div className="mx-auto max-w-md rounded-2xl bg-surface border border-divider p-5 text-left text-small space-y-2">
              <div className="flex justify-between">
                <span className="text-mid">Expected Turnaround:</span>
                <span className="font-bold text-navy">{claimResult.estimatedTurnaround}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid">Return Shipping:</span>
                <span className="font-bold text-emerald-600">Free Insured Courier</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-full border border-divider px-5 py-2.5 text-small font-semibold text-navy hover:bg-surface"
              >
                <Download className="size-4" /> Download Shipping Label (PDF)
              </button>
              <Link
                href="/services/tracking"
                className="rounded-full bg-navy px-6 py-2.5 text-small font-semibold text-white hover:bg-navy-deep"
              >
                Track Repair Status
              </Link>
            </div>
          </div>
        ) : (
          /* Claim Form */
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <form onSubmit={handleSubmit} className="lg:col-span-7 rounded-3xl border border-divider bg-white p-6 sm:p-8 shadow-card space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-caption font-medium text-rose-800">
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                  10-Digit Serial Number *
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AMT-9255-3004"
                  className="w-full rounded-xl border border-divider px-4 py-2.5 font-mono text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                  Affected Component *
                </label>
                <select
                  value={damageCategory}
                  onChange={(e) => setDamageCategory(e.target.value)}
                  className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                >
                  <option value="Wheels">Multiwheel® System (Worn, stuck, or cracked wheel)</option>
                  <option value="Handle">Telescopic Handle or Carrying Grip</option>
                  <option value="Lock">TSA Combination Latch / Dial Mechanism</option>
                  <option value="Shell">Aluminium or Polycarbonate Shell Dents / Cracks</option>
                  <option value="Zipper">Zippers & Flex Divider Compression Straps</option>
                </select>
              </div>

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                  Description of Damage
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe how the damage occurred (e.g. airport handling impact, baggage belt collision)..."
                  className="w-full rounded-xl border border-divider p-3 text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Henrik Ibsen"
                    className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="henrik@example.com"
                    className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-2">
                  Service Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDropoffType("COURIER_PICKUP")}
                    className={`rounded-xl border p-3 text-left text-small transition-all ${
                      dropoffType === "COURIER_PICKUP"
                        ? "border-navy bg-navy/5 font-semibold text-navy ring-1 ring-navy"
                        : "border-divider bg-white text-navy hover:bg-surface"
                    }`}
                  >
                    <div className="font-semibold">Courier Pick-Up</div>
                    <div className="text-[11px] text-mid">Prepaid label emailed to you</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDropoffType("STORE_DROPOFF")}
                    className={`rounded-xl border p-3 text-left text-small transition-all ${
                      dropoffType === "STORE_DROPOFF"
                        ? "border-navy bg-navy/5 font-semibold text-navy ring-1 ring-navy"
                        : "border-divider bg-white text-navy hover:bg-surface"
                    }`}
                  >
                    <div className="font-semibold">Boutique Drop-Off</div>
                    <div className="text-[11px] text-mid">In-store quick repair service</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-small font-semibold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting Claim..." : "Submit Free Repair Request"}
                <ArrowRight className="size-4" />
              </button>
            </form>

            {/* Global Repair Hubs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-divider bg-white p-5 shadow-xs space-y-3">
                <span className="flex items-center gap-2 font-semibold text-small text-navy">
                  <MapPin className="size-4 text-sky" /> Global Certified Service Hubs
                </span>
                <ul className="text-caption text-mid space-y-2 divide-y divide-divider/60">
                  <li className="pt-1.5 flex justify-between">
                    <span className="font-semibold text-navy">Oslo Flagship Atelier</span>
                    <span>Karl Johans gate 22</span>
                  </li>
                  <li className="pt-1.5 flex justify-between">
                    <span className="font-semibold text-navy">London Mayfair</span>
                    <span>15 Old Bond Street</span>
                  </li>
                  <li className="pt-1.5 flex justify-between">
                    <span className="font-semibold text-navy">Paris Saint-Honoré</span>
                    <span>73 Rue du Faubourg</span>
                  </li>
                  <li className="pt-1.5 flex justify-between">
                    <span className="font-semibold text-navy">New York Madison Ave</span>
                    <span>535 Madison Avenue</span>
                  </li>
                  <li className="pt-1.5 flex justify-between">
                    <span className="font-semibold text-navy">Tokyo Ginza</span>
                    <span>6-10-1 Ginza, Chuo-ku</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}