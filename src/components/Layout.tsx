import { useState, useEffect } from "react";
import clsx from "clsx";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "../hooks/useMobile";

const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";

export function Layout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
        setSidebarCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const toggleSidebarCollapsed = () => setSidebarCollapsed((c) => !c);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar
        isMobile={isMobile}
        open={sidebarOpen}
        onClose={closeSidebar}
        collapsed={!isMobile && sidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
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
        className={clsx(
          "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
          isMobile ? "pl-0" : sidebarCollapsed ? "pl-[72px]" : "pl-[260px]"
        )}
      >
        <TopBar onMenuClick={toggleSidebar} showMenuButton={isMobile} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
