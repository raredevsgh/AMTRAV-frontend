"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useCart, resolveProduct } from "@/lib/shop";
import { useRegion } from "@/lib/region";
import { useI18n } from "@/lib/i18n/context";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { formatPrice, currency } = useRegion();
  const { cart, totalItems, subtotalMinor, addToCart, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `order-${Date.now()}`,
        },
        body: JSON.stringify({
          items: cart,
          currency: currency.code,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderConfirmation({
          id: data.order_id || "AMR-" + Math.floor(100000 + Math.random() * 900000),
          message: data.message || "Your pre-order has been secured!",
        });
        clearCart();
      } else {
        alert(data.error || "Unable to proceed to checkout.");
      }
    } catch {
      alert("Network error connecting to checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const entries: [string, number][] = Object.entries(cart).filter(([, qty]) => qty > 0);

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-brand" />
            <h2 className="text-h4 font-bold text-navy">{t("shop.cart", "Your Pre-Order")}</h2>
            <span className="rounded-full bg-blue-pale px-2.5 py-0.5 text-caption font-semibold text-brand">
              {totalItems}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-full bg-blue-pale/80 hover:bg-blue-pale px-2.5 py-1 text-[11px] font-bold text-brand transition-colors uppercase tracking-wider font-mono"
              title="Browse Full Shop Collection"
            >
              <span>Shop</span>
              <ArrowUpRight className="size-3" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-mid hover:bg-surface hover:text-navy"
              aria-label={t("shop.close", "Close cart")}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderConfirmation ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="text-h3 font-bold text-navy">Reservation Confirmed!</h3>
              <p className="text-body-m text-mid">{orderConfirmation.message}</p>
              <div className="rounded-2xl border border-line bg-surface p-4 font-mono text-caption text-navy">
                Reference ID: <span className="font-bold text-brand">{orderConfirmation.id}</span>
              </div>
              <p className="max-w-xs text-[13px] text-mid">
                We have reserved your bag from the initial production run. You will receive updates as shipping dates approach.
              </p>
              <Link
                href="/shop"
                onClick={() => {
                  setOrderConfirmation(null);
                  onClose();
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-2.5 text-caption font-semibold text-white hover:bg-navy-deep"
              >
                {t("shop.keepShopping", "Continue Browsing")}
              </Link>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3.5 py-16 text-center text-mid">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-surface border border-line shadow-xs">
                <ShoppingBag className="size-8 text-brand" />
              </div>
              <p className="text-body font-bold text-navy">{t("shop.cartEmpty", "Your pre-order cart is empty")}</p>
              <p className="max-w-xs text-caption text-mid">
                {t("shop.browse", "Explore our smart luggage range, configure sizes and colors, or reserve your serialized case.")}
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-caption font-bold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all"
              >
                <span>{t("shop.exploreCollection", "Explore Shop Collection")}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {entries.map(([sku, qty]) => {
                const item = resolveProduct(sku);
                return (
                  <div key={sku} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-white p-1.5">
                      <Image
                        src={item.image.startsWith("/images/") && !item.image.includes("?") ? `${item.image}?v=20261125b` : item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-caption font-bold text-navy truncate">{item.name}</h4>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-full bg-navy/5 border border-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
                              {item.selectedSize}
                            </span>
                            {item.selectedMaterial && (
                              <span className="rounded-full bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand">
                                {item.selectedMaterial}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-[11px] text-mid">
                              <span
                                className="size-2.5 rounded-full border border-black/20 shrink-0 shadow-xs"
                                style={{ backgroundColor: item.selectedColorHex }}
                              />
                              <span className="truncate max-w-[110px]">{item.selectedColorName}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(sku)}
                          className="p-1 text-mid/60 hover:text-danger transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5 rounded-lg border border-line px-2 py-0.5 bg-surface/50">
                          <button
                            type="button"
                            onClick={() => addToCart(sku, -1)}
                            className="text-caption font-bold text-mid hover:text-navy px-1"
                          >
                            -
                          </button>
                          <span className="text-caption font-bold text-navy">{qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(sku, 1)}
                            className="text-caption font-bold text-mid hover:text-navy px-1"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-caption font-bold text-navy">
                          {formatPrice(item.price_minor * qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!orderConfirmation && entries.length > 0 && (
          <div className="border-t border-line bg-surface/50 p-6">
            <div className="mb-4 flex items-center justify-between text-caption text-navy">
              <span className="text-mid">{t("shop.subtotal", "Subtotal")}</span>
              <span className="text-h4 font-bold">{formatPrice(subtotalMinor)}</span>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-pale/60 p-2.5 text-[12px] text-brand">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Complimentary worldwide priority delivery & Lifetime Functional Guarantee (Free Repairs Anytime) included.</span>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-caption font-bold text-white transition-colors hover:bg-navy-deep disabled:opacity-50"
            >
              <span>{isSubmitting ? "Securing Reservation..." : t("shop.checkout", "Check out")}</span>
              <ArrowRight className="size-4" />
            </button>
            <Link
              href="/shop"
              onClick={onClose}
              className="mt-2.5 block text-center text-[12px] font-semibold text-mid hover:text-navy transition-colors"
            >
              ← {t("shop.continueShopping", "Continue Shopping in Store")}
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
