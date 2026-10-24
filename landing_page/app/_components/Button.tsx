import Image from "next/image";
import Link from "next/link";

// Figma "Button" (119:208): pill button. Style: Navy, Sky, White, Outline (on dark), Ghost.
// Size: L 56, M 48, S 46, XS 44. Each style has a Hover state.
type Style = "navy" | "sky" | "white" | "outline" | "ghost";
type Size = "l" | "m" | "s" | "xs";

// Sky and Outline sit on navy backgrounds, so their focus ring is sky rather than brand blue.
const STYLES: Record<Style, string> = {
  navy: "bg-brand text-white hover:bg-navy focus-visible:outline-brand",
  sky: "bg-sky text-navy hover:bg-blue-faint focus-visible:outline-sky",
  white: "bg-white text-navy hover:bg-blue-pale focus-visible:outline-brand",
  outline: "border border-line text-white hover:bg-navy-deep focus-visible:outline-sky",
  ghost: "text-navy hover:bg-blue-pale focus-visible:outline-brand",
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

// `stretch` extends the link over its nearest positioned ancestor (a card) through ::after.
// It skips the press scale: a scaled link would become the box its own ::after fills.
export function buttonClass(style: Style, size: Size, extra = "", stretch = false) {
  const press = stretch ? "after:absolute after:inset-0" : "motion-safe:active:scale-[0.97]";
  return `group inline-flex shrink-0 items-center justify-center rounded-full font-bold whitespace-nowrap transition-[background-color,color,scale] duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 ${press} ${STYLES[style]} ${SIZES[size]} ${labelClass(style, size)} ${extra}`;
}

export default function Button({
  href,
  label,
  style = "navy",
  size = "m",
  arrow = false,
  className = "",
  stretch = false,
  onClick,
}: {
  href: string;
  label: string;
  style?: Style;
  size?: Size;
  arrow?: boolean;
  className?: string;
  stretch?: boolean;
  onClick?: () => void;
}) {
  const icon = arrowIcon(style, size);
  return (
    <Link href={href} onClick={onClick} className={buttonClass(style, size, className, stretch)}>
      {label}
      {arrow && (
        <Image
          src={icon.src}
          alt=""
          width={icon.px}
          height={icon.px}
          className="transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
