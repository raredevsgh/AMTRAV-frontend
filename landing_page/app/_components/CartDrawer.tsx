"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useCart, resolveProduct, formatPrice } from "@/lib/shop";
import { useI18n } from "@/lib/i18n/context";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
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
          currency: "USD",
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
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-mid hover:bg-surface hover:text-navy"
            aria-label={t("shop.close", "Close cart")}
          >
            <X className="size-5" />
          </button>
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
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmation(null);
                  onClose();
                }}
                className="mt-4 rounded-xl bg-navy px-6 py-2.5 text-caption font-semibold text-white hover:bg-navy-deep"
              >
                {t("shop.keepShopping", "Continue Browsing")}
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-mid">
              <ShoppingBag className="size-12 text-mid/40" />
              <p className="text-body font-medium text-navy">{t("shop.cartEmpty", "Your cart is empty")}</p>
              <p className="max-w-xs text-caption">{t("shop.browse", "Explore our smart luggage range and pick your size with built-in TRACE.")}</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {entries.map(([sku, qty]) => {
                const item = resolveProduct(sku);
                return (
                  <div key={sku} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-caption font-bold text-navy">{item.name}</h4>
                            <span className="rounded-full bg-navy/5 border border-navy/10 px-2 py-0.2 text-[10px] font-semibold text-navy">
                              {item.selectedSize}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-mid">
                            <span
                              className="size-3 rounded-full border border-black/20 shrink-0 shadow-xs"
                              style={{ backgroundColor: item.selectedColorHex }}
                            />
                            <span>{item.selectedColorName}</span>
                          </div>
                          <span className="block mt-1 text-[12px] font-semibold text-navy">{formatPrice(item.price_minor)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(sku)}
                          className="text-mid/60 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg border border-line px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => addToCart(sku, -1)}
                            className="text-caption font-bold text-mid hover:text-navy"
                          >
                            -
                          </button>
                          <span className="text-caption font-semibold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(sku, 1)}
                            className="text-caption font-bold text-mid hover:text-navy"
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
              <span>Complimentary worldwide priority delivery & 5-year warranty included.</span>
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
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
