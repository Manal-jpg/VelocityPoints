import { Link, useLocation } from "react-router-dom";
import { Settings, Star } from "lucide-react";
import { getNavItems } from "./navItems";
import { useAuth } from "../../hooks/useAuth";

export function Sidebar() {
  const location = useLocation();
  const { user, activeRole } = useAuth();
  const navItems = getNavItems(user, activeRole);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-[#f4f4f5] flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#f4f4f5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a862] flex items-center justify-center shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span
            className="text-[17px] text-[#18181b]"
            style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            PointsVelocity
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all ${
                    isActive
                      ? "bg-[#e6f7f0] text-[#00a862]"
                      : "text-[#71717a] hover:bg-[#f9fafb] hover:text-[#18181b]"
                  }`}
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="text-[15px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings + Gold badge */}
      <div className="p-3 border-t border-[#f4f4f5]">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#71717a] hover:bg-[#f9fafb] hover:text-[#18181b] mb-4 transition-all"
        >
          <Settings size={20} strokeWidth={1.5} />
          <span className="text-[15px]">Settings</span>
        </Link>

        <div className="bg-gradient-to-br from-[#ffc947] to-[#ffb020] p-4 rounded-2xl text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M20 0v40M0 20h40' stroke='white' stroke-width='1' opacity='.1'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} fill="white" strokeWidth={0} />
              <span className="text-[13px]" style={{ fontWeight: 600 }}>
                Gold Member
              </span>
            </div>
            <p className="text-[12px] opacity-90">Premium benefits active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
