export type AdminSection = {
  href: string;
  label: string;
  description: string;
};

// The five MVP admin sections, in navigation order. Shared by pages,
// breadcrumbs and the sidebar.
export const adminSections = {
  dashboard: {
    href: "/dashboard",
    label: "Dashboard",
    description:
      "Overview of QR bags generated, bags in sales custody, warehouse stock and total sold.",
  },
  manufacturers: {
    href: "/manufacturers",
    label: "Manufacturers",
    description: "Manufacturer accounts and QR batch generation.",
  },
  sales: {
    href: "/sales",
    label: "Sales",
    description:
      "Sales rep custody, stock handoffs and verified customer scans.",
  },
  inventory: {
    href: "/inventory",
    label: "Inventory",
    description: "Warehouse stock balances and the stock movement ledger.",
  },
  finance: {
    href: "/finance",
    label: "Finance",
    description: "Gross revenue and the sales transaction ledger.",
  },
} as const satisfies Record<string, AdminSection>;
