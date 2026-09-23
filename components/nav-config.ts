export type NavItem = {
  href: string;
  label: string;
  icon: string;
  ownerOnly?: boolean;
};

export const EVERYDAY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/customers", label: "Customers", icon: "users" },
  { href: "/visits", label: "Visits", icon: "map-pin" },
  { href: "/orders", label: "Orders", icon: "package" },
  { href: "/tours", label: "Tour Plan", icon: "calendar" },
  { href: "/travel", label: "Travel Log", icon: "car" },
];

export const GROWTH_NAV: NavItem[] = [
  { href: "/targets", label: "Targets", icon: "target" },
  { href: "/expenses", label: "Expenses", icon: "receipt" },
  { href: "/advances", label: "Advances", icon: "wallet" },
  { href: "/trials", label: "Product Trials", icon: "flask-conical" },
  { href: "/competitor-intel", label: "Competitor Intel", icon: "binoculars" },
  { href: "/brochures", label: "Brochures", icon: "book-open" },
  { href: "/reports", label: "Reports", icon: "bar-chart-3" },
];

export const MOBILE_PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "layout-dashboard" },
  { href: "/visits", label: "Visits", icon: "map-pin" },
  { href: "/orders", label: "Orders", icon: "package" },
  { href: "/customers", label: "Customers", icon: "users" },
  { href: "/more", label: "More", icon: "menu" },
];
