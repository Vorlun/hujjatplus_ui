import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router";
import { X, ExternalLink } from "lucide-react";
import clsx from "clsx";
import type { RequestListItem } from "../../api/requests";
import { StatusBadge } from "../StatusBadge";
import { PriorityBadge } from "../PriorityBadge";

interface RequestQuickViewDialogProps {
  request: RequestListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestQuickViewDialog({ request, open, onOpenChange }: RequestQuickViewDialogProps) {
  const navigate = useNavigate();

  if (!request) return null;

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
            "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] max-h-[min(90vh,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
            "rounded-2xl border border-slate-200/90 bg-white p-0 shadow-xl shadow-slate-200/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-semibold leading-snug text-slate-900">
                {request.title || "Untitled request"}
              </Dialog.Title>
              <p className="mt-1 font-mono text-xs text-slate-500">{request.id}</p>
            </div>
            <Dialog.Close
              type="button"
              className="shrink-0 rounded-lg p-2 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Requester</dt>
                <dd className="mt-0.5 text-slate-800">
                  {request.requester_name ?? request.requester_id ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Category</dt>
                <dd className="mt-0.5 text-slate-800">{request.category || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Created</dt>
                <dd className="mt-0.5 text-slate-800">
                  {new Date(request.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              {request.description ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</dt>
                  <dd className="mt-0.5 line-clamp-4 text-slate-600">{request.description}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50"
              >
                Close
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                navigate("/inbox");
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-600 hover:shadow-md"
            >
              Open in Inbox
              <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
