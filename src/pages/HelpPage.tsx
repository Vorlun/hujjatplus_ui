import { useNavigate } from "react-router";
import { HelpCircle, MessageSquare, FileText, ListTodo, Download } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "How to submit a request",
    body: "Submit your request using AI Chat or the Quick Request panel on the Dashboard. Type your issue and send; the system will create a ticket automatically.",
  },
  {
    step: 2,
    title: "How AI routing works",
    body: "AI automatically detects the category and department from your message. Your request is then routed to the correct team without manual assignment.",
  },
  {
    step: 3,
    title: "How to track request status",
    body: "Your request is routed to the right department. Track progress in My Requests. Open any request to see the full timeline and status.",
  },
  {
    step: 4,
    title: "How to download documents",
    body: "Go to the Documents page to view helpful documents by department. Use the Download link on each row to open or save the file.",
  },
];

export function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#7C3AED]" />
          Help
        </h1>
        <p className="text-sm text-gray-500 mt-1">Learn how to use the support platform</p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <div
            key={s.step}
            className="rounded-xl border border-gray-200 bg-white shadow-sm p-6"
          >
            <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wide mb-2">
              Step {s.step}
            </p>
            <h2 className="text-base font-semibold text-[#111827] mb-2">{s.title}</h2>
            <p className="text-sm text-gray-600">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 hover:border-[#7C3AED]/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center group-hover:bg-[#7C3AED]/20">
              <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="font-medium text-[#111827]">AI Chat</p>
              <p className="text-xs text-gray-500">Submit a new request</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-requests")}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 hover:border-[#7C3AED]/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center group-hover:bg-[#7C3AED]/20">
              <ListTodo className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="font-medium text-[#111827]">My Requests</p>
              <p className="text-xs text-gray-500">Track your requests</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("/documents")}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 hover:border-[#7C3AED]/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center group-hover:bg-[#7C3AED]/20">
              <Download className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="font-medium text-[#111827]">Documents</p>
              <p className="text-xs text-gray-500">View and download</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
