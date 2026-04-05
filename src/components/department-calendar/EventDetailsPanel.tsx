import type { CalendarRequestEvent } from "./types";

/** Shared minimal detail block for hover card / popover */
export function EventDetailsPanel({ event }: { event: CalendarRequestEvent }) {
  return (
    <dl className="space-y-2 text-slate-600">
      <div>
        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Request ID</dt>
        <dd className="mt-0.5 font-mono text-xs text-slate-900">{event.id}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Title</dt>
        <dd className="mt-0.5 font-medium leading-snug text-slate-900">{event.title}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Department</dt>
        <dd className="mt-0.5 text-xs">{event.department}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Priority</dt>
        <dd className="mt-0.5 text-xs">{event.priority}</dd>
      </div>
    </dl>
  );
}
