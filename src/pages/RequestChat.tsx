import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { createRequest } from "../api/requests";
import { MessageSquare, Loader2, Bot, CheckCircle, Copy, MapPin, Clock, Paperclip, Send } from "lucide-react";
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

type FlowStep =
  | "initial"
  | "urgency"
  | "details"
  | "confirm";

interface ConversationDraft {
  problem: string;
  urgency: "High" | "Medium" | "Low" | null;
  details: string;
}

function formatTime(value: Date): string {
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function parseUrgency(text: string): "High" | "Medium" | "Low" | null {
  const t = text.toLowerCase();
  if (
    /(high|urgent|asap|critical|blocker|immediately|tez|shoshilinch|zudlik)/.test(t)
  ) {
    return "High";
  }
  if (/(medium|normal|soon|o'rta|orta|normal)/.test(t)) {
    return "Medium";
  }
  if (/(low|minor|later|past|pastroq|low priority)/.test(t)) {
    return "Low";
  }
  return null;
}

function isAffirmative(text: string): boolean {
  return /^(yes|y|ha|ok|okay|confirm|tasdiqlayman|create|yarat)/i.test(
    text.trim()
  );
}

function isNegative(text: string): boolean {
  return /^(no|yo'q|yoq|edit|o'zgartir|change|not yet)/i.test(text.trim());
}

function isLikelyNewIssue(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.length > 24 &&
    /(issue|problem|can't|cannot|not working|xato|muammo|ishlamayap|vpn|internet|hujjat|document|login)/.test(
      t
    )
  );
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
    <div className="w-full overflow-hidden rounded-2xl border border-green-200 bg-white shadow-md shadow-green-100/60 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
          🎉 Ticket Created
        </span>
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
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("initial");
  const [draft, setDraft] = useState<ConversationDraft>({
    problem: "",
    urgency: null,
    details: "",
  });
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, aiTyping]);

  const suggestionChips = useMemo(() => {
    if (flowStep === "urgency") {
      return ["High - ish to'xtagan", "Medium - bugun kerak", "Low - keyinroq bo'ladi"];
    }
    if (flowStep === "details") {
      return [
        "Xatolik kodi: 500, login ishlamayapti",
        "Bugun 10:30 dan beri davom etyapti",
        "Chrome va Edge ikkalasida ham kuzatildi",
      ];
    }
    return [
      "Kompyuter ishlamayapti",
      "Ish haqi hujjati kerak",
      "VPN ulanmayapti",
      "HR ma'lumotnomasi kerak",
    ];
  }, [flowStep]);

  function addAIText(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "ai",
        text,
        createdAt: new Date(),
      },
    ]);
  }

  function addAITextWithDelay(text: string, delayMs = 700) {
    setAiTyping(true);
    window.setTimeout(() => {
      setAiTyping(false);
      addAIText(text);
    }, delayMs);
  }

  const createMutation = useMutation({
    mutationFn: (payload: { text: string; requester_id: string }) =>
      createRequest(payload),
    onSuccess: (data) => {
      setAiTyping(false);
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
      setFlowStep("initial");
      setDraft({ problem: "", urgency: null, details: "" });
      addAITextWithDelay("You're all set 🎉 If you have another issue, just send it here.", 350);
    },
    onError: (err: Error) => {
      setAiTyping(false);
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
      addAITextWithDelay(
        "I couldn't create the ticket right now. Got it 👍 I can retry after you confirm.",
        300
      );
      setFlowStep("confirm");
    },
  });

  function submitToAPI(payloadText: string) {
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
    setAiTyping(true);
    createMutation.mutate({ text: payloadText, requester_id: requesterId });
  }

  function handleSubmit(text: string) {
    const trimmed = text.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    if (aiTyping || loading) return;
    if (trimmed.toLowerCase() === lastUserMessage.toLowerCase()) {
      addAITextWithDelay("Got it 👍 I already captured that. Share new info so I can continue.", 300);
      return;
    }
    setLastUserMessage(trimmed);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        text: trimmed,
        createdAt: new Date(),
      },
    ]);

    if (flowStep !== "initial" && isLikelyNewIssue(trimmed) && parseUrgency(trimmed) == null) {
      setDraft({ problem: trimmed, urgency: null, details: "" });
      setFlowStep("urgency");
      addAITextWithDelay(
        "This sounds like a new issue. Thanks, that helps. What urgency should I set: High, Medium, or Low?"
      );
      return;
    }

    if (flowStep === "initial") {
      if (trimmed.length < 8) {
        addAITextWithDelay(
          "Could you share a bit more context? What exactly isn't working?"
        );
        return;
      }
      setDraft((prev) => ({ ...prev, problem: trimmed }));
      setFlowStep("urgency");
      addAITextWithDelay(
        "Got it 👍 How urgent is this issue? Please answer with High, Medium, or Low."
      );
      return;
    }

    if (flowStep === "urgency") {
      const urgency = parseUrgency(trimmed);
      if (!urgency) {
        addAITextWithDelay(
          "Thanks. I still need urgency to continue. Please reply with High, Medium, or Low."
        );
        return;
      }
      setDraft((prev) => ({ ...prev, urgency }));
      setFlowStep("details");
      addAITextWithDelay(
        "Thanks, that helps. Please share key details (when it started, exact error, and impact)."
      );
      return;
    }

    if (flowStep === "details") {
      const urgencyOnly = parseUrgency(trimmed) !== null && trimmed.length < 16;
      if (trimmed.length < 12 || urgencyOnly) {
        addAITextWithDelay(
          "I still need technical/context details (error message, timing, affected system). Please provide a bit more information."
        );
        return;
      }
      const nextDraft = { ...draft, details: trimmed };
      setDraft(nextDraft);
      setFlowStep("confirm");
      addAITextWithDelay(
        [
          "Perfect. Here's what I captured:",
          `• Problem: ${nextDraft.problem}`,
          `• Urgency: ${nextDraft.urgency}`,
          `• Details: ${nextDraft.details}`,
          "",
          "Use the buttons below to create ticket or edit details.",
        ].join("\n")
      );
      return;
    }

    if (flowStep === "confirm") {
      if (isAffirmative(trimmed)) {
        if (!draft.problem || !draft.urgency || !draft.details) {
          addAITextWithDelay(
            "I am missing required information. Let's continue: describe the problem, urgency, and details."
          );
          setFlowStep("initial");
          return;
        }
        const finalText = [
          draft.problem,
          "",
          `Urgency: ${draft.urgency}`,
          `Details: ${draft.details}`,
        ].join("\n");
        submitToAPI(finalText);
        return;
      }
      if (isNegative(trimmed)) {
        setFlowStep("details");
        addAITextWithDelay("No problem. Please provide updated details and I'll revise before creating the ticket.");
        return;
      }
      addAITextWithDelay(
        "Please use Create Ticket or Edit Details so I can continue."
      );
    }
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
        <div ref={scrollerRef} className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="text-center py-14 text-gray-500 text-sm">
              <MessageSquare className="w-14 h-14 mx-auto text-gray-200 mb-4" />
              <p className="font-medium text-gray-600">Start a conversation</p>
              <p className="mt-1">Describe your issue and I will collect required details before creating a ticket.</p>
            </div>
          )}
          {messages.map((m, idx) => {
            const prev = messages[idx - 1];
            const isGrouped =
              !!prev &&
              prev.type === m.type &&
              prev.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ===
                m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
            m.type === "user" ? (
              <div key={m.id} className={`animate-in fade-in slide-in-from-bottom-1 duration-300 flex justify-end ${isGrouped ? "-mt-2" : ""}`}>
                <div className="max-w-[60%]">
                  <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-4 py-3 text-sm text-white shadow-sm">
                    {m.text}
                  </div>
                  {!isGrouped && (
                    <p className="mt-1 pr-1 text-right text-[10px] text-gray-400/80">{formatTime(m.createdAt)}</p>
                  )}
                </div>
              </div>
            ) : m.type === "error" ? (
              <div key={m.id} className={`animate-in fade-in slide-in-from-bottom-1 duration-300 flex justify-start ${isGrouped ? "-mt-2" : ""}`}>
                <div className="max-w-[60%]">
                  <div className="whitespace-pre-line rounded-2xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {m.text}
                  </div>
                  {!isGrouped && (
                    <p className="mt-1 pl-1 text-[10px] text-gray-400/80">{formatTime(m.createdAt)}</p>
                  )}
                </div>
              </div>
            ) : m.request ? (
              <div key={m.id} className={`animate-in fade-in slide-in-from-bottom-1 duration-300 flex justify-start gap-2.5 ${isGrouped ? "-mt-2" : ""}`}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10 shadow-sm">
                  <Bot className="h-4 w-4 text-[#7C3AED]" />
                </div>
                <div className="max-w-[60%]">
                  <AICard message={m} onCopyRequestId={m.request.id} />
                  {!isGrouped && (
                    <p className="mt-1 pl-1 text-[10px] text-gray-400/80">{formatTime(m.createdAt)}</p>
                  )}
                </div>
              </div>
            ) : (
              <div key={m.id} className={`animate-in fade-in slide-in-from-bottom-1 duration-300 flex justify-start gap-2.5 ${isGrouped ? "-mt-2" : ""}`}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10 shadow-sm">
                  <Bot className="h-4 w-4 text-[#7C3AED]" />
                </div>
                <div className="max-w-[60%]">
                  <div className="whitespace-pre-line rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] shadow-sm">
                    {m.text}
                  </div>
                  {!isGrouped && (
                    <p className="mt-1 pl-1 text-[10px] text-gray-400/80">{formatTime(m.createdAt)}</p>
                  )}
                </div>
              </div>
            )
          );})}
          {(loading || aiTyping) && (
            <div className="flex justify-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10">
                <Bot className="h-4 w-4 text-[#7C3AED]" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                <div className="flex items-center gap-2">
                  <span>AI is typing</span>
                  <span className="inline-flex gap-0.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 bg-gray-50/50 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={loading || aiTyping}
                onClick={() => {
                  setSelectedChip(chip);
                  handleSubmit(chip);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 disabled:opacity-50 ${
                  selectedChip === chip
                    ? "border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#6D28D9]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 hover:shadow-sm"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          {flowStep === "confirm" && (
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading || aiTyping}
                onClick={() => handleSubmit("yes")}
                className="rounded-xl bg-[#7C3AED] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6D28D9] disabled:opacity-50"
              >
                Create Ticket
              </button>
              <button
                type="button"
                disabled={loading || aiTyping}
                onClick={() => handleSubmit("no")}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Edit Details
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading && !aiTyping) {
                handleSubmit(input);
                setInput("");
                setSelectedChip(null);
              }
            }}
            className="flex items-end gap-2"
          >
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-gray-500 transition hover:bg-gray-50 hover:text-[#7C3AED]"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              disabled={loading || aiTyping}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && !aiTyping && input.trim()) {
                    handleSubmit(input);
                    setInput("");
                    setSelectedChip(null);
                  }
                }
              }}
              rows={1}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || aiTyping || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading || aiTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
