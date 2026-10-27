"use client";

import { useId, useState } from "react";
import Button, { buttonClass } from "../_components/Button";

// The approved design includes pre-order actions; purchasing remains unavailable.
export default function PreorderButton({ product }: { product: string }) {
  const [requested, setRequested] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        className={buttonClass("navy", "xs")}
        aria-label={`Pre-order ${product}`}
        aria-expanded={requested}
        aria-controls={id}
        onClick={() => setRequested(!requested)}
      >
        Pre-order <span aria-hidden="true">→</span>
      </button>
      <div
        id={id}
        hidden={!requested}
        className="mt-3 max-w-[280px] rounded-xl bg-blue-pale p-3 text-caption-m text-navy"
      >
        {requested && (
          <>
            <p role="status">
              Pre-orders for {product} aren’t open yet. No order has been
              placed.
            </p>
            <div className="mt-3">
              <Button href="#signup" label="Join the list" size="xs" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
