import type { Metadata } from "next";
import Image from "next/image";
import Button from "../_components/Button";
import ProductVideo from "../_components/ProductVideo";
import PreorderButton from "./PreorderButton";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Pick your AMORTRAV bag. Explore cabin and check-in sizes with TRACE. Purchasing is not available yet.",
  alternates: { canonical: "/shop" },
};

// Product names, prices and copy supplied in the owner's current Shop design reference.
// These are a design preview, not live inventory or an operational checkout.
const PRODUCTS = [
  {
    name: "Cabin 55",
    detail: "Fits the overhead bin",
    price: 349,
    image: "/img/tile-dropoff.png",
    alt: "AMORTRAV cabin suitcase with its handle extended",
  },
  {
    name: "Check-in 68",
    detail: "Made for a week away",
    price: 429,
    image: "/img/hero-photo.png",
    alt: "Traveller with an AMORTRAV suitcase",
  },
  {
    name: "Check-in 76",
    detail: "Room for the long trips",
    price: 469,
    image: "/img/step-unbox.png",
    alt: "AMORTRAV check-in suitcase beside its packaging",
  },
  {
    name: "The Pair",
    detail: "Cabin 55 + Check-in 68",
    price: 719,
    image: "/img/page-header-media.png",
    alt: "AMORTRAV luggage range",
    pair: true,
  },
] as const;

const FEATURES = [
  ["Journey Log", "Records each trip"],
  ["Impact detection", "Detects hard knocks"],
  ["Built-in weighing", "Weighs when you lift it"],
  ["Theft & tamper", "Alerts if moved or opened"],
];
const STEPS = [
  ["Choose your size", "Cabin, check-in, or the pair."],
  ["Place your pre-order", "Your bag is held from the first run."],
  ["Follow along", "We’ll email you shipping updates."],
];

export default function ShopPage() {
  return (
    <>
      <section
        aria-labelledby="shop-heading"
        className="relative flex min-h-[710px] flex-col justify-between gap-12 overflow-hidden rounded-3xl bg-navy px-5 pt-24 pb-6 md:min-h-[630px] md:px-10 md:pb-10 xl:rounded-[32px] xl:px-14 xl:pt-28"
      >
        <ProductVideo />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/75 via-ink/65 to-navy/70" />
        <div className="relative mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <h1
            id="shop-heading"
            className="text-display-m font-bold text-white md:text-[60px] md:leading-[1.04] md:tracking-[-0.04em] xl:text-[70px]"
          >
            Pick your bag.
            <br />
            <span className="text-sky">TRACE comes in every one.</span>
          </h1>
          <p className="max-w-[660px] text-small text-light-white md:text-lead md:leading-normal">
            Cabin and check-in sizes from $349. Every bag weighs itself, records
            each trip and alerts you to hard knocks.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="#range" label="Shop the range" style="sky" arrow />
            <Button
              href="/how-it-works"
              label="See how it works"
              style="outline"
            />
          </div>
        </div>
        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-5 rounded-3xl border border-line bg-white/10 p-5 text-white backdrop-blur-md md:grid-cols-4 md:gap-0 md:py-6">
          {FEATURES.map(([name, detail], i) => (
            <li
              key={name}
              className="flex items-center gap-3 md:border-l md:border-line md:px-5 md:first:border-0"
            >
              <span className="font-mono text-caption-m text-sky">
                0{i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-caption-m md:text-small">{name}</span>
                <span className="text-[12px] leading-normal text-light-white md:text-caption">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="range"
        aria-labelledby="range-heading"
        className="scroll-mt-28 px-5 py-8 xl:px-14 xl:py-14"
      >
        <h2
          id="range-heading"
          className="text-h1-m font-bold text-navy xl:text-h1"
        >
          Pick your size.
        </h2>
        <p className="mt-3 text-small text-mid">
          Same TRACE system in every size. Choose by how long you’re away.
        </p>
        <div className="mt-8 grid gap-4 min-[640px]:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <article
              key={product.name}
              className="flex min-w-0 flex-col rounded-3xl bg-white p-2 shadow-card"
            >
              <div className="relative aspect-[1.45] overflow-hidden rounded-2xl bg-white">
                {"pair" in product ? (
                  <div className="absolute inset-y-0 left-0 w-[165%]">
                    <Image
                      src={product.image}
                      alt={product.alt}
                      fill
                      sizes="(min-width: 1024px) 480px, 90vw"
                      className="object-cover object-left"
                    />
                  </div>
                ) : (
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                    className={`object-cover ${product.name === "Check-in 68" ? "object-[center_36%]" : "object-center"}`}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 px-2 pt-3 pb-2">
                <h3 className="text-h3-m font-semibold text-navy xl:text-[22px]">
                  {product.name}
                </h3>
                <p className="text-caption text-mid">{product.detail}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-h3-m font-semibold text-navy xl:text-[22px]">
                    ${product.price}
                  </span>
                  <PreorderButton product={product.name} />
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-caption-m text-mid">
          Design preview · Purchasing is not available yet.
        </p>
      </section>

      <section
        aria-labelledby="preorder-heading"
        className="grid items-center gap-8 rounded-3xl border border-divider px-5 py-8 md:grid-cols-[1.2fr_1fr] md:gap-12 xl:rounded-[32px] xl:px-14 xl:py-14"
      >
        <div>
          <h2
            id="preorder-heading"
            className="text-h1-m font-bold text-navy xl:text-h1"
          >
            How pre-ordering works
          </h2>
          <p className="mt-5 text-small text-mid">
            Pre-order now and your bag is reserved from the first production
            run.
          </p>
          <ol className="mt-5 flex flex-col gap-3">
            {STEPS.map(([name, detail], i) => (
              <li
                key={name}
                className="flex items-center gap-4 rounded-3xl bg-white px-4 py-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-small text-navy">{name}</span>
                  <span className="text-caption-m text-mid">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-caption-m text-mid">
            This is the planned pre-order process. Orders and reservations are
            not open yet.
          </p>
        </div>
        <article className="min-w-0 rounded-3xl bg-white p-2 shadow-card">
          <div className="relative aspect-[1.64] overflow-hidden rounded-2xl">
            <Image
              src="/img/page-header-media.png"
              alt="The AMORTRAV luggage range and close-ups of its handle, controls and wheels"
              fill
              sizes="(min-width: 1280px) 520px, (min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h3 className="text-h3 font-semibold text-navy">The Pair</h3>
              <p className="mt-1 text-caption-m text-mid">
                Cabin 55 + Check-in 68 · $719
              </p>
            </div>
            <PreorderButton product="The Pair" />
          </div>
        </article>
      </section>
    </>
  );
}
