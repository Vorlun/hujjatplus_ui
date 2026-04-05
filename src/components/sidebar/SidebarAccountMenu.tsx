import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import {
  ChevronUp,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import type { Role } from "../../auth/useAuth";

const STORAGE_NAME = "profile_display_name";
const STORAGE_AVATAR = "settings_avatar_data_url";

function roleBadgeClass(role: Role): string {
  switch (role) {
    case "admin":
      return "bg-purple-500/15 text-purple-700 ring-purple-200/50";
    case "agent":
    case "department":
      return "bg-blue-500/15 text-blue-700 ring-blue-200/50";
    default:
      return "bg-slate-500/10 text-slate-600 ring-slate-200/60";
  }
}

function roleLabel(role: Role): string {
  if (role === "department") return "Agent";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

interface SidebarAccountMenuProps {
  /** Close mobile drawer after navigation */
  onNavigate?: () => void;
  /** Icon-only sidebar rail */
  collapsed?: boolean;
}

export function SidebarAccountMenu({ onNavigate, collapsed = false }: SidebarAccountMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [displayName, setDisplayName] = useState(user?.email?.split("@")[0] || "User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(localStorage.getItem(STORAGE_NAME) || user?.email?.split("@")[0] || "User");
    setAvatarUrl(localStorage.getItem(STORAGE_AVATAR));
  }, [open, user?.email]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!user) return null;

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user.email?.slice(0, 2).toUpperCase() || "U";

  const helpPath = user.role === "user" ? "/help" : "/settings";

  const go = (path: string) => {
    setOpen(false);
    onNavigate?.();
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    onNavigate?.();
    logout();
    navigate("/login");
  };

  return (
    <div className={clsx("relative pb-3 pt-1", collapsed ? "px-1.5" : "px-3")} ref={ref}>
      {open && (
        <div
          className={clsx(
            "absolute bottom-full z-50 mb-2 overflow-hidden",
            collapsed ? "left-1 right-1 w-[calc(100vw-2rem)] max-w-[260px]" : "left-3 right-3",
            "rounded-xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100/80",
            "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out motion-reduce:animate-none motion-reduce:opacity-100"
          )}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => go("/settings")}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 group"
          >
            <User className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => go("/settings")}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 group"
          >
            <Settings className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => go(helpPath)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 group"
          >
            <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
            Help
          </button>
          <div className="border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 group"
          >
            <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-600" />
            Log out
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={collapsed ? displayName : undefined}
        className={clsx(
          "flex w-full items-center rounded-xl border border-transparent transition-all duration-200",
          collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2.5 text-left",
          "hover:border-slate-200/80 hover:bg-white/80 hover:shadow-sm",
          open && "border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80"
        )}
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md ring-2 ring-white">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">{initials}</span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <span
                className={clsx(
                  "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
                  roleBadgeClass(user.role)
                )}
              >
                {roleLabel(user.role)}
              </span>
            </div>
            <ChevronUp
              className={clsx(
                "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                open ? "rotate-0" : "rotate-180"
              )}
            />
          </>
        )}
      </button>
    </div>
  );
}
