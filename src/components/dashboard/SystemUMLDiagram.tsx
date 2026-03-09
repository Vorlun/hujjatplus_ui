import { MessageSquare, Cpu, GitBranch, Building2, LayoutDashboard, CheckCircle } from "lucide-react";

const NODES = [
  { id: "1", label: "User Request", icon: MessageSquare, desc: "User submits request via chat or form" },
  { id: "2", label: "AI NLP Classifier", icon: Cpu, desc: "Processes and analyzes the message" },
  { id: "3", label: "Detect Domain + Intent", icon: GitBranch, desc: "Identifies department and request type" },
  { id: "4", label: "Route to Department", icon: Building2, desc: "Assigns to correct team" },
  { id: "5", label: "Admin Dashboard", icon: LayoutDashboard, desc: "Monitor and manage requests" },
  { id: "6", label: "Update Request Status", icon: CheckCircle, desc: "Resolve, reject, or track progress" },
];

export function SystemUMLDiagram() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#111827] mb-2">System Workflow (UML)</h2>
      <p className="text-sm text-gray-500 mb-8">
        How requests flow from submission to resolution
      </p>
      <div className="flex flex-col items-center max-w-md mx-auto">
        {NODES.map((node, index) => {
          const Icon = node.icon;
          return (
            <div key={node.id} className="flex flex-col items-center w-full">
              {/* Node card */}
              <div className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-[#7C3AED]/40 transition-colors px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#111827]">{node.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{node.desc}</p>
                  </div>
                </div>
              </div>
              {/* Arrow down (except after last node) */}
              {index < NODES.length - 1 && (
                <div className="flex flex-col items-center py-2">
                  <div className="w-0.5 h-6 bg-gray-300 rounded-full" />
                  <svg
                    className="w-5 h-5 text-gray-400 -mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 011.414-1.414L10 11.586l3.293-3.293a1 1 0 011.414 1.414l-4 4A1 1 0 0110 14z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
