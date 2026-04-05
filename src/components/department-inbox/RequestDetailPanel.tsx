import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  MessageSquare,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import type { RequestListItem, RequestStatus } from "../../api/requests";
import { StatusBadge } from "../StatusBadge";
import { PriorityBadge } from "../PriorityBadge";
import type { MessagePayload } from "../../api/messages";
import type { AgentOption } from "./assignmentUtils";

interface RequestDetailPanelProps {
  request: RequestListItem | null;
  assignee: AgentOption | null;
  candidateAgents: AgentOption[];
  onAssign: (agent: AgentOption | null) => void;
  onClose?: () => void;
  showCloseMobile?: boolean;
  messages: MessagePayload[];
  loadingMessages: boolean;
  response: string;
  onResponseChange: (v: string) => void;
  onSendResponse: () => void;
  sendPending: boolean;
  updateMutation: { isPending: boolean };
  onStatusChange: (requestId: string, status: RequestStatus) => void;
}

export function RequestDetailPanel({
  request,
  assignee,
  candidateAgents,
  onAssign,
  onClose,
  showCloseMobile,
  messages,
  loadingMessages,
  response,
  onResponseChange,
  onSendResponse,
  sendPending,
  updateMutation,
  onStatusChange,
}: RequestDetailPanelProps) {
  if (!request) {
    return (
      <div
        className={clsx(
          "hidden min-h-[min(85vh,920px)] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center lg:flex"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <MessageSquare className="h-7 w-7 text-slate-300" aria-hidden />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Select a request</p>
        <p className="mt-1 max-w-[220px] text-xs text-slate-500">
          Choose a row from the queue to view details, assign an agent, and respond.
        </p>
      </div>
    );
  }

  const statusPending = updateMutation.isPending;

  return (
    <div
      key={request.id}
      className={clsx(
        "flex max-h-none flex-col overflow-hidden border border-slate-200/80 bg-white shadow-lg lg:max-h-[min(85vh,920px)] lg:rounded-xl lg:shadow-md",
        "animate-in slide-in-from-right fade-in duration-300 ease-out motion-reduce:animate-none"
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-slate-900">{request.title || "—"}</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{request.id}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {showCloseMobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="space-y-5 px-4 py-4 sm:px-5">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Description</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {request.description || "No description provided."}
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Assigned agent</h4>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {assignee ? (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                    {assignee.name
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{assignee.name}</span>
                </div>
              ) : (
                <span className="inline-flex rounded-full border border-dashed border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  Unassigned
                </span>
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:shadow"
                  >
                    <UserPlus className="h-3.5 w-3.5" aria-hidden />
                    Assign
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    sideOffset={6}
                    className="z-50 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                  >
                    <DropdownMenu.Item
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                      onSelect={() => onAssign(null)}
                    >
                      Unassign
                    </DropdownMenu.Item>
                    {candidateAgents.map((a) => (
                      <DropdownMenu.Item
                        key={a.id}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                        onSelect={() => onAssign(a)}
                      >
                        {a.name}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={statusPending}
              onClick={() => onStatusChange(request.id, "resolved")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {statusPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Resolve
            </button>
            <button
              type="button"
              disabled={statusPending}
              onClick={() => onStatusChange(request.id, "rejected")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-all duration-150 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              type="button"
              disabled={statusPending || request.status === "in_progress"}
              onClick={() => onStatusChange(request.id, "in_progress")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              In progress
            </button>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Update status</h4>
            <select
              value={request.status}
              onChange={(e) => onStatusChange(request.id, e.target.value as RequestStatus)}
              disabled={statusPending}
              className="mt-2 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 transition-all duration-150 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
            >
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              AI classification
            </h4>
            <p className="text-sm capitalize text-slate-700">{request.category || "—"}</p>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Conversation</h4>
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                  U
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">User request</p>
                  <p className="mt-0.5 text-sm text-slate-800">
                    {request.description || request.title || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {loadingMessages ? (
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading conversation…
                </p>
              ) : messages.length === 0 ? (
                <p className="text-xs italic text-slate-500">No responses yet.</p>
              ) : (
                messages.map((m) => {
                  const isUser = m.sender_id === request.requester_id;
                  return (
                    <div key={m.id} className="flex gap-2">
                      <div
                        className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          isUser ? "bg-[#2563EB]" : "bg-emerald-600"
                        )}
                      >
                        {isUser ? "U" : "A"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">
                          {isUser ? "User" : "Agent"} ·{" "}
                          {new Date(m.created_at).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">{m.message_text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Response</h4>
            <textarea
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              placeholder="Type your response to the user…"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all duration-150 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <button
              type="button"
              onClick={onSendResponse}
              disabled={!response.trim() || sendPending}
              className="mt-2 w-full cursor-pointer rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendPending ? "Sending…" : "Send response"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
