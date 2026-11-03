import Image from "next/image";

export function ConsoleBrand({
  light = false,
  consoleLabel = false,
  compact = false,
}: {
  light?: boolean;
  consoleLabel?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="console-brand-lockup">
      <span className={compact ? "console-brand-symbol" : undefined}>
        <Image
          src={light || compact ? "/brand/mark-white.svg" : "/brand/mark-navy.svg"}
          width={compact ? 22 : 32}
          height={compact ? 18 : 26}
          alt=""
          className="console-brand-mark"
        />
      </span>
      <span className="console-wordmark">AMORTRAV</span>
      {consoleLabel && <small>Console</small>}
    </span>
  );
}
