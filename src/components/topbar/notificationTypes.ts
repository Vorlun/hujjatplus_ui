import type { LucideIcon } from "lucide-react";
import { MessageSquare, FileText, CheckCircle, AlertTriangle } from "lucide-react";

export type NotificationTone = "success" | "info" | "warning";

export type NotificationKind = "request" | "document" | "status" | "alert";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  tone: NotificationTone;
  title: string;
  description: string;
  at: Date;
  /** When set, clicking navigates to request detail where supported */
  requestId?: string;
}

export function notificationIcon(kind: NotificationKind): LucideIcon {
  switch (kind) {
    case "document":
      return FileText;
    case "status":
      return CheckCircle;
    case "alert":
      return AlertTriangle;
    default:
      return MessageSquare;
  }
}

export const toneIconWrap: Record<NotificationTone, string> = {
  success: "bg-emerald-100 text-emerald-700 ring-emerald-200/60",
  info: "bg-blue-100 text-blue-700 ring-blue-200/60",
  warning: "bg-amber-100 text-amber-800 ring-amber-200/60",
};

export const toneUnreadBar: Record<NotificationTone, string> = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function formatNotifTime(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24 && isToday(d)) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
