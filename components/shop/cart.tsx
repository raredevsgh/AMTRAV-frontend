"use client";
// The cart: a button in the site header (once there's something in it, and on every shop page)
// that opens a panel from the side with each bag, its quantity and what it all comes to, then
// on to checkout. Adding a bag on its page opens it too (openCart).
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { format } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { bagLines, MAX_QUANTITY, money, useBag, useProducts, type ShopProduct } from "@/lib/shop";
import { MenuContainer } from "@/components/marketing/header-menus";
import "@/app/cart.css";

const OPEN_EVENT = "amortrav:open-cart";

/** Opens the cart panel, wherever its button is. */
export function openCart() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** A bag's photo on its stage, small, for lists. */
export function Thumb({ product }: { product: ShopProduct }) {
  return (
    <span className="cart-thumb">
      {product.image ? (
        <Image
          src={product.image}
          alt=""
          fill
          sizes="72px"
          unoptimized={product.image.startsWith("/api/")}
        />
      ) : null}
    </span>
  );
}

/** − quantity +, within the order limit and what's in stock. */
export function Stepper({
  product,
  quantity,
  onChange,
}: {
  product: ShopProduct;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const { m } = useI18n();
  const most = Math.min(MAX_QUANTITY, Math.max(product.available, quantity));
  return (
    <div className="cart-stepper" role="group" aria-label={format(m.shop.quantity, { name: product.name })}>
      <button
        type="button"
        aria-label={format(m.shop.fewer, { name: product.name })}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        type="button"
        aria-label={format(m.shop.more, { name: product.name })}
        disabled={quantity >= most}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CartButton() {
  const { href } = useI18n();
  const pathname = usePathname();
  const { count } = useBag();
  const inShop = pathname?.startsWith(href("/shop")) ?? false;
  // Nothing to show, or to load, until there's a cart or the visitor is in the shop.
  return count || inShop ? <Cart /> : null;
}

function Cart() {
  const { m, tag, href } = useI18n();
  const container = useContext(MenuContainer);
  const { bag, count, set } = useBag();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const { lines, currencies, total, currency } = bagLines(bag, products);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  // Bags that are no longer on sale leave the cart once the shop has loaded.
  useEffect(() => {
    if (!products) return;
    for (const sku of Object.keys(bag)) {
      if (!products.some((product) => product.sku === sku)) set(sku, 0);
    }
  }, [bag, products, set]);

  const mixed = currencies.length > 1;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="cart-button" aria-label={format(m.shop.cartLabel, { count })}>
        <ShoppingBag size={18} aria-hidden="true" />
        {count ? <span className="cart-count">{count}</span> : null}
      </Dialog.Trigger>
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay className="cart-overlay" />
        <Dialog.Content className="cart-panel" aria-describedby={undefined}>
          <header className="cart-head">
            <Dialog.Title>
              {m.shop.cart}
              {count ? <span>{count}</span> : null}
            </Dialog.Title>
            <Dialog.Close className="cart-close" aria-label={m.shop.close}>
              <X size={18} />
            </Dialog.Close>
          </header>

          {lines.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={28} aria-hidden="true" />
              <p>{m.shop.cartEmpty}</p>
              <Link className="trace-button ghost-ink small" href={href("/shop")} onClick={() => setOpen(false)}>
                {m.shop.browse}
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-lines">
                {lines.map(({ product, quantity }) => (
                  <li key={product.sku}>
                    <Link href={href(`/shop/${product.sku}`)} onClick={() => setOpen(false)} tabIndex={-1}>
                      <Thumb product={product} />
                    </Link>
                    <div className="cart-line-main">
                      <Link href={href(`/shop/${product.sku}`)} onClick={() => setOpen(false)}>
                        {brand.company} {product.name}
                      </Link>
                      <small>{money(product.price_minor, product.currency, tag)}</small>
                      <div className="cart-line-actions">
                        <Stepper product={product} quantity={quantity} onChange={(next) => set(product.sku, next)} />
                        <button
                          type="button"
                          className="cart-remove"
                          aria-label={format(m.shop.remove, { name: product.name })}
                          onClick={() => set(product.sku, 0)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <strong>{money(product.price_minor * quantity, product.currency, tag)}</strong>
                  </li>
                ))}
              </ul>
              <footer className="cart-foot">
                {mixed ? (
                  <p className="cart-warning" role="alert">
                    {m.shop.mixed}
                  </p>
                ) : (
                  <p className="cart-total">
                    <span>{m.shop.subtotal}</span>
                    <strong>{money(total, currency, tag)}</strong>
                  </p>
                )}
                <small>{m.shop.held}</small>
                {mixed ? (
                  <button type="button" className="trace-button ink" disabled>
                    {m.shop.checkout}
                  </button>
                ) : (
                  <Link className="trace-button ink" href={href("/shop/checkout")} onClick={() => setOpen(false)}>
                    {m.shop.checkout}
                  </Link>
                )}
                <Dialog.Close className="cart-continue">{m.shop.keepShopping}</Dialog.Close>
              </footer>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
