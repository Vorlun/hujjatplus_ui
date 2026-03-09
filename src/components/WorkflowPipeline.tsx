import {
  MessageSquare,
  Cpu,
  GitBranch,
  Inbox,
  UserCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const steps = [
  { label: "Client Request", icon: MessageSquare, time: "~0s" },
  { label: "AI Classification", icon: Cpu, time: "&lt;1s" },
  { label: "Department Routing", icon: GitBranch, time: "&lt;1s" },
  { label: "Department Inbox", icon: Inbox, time: "Real-time" },
  { label: "Task Assignment", icon: UserCheck, time: "Manual" },
  { label: "Completion", icon: CheckCircle2, time: "—" },
];

export function WorkflowPipeline() {
  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#111827] mb-4">
        Request processing flow
      </h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1 min-w-[100px] p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#7C3AED]/30 transition-colors">
              <step.icon className="w-5 h-5 text-[#7C3AED]" />
              <span className="text-xs font-medium text-[#111827] text-center">
                {step.label}
              </span>
              <span
                className="text-[10px] text-[#6B7280]"
                dangerouslySetInnerHTML={{ __html: step.time }}
              />
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
