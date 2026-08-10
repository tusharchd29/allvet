import {
  LayoutDashboard, Users, MapPin, ShoppingCart, Car, Route,
  Wallet, Target, Banknote, FileText, FlaskConical, Binoculars, BookOpen,
} from "lucide-react";

export const EVERYDAY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/visits", label: "Visits", icon: MapPin },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/travel", label: "Travel & Location", icon: Car },
  { href: "/tours", label: "Tour Planning", icon: Route },
  { href: "/expenses", label: "Expenses", icon: Wallet },
];

export const GROWTH_NAV = [
  { href: "/targets", label: "Targets", icon: Target },
  { href: "/advances", label: "Advances", icon: Banknote },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/trials", label: "Product Trials", icon: FlaskConical },
  { href: "/competitor-intel", label: "Competitor Intel", icon: Binoculars },
  { href: "/brochures", label: "Brochures", icon: BookOpen },
];

export const MOBILE_PRIMARY = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/visits", label: "Visits", icon: MapPin },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/more", label: "More", icon: Route },
];
