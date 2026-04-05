import { useState } from "react";
import { useNavigate } from "react-router";
import clsx from "clsx";
import { Inbox, Eye, FileSearch } from "lucide-react";
import type { RequestListItem } from "../../api/requests";
import { StatusBadge } from "../StatusBadge";
import { PriorityBadge } from "../PriorityBadge";
import { Skeleton } from "../ui/Skeleton";
import { RequestQuickViewDialog } from "./RequestQuickViewDialog";

function TableSkeletonBody({ rows = 6 }: { rows?: number }) {
  return (
    <tbody className="divide-y divide-transparent">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={clsx(i % 2 === 1 && "bg-slate-50/60")}>
          <td className="px-4 py-3.5">
            <Skeleton className="h-4 w-full max-w-[200px]" />
          </td>
          <td className="px-4 py-3.5">
            <Skeleton className="h-5 w-16 rounded-full" />
          </td>
          <td className="px-4 py-3.5">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-4 py-3.5">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-4 py-3.5">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-4 py-3.5 text-right">
            <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

interface RequestsTableProps {
  requests: RequestListItem[];
  isLoading: boolean;
}

export function RequestsTable({ requests, isLoading }: RequestsTableProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RequestListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDetail(r: RequestListItem) {
    setSelected(r);
    setDialogOpen(true);
  }

  return (
    <>
      <div
        className={clsx(
          "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40",
          "animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none"
        )}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Inbox className="h-4 w-4" aria-hidden />
            </span>
            Department Requests
          </h2>
          <button
            type="button"
            onClick={() => navigate("/inbox")}
            className="cursor-pointer self-start text-sm font-semibold text-[#2563EB] transition-all duration-150 hover:text-blue-700 sm:self-auto"
          >
            Open Inbox →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3.5 sm:px-5">Title</th>
                <th className="px-4 py-3.5 sm:px-5">Priority</th>
                <th className="px-4 py-3.5 sm:px-5">Status</th>
                <th className="px-4 py-3.5 sm:px-5">Requester</th>
                <th className="px-4 py-3.5 sm:px-5">Created</th>
                <th className="px-4 py-3.5 pr-5 text-right sm:px-5">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeletonBody />
            ) : requests.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center sm:px-5">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FileSearch className="h-7 w-7" aria-hidden />
                      </span>
                      <p className="mt-4 text-base font-semibold text-slate-800">No requests yet</p>
                      <p className="mt-1 text-sm text-slate-500">
                        When requests are routed to your department, they will show up in this table and
                        in the inbox.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100/80">
                {requests.map((r, index) => (
                  <tr
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetail(r)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetail(r);
                      }
                    }}
                    className={clsx(
                      "cursor-pointer transition-all duration-150 outline-none focus-visible:bg-blue-50/80 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]/25",
                      index % 2 === 1 ? "bg-slate-50/50" : "bg-white",
                      "hover:bg-blue-50/60"
                    )}
                  >
                    <td className="max-w-[220px] px-4 py-3.5 font-medium text-slate-900 sm:max-w-[280px] sm:px-5">
                      <span className="block truncate">{r.title || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 sm:px-5">
                      <span className="block max-w-[140px] truncate">
                        {r.requester_name ?? r.requester_id ?? "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 sm:px-5">
                      {new Date(r.created_at).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openDetail(r)}
                        className="inline-flex cursor-pointer rounded-lg p-2 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800"
                        title="Quick view"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <RequestQuickViewDialog
        request={selected}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) {
            window.setTimeout(() => setSelected(null), 200);
          }
        }}
      />
    </>
  );
}
