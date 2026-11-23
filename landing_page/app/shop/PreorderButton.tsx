"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { addToCart } from "@/lib/shop";
import CartDrawer from "../_components/CartDrawer";

const SKU_MAP: Record<string, string> = {
  "Cabin 55": "cabin-55",
  "Check-in 68": "checkin-68",
  "Check-in 76": "checkin-76",
  "The Pair": "the-pair",
};

export default function PreorderButton({ product }: { product: string }) {
  const [added, setAdded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sku = SKU_MAP[product] || "cabin-55";

  const handleAdd = () => {
    addToCart(sku, 1);
    setAdded(true);
    setDrawerOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2 text-caption font-semibold text-white transition-all hover:bg-navy-deep active:scale-95"
          aria-label={`Pre-order ${product}`}
        >
          {added ? (
            <>
              <Check className="size-3.5 text-sky" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-3.5 text-sky" />
              <span>Pre-order →</span>
            </>
          )}
        </button>
      </div>

      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
