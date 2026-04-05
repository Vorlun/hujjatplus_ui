import clsx from "clsx";
import type { CalendarRequestEvent, CalendarViewMode } from "./types";
import { WEEKDAY_LABELS, dayKey } from "./calendarDates";
import { DayCell } from "./DayCell";

interface CalendarGridProps {
  days: Date[];
  eventsByDay: Record<string, CalendarRequestEvent[]>;
  view: CalendarViewMode;
  anchorDate: Date;
  today: Date;
  /** Changes when the visible period changes — drives enter animation */
  transitionKey: string;
}

export function CalendarGrid({
  days,
  eventsByDay,
  view,
  anchorDate,
  today,
  transitionKey,
}: CalendarGridProps) {
  return (
    <div className="space-y-2 md:space-y-3">
      {view !== "day" && (
        <div className="grid grid-cols-7 gap-1.5 md:gap-2" role="row" aria-hidden>
          {WEEKDAY_LABELS.map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs"
            >
              {d}
            </div>
          ))}
        </div>
      )}

      <div
        key={transitionKey}
        className={clsx(
          "grid gap-1.5 md:gap-2",
          "animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none motion-reduce:opacity-100",
          view === "day" ? "grid-cols-1" : "grid-cols-7 auto-rows-[minmax(5.5rem,1fr)]",
          view === "month" && "min-h-[min(70vh,640px)]",
          view === "week" && "min-h-[min(50vh,480px)]"
        )}
      >
        {days.map((d) => {
          const key = dayKey(d);
          const dayEvents = eventsByDay[key] ?? [];
          return (
            <DayCell
              key={key}
              date={d}
              events={dayEvents}
              view={view}
              anchorDate={anchorDate}
              today={today}
            />
          );
        })}
      </div>
    </div>
  );
}
