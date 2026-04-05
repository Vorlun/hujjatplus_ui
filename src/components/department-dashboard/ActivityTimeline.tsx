import clsx from "clsx";
import { Clock, MessageSquare } from "lucide-react";
import type { RequestListItem } from "../../api/requests";
import { StatusBadge } from "../StatusBadge";
import { Skeleton } from "../ui/Skeleton";

function TimelineSkeleton() {
  return (
    <div className="space-y-0 pl-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 pb-6 last:pb-0">
          <Skeleton className="mt-1 h-3 w-3 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ActivityTimelineProps {
  items: RequestListItem[];
  isLoading: boolean;
}

export function ActivityTimeline({ items, isLoading }: ActivityTimelineProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200/80 bg-white p-4 shadow-md shadow-slate-200/40 sm:p-5",
        "animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none"
      )}
    >
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
          <Clock className="h-4 w-4" aria-hidden />
        </span>
        Recent activity
      </h2>
      <p className="mt-1 text-xs text-slate-500">Latest updates in your queue</p>

      <div className="mt-6">
        {isLoading ? (
          <TimelineSkeleton />
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
            <p className="mt-2 text-sm font-medium text-slate-600">No activity yet</p>
            <p className="mt-1 text-xs text-slate-500">New requests will appear in this timeline.</p>
          </div>
        ) : (
          <div className="relative pl-1">
            <div
              className="absolute bottom-3 left-[11px] top-3 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"
              aria-hidden
            />
            <ul className="relative space-y-0">
              {items.map((r) => (
                <li key={r.id} className="relative flex gap-4 pb-6 last:pb-0">
                  <div className="relative z-[1] flex w-6 shrink-0 justify-center pt-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] shadow-sm ring-4 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{r.title || "Request"}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                        {new Date(r.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
