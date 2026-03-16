import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useAuth } from "../auth/useAuth";
import { apiClient } from "../services/apiClient";

const localizer = momentLocalizer(moment);

interface CalendarRequestEvent {
  id: string;
  title: string;
  department: string;
  priority: string;
  deadline: string;
  status: string;
}

export function DepartmentCalendar() {
  const { user } = useAuth();

  const { data: eventsRaw = [], isLoading, error } = useQuery({
    queryKey: ["requests-calendar"],
    queryFn: () => apiClient<CalendarRequestEvent[]>("/requests/calendar"),
    enabled: !!user && (user.role === "agent" || user.role === "admin"),
  });

  const events = useMemo(
    () =>
      eventsRaw
        .filter((e) => e.deadline)
        .map((e) => {
          const start = new Date(e.deadline);
          const end = new Date(e.deadline);
          return {
            ...e,
            start,
            end,
            title: `${e.id} – ${e.title}`,
          };
        }),
    [eventsRaw]
  );

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
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-[#111827] mb-4">Department Calendar</h1>
      {isLoading ? (
        <div className="text-[#6B7280]">Loading deadlines…</div>
      ) : (
        <div className="h-[600px] bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            eventPropGetter={(event: CalendarRequestEvent & { start: Date; end: Date }) => {
              const now = new Date();
              const deadline = new Date(event.deadline);
              const remainingMs = deadline.getTime() - now.getTime();
              let backgroundColor = "#10B981"; // on_time
              if (remainingMs <= 0) {
                backgroundColor = "#EF4444"; // overdue red
              } else if (remainingMs <= 2 * 60 * 60 * 1000) {
                backgroundColor = "#F59E0B"; // warning yellow
              }
              return {
                style: {
                  backgroundColor,
                  borderRadius: "8px",
                  border: "none",
                  color: "#ffffff",
                  padding: "2px 6px",
                  fontSize: "0.75rem",
                },
              };
            }}
          />
        </div>
      )}
    </div>
  );
}

