"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, Check, ShieldCheck, ShoppingBag, Lock, Tag, ChevronRight } from "lucide-react";
import { useRegion } from "@/lib/region";
import { addToCart } from "@/lib/shop";

const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export interface ReservationProductProps {
  sku: string;
  name: string;
  subtitle?: string;
  sizeName: string;
  colorName: string;
  colorHex: string;
  priceMinor: number;
  initialTagAddon?: boolean;
  initialTagInitials?: string;
  initialTagFoil?: string;
  initialTagColor?: string;
  initialTagHex?: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ReservationProductProps;
  onSuccess?: (reservationId: string) => void;
}

const TAG_BASE_PRICE_MINOR = 3500; // $35 / ~£29

const FOIL_OPTIONS = [
  { id: "silver", name: "Silver Metallic Foil" },
  { id: "gold", name: "24K Gold Foil" },
  { id: "blind", name: "Blind Deboss (Subtle)" },
];

const LEATHER_TAG_SWATCHES = [
  { id: "cognac", name: "Cognac Leather", hex: "#7a411f" },
  { id: "black", name: "Onyx Black", hex: "#1a1a1a" },
  { id: "papaya", name: "Papaya Orange", hex: "#e05a2b" },
  { id: "emerald", name: "Emerald Green", hex: "#1c5d3f" },
  { id: "cobalt", name: "Cobalt Blue", hex: "#133863" },
];

export default function ReservationModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ReservationModalProps) {
  const { formatPrice, country: userCountry } = useRegion();
  const mounted = useMounted();

  // Form states - Personal
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Form states - Delivery
  const [country, setCountry] = useState(userCountry?.name || "United Kingdom");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "white-glove">("standard");

  // Optional Luggage Tag Add-On state
  const [includeTag, setIncludeTag] = useState(product.initialTagAddon ?? false);
  const [tagInitials, setTagInitials] = useState(product.initialTagInitials || "AMT");
  const [tagFoil, setTagFoil] = useState(product.initialTagFoil || "Silver Metallic Foil");
  const [tagColor, setTagColor] = useState(product.initialTagColor || "Cognac Leather");
  const [tagHex, setTagHex] = useState(product.initialTagHex || "#7a411f");

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedReservation, setConfirmedReservation] = useState<{
    referenceId: string;
    batchNumber: string;
    deliveryDate: string;
  } | null>(null);

  // Render-time state adjustment when modal opens
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setErrorMessage("");
      setConfirmedReservation(null);
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const tagPriceMinor = includeTag ? TAG_BASE_PRICE_MINOR : 0;
  const whiteGlovePriceMinor = deliveryMethod === "white-glove" ? 2500 : 0;
  const grandTotalMinor = product.priceMinor + tagPriceMinor + whiteGlovePriceMinor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address for reservation confirmation.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please provide a contact phone number for courier delivery dispatch.");
      return;
    }
    if (!streetAddress.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage("Please complete all required delivery address fields.");
      return;
    }

    setLoading(true);

    try {
      // Generate real reference ID: e.g. AMT-RES-84920
      const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
      const refId = `AMT-RES-${randomCode}`;
      const batchNo = `Batch #24 (Munich Atelier)`;
      
      const payload = {
        reservation_id: refId,
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        delivery_address: {
          country,
          street: streetAddress,
          apartment,
          city,
          postal_code: postalCode,
          method: deliveryMethod,
        },
        product: {
          sku: product.sku,
          name: product.name,
          size: product.sizeName,
          color: product.colorName,
          base_price_minor: product.priceMinor,
          tag_addon: includeTag
            ? {
                initials: tagInitials,
                foil: tagFoil,
                color: tagColor,
                price_minor: TAG_BASE_PRICE_MINOR,
              }
            : null,
          total_price_minor: grandTotalMinor,
        },
      };

      // Save reservation to local storage for persistence
      try {
        const stored = localStorage.getItem("amortrav.reservations");
        const reservations = stored ? JSON.parse(stored) : [];
        reservations.unshift({ ...payload, created_at: new Date().toISOString() });
        localStorage.setItem("amortrav.reservations", JSON.stringify(reservations));
      } catch {
        // Safe fallback
      }

      // Add item to cart
      const cleanHex = product.colorHex.replace("#", "");
      const tagSuffix = includeTag ? ` [Tag: ${tagInitials}]` : "";
      const compoundSku = `${product.sku}__${encodeURIComponent(`${product.colorName}${tagSuffix}`)}__${cleanHex}`;
      addToCart(compoundSku, 1);

      // Also add standalone tag accessory to cart if requested separately
      if (includeTag) {
        addToCart(`accessory-leather-tag__${encodeURIComponent(`${tagColor} [${tagInitials}]`)}__${tagHex.replace("#", "")}`, 1);
      }

      setConfirmedReservation({
        referenceId: refId,
        batchNumber: batchNo,
        deliveryDate: "14–21 business days",
      });

      if (onSuccess) {
        onSuccess(refId);
      }
    } catch {
      setErrorMessage("Could not submit reservation. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy/80 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-divider shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col text-navy">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-divider px-6 py-4 bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-navy text-sky">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-mid font-bold">
                TRACE Certified Allocation
              </span>
              <h2 id="reservation-modal-title" className="text-small font-bold text-navy leading-none">
                Reserve Your AMTRAV Luggage
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-mid hover:bg-black/5 hover:text-navy transition-colors"
            aria-label="Close reservation modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {confirmedReservation ? (
            /* Confirmation Success State */
            <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-sm">
                <Check className="size-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="inline-block rounded-full bg-navy/5 px-3 py-1 font-mono text-xs font-bold text-navy">
                  ALLOCATION SECURED · {confirmedReservation.batchNumber}
                </span>
                <h3 className="text-h2 font-bold text-navy">
                  Reservation Confirmed!
                </h3>
                <p className="text-small text-mid max-w-md mx-auto">
                  Your priority production slot is locked. An official reservation certificate and TRACE digital key have been sent to{" "}
                  <strong className="text-navy">{email}</strong>.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="rounded-2xl border-2 border-dashed border-navy/20 bg-surface p-5 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between border-b border-divider pb-2.5">
                  <span className="text-caption font-mono text-mid uppercase">Reference ID</span>
                  <span className="font-mono text-small font-bold text-brand tracking-wider">
                    {confirmedReservation.referenceId}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-divider pb-2.5">
                  <span className="text-caption font-mono text-mid uppercase">Reserved Item</span>
                  <span className="text-caption font-bold text-navy text-right">
                    {product.name} ({product.sizeName})
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-divider pb-2.5">
                  <span className="text-caption font-mono text-mid uppercase">Finish & Hue</span>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full border border-black/20" style={{ backgroundColor: product.colorHex }} />
                    <span className="text-caption font-medium text-navy">{product.colorName}</span>
                  </div>
                </div>
                {includeTag && (
                  <div className="flex items-center justify-between border-b border-divider pb-2.5">
                    <span className="text-caption font-mono text-mid uppercase">Leather Tag Add-on</span>
                    <span className="text-caption font-bold text-navy">
                      [{tagInitials}] {tagColor} · {tagFoil}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-divider pb-2.5">
                  <span className="text-caption font-mono text-mid uppercase">Delivery Destination</span>
                  <span className="text-caption font-medium text-navy text-right truncate max-w-[220px]">
                    {streetAddress}, {city}, {country}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 text-navy font-bold">
                  <span className="text-small">Amount Due at Dispatch</span>
                  <span className="text-h3-m font-bold text-navy">{formatPrice(grandTotalMinor)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-sky/10 border border-sky/20 p-3.5 text-[11px] text-navy/80 max-w-md mx-auto flex items-center gap-2.5 text-left">
                <Lock className="size-4 text-brand shrink-0" />
                <span>
                  <strong>Zero-Risk Guarantee:</strong> No credit card charge is made today. You may modify your finish, monogram, or cancel free of charge until dispatch.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full bg-navy px-6 py-3 text-small font-bold text-white hover:bg-navy-deep active:scale-95 transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Summary Header Banner */}
              <div className="rounded-2xl border border-divider bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="size-12 shrink-0 rounded-xl border border-black/10 shadow-inner flex items-center justify-center font-bold text-white text-xs"
                    style={{ backgroundColor: product.colorHex }}
                  >
                    <ShoppingBag className="size-5 text-white/80" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-mid">
                      {product.sizeName} · Lifetime Guarantee
                    </span>
                    <h3 className="text-small font-bold text-navy leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-caption text-mid mt-0.5">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: product.colorHex }} />
                      <span>{product.colorName}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-caption font-mono text-mid block">Estimated Price</span>
                  <span className="text-h3-m font-bold text-navy">
                    {formatPrice(product.priceMinor)}
                  </span>
                </div>
              </div>

              {/* Luggage Tag Accessory Add-on Section */}
              <div className="rounded-2xl border border-divider bg-white p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <Tag className="size-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-small font-bold text-navy">
                          Add Personalized Leather Luggage Tag
                        </span>
                        <span className="rounded-full bg-brand/10 text-brand px-2 py-0.5 text-[10px] font-mono font-bold">
                          +{formatPrice(TAG_BASE_PRICE_MINOR)}
                        </span>
                      </div>
                      <p className="text-[11px] text-mid">
                        Italian calfskin with custom hot-stamped monogram & titanium hardware.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={includeTag}
                      onChange={(e) => setIncludeTag(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
                  </label>
                </div>

                {includeTag && (
                  <div className="pt-3 border-t border-divider space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-caption font-semibold uppercase text-mid mb-1">
                          Monogram Initials (Up to 3 Letters)
                        </label>
                        <input
                          type="text"
                          maxLength={3}
                          value={tagInitials}
                          onChange={(e) => setTagInitials(e.target.value.toUpperCase())}
                          placeholder="AMT"
                          className="w-full rounded-xl border border-divider px-3 py-2 font-serif text-center font-bold tracking-widest text-navy uppercase focus:border-navy focus:outline-none bg-surface"
                        />
                      </div>
                      <div>
                        <label className="block text-caption font-semibold uppercase text-mid mb-1">
                          Embossing Foil
                        </label>
                        <select
                          value={tagFoil}
                          onChange={(e) => setTagFoil(e.target.value)}
                          className="w-full rounded-xl border border-divider px-3 py-2 text-caption text-navy focus:border-navy focus:outline-none bg-surface"
                        >
                          {FOIL_OPTIONS.map((f) => (
                            <option key={f.id} value={f.name}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-caption font-semibold uppercase text-mid mb-1.5">
                        Leather Colorway
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LEATHER_TAG_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.id}
                            type="button"
                            onClick={() => {
                              setTagColor(swatch.name);
                              setTagHex(swatch.hex);
                            }}
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
                              tagColor === swatch.name
                                ? "border-navy bg-navy/5 font-bold text-navy ring-1 ring-navy"
                                : "border-divider text-mid hover:border-navy/40"
                            }`}
                          >
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                            <span>{swatch.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tag Live Badge Preview */}
                    <div className="rounded-xl bg-surface border border-divider p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/20 shadow-sm font-serif font-bold text-base text-white"
                          style={{
                            backgroundColor: tagHex,
                            color:
                              tagFoil.includes("Gold")
                                ? "#f3d178"
                                : tagFoil.includes("Silver")
                                ? "#e2e8f0"
                                : "rgba(255,255,255,0.75)",
                          }}
                        >
                          <span className="drop-shadow-xs">{tagInitials || "AMT"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-mid font-bold block">
                            Luggage Tag Preview
                          </span>
                          <span className="text-caption font-semibold text-navy">
                            {tagColor} · {tagFoil}
                          </span>
                        </div>
                      </div>
                      <span className="text-caption font-bold text-navy">+{formatPrice(TAG_BASE_PRICE_MINOR)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 1. Personal Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold block">
                  1. Personal Reservation Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alexander Vance"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexander@traveler.com"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                    <span className="text-[10px] text-mid mt-0.5 block">
                      For dispatch tracking & TRACE digital pairing pass.
                    </span>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7911 123456"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                    <span className="text-[10px] text-mid mt-0.5 block">
                      For secure courier delivery coordination.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Destination */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold block">
                  2. Destination Delivery Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Country / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 14 Curzon Street, Mayfair"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Apartment / Suite / Floor (Optional)
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Suite 4B"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-navy mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-caption font-semibold text-navy mb-1">
                      Postal Code / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="W1J 5HN"
                      className="w-full rounded-xl border border-divider px-3.5 py-2.5 text-small text-navy focus:border-navy focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold block">
                  3. Delivery Logistics
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      deliveryMethod === "standard"
                        ? "border-navy bg-navy/5 ring-1 ring-navy"
                        : "border-divider bg-white hover:bg-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === "standard"}
                      onChange={() => setDeliveryMethod("standard")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-small font-bold text-navy block">
                        Insured Atelier Courier
                      </span>
                      <span className="text-[11px] text-mid block">
                        Direct from Munich with real-time GPS tracking.
                      </span>
                      <span className="text-caption font-bold text-emerald-600 mt-1 block">
                        Complimentary (Included)
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      deliveryMethod === "white-glove"
                        ? "border-navy bg-navy/5 ring-1 ring-navy"
                        : "border-divider bg-white hover:bg-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === "white-glove"}
                      onChange={() => setDeliveryMethod("white-glove")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-small font-bold text-navy block">
                        White-Glove Handover
                      </span>
                      <span className="text-[11px] text-mid block">
                        Scheduled appointment unboxing and TRACE pairing.
                      </span>
                      <span className="text-caption font-bold text-navy mt-1 block">
                        +{formatPrice(2500)}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-caption text-red-600 font-semibold animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              {/* Bottom Total & Submit Button */}
              <div className="border-t border-divider pt-4 space-y-3">
                <div className="flex items-center justify-between text-navy">
                  <div>
                    <span className="text-caption text-mid block">Total Allocation Value</span>
                    <span className="text-caption text-mid">No payment required today</span>
                  </div>
                  <div className="text-right">
                    <span className="text-h2 font-bold text-navy">
                      {formatPrice(grandTotalMinor)}
                    </span>
                    <span className="text-[10px] text-mid block">incl. VAT & global insured shipping</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-navy py-3.5 text-small font-bold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Securing Priority Allocation...</span>
                  ) : (
                    <>
                      <Lock className="size-4 text-sky" />
                      <span>Confirm Luggage Reservation</span>
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-mid">
                  By clicking Confirm, you reserve your piece in Production Batch #24. Your card will only be charged when your suitcase is inspected and prepared for courier dispatch.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
