import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { apiClient } from "../services/apiClient";
import { CalendarHeader } from "../components/department-calendar/CalendarHeader";
import { CalendarGrid } from "../components/department-calendar/CalendarGrid";
import {
  getVisibleDays,
  headerTitle,
  navigateDate,
  dayKey,
  calendarTransitionKey,
} from "../components/department-calendar/calendarDates";
import type { CalendarRequestEvent, CalendarViewMode } from "../components/department-calendar/types";

function groupEventsByDay(events: CalendarRequestEvent[]): Record<string, CalendarRequestEvent[]> {
  const map: Record<string, CalendarRequestEvent[]> = {};
  for (const e of events) {
    const k = dayKey(new Date(e.deadline));
    if (!map[k]) map[k] = [];
    map[k].push(e);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }
  return map;
}

export function DepartmentCalendar() {
  const { user } = useAuth();
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarViewMode>("month");

  const { data: eventsRaw = [], isLoading, error } = useQuery({
    queryKey: ["requests-calendar"],
    queryFn: () => apiClient<CalendarRequestEvent[]>("/requests/calendar"),
    enabled: !!user && (user.role === "agent" || user.role === "admin"),
  });

  const events = useMemo(() => eventsRaw.filter((e) => e.deadline), [eventsRaw]);
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);
  const visibleDays = useMemo(() => getVisibleDays(anchorDate, view), [anchorDate, view]);
  const title = useMemo(() => headerTitle(anchorDate, view), [anchorDate, view]);
  const gridTransitionKey = useMemo(
    () => calendarTransitionKey(view, anchorDate),
    [view, anchorDate]
  );
  const today = new Date();

  if (!user || (user.role !== "agent" && user.role !== "admin")) {
    return <div className="text-[#6B7280] px-4 py-6">Access denied. Agent or Admin only.</div>;
  }

  if (error) {
    return (
      <div className="px-4 py-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
        {(error as Error).message ?? "Failed to load calendar"}
      </div>
    );
  }

  return (
    <div className="min-h-0 min-w-0 space-y-6 bg-[#F8FAFC] p-4 sm:p-6 md:p-8">
      <CalendarHeader
        title={title}
        view={view}
        onViewChange={setView}
        onPrev={() => setAnchorDate((d) => navigateDate(d, view, -1))}
        onNext={() => setAnchorDate((d) => navigateDate(d, view, 1))}
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5 md:p-6">
        {isLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" aria-hidden />
            <p className="text-sm font-medium">Loading deadlines…</p>
          </div>
        ) : (
          <CalendarGrid
            days={visibleDays}
            eventsByDay={eventsByDay}
            view={view}
            anchorDate={anchorDate}
            today={today}
            transitionKey={gridTransitionKey}
          />
        )}
      </div>
    </div>
  );
}
