import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { createRequest } from "../api/requests";
import { ChatInput } from "../components/ChatInput";
import { MessageSquare, Loader2 } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai" | "error";
  text: string;
  createdAt: Date;
  request?: {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    department_id: string;
    departmentName: string;
  };
}

function formatStatus(s: string): string {
  if (s === "new") return "New";
  if (s === "in_progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  if (s === "rejected") return "Rejected";
  return s;
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
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${data.id}`,
          type: "ai",
          text: [
            "Your request has been submitted successfully.",
            "",
            `Request ID: ${data.id}`,
            "",
            `Department: ${deptDisplay}`,
            `Priority: ${data.priority}`,
            `Status: ${formatStatus(data.status)}`,
            "",
            "Your request has been routed to the correct department.",
          ].join("\n"),
          createdAt: new Date(),
          request: {
            id: data.id,
            title: data.title,
            category: data.category,
            priority: data.priority,
            status: data.status,
            department_id: data.department_id,
            departmentName: deptDisplay,
          },
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "error",
          text: "Unable to submit request.\nPlease try again.",
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
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[85%] space-y-3">
                  <div className="px-4 py-3 bg-gray-100 text-[#111827] rounded-2xl rounded-bl-md text-sm border border-gray-200/80 whitespace-pre-line">
                    {m.text}
                  </div>
                  {m.request && (
                    <div className="rounded-xl border border-gray-200 bg-blue-50 p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-[#111827] mb-3">Request Created</h4>
                      <p className="font-mono text-sm font-medium text-[#111827] mb-3">{m.request.id}</p>
                      <dl className="space-y-1.5 text-sm text-gray-700">
                        <div>
                          <dt className="inline font-medium text-gray-500">Department: </dt>
                          <dd className="inline">{m.request.departmentName}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-gray-500">Priority: </dt>
                          <dd className="inline">{m.request.priority}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-gray-500">Status: </dt>
                          <dd className="inline">{formatStatus(m.request.status)}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
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
