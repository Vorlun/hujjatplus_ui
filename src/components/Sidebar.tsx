import type { LucideIcon } from "lucide-react";
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
  FileText,
  Building2,
  Bell,
  HelpCircle,
  MessageCircleReply,
  CalendarDays,
  ChevronsLeft,
} from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "../auth/useAuth";
import type { Role } from "../auth/useAuth";
import clsx from "clsx";
import { SidebarAccountMenu } from "./sidebar/SidebarAccountMenu";
import { Logo } from "./ui/Logo";

interface SidebarProps {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
  /** Desktop rail mode: icon-only nav */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
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
  if (role === "admin")
    return adminMenuItems.map((item) => ({
      ...item,
      path: item.path,
      label: item.label,
      icon: item.icon,
      roles: ["admin"] as Role[],
    }));
  if (role === "user")
    return userMenuItems.map((item) => ({
      ...item,
      path: item.path,
      label: item.label,
      icon: item.icon,
      roles: ["user"] as Role[],
    }));
  if (role === "agent")
    return agentMenuItems.map((item) => ({
      ...item,
      path: item.path,
      label: item.label,
      icon: item.icon,
      roles: ["agent"] as Role[],
    }));
  return allMenuItems.filter((item) => item.roles.includes(role));
}

function SidebarNavItem({
  to,
  end,
  icon: Icon,
  label,
  onNavigate,
  collapsed,
}: {
  to: string;
  end?: boolean;
  icon: LucideIcon;
  label: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        title={collapsed ? label : undefined}
        aria-label={collapsed ? label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          clsx(
            "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ease-out",
            collapsed ? "justify-center px-2" : "pl-3 pr-3",
            isActive
              ? clsx(
                  "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/10",
                  !collapsed && "pl-3.5"
                )
              : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 hover:shadow-sm"
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && (
              <span
                className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-sm"
                aria-hidden
              />
            )}
            <Icon
              className={clsx(
                "relative z-[1] h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
              )}
            />
            <span className={clsx("relative z-[1] truncate", collapsed && "sr-only")}>{label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export function Sidebar({
  isMobile = false,
  open = true,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const items = getMenuItems(user.role);

  const handleNav = () => {
    if (isMobile) onClose?.();
  };

  const narrow = collapsed && !isMobile;

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-30 flex h-screen flex-shrink-0 flex-col border-r border-slate-200/90",
        narrow ? "w-[72px]" : "w-[260px]",
        "bg-gradient-to-b from-white via-white to-slate-50/90",
        "transition-[transform,width] duration-200 ease-out",
        isMobile && !open ? "-translate-x-full" : "translate-x-0"
      )}
    >
      {/* Brand */}
      {narrow ? (
        <div className="flex items-center justify-center gap-2 border-b border-slate-200/80 px-3 py-4 dark:border-slate-700/80">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            className="flex items-center justify-center rounded-xl p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <Logo variant="icon" size="md" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-slate-200/80 px-3 py-4 pb-6 dark:border-slate-700/80">
          <div className="flex min-w-0 flex-1 items-center">
            <Logo variant="full" size="xl" className="min-w-0" />
          </div>
          {!isMobile && onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100/90 dark:hover:bg-slate-800/80"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className={clsx("flex-1 overflow-y-auto py-4", narrow ? "px-1.5" : "px-3")}>
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const path =
              item.path === "/dashboard" && user.role === "admin" ? "/admin" : item.path;
            const end =
              path === "/dashboard" || path === "/admin" || path === "/department/dashboard";
            return (
              <SidebarNavItem
                key={path + item.label}
                to={path}
                end={end}
                icon={Icon}
                label={item.label}
                onNavigate={handleNav}
                collapsed={narrow}
              />
            );
          })}
        </ul>
      </nav>

      {/* Account */}
      <div className="border-t border-slate-200/80 bg-gradient-to-t from-slate-50/80 to-transparent pb-2">
        <SidebarAccountMenu
          collapsed={narrow}
          onNavigate={isMobile ? onClose : undefined}
        />
      </div>
    </aside>
  );
}
