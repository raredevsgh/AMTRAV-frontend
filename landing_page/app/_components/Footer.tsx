import Image from "next/image";

// Figma "Footer / Desktop" (2020:525) and "Footer / Mobile" (2020:562).
// Destinations are not defined in the design yet, so the links point to "#".
const LINKS = [
  { label: "Company", width: "xl:w-[98px]" },
  { label: "Support", width: "xl:w-[98px]" },
  { label: "Terms of use", width: "xl:w-[97px]" },
  { label: "Contact", width: "xl:w-[83px]" },
  { label: "Blog", width: "xl:w-[92px]" },
];

// The social artwork includes its drop shadow, so each image overflows its slot.
function Social() {
  return (
    <div className="flex items-center gap-2.5 xl:w-[177px] xl:items-start xl:gap-[25px]">
      <a href="#" aria-label="Facebook" className="relative size-[41px] shrink-0">
        <Image src="/icons/social-facebook.svg" alt="" width={45} height={45} className="absolute top-[-1px] left-[-2px] max-w-none" />
      </a>
      <a href="#" aria-label="Instagram" className="relative size-[45px] shrink-0">
        <Image src="/icons/social-instagram-bg.png" alt="" width={49} height={49} className="absolute top-[-1px] left-[-2px] max-w-none" />
        <span className="absolute top-3.5 left-[15px] size-4">
          <Image src="/icons/instagram-1.svg" alt="" fill />
          <span className="absolute inset-[11.91%_11.91%_76.37%_76.37%]">
            <Image src="/icons/instagram-2.svg" alt="" fill />
          </span>
          <span className="absolute inset-[23.63%]">
            <Image src="/icons/instagram-3.svg" alt="" fill />
          </span>
        </span>
      </a>
      <a href="#" aria-label="X" className="relative size-[41px] shrink-0 xl:mt-0.5">
        <Image src="/icons/social-x.svg" alt="" width={45} height={45} className="absolute top-[-1px] left-[-2px] max-w-none" />
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="flex flex-col border-t border-stale px-5 py-6 xl:items-center xl:px-[140px] xl:py-3">
      <div className="flex flex-col gap-5 xl:w-[847px] xl:flex-row xl:items-center">
        <nav className="flex flex-wrap gap-x-4 gap-y-3 text-body-m whitespace-nowrap text-mid xl:flex-nowrap xl:gap-10 xl:text-small">
          {LINKS.map(({ label, width }) => (
            <a key={label} href="#" className={width}>
              {label}
            </a>
          ))}
          <p className="hidden xl:block xl:w-[146px]">©2026 Amortrav</p>
        </nav>
        <div className="flex items-center justify-between">
          <p className="text-caption-m text-mid xl:hidden">©2026 Amortrav</p>
          <Social />
        </div>
      </div>
    </footer>
  );
}
