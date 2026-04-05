import clsx from "clsx";
import { User, IdCard, Shield, Bell, SlidersHorizontal, type LucideIcon } from "lucide-react";

export type SettingsSectionId = "profile" | "account" | "security" | "notifications" | "preferences";

export const SETTINGS_NAV: { id: SettingsSectionId; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: IdCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

interface SettingsSidebarProps {
  active: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
}

export function SettingsSidebar({ active, onSelect }: SettingsSidebarProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0 md:pr-2"
      aria-label="Settings sections"
    >
      {SETTINGS_NAV.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={clsx(
              "flex min-w-[8.5rem] shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-150 md:min-w-0 md:px-3",
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/90"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            )}
          >
            <Icon
              className={clsx("h-4 w-4 shrink-0", isActive ? "text-[#2563EB]" : "text-slate-400")}
              aria-hidden
            />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
