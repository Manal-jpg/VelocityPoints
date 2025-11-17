import {
  CalendarRange,
  ClipboardCheck,
  Gift,
  Home,
  PlusCircle,
  QrCode,
  Receipt,
  Send,
  ShieldCheck,
  Tag,
  User,
  Users,
  Wallet,
} from "lucide-react";

const normalizeRoles = (user) => {
  // Roles may come as a single string or an array; normalize to a Set for easy lookups
  const roles = new Set();
  const raw = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : ["regular"]; // default to basic user if role is missing

  raw.filter(Boolean).forEach((role) => roles.add(role.toUpperCase()));
  return roles;
};

export const getNavItems = (user) => {
  const roles = normalizeRoles(user);
  const hasRole = (role) => roles.has(role.toUpperCase());

  const isSuperuser = hasRole("superuser");
  const isManager = hasRole("manager") || isSuperuser;
  const isCashier = hasRole("cashier") || isManager;
  const isRegular = hasRole("regular") && !isCashier && !isManager;

  const items = [{ icon: Home, label: "Dashboard", path: "/" }];
  const add = (item) => {
    if (!items.some((nav) => nav.path === item.path)) {
      items.push(item);
    }
  };

  if (isRegular) {
    add({ icon: Wallet, label: "My Points", path: "/points" });
    add({ icon: QrCode, label: "My QR Code", path: "/qr" });
    add({ icon: Send, label: "Transfer Points", path: "/transfer" });
    add({ icon: Gift, label: "Redeem Points", path: "/redemptions/request" });
    add({
      icon: ClipboardCheck,
      label: "Redemption QR",
      path: "/redemptions/pending",
    });
    add({ icon: Tag, label: "Promotions", path: "/promotions" });
    add({ icon: CalendarRange, label: "Events", path: "/events" });
    add({ icon: Receipt, label: "My Transactions", path: "/transactions" });
  }

  if (isCashier) {
    add({
      icon: PlusCircle,
      label: "New Transaction",
      path: "/cashier/transactions/new",
    });
    add({
      icon: ClipboardCheck,
      label: "Process Redemption",
      path: "/cashier/redemptions/process",
    });
  }

  if (isManager) {
    add({ icon: Users, label: "Users", path: "/manager/users" });
    add({
      icon: Receipt,
      label: "All Transactions",
      path: "/manager/transactions",
    });
    add({ icon: Tag, label: "Promotions", path: "/manager/promotions" });
    add({ icon: CalendarRange, label: "Events", path: "/manager/events" });
  }

  add({ icon: User, label: "Profile", path: "/profile" });

  if (isSuperuser) {
    add({ icon: ShieldCheck, label: "Role Management", path: "/admin/roles" });
  }

  return items;
};
