import { useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import type { CalendarRequestEvent, CalendarViewMode } from "./types";
import { EventItem } from "./EventItem";
import { DayOverflowDialog } from "./DayOverflowDialog";
import { isInDisplayedMonth, isSameDay } from "./calendarDates";

const MAX_VISIBLE_COMPACT = 2;

interface DayCellProps {
  date: Date;
  events: CalendarRequestEvent[];
  view: CalendarViewMode;
  anchorDate: Date;
  today: Date;
}

export function DayCell({ date, events, view, anchorDate, today }: DayCellProps) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const isToday = isSameDay(date, today);
  const inMonth = view === "month" ? isInDisplayedMonth(date, anchorDate) : true;
  const maxVisible = view === "day" ? events.length : MAX_VISIBLE_COMPACT;
  const visible = events.slice(0, maxVisible);
  const hiddenCount = events.length - visible.length;

  return (
    <>
      <div
        className={clsx(
          "flex min-h-0 flex-col rounded-xl border bg-white p-2 shadow-sm shadow-slate-200/30 transition-all duration-150",
          "md:p-2.5",
          inMonth ? "border-slate-200/80 hover:bg-gray-50" : "border-slate-100 bg-slate-50/70 opacity-70 hover:bg-gray-50/80",
          isToday && "ring-2 ring-blue-500 ring-offset-2 ring-offset-white",
          view === "day" && "min-h-[280px] md:min-h-[320px]"
        )}
      >
        <div className="mb-1 flex items-baseline justify-between gap-1">
          {isToday ? (
            <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-blue-50 px-1 text-xs font-semibold tabular-nums text-blue-700">
              {format(date, "d")}
            </span>
          ) : (
            <span
              className={clsx(
                "text-xs font-semibold tabular-nums",
                inMonth ? "text-slate-800" : "text-slate-400"
              )}
            >
              {format(date, "d")}
            </span>
          )}
        </div>
        <div
          className={clsx(
            "flex min-h-0 flex-1 flex-col gap-1",
            view === "day" ? "max-h-[min(60vh,520px)] overflow-y-auto pr-0.5" : "overflow-hidden"
          )}
        >
          {visible.map((ev) => (
            <EventItem key={ev.id} event={ev} />
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setOverflowOpen(true)}
              className={clsx(
                "w-full cursor-pointer truncate rounded-full border border-dashed border-slate-200/90 bg-slate-50/90 py-0.5 text-center text-xs font-medium text-slate-600 transition-all duration-150",
                "hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
              )}
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      </div>
      <DayOverflowDialog
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
        date={date}
        events={events}
      />
    </>
  );
}
