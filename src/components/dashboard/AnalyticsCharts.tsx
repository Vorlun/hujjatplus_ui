import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { buildCategoryDonutData, type RequestForChart } from "../../utils/chartData";
import { FileText, TrendingUp } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#3B82F6",
  in_progress: "#F59E0B",
  resolved: "#10B981",
  new: "#3B82F6",
  rejected: "#EF4444",
};

export interface AnalyticsChartsProps {
  requests: RequestForChart[];
  departmentIdToName?: Map<string, string>;
  isLoading?: boolean;
}

function buildStatusBarData(requests: RequestForChart[]): { name: string; count: number; fill: string }[] {
  const pending = requests.filter((r) => r.status === "new").length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const resolved = requests.filter((r) => r.status === "resolved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  return [
    { name: "Pending", count: pending, fill: STATUS_COLORS.pending },
    { name: "In Progress", count: inProgress, fill: STATUS_COLORS.in_progress },
    { name: "Resolved", count: resolved, fill: STATUS_COLORS.resolved },
    ...(rejected > 0 ? [{ name: "Rejected", count: rejected, fill: STATUS_COLORS.rejected }] : []),
  ];
}

function buildRequestsOverTime(requests: RequestForChart[]): { month: string; requests: number }[] {
  const now = new Date();
  const result: { month: string; requests: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = MONTH_NAMES[d.getMonth()];
    const count = requests.filter((r) => r.created_at.slice(0, 7) === monthKey).length;
    result.push({ month: monthLabel, requests: count });
  }
  return result;
}

export function AnalyticsCharts({ requests, departmentIdToName, isLoading }: AnalyticsChartsProps) {
  const pieData = buildCategoryDonutData(requests, departmentIdToName);
  const statusData = buildStatusBarData(requests);
  const lineData = buildRequestsOverTime(requests);
  const totalRequests = requests.length;
  const hasPieData = pieData.length > 0 && !(pieData.length === 1 && pieData[0].name === "Ma'lumot yo'q");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Department — Pie */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#111827] mb-1">Requests by Department</h3>
          <p className="text-sm text-gray-500 mb-4">Distribution across departments</p>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center rounded-lg bg-gray-50 animate-pulse" />
            ) : !hasPieData ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium">No data yet</p>
                <p className="text-xs mt-1">Requests will appear by department</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: { payload: { count?: number } }) =>
                      [`${value}%`, props.payload.count != null ? `Count: ${props.payload.count}` : name]
                    }
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Requests by Status — Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#111827] mb-1">Requests by Status</h3>
          <p className="text-sm text-gray-500 mb-4">Pending, in progress, resolved</p>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center rounded-lg bg-gray-50 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [value, "Count"]}
                  />
                  <Bar dataKey="count" name="Requests" radius={[6, 6, 0, 0]} fill="#7C3AED" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Requests Over Time — Line */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#111827] mb-1">Requests Over Time</h3>
          <p className="text-sm text-gray-500 mb-4">Last 6 months</p>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center rounded-lg bg-gray-50 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [value, "Requests"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    name="Requests"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={{ fill: "#7C3AED", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Total Requests Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center">
          <h3 className="text-base font-semibold text-[#111827] mb-1">Total Requests Summary</h3>
          <p className="text-sm text-gray-500 mb-4">All-time request count</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#111827] tabular-nums">
                {isLoading ? "—" : totalRequests.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Total requests</p>
              {!isLoading && lineData.length > 0 && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Last 6 months trend in chart
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
