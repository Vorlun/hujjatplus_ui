import { useMemo, useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router";
import type { NotificationItem } from "./notificationTypes";
import {
  formatNotifTime,
  isToday,
  notificationIcon,
  toneIconWrap,
  toneUnreadBar,
} from "./notificationTypes";
import { getDefaultNotifications } from "./notificationMockData";
import type { Role } from "../../auth/AuthProvider";

const READ_STORAGE_KEY = "topbar_notifications_read_ids";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
}

interface NotificationDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: Role | undefined;
  items?: NotificationItem[];
}

export function NotificationDropdown({
  open,
  onOpenChange,
  userRole,
  items: itemsProp,
}: NotificationDropdownProps) {
  const items = useMemo(() => itemsProp ?? getDefaultNotifications(), [itemsProp]);
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  useEffect(() => {
    if (open) setReadIds(loadReadIds());
  }, [open]);

  const unreadCount = useMemo(
    () => items.filter((n) => !readIds.has(n.id)).length,
    [items, readIds]
  );

  const { today, earlier } = useMemo(() => {
    const t: NotificationItem[] = [];
    const e: NotificationItem[] = [];
    for (const n of items) {
      (isToday(n.at) ? t : e).push(n);
    }
    return { today: t, earlier: e };
  }, [items]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const next = new Set(items.map((n) => n.id));
    setReadIds(next);
    saveReadIds(next);
  }, [items]);

  const handleItemClick = useCallback(
    (n: NotificationItem) => {
      markRead(n.id);
      onOpenChange(false);
      if (n.requestId) {
        if (userRole === "user") {
          navigate(`/my-requests/${encodeURIComponent(n.requestId)}`);
        } else if (userRole === "admin") {
          navigate(`/admin/requests/${encodeURIComponent(n.requestId)}`);
        } else {
          navigate("/inbox");
        }
      } else if (n.kind === "document") {
        navigate("/documents");
      } else if (userRole === "agent" || userRole === "admin") {
        navigate("/inbox");
      } else {
        navigate("/my-requests");
      }
    },
    [markRead, navigate, onOpenChange, userRole]
  );

  const renderGroup = (label: string, group: NotificationItem[]) => {
    if (group.length === 0) return null;
    return (
      <div className="px-3 pt-2">
        <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <ul className="space-y-2">
          {group.map((n) => {
            const unread = !readIds.has(n.id);
            const Icon = notificationIcon(n.kind);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={clsx(
                    "group relative w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm",
                    "transition-all duration-200 ease-out",
                    "hover:border-slate-200 hover:bg-slate-50/90 hover:shadow-md hover:scale-[1.01]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  )}
                >
                  {unread && (
                    <span
                      className={clsx(
                        "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full",
                        toneUnreadBar[n.tone]
                      )}
                      aria-hidden
                    />
                  )}
                  <div className="flex gap-3 pl-1">
                    <div
                      className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105",
                        toneIconWrap[n.tone]
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-slate-900">{n.title}</p>
                        {unread && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40"
                            title="Unread"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {n.description}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                        {formatNotifTime(n.at)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={clsx(
          "relative rounded-xl p-2 text-slate-500 transition-all duration-200",
          "hover:scale-105 hover:bg-slate-100 hover:text-slate-900",
          open && "bg-slate-100 text-slate-900"
        )}
        title="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] origin-top-right",
            "rounded-xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100/80",
            "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out motion-reduce:animate-none motion-reduce:opacity-100"
          )}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">Stay on top of your work</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className={clsx(
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600",
                  "transition-all duration-150 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,24rem)] overflow-y-auto py-2">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
            ) : (
              <>
                {renderGroup("Today", today)}
                {renderGroup("Earlier", earlier)}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
