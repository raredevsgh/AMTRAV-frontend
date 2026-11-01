import Image from "next/image";

export function ConsoleBrand({
  light = false,
  consoleLabel = false,
}: {
  light?: boolean;
  consoleLabel?: boolean;
}) {
  return (
    <span className="console-brand-lockup">
      <Image
        src={light ? "/brand/mark-white.svg" : "/brand/mark-navy.svg"}
        width={32}
        height={26}
        alt=""
        className="console-brand-mark"
      />
      <span className="console-wordmark">AMORTRAV</span>
      {consoleLabel && <small>Console</small>}
    </span>
  );
}
