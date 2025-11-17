import { Search, Bell, Settings } from "lucide-react";

export function TopBar({ title, showSearch = true }) {
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
        <div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a862] to-[#00d477] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform ml-1"
          style={{
            boxShadow: "0 4px 6px rgba(0, 168, 98, 0.15)",
          }}
        >
          {/* TODO: replace with user initials from context */}
          <span className="text-[14px]" style={{ fontWeight: 600 }}>
            JD
          </span>
        </div>
      </div>
    </header>
  );
}
