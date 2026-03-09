import { LayoutDashboard } from "lucide-react";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { SystemUMLDiagram } from "./SystemUMLDiagram";
import type { RequestForChart } from "../../utils/chartData";

export interface AdminDashboardProps {
  requests: RequestForChart[];
  departmentIdToName?: Map<string, string>;
  isLoading?: boolean;
}

export function AdminDashboard({ requests, departmentIdToName, isLoading }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-[#7C3AED]" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          System analytics and workflow overview
        </p>
      </div>

      {/* Top section — Analytics charts */}
      <AnalyticsCharts
        requests={requests}
        departmentIdToName={departmentIdToName}
        isLoading={isLoading}
      />

      {/* Lower section — UML workflow diagram */}
      <SystemUMLDiagram />
    </div>
  );
}
