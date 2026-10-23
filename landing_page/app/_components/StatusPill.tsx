// Figma "Status" (123:302): feature availability pill. The design labels the roadmap state "Planned".
export default function StatusPill({ live, onSurface = false }: { live: boolean; onSurface?: boolean }) {
  return (
    <span
      className={`flex h-[26px] shrink-0 items-center justify-center rounded-full px-2.5 font-bold whitespace-nowrap ${
        live ? "bg-blue-pale text-caption text-brand" : `${onSurface ? "bg-white" : "bg-surface"} text-caption-m text-mid`
      }`}
    >
      {live ? "Live" : "Planned"}
    </span>
  );
}
