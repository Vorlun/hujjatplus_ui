import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { Inbox } from "lucide-react";
import type { RequestListItem } from "../../api/requests";
import { StatusBadge } from "../StatusBadge";
import { PriorityBadge } from "../PriorityBadge";
import { Skeleton } from "../ui/Skeleton";
import type { AgentOption } from "./assignmentUtils";
import { getDisplayAssignment } from "./assignmentUtils";

function AssigneeCell({
  request,
  overrides,
}: {
  request: RequestListItem;
  overrides: Record<string, AgentOption | null>;
}) {
  const a = getDisplayAssignment(request, overrides);
  if (!a) {
    return (
      <span className="inline-flex rounded-full border border-dashed border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
        Unassigned
      </span>
    );
  }
  const initials = a.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex min-w-0 max-w-[140px] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
        {initials || "?"}
      </span>
      <span className="truncate text-sm text-slate-700">{a.name}</span>
    </div>
  );
}

function TableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <tbody className="divide-y divide-transparent">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={clsx(i % 2 === 1 && "bg-slate-50/50")}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3 sm:px-5">
              <Skeleton className={clsx("h-4", j === 1 ? "w-full max-w-[200px]" : "w-20")} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

interface InboxTableProps {
  requests: RequestListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  assignmentOverrides: Record<string, AgentOption | null>;
}

export function InboxTable({
  requests,
  selectedId,
  onSelect,
  isLoading,
  assignmentOverrides,
}: InboxTableProps) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40",
        "animate-in fade-in duration-300 motion-reduce:animate-none"
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
          <Inbox className="h-4 w-4" aria-hidden />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">Request queue</h2>
        <span className="ml-auto text-xs font-medium text-slate-400">{requests.length} shown</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 sm:px-5">ID</th>
              <th className="px-4 py-3 sm:px-5">Title</th>
              <th className="px-4 py-3 sm:px-5">Priority</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
              <th className="px-4 py-3 sm:px-5">Created</th>
              <th className="px-4 py-3 sm:px-5">Assigned</th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton />
          ) : requests.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center sm:px-5">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Inbox className="h-7 w-7" aria-hidden />
                    </span>
                    <p className="mt-4 text-base font-semibold text-slate-800">No requests</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Nothing matches your filters, or the queue is empty. Try adjusting search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-slate-100/80">
              {requests.map((r, index) => {
                const selected = selectedId === r.id;
                return (
                  <Tooltip.Root key={r.id} delayDuration={300}>
                    <Tooltip.Trigger asChild>
                      <tr
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(r.id);
                          }
                        }}
                        className={clsx(
                          "cursor-pointer transition-all duration-150 outline-none",
                          index % 2 === 1 ? "bg-slate-50/60" : "bg-white",
                          "hover:bg-slate-100/90",
                          selected &&
                            "bg-blue-50/90 ring-1 ring-inset ring-blue-200/70 hover:bg-blue-50"
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 sm:px-5">
                          {r.id.slice(0, 8)}…
                        </td>
                        <td className="max-w-[200px] px-4 py-3 font-medium text-slate-900 sm:max-w-[280px] sm:px-5">
                          <span className="block truncate">{r.title || "—"}</span>
                        </td>
                        <td className="px-4 py-3 sm:px-5">
                          <PriorityBadge priority={r.priority} />
                        </td>
                        <td className="px-4 py-3 sm:px-5">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5">
                          {new Date(r.created_at).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 sm:px-5">
                          <AssigneeCell request={r} overrides={assignmentOverrides} />
                        </td>
                      </tr>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="z-50 max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg"
                      >
                        <p className="font-semibold text-slate-900">{r.title || "Request"}</p>
                        <p className="mt-1 font-mono text-[10px] text-slate-500">{r.id}</p>
                        <Tooltip.Arrow className="fill-white" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
