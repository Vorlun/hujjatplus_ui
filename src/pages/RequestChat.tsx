import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { createRequest } from "../api/requests";
import { ChatInput } from "../components/ChatInput";
import { MessageSquare, Loader2, Bot, CheckCircle, Copy, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "ai" | "error";
  text: string;
  createdAt: Date;
  request?: {
    id: string;
    title: string;
    category: string;
    intent?: string;
    priority: string;
    status: string;
    department_id: string;
    departmentName: string;
    deadline?: string;
  };
}

function formatStatus(s: string): string {
  if (s === "new") return "New";
  if (s === "in_progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  if (s === "rejected") return "Rejected";
  return s;
}

const statusBadgeClass: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const priorityColorClass: Record<string, string> = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-blue-600",
};

function AICard({
  message,
  onCopyRequestId,
}: {
  message: Message;
  onCopyRequestId: string;
}) {
  const [copied, setCopied] = useState(false);
  const req = message.request!;
  const statusClass = statusBadgeClass[req.status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const priorityClass = priorityColorClass[req.priority] ?? "text-gray-700";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(onCopyRequestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="max-w-[85%] w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-[#7C3AED]" />
        </div>
        <span className="text-sm font-medium text-gray-600">AI Assistant</span>
      </div>

      {/* Main status */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-[#111827]">Request Submitted Successfully</span>
      </div>

      {/* Request details grid */}
      <div className="px-4 pb-4">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Request Details</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="col-span-2 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-gray-500">Request ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-medium text-[#111827]">{req.id}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors"
                title="Copy request ID"
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <div>
            <span className="text-gray-500 block">Department</span>
            <span className="inline-flex items-center gap-1 mt-0.5 rounded-md border px-2 py-0.5 text-xs font-medium bg-[#7C3AED]/5 text-[#7C3AED] border-[#7C3AED]/20">
              <MapPin className="w-3 h-3" />
              {req.departmentName}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Priority</span>
            <span className={`font-medium mt-0.5 ${priorityClass}`}>{req.priority}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Status</span>
            <span className={`inline-flex mt-0.5 rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass}`}>
              {formatStatus(req.status)}
            </span>
          </div>
          {req.intent != null && req.intent !== "" && (
            <div>
              <span className="text-gray-500 block">Intent</span>
              <span className="font-medium mt-0.5 capitalize text-[#111827]">{req.intent}</span>
            </div>
          )}
          {req.deadline != null && (
            <div className="col-span-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Estimated resolution:</span>
              <span className="font-medium text-[#111827]">
                {new Date(req.deadline).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
          {req.priority && (
            <p className="text-sm text-gray-600">
              <strong>Estimated resolution time:</strong>{" "}
              {req.priority === "High" ? "4 hours" : req.priority === "Medium" ? "24 hours" : "72 hours"}.
            </p>
          )}
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
            Your request has been routed to the correct department.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RequestChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);

  const createMutation = useMutation({
    mutationFn: (payload: { text: string; requester_id: string }) =>
      createRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      const depts = queryClient.getQueryData<{ id: string; name: string }[]>(["departments"]) ?? [];
      const departmentName = depts.find((d) => d.id === data.department_id)?.name;
      const deptDisplay = departmentName ?? (data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : "—");
      const estimatedResolution = data.deadline
        ? new Date(data.deadline).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
        : null;
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${data.id}`,
          type: "ai",
          text: [
            "Your request has been submitted successfully.",
            "",
            `Request ID: ${data.id}`,
            `Department: ${deptDisplay}`,
            data.intent ? `Intent: ${data.intent}` : "",
            `Priority: ${data.priority}`,
            estimatedResolution ? `Estimated resolution: ${estimatedResolution}` : "",
            `Status: ${formatStatus(data.status)}`,
            "",
            "Your request has been routed to the correct department.",
          ].filter(Boolean).join("\n"),
          createdAt: new Date(),
          request: {
            id: data.id,
            title: data.title,
            category: data.category,
            intent: data.intent,
            priority: data.priority,
            status: data.status,
            department_id: data.department_id,
            departmentName: deptDisplay,
            deadline: data.deadline,
          },
        },
      ]);
    },
    onError: (err: Error) => {
      const message = err?.message ?? "Unable to submit request. Please try again.";
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          text: message,
          createdAt: new Date(),
        },
      ]);
    },
  });

  function handleSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const requesterId = user?.id ?? "";
    if (!requesterId) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          text: "Unable to submit request. Please sign in again.",
          createdAt: new Date(),
        },
      ]);
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        text: trimmed,
        createdAt: new Date(),
      },
    ]);
    createMutation.mutate({ text: trimmed, requester_id: requesterId });
  }

  const loading = createMutation.isPending;
  const error = createMutation.error;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#7C3AED]" />
          AI Chat
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Send your request. The system will create a ticket and route it to the right department.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          Unable to submit request. Please try again.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm min-h-[440px] flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-14 text-gray-500 text-sm">
              <MessageSquare className="w-14 h-14 mx-auto text-gray-200 mb-4" />
              <p className="font-medium text-gray-600">No messages yet</p>
              <p className="mt-1">Describe your issue below to submit a request.</p>
            </div>
          )}
          {messages.map((m) =>
            m.type === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] px-4 py-3 bg-[#7C3AED] text-white rounded-2xl rounded-br-md text-sm shadow-sm">
                  {m.text}
                </div>
              </div>
            ) : m.type === "error" ? (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 bg-red-50 text-red-700 rounded-2xl rounded-bl-md text-sm border border-red-200 whitespace-pre-line">
                  {m.text}
                </div>
              </div>
            ) : m.request ? (
              <div key={m.id} className="flex justify-start">
                <AICard message={m} onCopyRequestId={m.request.id} />
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 bg-gray-100 text-[#111827] rounded-2xl rounded-bl-md text-sm border border-gray-200/80 whitespace-pre-line">
                  {m.text}
                </div>
              </div>
            )
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md text-sm text-gray-600 border border-gray-200/80">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                Submitting request...
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <ChatInput
            onSubmit={handleSubmit}
            disabled={loading}
            placeholder="Type your request (e.g. kompyuter ishlamayapti, internet ulanish muammosi bor)"
          />
        </div>
      </div>
    </div>
  );
}
