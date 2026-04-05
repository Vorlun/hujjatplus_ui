import { useState, useEffect } from "react";
import clsx from "clsx";
import { ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import type { AuthUser, Role } from "../../auth/AuthProvider";

const STORAGE_NAME = "profile_display_name";
const STORAGE_AVATAR = "settings_avatar_data_url";

function roleBadgeClass(role: Role): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800 ring-purple-200/60";
    case "agent":
    case "department":
      return "bg-blue-100 text-blue-800 ring-blue-200/60";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200/60";
  }
}

function roleLabel(role: Role): string {
  if (role === "department") return "Agent";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

interface ProfileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser | null;
  onLogout: () => void;
}

export function ProfileMenu({ open, onOpenChange, user, onLogout }: ProfileMenuProps) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.email?.split("@")[0] || "User");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(localStorage.getItem(STORAGE_NAME) || user?.email?.split("@")[0] || "User");
    setAvatarUrl(localStorage.getItem(STORAGE_AVATAR));
  }, [open, user?.email]);

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || "U";

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const helpPath = user?.role === "user" ? "/help" : "/settings";

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={clsx(
          "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200",
          "hover:bg-slate-100 hover:scale-[1.02]",
          open && "bg-slate-100"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#2563EB] to-indigo-600 text-sm font-bold text-white shadow-md ring-2 ring-white">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">{initials}</span>
          )}
        </div>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-slate-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,17.5rem)] origin-top-right",
            "rounded-xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100/80",
            "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out motion-reduce:animate-none motion-reduce:opacity-100"
          )}
          role="menu"
          aria-label="Account menu"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#2563EB] to-indigo-600 text-base font-bold text-white shadow-md ring-1 ring-slate-200/60">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email ?? "—"}</p>
                {user?.role && (
                  <span
                    className={clsx(
                      "mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                      roleBadgeClass(user.role)
                    )}
                  >
                    {roleLabel(user.role)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => go("/settings")}
              className={clsx(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700",
                "transition-all duration-150 hover:bg-slate-50 hover:text-slate-900",
                "group"
              )}
            >
              <User className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#2563EB]" />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go("/settings")}
              className={clsx(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700",
                "transition-all duration-150 hover:bg-slate-50 hover:text-slate-900",
                "group"
              )}
            >
              <Settings className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#2563EB]" />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go(helpPath)}
              className={clsx(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700",
                "transition-all duration-150 hover:bg-slate-50 hover:text-slate-900",
                "group"
              )}
            >
              <HelpCircle className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#2563EB]" />
              Help
            </button>
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
              className={clsx(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600",
                "transition-all duration-150 hover:bg-red-50 hover:text-red-700",
                "group"
              )}
            >
              <LogOut className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-600" />
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
