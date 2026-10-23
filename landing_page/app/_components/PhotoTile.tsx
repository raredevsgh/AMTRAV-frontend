import Image from "next/image";

// Figma "Photo tile" (119:234): photo with a bottom scrim and a glass caption pill.
export default function PhotoTile({
  caption,
  className = "",
  children,
}: {
  caption: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-clip rounded-[20px] bg-navy-deep xl:rounded-[28px] ${className}`}>
      {children}
      <div className="absolute inset-0 bg-linear-to-b from-[rgba(0,31,77,0)] from-50% to-[rgba(0,31,77,0.7)]" />
      <div className="absolute bottom-[18px] left-[18px] flex items-center gap-3 rounded-[20px] bg-white/51 py-3 pr-[18px] pl-3 shadow-float">
        <Image src="/icons/dot-caption.svg" alt="" width={8} height={8} />
        <span className="text-btn-sm font-bold text-navy">{caption}</span>
      </div>
    </div>
  );
}
