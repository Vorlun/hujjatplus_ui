import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, Shield } from "lucide-react";
import { fetchAllRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { buildMonthlyBarData } from "../utils/chartData";
import { Skeleton } from "../components/ui/Skeleton";

const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function Reports() {
  const { data: requests = [], isLoading } = useQuery({ queryKey: ["requests"], queryFn: fetchAllRequests });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });

  const resolvedCount = requests.filter((r) => r.status === "resolved").length;
  const monthlyData = buildMonthlyBarData(requests);
  const requestsPerMonth = monthlyData.map((d) => ({
    month: d.month,
    total: d.completed + d.pending + d.overdue,
    resolved: d.completed,
  }));

  const byDept = departments.map((d) => ({
    name: d.name,
    count: requests.filter((r) => r.department_id === d.id).length,
    fill: COLORS[departments.indexOf(d) % COLORS.length],
  })).filter((d) => d.count > 0);
  const deptBarData = byDept.length ? byDept : [{ name: "No data", count: 0, fill: "#E5E7EB" }];

  const priorityData = [
    { name: "High", value: requests.filter((r) => r.priority === "High").length, fill: "#EF4444" },
    { name: "Medium", value: requests.filter((r) => r.priority === "Medium").length, fill: "#F59E0B" },
    { name: "Low", value: requests.filter((r) => r.priority === "Low").length, fill: "#6B7280" },
  ].filter((d) => d.value > 0);
  const donutData = priorityData.length ? priorityData : [{ name: "No data", value: 1, fill: "#E5E7EB" }];

  const resolutionTrend = monthlyData.map((d) => ({
    month: d.month,
    resolved: d.completed,
    total: d.completed + d.pending + d.overdue,
  }));

  const slaPercent = requests.length ? Math.round((resolvedCount / requests.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#7C3AED]" />
          Reports & Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Key performance metrics and trends</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
          <p className="text-2xl font-semibold text-[#111827] mt-1">{requests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Resolved Requests</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{resolvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Average Resolution Time</p>
          <p className="text-2xl font-semibold text-[#111827] mt-1">2.4h</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">AI Accuracy</p>
          <p className="text-2xl font-semibold text-[#7C3AED] mt-1">98%</p>
        </div>
      </div>

      {/* SLA compliance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[#7C3AED]" />
          <h3 className="text-base font-semibold text-[#111827]">SLA Compliance</h3>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#7C3AED] transition-all duration-500"
                style={{ width: `${slaPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Target: 95% — Current: {slaPercent}%</p>
          </div>
          <p className="text-2xl font-bold text-[#7C3AED] tabular-nums">{slaPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests per month - line chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Requests per month</h3>
          <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : (
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={requestsPerMonth} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED" }} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Priority distribution - donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Priority distribution</h3>
          <p className="text-sm text-gray-500 mt-1">By priority level</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : (
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={donutData[i].fill} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department workload - bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Department workload</h3>
          <p className="text-sm text-gray-500 mt-1">Requests by department</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : (
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBarData} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                    {deptBarData.map((_, i) => (
                      <Cell key={i} fill={deptBarData[i].fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Resolution time trend - area chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Resolution time trend</h3>
          <p className="text-sm text-gray-500 mt-1">Resolved requests per month</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : (
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resolutionTrend} margin={{ left: 8, right: 8 }}>
                  <defs>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" fill="url(#resolvedGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
