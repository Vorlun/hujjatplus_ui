import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchRequestById, updateRequestStatus, getFeedback, suggestResponse, type RequestStatus } from "../api/requests";
import { fetchMessages, sendMessage, type MessagePayload } from "../api/messages";
import { fetchDepartments } from "../api/departments";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  User,
  Loader2,
  Cpu,
  Clock,
  Lightbulb,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

function AdminRequestConversation({
  requestId,
  requesterId,
  currentUserId,
}: {
  requestId: string;
  requesterId: string;
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();
  const [newMessageText, setNewMessageText] = useState("");
  const [suggestedResponseText, setSuggestedResponseText] = useState<string | null>(null);
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages", requestId],
    queryFn: () => fetchMessages(requestId),
  });
  const { data: existingFeedback } = useQuery({
    queryKey: ["feedback", requestId],
    queryFn: () => getFeedback(requestId),
  });
  const addMessageMutation = useMutation({
    mutationFn: () => sendMessage(requestId, newMessageText.trim(), currentUserId!),
    onSuccess: () => {
      setNewMessageText("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["request", requestId] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to send message"),
  });
  const handleSuggestResponse = async () => {
    try {
      const res = await suggestResponse(requestId);
      setSuggestedResponseText(res.suggested_response);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load suggestion");
    }
  };
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
        Conversation
      </h2>
      <ul className="space-y-3">
        {messages.length === 0 && (
          <li className="text-sm text-gray-500 py-2">No messages yet.</li>
        )}
        {messages.map((m: MessagePayload) => {
          const isRequester = m.sender_id === requesterId;
          return (
            <li key={m.id} className={`flex ${isRequester ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                  isRequester ? "bg-gray-100 border border-gray-200" : "bg-[#7C3AED]/10 border border-[#7C3AED]/20"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.message_text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(m.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {currentUserId && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          />
          <button
            type="button"
            onClick={() => newMessageText.trim() && addMessageMutation.mutate()}
            disabled={!newMessageText.trim() || addMessageMutation.isPending}
            className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" />
          Suggested response
        </h3>
        {suggestedResponseText != null ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-[#111827] whitespace-pre-wrap">
            {suggestedResponseText}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSuggestResponse}
            className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-200"
          >
            Get suggested response
          </button>
        )}
      </div>
      {existingFeedback && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
          <span className="font-medium text-[#111827] flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500" />
            User rating: {existingFeedback.rating}/5
          </span>
          {existingFeedback.comment && (
            <p className="text-gray-600 mt-1">{existingFeedback.comment}</p>
          )}
        </div>
      )}
    </section>
  );
}

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

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!id) {
      navigate("/admin/requests");
    }
  }, [id, navigate]);

  if (user?.role !== "admin") return null;
  if (!id) return null;

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
                <dt className="text-gray-500">Intent</dt>
                <dd className="text-[#111827] capitalize">{request.intent ?? "—"}</dd>
                <dt className="text-gray-500">Priority</dt>
                <dd><PriorityBadge priority={request.priority} /></dd>
                <dt className="text-gray-500">Department</dt>
                <dd className="text-[#111827]">{getDeptName(request.department_id)}</dd>
                <dt className="text-gray-500">Requester ID</dt>
                <dd className="text-[#111827] font-mono text-xs">{request.requester_id}</dd>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-[#111827]">{createdStr}</dd>
                {request.deadline && (
                  <>
                    <dt className="text-gray-500">SLA deadline</dt>
                    <dd className="text-[#111827]">
                      {new Date(request.deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      {new Date(request.deadline) > new Date() && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({Math.ceil((new Date(request.deadline).getTime() - Date.now()) / (60 * 60 * 1000))}h left)
                        </span>
                      )}
                    </dd>
                  </>
                )}
                {request.sla_status && (
                  <>
                    <dt className="text-gray-500">SLA status</dt>
                    <dd>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        request.sla_status === "overdue" ? "bg-red-100 text-red-700" :
                        request.sla_status === "warning" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      }`}>
                        {request.sla_status === "overdue" ? "Overdue" : request.sla_status === "warning" ? "Warning" : "On time"}
                      </span>
                    </dd>
                  </>
                )}
              </dl>
            </section>

            {(request.intent != null || request.ai_confidence != null) && (
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#7C3AED]" />
                  AI classification
                </h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {request.intent != null && (
                    <>
                      <dt className="text-gray-500">Intent</dt>
                      <dd className="text-[#111827] capitalize">{request.intent}</dd>
                    </>
                  )}
                  {request.ai_confidence != null && (
                    <>
                      <dt className="text-gray-500">Confidence</dt>
                      <dd className="text-[#111827]">{Math.round((request.ai_confidence as number) * 100)}%</dd>
                    </>
                  )}
                </dl>
              </section>
            )}

            <AdminRequestConversation
              requestId={request.id}
              requesterId={request.requester_id}
              currentUserId={user?.id}
            />
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
              <p className="text-xs text-gray-500">Use the conversation section to reply to the user.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
