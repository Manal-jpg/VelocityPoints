import { Search, Bell, Settings, LogOut, User, Shuffle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const getInitials = (name, utorid) => {
  const source = name || utorid || "";
  if (!source) return "??";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function TopBar({ title, showSearch = true }) {
  const { user, logout, activeRole, switchInterface } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = useMemo(
    () => getInitials(user?.name, user?.utorid),
    [user?.name, user?.utorid]
  );
  const avatarUrl = user?.avatarUrl
    ? `${API_BASE_URL}${user.avatarUrl}`
    : null;

  const availableRoles = useMemo(() => {
    if (!user) return [];
    const base = Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];
    const set = new Set(base.map((r) => String(r || "").toLowerCase()));
    if (set.has("superuser")) {
      set.add("manager");
      set.add("cashier");
      set.add("regular");
    }
    if (set.has("manager")) {
      set.add("cashier");
      set.add("regular");
    }
    if (set.has("cashier")) {
      set.add("regular");
    }
    if (set.size === 0) set.add("regular");
    return Array.from(set);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  const formatRoleLabel = (role) => {
    const map = {
      regular: "User",
      cashier: "Cashier",
      manager: "Manager",
      superuser: "Superuser",
      organizer: "Organizer",
    };
    return map[role] || role;
  };

  return (
    <header className="h-20 bg-white border-b border-[#f4f4f5] flex items-center justify-between px-6 md:px-8">
      <h1 className="text-[#18181b] text-lg md:text-xl font-semibold">
        {title}
      </h1>

      {showSearch && (
        <div className="hidden sm:block flex-1 max-w-[400px] mx-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
              size={18}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-11 pl-11 pr-4 rounded-[10px] bg-[#fafaf9] border border-transparent text-[15px] text-[#18181b] placeholder:text-[#a1a1aa] focus:border-[#00a862] focus:bg-white transition-all outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-[10px] hover:bg-[#fafaf9] flex items-center justify-center transition-all">
          <Bell size={20} strokeWidth={1.5} className="text-[#71717a]" />
        </button>
        <button className="w-10 h-10 rounded-[10px] hover:bg-[#fafaf9] flex items-center justify-center transition-all">
          <Settings size={20} strokeWidth={1.5} className="text-[#71717a]" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a862] to-[#00d477] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform ml-1 overflow-hidden"
            style={{
              boxShadow: "0 4px 6px rgba(0, 168, 98, 0.15)",
            }}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[14px]" style={{ fontWeight: 600 }}>
                {initials}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#f4f4f5] shadow-lg overflow-hidden z-30">
              {availableRoles.length > 1 && (
                <div className="border-b border-[#f4f4f5]">
                  <div className="px-4 py-2 text-xs uppercase tracking-wide text-[#71717a] flex items-center gap-2">
                    <Shuffle size={14} />
                    Switch interface
                  </div>
                  {availableRoles.map((role) => {
                    const isActive = role === activeRole;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          switchInterface(role);
                          setOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                          isActive
                            ? "bg-[#e6f7f0] text-[#0f9a61]"
                            : "text-[#18181b] hover:bg-[#f9fafb]"
                        }`}
                      >
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#0f9a61] opacity-60" />
                        {formatRoleLabel(role)}
                        {isActive && (
                          <span className="ml-auto text-[11px] text-[#0f9a61]">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#18181b] hover:bg-[#f9fafb]"
              >
                <User size={16} />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/account");
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#18181b] hover:bg-[#f9fafb]"
              >
                <User size={16} />
                Account Info
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/password");
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#18181b] hover:bg-[#f9fafb]"
              >
                <User size={16} />
                Password &amp; Security
              </button>
              <div className="border-t border-[#f4f4f5]" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#b91c1c] hover:bg-[#fef2f2]"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
