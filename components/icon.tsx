import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  Calendar,
  Car,
  Target,
  Receipt,
  Wallet,
  FlaskConical,
  Binoculars,
  BookOpen,
  BarChart3,
  Menu,
  LogOut,
  Plus,
  ChevronRight,
  Check,
  Clock,
  Truck,
  Box,
  Map,
  IndianRupee,
  Navigation,
  Pencil,
  X,
  Tags,
  UserCog,
  Flower2,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  "map-pin": MapPin,
  package: Package,
  calendar: Calendar,
  car: Car,
  target: Target,
  receipt: Receipt,
  wallet: Wallet,
  "flask-conical": FlaskConical,
  binoculars: Binoculars,
  "book-open": BookOpen,
  "bar-chart-3": BarChart3,
  menu: Menu,
  "log-out": LogOut,
  plus: Plus,
  "chevron-right": ChevronRight,
  check: Check,
  clock: Clock,
  truck: Truck,
  box: Box,
  map: Map,
  "indian-rupee": IndianRupee,
  navigation: Navigation,
  edit: Pencil,
  x: X,
  tags: Tags,
  "user-cog": UserCog,
  flower: Flower2,
};

export function Icon({
  name,
  className,
  size = 18,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Cmp = MAP[name] ?? Package;
  return <Cmp className={className} size={size} strokeWidth={2} />;
}
