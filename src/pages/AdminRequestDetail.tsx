import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchRequestById, updateRequestStatus, type RequestStatus } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  User,
  Loader2,
} from "lucide-react";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export function AdminRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ["request", id],
    queryFn: () => fetchRequestById(id!),
    enabled: !!id && user?.role === "admin",
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const updateMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: RequestStatus }) =>
      updateRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["department-requests"] });
    },
  });

  const getDeptName = (deptId: string) => departments.find((d) => d.id === deptId)?.name ?? deptId;

  if (user?.role !== "admin") {
    navigate("/admin");
    return null;
  }

  if (!id) {
    navigate("/admin/requests");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] gap-2 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error ? String(error) : "Request not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/admin/requests")}
          className="text-[#7C3AED] hover:underline"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const createdStr = new Date(request.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const departmentReply = (request as { department_reply?: string }).department_reply;

  return (
    <div className="max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/requests")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#111827] text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#111827]">{request.title || "Untitled request"}</h1>
              <p className="text-sm font-mono text-gray-500 mt-1">Request ID: {request.id}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 p-6 space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</h2>
              <p className="text-[#111827]">{request.description || "—"}</p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <h2 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7C3AED]" />
                Request information
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-[#111827] capitalize">{request.category ?? "—"}</dd>
                <dt className="text-gray-500">Priority</dt>
                <dd><PriorityBadge priority={request.priority} /></dd>
                <dt className="text-gray-500">Department</dt>
                <dd className="text-[#111827]">{getDeptName(request.department_id)}</dd>
                <dt className="text-gray-500">Requester ID</dt>
                <dd className="text-[#111827] font-mono text-xs">{request.requester_id}</dd>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-[#111827]">{createdStr}</dd>
              </dl>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-[#111827] mb-3">Conversation</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">User request</p>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl rounded-tl-none text-sm text-[#111827]">
                      {request.title || request.description || "—"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{createdStr}</p>
                  </div>
                </div>
                {departmentReply ? (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Department response</p>
                      <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl rounded-tl-none text-sm text-[#111827]">
                        {departmentReply}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 italic">No department response yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-gray-200 p-6 bg-gray-50/30">
            <h2 className="text-sm font-semibold text-[#111827] mb-4">Admin actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={request.status}
                  onChange={(e) => updateMutation.mutate({ requestId: request.id, status: e.target.value as RequestStatus })}
                  disabled={updateMutation.isPending}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => updateMutation.mutate({ requestId: request.id, status: "resolved" })}
                  disabled={updateMutation.isPending || request.status === "resolved"}
                  className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Mark Resolved
                </button>
                <button
                  type="button"
                  onClick={() => updateMutation.mutate({ requestId: request.id, status: "rejected" })}
                  disabled={updateMutation.isPending || request.status === "rejected"}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Request
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Response / Comment</label>
                <textarea
                  placeholder="e.g. Your issue has been forwarded to IT support."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                />
                <p className="text-xs text-gray-500 mt-1">Save when backend supports responses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
