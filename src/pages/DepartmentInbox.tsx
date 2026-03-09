import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import {
  fetchDepartmentRequests,
  updateRequestStatus,
  type RequestListItem,
  type RequestStatus,
} from "../api/requests";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Inbox, Search, Filter, FileText, Cpu, GitBranch, Clock, Loader2, MessageSquare } from "lucide-react";
import { TableRowSkeleton } from "../components/ui/Skeleton";

const statusOptions: RequestStatus[] = ["new", "in_progress", "resolved", "rejected"];

export function DepartmentInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const departmentId = user?.department_id ?? "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["department-requests", departmentId],
    queryFn: () => fetchDepartmentRequests(departmentId),
    enabled: !!departmentId && (user?.role === "agent" || user?.role === "admin"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-requests", departmentId] });
    },
  });

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected = selectedId ? requests.find((r) => r.id === selectedId) : null;

  function handleStatusChange(requestId: string, status: RequestStatus) {
    updateMutation.mutate({ id: requestId, status });
    if (selectedId === requestId) setSelectedId(null);
  }

  if (user?.role !== "agent" && user?.role !== "admin") {
    return (
      <div className="text-[#6B7280]">Access denied. Agent or Admin only.</div>
    );
  }

  if (!departmentId && user?.role === "agent") {
    return (
      <div className="text-[#6B7280]">No department assigned.</div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className={`flex-1 flex flex-col min-w-0 ${selected ? "max-w-[58%]" : ""}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#7C3AED]" />
            Department Inbox
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Incoming requests for your department
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
            >
              <option value="all">All status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-2">
            {String(error)}
          </div>
        )}

        <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Request ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Created time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Assigned Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                  : filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedId === r.id ? "bg-[#F5F3FF]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#111827]">{r.id}</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">{r.title}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">—</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-[#6B7280]">No requests</div>
          )}
        </div>
      </div>

      {selected && (
        <div className="w-[400px] flex-shrink-0 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden sticky top-20 self-start">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h3 className="font-semibold text-[#111827]">{selected.title}</h3>
            <p className="text-xs font-mono text-[#6B7280] mt-1">{selected.id}</p>
          </div>
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Content
              </h4>
              <p className="text-sm text-[#111827]">{selected.description || "—"}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Attachments
              </h4>
              <p className="text-sm text-[#6B7280]">No attachments</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> AI Classification
              </h4>
              <p className="text-sm text-[#111827] capitalize">{selected.category || "—"}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Confidence Score
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-[#7C3AED] rounded-full" />
                </div>
                <span className="text-sm font-medium text-[#111827]">~85%</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" /> Routing Info
              </h4>
              <p className="text-sm text-[#111827]">Department: <span className="capitalize">{selected.category}</span></p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Activity Timeline
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="text-[#6B7280]">
                  Created {new Date(selected.created_at).toLocaleString()}
                </li>
                <li className="text-[#6B7280]">Status: {selected.status}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Conversation
              </h4>
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">User request</p>
                    <p className="text-sm text-[#111827] mt-0.5">{selected.description || selected.title || "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {(selected as { department_reply?: string }).department_reply ? (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Department response</p>
                      <p className="text-sm text-[#111827] mt-0.5">{(selected as { department_reply: string }).department_reply}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No response yet.</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Update Status
              </h4>
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(selected.id, e.target.value as RequestStatus)}
                disabled={updateMutation.isPending}
                className="w-full px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                type="button"
                onClick={() => handleStatusChange(selected.id, selected.status)}
                disabled={updateMutation.isPending}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Update Status
              </button>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Response / Comment
              </h4>
              <textarea
                placeholder="e.g. Your issue has been forwarded to IT support."
                rows={3}
                className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
              />
              <p className="text-xs text-gray-500 mt-1">Available when backend supports responses.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
