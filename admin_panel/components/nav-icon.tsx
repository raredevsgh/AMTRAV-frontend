import type { AdminSectionIcon } from "@/lib/admin-sections";

const figmaIcons: Partial<Record<AdminSectionIcon, string>> = {
  overview: "overview", devices:"devices", customers: "customer", journeys: "route",
  alerts: "bell", operations: "wrench", settings: "settings",
};

export function NavIcon({ icon }: { icon: AdminSectionIcon }) {
  const asset = figmaIcons[icon];
  if (asset) {
    const maskImage = `url("/admin-icons/${asset}.png")`;
    return <span aria-hidden="true" className="nav-icon figma-icon" style={{ maskImage, WebkitMaskImage: maskImage }} />;
  }
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {

    case "register":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="nav-icon"
          {...common}
        >
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 6.5v7M6.5 10h7" />
        </svg>
      );





    case "manufacturers":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="nav-icon"
          {...common}
        >
          <path d="M2.5 17.5V7l4 3V7l4 3V7l7 4.5v6H2.5z" />
          <line x1="5.5" y1="14" x2="5.5" y2="17.5" />
          <line x1="9.5" y1="14" x2="9.5" y2="17.5" />
          <line x1="13.5" y1="14" x2="13.5" y2="17.5" />
        </svg>
      );

    case "files":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="nav-icon"
          {...common}
        >
          <path d="M11.5 2.5H4.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V7.5L11.5 2.5z" />
          <path d="M11.5 2.5v5h5" />
          <line x1="6.5" y1="10.5" x2="13.5" y2="10.5" />
          <line x1="6.5" y1="13.5" x2="11.5" y2="13.5" />
        </svg>
      );

    case "users":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="nav-icon"
          {...common}
        >
          <circle cx="7.5" cy="6.5" r="3" />
          <path d="M2.5 16.5v-.5a4.5 4.5 0 0 1 9 0v.5" />
          <path d="M13 3.5a2.5 2.5 0 0 1 0 5" />
          <path d="M14 16.5v-.5a3.5 3.5 0 0 0-2.5-3.3" />
        </svg>
      );


    default:
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="nav-icon"
          {...common}
        >
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="11" y="3" width="6" height="6" rx="1" />
          <rect x="3" y="11" width="6" height="6" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
        </svg>
      );
  }
}
