// Figma "Tag" (119:213): Tone=Navy on dark cards, Tone=Light on white cards.
export default function Tag({ label, tone }: { label: string; tone: "navy" | "light" }) {
  return (
    <span
      className={`flex h-8 items-center justify-center rounded-full px-3 text-caption whitespace-nowrap ${
        tone === "navy" ? "bg-navy-deep text-white" : "bg-surface text-navy"
      }`}
    >
      {label}
    </span>
  );
}
