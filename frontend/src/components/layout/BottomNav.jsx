import { Link, useLocation } from "react-router-dom";
import { navItems } from "./navItems";

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#f4f4f5] flex items-center justify-around z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1 text-xs"
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              className={isActive ? "text-[#00a862]" : "text-[#a1a1aa]"}
            />
            <span
              className={`${
                isActive ? "text-[#00a862] font-medium" : "text-[#a1a1aa]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
