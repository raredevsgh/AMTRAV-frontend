import Image from "next/image";
import Link from "next/link";

// Figma "Button" (119:208): pill button. Style: Navy, Sky, White, Outline (on dark), Ghost.
// Size: L 56, M 48, S 46, XS 44. Each style has a Hover state.
type Style = "navy" | "sky" | "white" | "outline" | "ghost";
type Size = "l" | "m" | "s" | "xs";

const STYLES: Record<Style, string> = {
  navy: "bg-brand text-white hover:bg-navy",
  sky: "bg-sky text-navy hover:bg-blue-faint",
  white: "bg-white text-navy hover:bg-blue-pale",
  outline: "border border-line text-white hover:bg-navy-deep",
  ghost: "text-navy hover:bg-blue-pale",
};

const SIZES: Record<Size, string> = {
  l: "h-14 gap-2.5 px-7",
  m: "h-12 gap-2 px-6",
  s: "h-[46px] gap-2 px-5",
  xs: "h-11 gap-2 px-4",
};

// Large labels are 18px; so is Navy/Outline at M. Everything else is 14px.
function labelClass(style: Style, size: Size) {
  const large = size === "l" || (size === "m" && style === "navy");
  return large ? "text-btn" : "text-btn-sm";
}

function arrowIcon(style: Style, size: Size) {
  const onDark = style === "navy" || style === "outline";
  if (size === "l") {
    return { src: onDark ? "/icons/arrow-white-l.svg" : "/icons/arrow-navy-l.svg", px: 18 };
  }
  return { src: onDark ? "/icons/arrow-white.svg" : "/icons/arrow-navy-s.svg", px: 16 };
}

export function buttonClass(style: Style, size: Size, extra = "") {
  return `inline-flex shrink-0 items-center justify-center rounded-full font-bold whitespace-nowrap transition-colors ${STYLES[style]} ${SIZES[size]} ${labelClass(style, size)} ${extra}`;
}

export default function Button({
  href,
  label,
  style = "navy",
  size = "m",
  arrow = false,
  className = "",
  onClick,
}: {
  href: string;
  label: string;
  style?: Style;
  size?: Size;
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const icon = arrowIcon(style, size);
  return (
    <Link href={href} onClick={onClick} className={buttonClass(style, size, className)}>
      {label}
      {arrow && <Image src={icon.src} alt="" width={icon.px} height={icon.px} />}
    </Link>
  );
}
