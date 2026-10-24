import Image from "next/image";

// Figma "Photo tile" (119:234): photo with a bottom scrim and a glass caption pill.
// On hover the photo eases in slightly; the tile itself keeps its size.
export default function PhotoTile({
  caption,
  className = "",
  children,
  ...rest
}: {
  caption: string;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`relative overflow-clip rounded-[20px] bg-navy-deep xl:rounded-[28px] [&_img]:transition-[scale] [&_img]:duration-700 [&_img]:ease-out-soft motion-safe:hover:[&_img]:scale-[1.04] ${className}`}
    >
      {children}
      <div className="absolute inset-0 bg-linear-to-b from-[rgba(0,31,77,0)] from-50% to-[rgba(0,31,77,0.7)]" />
      <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-24px)] items-center gap-2 rounded-2xl bg-white/51 py-2 pr-3.5 pl-2.5 shadow-float sm:bottom-[18px] sm:left-[18px] sm:gap-3 sm:rounded-[20px] sm:py-3 sm:pr-[18px] sm:pl-3">
        <Image src="/icons/dot-caption.svg" alt="" width={8} height={8} />
        <span className="truncate text-btn-sm font-bold text-navy">{caption}</span>
      </div>
    </div>
  );
}
