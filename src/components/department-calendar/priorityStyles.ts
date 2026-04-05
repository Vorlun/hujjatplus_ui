import type { CalendarRequestEvent } from "./types";

export type PriorityTone = "high" | "medium" | "low" | "unknown";

export function normalizePriority(priority: string): PriorityTone {
  const p = priority.trim().toLowerCase();
  if (p === "high") return "high";
  if (p === "medium") return "medium";
  if (p === "low") return "low";
  return "unknown";
}

/** Soft pastel pills — avoid harsh contrast */
export function priorityBadgeClass(tone: PriorityTone): string {
  switch (tone) {
    case "high":
      return "bg-red-100 text-red-600 border-red-200/50";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200/50";
    case "low":
      return "bg-green-100 text-green-700 border-green-200/50";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200/60";
  }
}

export function priorityDotClass(tone: PriorityTone): string {
  switch (tone) {
    case "high":
      return "bg-red-400";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-slate-400";
  }
}

export function eventTone(event: CalendarRequestEvent): PriorityTone {
  return normalizePriority(event.priority);
}
