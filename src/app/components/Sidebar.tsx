import {
  LayoutDashboard,
  FileDown,
  Inbox,
  Search,
  MessageSquare,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "incoming", label: "Documents", icon: FileDown },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "search", label: "Search", icon: Search },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-3 py-4 pb-6">
        <Logo variant="full" size="xl" className="min-w-0" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
