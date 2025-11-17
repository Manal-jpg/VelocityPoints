import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

export function AppLayout({ title, children, showSearch = true }) {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="md:pl-[240px] flex flex-col min-h-screen">
        <TopBar title={title} showSearch={showSearch} />
        <main className="flex-1 px-4 md:px-8 py-6 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
