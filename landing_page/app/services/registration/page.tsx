"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, QrCode, ArrowRight, Check, AlertCircle, Download } from "lucide-react";

export default function RegistrationPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [purchaseChannel, setPurchaseChannel] = useState("AMTRAV Online Boutique");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    registrationId: string;
    serialNumber: string;
    registeredAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/services/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialNumber,
          ownerName,
          ownerEmail,
          purchaseChannel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register luggage.");
      }
      setSuccessData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface/30 pt-6 sm:pt-8 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-caption text-mid">
          <Link href="/" className="hover:text-navy">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-navy">Services</Link>
          <span>/</span>
          <span className="font-semibold text-navy">Luggage Registration</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider pb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3.5 py-1 text-caption font-bold uppercase tracking-wider text-navy border border-navy/10 mb-3">
            <ShieldCheck className="size-4 text-emerald-600" /> Lifetime Guarantee Activation
          </div>
          <h1 className="text-display-m font-bold text-navy md:text-h1">
            Register Your AMTRAV Luggage
          </h1>
          <p className="mt-2 text-small text-mid max-w-2xl">
            Activate your Lifetime Functional Guarantee, associate your TRACE Smart Core digital passport, and ensure fast-track assistance at 100+ global repair centers.
          </p>
        </div>

        {successData ? (
          /* Success Certificate Card */
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="size-8" />
            </div>

            <div className="space-y-2">
              <span className="text-caption font-mono uppercase text-emerald-700 font-bold">
                Lifetime Guarantee Activated
              </span>
              <h2 className="text-h2-m font-bold text-navy">Registration Successful</h2>
              <p className="text-small text-mid max-w-md mx-auto">
                Your suitcase is now permanently certified under registration ID <strong className="font-mono text-navy">{successData.registrationId}</strong>.
              </p>
            </div>

            {/* Passport Card Visual */}
            <div className="mx-auto max-w-md rounded-2xl bg-navy p-6 text-white text-left shadow-lg border border-line space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-caption font-mono tracking-widest text-sky">AMTRAV DIGITAL PASSPORT</span>
                <QrCode className="size-5 text-white/70" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-blue-pale uppercase font-semibold">Serial Number</span>
                <p className="font-mono text-lg font-bold tracking-wider text-white">{successData.serialNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-caption pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-blue-pale">Registered Owner</span>
                  <p className="font-semibold text-white">{ownerName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-blue-pale">Warranty Status</span>
                  <p className="font-semibold text-emerald-400">Lifetime Active</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-full border border-divider px-5 py-2.5 text-small font-semibold text-navy hover:bg-surface"
              >
                <Download className="size-4" /> Download Certificate (PDF)
              </button>
              <Link
                href="/shop"
                className="rounded-full bg-navy px-6 py-2.5 text-small font-semibold text-white hover:bg-navy-deep"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
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
                  10-Digit Frame Serial Number *
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AMT-9255-3004"
                  className="w-full rounded-xl border border-divider px-4 py-2.5 font-mono text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none uppercase"
                />
                <span className="mt-1 block text-[11px] text-mid">
                  Laser-engraved on the exterior aluminium hinge or inside the TRACE Smart Core pocket.
                </span>
              </div>

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Henrik Ibsen"
                  className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="e.g. henrik@example.com"
                  className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy placeholder:text-mid focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy mb-1.5">
                  Purchased From
                </label>
                <select
                  value={purchaseChannel}
                  onChange={(e) => setPurchaseChannel(e.target.value)}
                  className="w-full rounded-xl border border-divider px-4 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                >
                  <option value="AMTRAV Online Boutique">AMTRAV Online Boutique</option>
                  <option value="AMTRAV Oslo Flagship Store">AMTRAV Oslo Flagship Store</option>
                  <option value="AMTRAV London Mayfair Boutique">AMTRAV London Mayfair Boutique</option>
                  <option value="Authorized Luxury Department Store">Authorized Luxury Department Store</option>
                  <option value="Gift / Transfer of Ownership">Gift / Transfer of Ownership</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-small font-semibold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Activating Guarantee..." : "Activate Lifetime Guarantee"}
                <ArrowRight className="size-4" />
              </button>
            </form>

            {/* Right Information Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-divider bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5 font-semibold text-small text-navy">
                  <ShieldCheck className="size-5 text-sky" />
                  <span>What Does the Lifetime Guarantee Cover?</span>
                </div>
                <p className="text-caption text-mid leading-relaxed">
                  Our guarantee covers all functional damage to the suitcase during travel: cracked shells, damaged wheels, broken handles, and TSA locks. Cosmetic wear (scratches, dents) is considered part of your luggage&apos;s travel patina.
                </p>
              </div>

              <div className="rounded-2xl border border-divider bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5 font-semibold text-small text-navy">
                  <QrCode className="size-5 text-sky" />
                  <span>Where to find your Serial Number</span>
                </div>
                <p className="text-caption text-mid leading-relaxed">
                  Every authentic AMTRAV case has a unique 10-digit number laser-engraved onto the outer rim of the case next to the central latch, and inside the companion app under TRACE settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}