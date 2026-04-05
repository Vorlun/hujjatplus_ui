import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import type { CalendarViewMode } from "./types";

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const weekOptions = { weekStartsOn: 0 as const };

export function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Stable key for grid transition when navigating the calendar */
export function calendarTransitionKey(view: CalendarViewMode, anchorDate: Date): string {
  if (view === "month") return `m-${format(anchorDate, "yyyy-MM")}`;
  if (view === "week") {
    const wk = startOfWeek(anchorDate, { weekStartsOn: 0 });
    return `w-${format(wk, "yyyy-MM-dd")}`;
  }
  return `d-${dayKey(anchorDate)}`;
}

export function navigateDate(date: Date, view: CalendarViewMode, direction: -1 | 1): Date {
  if (view === "month") return direction > 0 ? addMonths(date, 1) : subMonths(date, 1);
  if (view === "week") return direction > 0 ? addWeeks(date, 1) : subWeeks(date, 1);
  return direction > 0 ? addDays(date, 1) : subDays(date, 1);
}

export function headerTitle(date: Date, view: CalendarViewMode): string {
  if (view === "day") return format(date, "EEEE, MMMM d, yyyy");
  if (view === "week") {
    const start = startOfWeek(date, weekOptions);
    const end = endOfWeek(date, weekOptions);
    if (start.getFullYear() !== end.getFullYear()) {
      return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
  }
  return format(date, "MMMM yyyy");
}

export function getVisibleDays(date: Date, view: CalendarViewMode): Date[] {
  if (view === "day") return [startOfDay(date)];
  if (view === "week") {
    const start = startOfWeek(date, weekOptions);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, weekOptions);
  const gridEnd = endOfWeek(monthEnd, weekOptions);
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isInDisplayedMonth(day: Date, anchor: Date): boolean {
  return isSameMonth(day, anchor);
}

export { isSameDay, startOfDay };
