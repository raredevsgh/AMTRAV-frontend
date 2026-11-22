"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, Search, CheckCircle, AlertCircle } from "lucide-react";

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
  milestones: Milestone[];
}

export default function TrackingPage() {
  const [orderReference, setOrderReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/services/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderReference, email }),
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

  return (
    <div className="min-h-screen bg-surface/30 dark:bg-transparent pt-6 sm:pt-8 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-caption text-mid dark:text-blue-pale/70">
          <Link href="/" className="hover:text-navy dark:hover:text-white">Home</Link>
          <span className="text-light-white dark:text-white/30">/</span>
          <Link href="/services" className="hover:text-navy dark:hover:text-white">Services</Link>
          <span className="text-light-white dark:text-white/30">/</span>
          <span className="font-semibold text-navy dark:text-white">Order Tracking</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider dark:border-white/15 pb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 dark:bg-white/10 px-3.5 py-1 text-caption font-bold uppercase tracking-wider text-navy dark:text-white border border-navy/10 dark:border-white/20 mb-3 backdrop-blur-sm">
            <Package className="size-4 text-sky" /> Global Courier Tracker
          </div>
          <h1 className="text-display-m font-bold text-navy dark:text-white md:text-h1">
            Track Your Order & Delivery
          </h1>
          <p className="mt-2 text-small text-mid dark:text-blue-pale/80 max-w-2xl">
            Check the real-time shipping progress, customs clearance, and courier delivery of your AMTRAV luggage order.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="mt-8 rounded-3xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-6 sm:p-8 shadow-card">
          <form onSubmit={handleTrack} className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end">
            <div className="sm:col-span-5">
              <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy dark:text-white mb-1.5">
                Order Reference Number *
              </label>
              <input
                type="text"
                required
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value.toUpperCase())}
                placeholder="e.g. AMT-84920"
                className="w-full rounded-xl border border-divider dark:border-white/20 bg-white dark:bg-[#0c1e45] px-4 py-2.5 font-mono text-small text-navy dark:text-white placeholder:text-mid dark:placeholder:text-white/40 focus:border-navy dark:focus:border-sky focus:outline-none uppercase"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-caption-m font-semibold uppercase tracking-wider text-navy dark:text-white mb-1.5">
                Email on Order *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. traveler@example.com"
                className="w-full rounded-xl border border-divider dark:border-white/20 bg-white dark:bg-[#0c1e45] px-4 py-2.5 text-small text-navy dark:text-white placeholder:text-mid dark:placeholder:text-white/40 focus:border-navy dark:focus:border-sky focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy dark:bg-sky py-2.5 text-small font-semibold text-white dark:text-navy shadow-xs hover:bg-navy-deep dark:hover:bg-white active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Tracking..." : "Track"}
                <Search className="size-4" />
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 p-3.5 text-caption font-medium text-rose-800 dark:text-rose-300">
              <AlertCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Timeline Output */}
        {result && (
          <div className="mt-8 rounded-3xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Top Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider dark:border-white/15 pb-6">
              <div>
                <span className="text-caption font-mono uppercase text-sky font-bold">
                  Carrier: {result.carrier}
                </span>
                <h3 className="text-h3-m font-bold text-navy dark:text-white mt-1">
                  Tracking Code: {result.trackingNumber}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-mid dark:text-blue-pale/70">Estimated Delivery</span>
                <p className="text-small font-bold text-emerald-600 dark:text-emerald-400">{result.estimatedDelivery}</p>
              </div>
            </div>

            {/* Milestones Vertical Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-divider dark:before:bg-white/15">
              {result.milestones.map((m) => (
                <div key={m.step} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 flex size-5 items-center justify-center rounded-full text-white ring-4 ring-white dark:ring-[#071739] ${
                      m.completed ? "bg-emerald-600" : "bg-mid/40"
                    }`}
                  >
                    {m.completed && <CheckCircle className="size-3.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-small font-bold text-navy dark:text-white">{m.step}</h4>
                      <span className="text-caption font-mono text-mid dark:text-blue-pale/70">{m.date}</span>
                    </div>
                    <p className="text-caption text-mid dark:text-blue-pale/80">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assistance link */}
            <div className="border-t border-divider dark:border-white/15 pt-4 flex items-center justify-between text-caption text-mid dark:text-blue-pale/80">
              <span>Need help with delivery or rescheduling?</span>
              <Link href="/services/repairs" className="font-semibold text-brand dark:text-sky hover:text-navy dark:hover:text-white">
                Contact Client Concierge →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}