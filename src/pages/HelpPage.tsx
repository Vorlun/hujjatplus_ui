import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  HelpCircle,
  MessageSquare,
  ListTodo,
  Download,
  Search,
  Sparkles,
  Bot,
  Send,
  Route,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Lightbulb,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: Send,
    title: "Submit your issue",
    body: "Start in AI Chat or Create Request. Describe the problem in plain language and send.",
  },
  {
    step: 2,
    icon: Bot,
    title: "AI understands context",
    body: "The assistant detects urgency, intent, and category to structure your ticket clearly.",
  },
  {
    step: 3,
    icon: Route,
    title: "Routed to right team",
    body: "Your request is automatically sent to the correct department for faster response.",
  },
  {
    step: 4,
    icon: ListTodo,
    title: "Track progress & responses",
    body: "Open My Requests anytime to monitor status, SLA, timeline, and department replies.",
  },
];

const faqItems = [
  {
    q: "How to submit a request?",
    a: "Open AI Chat, describe your issue, confirm details, and create the ticket. You can also use Create Request from Dashboard.",
  },
  {
    q: "How long does it take?",
    a: "Response time depends on priority and department load. High priority requests are handled first, with SLA guidance shown in details.",
  },
  {
    q: "Can I upload files?",
    a: "Yes. Use Documents upload or attach links/files in conversation where available. Images and file links are supported in request threads.",
  },
  {
    q: "How to track status?",
    a: "Go to My Requests, open any ticket, and review status badges, timeline steps, and latest agent activity.",
  },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaq = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <HelpCircle className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111827] md:text-3xl">Help Center</h1>
            <p className="mt-1 text-sm text-gray-500">Learn how to use the support platform</p>
          </div>
        </div>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles, workflows, or common questions..."
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-[#111827] focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quick actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="inline-flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-sm font-semibold text-violet-700 transition hover:shadow-sm"
          >
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Start AI Chat
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:shadow-sm"
          >
            <span className="inline-flex items-center gap-2">
              <Send className="h-4 w-4" />
              Create Request
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-requests")}
            className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:shadow-sm"
          >
            <span className="inline-flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              View My Requests
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#111827]">Step-by-step guide</h2>
        <p className="mt-1 text-sm text-gray-500">From reporting an issue to tracking final resolution.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    Step {s.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#111827]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#111827]">Frequently asked questions</h2>
        <p className="mt-1 text-sm text-gray-500">Quick answers to common support questions.</p>
        <div className="mt-4 space-y-2">
          {filteredFaq.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left transition hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-[#111827]">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
          {filteredFaq.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
              No FAQ matches your search yet.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-base font-semibold text-[#111827]">
            <PlayCircle className="h-5 w-5 text-violet-600" />
            Watch demo
          </h3>
          <div className="mt-3 flex h-44 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gradient-to-br from-violet-50 to-blue-50 text-sm text-gray-600">
            Video walkthrough placeholder
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-base font-semibold text-[#111827]">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Pro tips
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="inline-flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-violet-500" />
              Add clear error messages/screenshots for faster resolution.
            </li>
            <li className="inline-flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-violet-500" />
              Use AI Chat for issue triage and automatic routing.
            </li>
            <li className="inline-flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-violet-500" />
              Track every request in My Requests with status timeline.
            </li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#111827] mb-4">Resources</h2>
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
            onClick={() => navigate("/documents")}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 hover:border-[#7C3AED]/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center group-hover:bg-[#7C3AED]/20">
              <Download className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="font-medium text-[#111827]">Documents</p>
              <p className="text-xs text-gray-500">Browse shared files and templates</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
