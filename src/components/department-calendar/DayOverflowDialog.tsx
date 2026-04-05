import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { X } from "lucide-react";
import clsx from "clsx";
import type { CalendarRequestEvent } from "./types";
import { eventTone, priorityBadgeClass, priorityDotClass } from "./priorityStyles";

interface DayOverflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  events: CalendarRequestEvent[];
}

export function DayOverflowDialog({ open, onOpenChange, date, events }: DayOverflowDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,420px)] max-h-[min(85vh,520px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xl shadow-slate-200/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900">
                {format(date, "EEEE, MMM d, yyyy")}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-slate-500">
                {events.length} request{events.length === 1 ? "" : "s"} due
              </Dialog.Description>
            </div>
            <Dialog.Close
              type="button"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <ul className="max-h-[min(60vh,400px)] space-y-2 overflow-y-auto px-5 py-4">
            {events.map((ev) => {
              const tone = eventTone(ev);
              return (
                <li
                  key={ev.id}
                  className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3 transition-colors hover:border-slate-200"
                >
                  <div className="flex gap-3">
                    <span
                      className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", priorityDotClass(tone))}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-medium text-slate-700">{ev.id}</span>
                        <span
                          className={clsx(
                            "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            priorityBadgeClass(tone)
                          )}
                        >
                          {ev.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                      <p className="text-xs text-slate-500">{ev.department}</p>
                      <p className="text-[11px] text-slate-400">
                        Due {format(new Date(ev.deadline), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
