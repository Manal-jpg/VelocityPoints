import { Home, Receipt, Calendar, QrCode, UserCircle } from "lucide-react";

export const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Receipt, label: "Transactions", path: "/transactions" },
  { icon: Calendar, label: "Events", path: "/events" },
  // TODO: change path if we make a dedicated QR route
  { icon: QrCode, label: "My QR Code", path: "/qr" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
];
