import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "../hooks/useMobile";

export function Layout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar
        isMobile={isMobile}
        open={sidebarOpen}
        onClose={closeSidebar}
      />
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/50"
          onClick={closeSidebar}
        />
      )}
      <div
        className={`flex flex-col min-h-screen transition-[padding] ${
          isMobile ? "pl-0" : "pl-[260px]"
        }`}
      >
        <TopBar onMenuClick={toggleSidebar} showMenuButton={isMobile} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
