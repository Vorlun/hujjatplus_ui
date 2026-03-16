import {
  LayoutDashboard,
  FileDown,
  FileUp,
  Inbox,
  ListTodo,
  FileEdit,
  MessageSquare,
  Archive,
  Search,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Building2,
  Bell,
  HelpCircle,
  MessageCircleReply,
  CalendarDays,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import type { Role } from "../auth/useAuth";

interface SidebarProps {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

/** User: Dashboard, AI Chat, My Requests, Responses, Settings, Help */
const userMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/chat", label: "AI Chat", icon: MessageSquare },
  { path: "/my-requests", label: "My Requests", icon: ListTodo },
  { path: "/department-responses", label: "Responses", icon: MessageCircleReply },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/help", label: "Help", icon: HelpCircle },
];

/** Admin: Dashboard, Requests, Documents, Departments, Reports, Settings */
const adminMenuItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/requests", label: "Requests", icon: ListTodo },
  { path: "/admin/documents", label: "Documents", icon: FileText },
  { path: "/admin/departments", label: "Departments", icon: Building2 },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

/** Department (agent): Dashboard, Inbox, Documents, Settings */
const agentMenuItems = [
  { path: "/department/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inbox", label: "Inbox", icon: Inbox },
   { path: "/department/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

const allMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["user"] as Role[] },
  { path: "/incoming", label: "Incoming Documents", icon: FileDown, roles: ["agent", "admin"] as Role[] },
  { path: "/outgoing", label: "Outgoing Documents", icon: FileUp, roles: ["agent", "admin"] as Role[] },
  { path: "/inbox", label: "Department Inbox", icon: Inbox, roles: ["agent", "admin"] as Role[] },
  { path: "/tasks", label: "Internal Tasks", icon: ListTodo, roles: ["agent", "admin"] as Role[] },
  { path: "/documents/editor", label: "Document Editor", icon: FileEdit, roles: ["agent", "admin"] as Role[] },
  { path: "/chat", label: "AI Request Chat", icon: MessageSquare, roles: ["admin"] as Role[] },
  { path: "/my-requests", label: "My Requests", icon: ListTodo, roles: ["user"] as Role[] },
  { path: "/documents", label: "Documents", icon: FileText, roles: ["agent", "admin"] as Role[] },
  { path: "/archive", label: "Archive", icon: Archive, roles: ["agent", "admin"] as Role[] },
  { path: "/search", label: "Search", icon: Search, roles: ["agent", "admin"] as Role[] },
  { path: "/reports", label: "Reports & Analytics", icon: BarChart3, roles: ["admin"] as Role[] },
  { path: "/notifications", label: "Notifications", icon: Bell, roles: ["agent", "admin"] as Role[] },
  { path: "/settings", label: "Profile Settings", icon: Settings, roles: ["user", "agent", "admin"] as Role[] },
];

function getMenuItems(role: Role) {
  if (role === "admin") return adminMenuItems.map((item) => ({ ...item, path: item.path, label: item.label, icon: item.icon, roles: ["admin"] as Role[] }));
  if (role === "user") return userMenuItems.map((item) => ({ ...item, path: item.path, label: item.label, icon: item.icon, roles: ["user"] as Role[] }));
  if (role === "agent") return agentMenuItems.map((item) => ({ ...item, path: item.path, label: item.label, icon: item.icon, roles: ["agent"] as Role[] }));
  return allMenuItems.filter((item) => item.roles.includes(role));
}

export function Sidebar({ isMobile = false, open = true, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = getMenuItems(user.role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNav = () => {
    if (isMobile) onClose?.();
  };

  return (
    <aside
      className={`w-[260px] flex-shrink-0 h-screen flex flex-col fixed left-0 top-0 z-30 bg-[#FFFFFF] border-r border-[#E5E7EB] transition-transform duration-200 ease-out ${
        isMobile && !open ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827]">
              HujjatPlus
            </h2>
            <p className="text-xs text-[#6B7280]">
              AI Helpdesk
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const path = item.path === "/dashboard" && user.role === "admin" ? "/admin" : item.path;
            const end = path === "/dashboard" || path === "/admin" || path === "/department/dashboard";
            return (
              <li key={path + item.label}>
                <NavLink
                  to={path}
                  onClick={handleNav}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-[#7C3AED] text-white shadow-sm" : "text-[#111827] hover:bg-[#F3F4F6]"
                    }`
                  }
                  end={end}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="text-xs text-[#6B7280] mb-1 truncate px-2">
          {user.email}
        </div>
        <div className="text-xs text-[#6B7280] mb-2 px-2 capitalize">
          {user.role}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
