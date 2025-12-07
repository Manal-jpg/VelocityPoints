import {
  CalendarRange,
  ClipboardCheck,
  Gift,
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

/**
 * Normalize user roles into a Set
 */
const normalizeRoles = (user) => {
  const roles = new Set();
  const raw = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : ["regular"];

  raw.filter(Boolean).forEach((role) => roles.add(role.toUpperCase()));
  return roles;
};

export const getNavItems = (user, activeRole) => {
  const baseRoles = normalizeRoles(user);
  const derivedRoles = new Set(baseRoles);
  if (baseRoles.has("SUPERUSER")) {
    derivedRoles.add("MANAGER");
    derivedRoles.add("CASHIER");
    derivedRoles.add("REGULAR");
  }
  if (baseRoles.has("MANAGER")) {
    derivedRoles.add("CASHIER");
    derivedRoles.add("REGULAR");
  }
  if (baseRoles.has("CASHIER")) {
    derivedRoles.add("REGULAR");
  }
  if (!derivedRoles.size) derivedRoles.add("REGULAR");

  const chosen = (() => {
    const lower = (activeRole || "").toUpperCase();
    if (derivedRoles.has(lower)) return lower;
    if (derivedRoles.has("SUPERUSER")) return "SUPERUSER";
    if (derivedRoles.has("MANAGER")) return "MANAGER";
    if (derivedRoles.has("CASHIER")) return "CASHIER";
    return "REGULAR";
  })();

  const isSuperuser = chosen === "SUPERUSER";
  const isManager = chosen === "MANAGER" || isSuperuser;
  const isCashier = chosen === "CASHIER" || isManager;
  const isRegular = chosen === "REGULAR" && !isCashier && !isManager;

  const items = [{ icon: User, label: "Dashboard", path: "/" }];

  const add = (item) => {
    if (!items.some((nav) => nav.path === item.path)) {
      items.push(item);
    }
  };

  // Regular user navigation
  if (isRegular) {
    add({ icon: QrCode, label: "My QR Code", path: "/qr" });
    add({ icon: ClipboardCheck, label: "Redemption QR", path: "/redemptions/pending" });
    add({ icon: Tag, label: "Promotions", path: "/promotions" });
    add({ icon: CalendarRange, label: "Events", path: "/events" });
    add({ icon: Receipt, label: "Transactions", path: "/transactions" });
  }

  // Cashier navigation
  if (isCashier) {
    add({ icon: PlusCircle, label: "New Transaction", path: "/cashier/transactions/new" });
    add({ icon: ClipboardCheck, label: "Process Redemption", path: "/cashier/redemptions/process" });
    add({ icon: Users, label: "Users", path: "/manager/users" });
    add({ icon: CalendarRange, label: "Events", path: "/events" });
  }

  // Manager navigation
  if (isManager) {
    add({ icon: Users, label: "Users", path: "/manager/users" });
    add({
      icon: Receipt,
      label: "All Transactions",
      path: "/transactions",
    });
    add({ icon: Tag, label: "Promotions", path: "/manager/promotions" });
    add({ icon: CalendarRange, label: "Events", path: "/events" });
    add({
      icon: PlusCircle,
      label: "Create Event",
      path: "/manager/events/new",
    });
  }

  // Universal
  add({ icon: User, label: "Profile", path: "/profile" });

  // Superuser
  if (isSuperuser) {
    add({ icon: ShieldCheck, label: "Role Management", path: "/admin/roles" });
  }

  return items;
};
