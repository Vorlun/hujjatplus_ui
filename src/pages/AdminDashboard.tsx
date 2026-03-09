import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { RequestCard } from "../components/RequestCard";
import { PriorityBadge } from "../components/PriorityBadge";
import { Skeleton } from "../components/ui/Skeleton";
import { SystemUMLDiagram } from "../components/dashboard/SystemUMLDiagram";
import { buildMonthlyBarData, buildCategoryDonutData } from "../utils/chartData";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Download,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Cpu,
  GitBranch,
  Inbox,
  UserCheck,
  ChevronRight,
  ListTodo,
  Clock,
  Activity,
  Gauge,
  Users,
  ArrowRight,
} from "lucide-react";

const METRIC_CARDS = [
  {
    key: "total",
    title: "Total Requests",
    trend: "All requests",
    icon: FileText,
    iconBg: "bg-[#7C3AED]/10",
    iconColor: "text-[#7C3AED]",
  },
  {
    key: "incoming",
    title: "New",
    trend: "Pending review",
    icon: Download,
    iconBg: "bg-[#3B82F6]/10",
    iconColor: "text-[#3B82F6]",
  },
  {
    key: "inProgress",
    title: "In Progress",
    trend: "Being handled",
    icon: CheckSquare,
    iconBg: "bg-[#F59E0B]/10",
    iconColor: "text-[#F59E0B]",
  },
  {
    key: "overdue",
    title: "Overdue",
    trend: "Rejected / overdue",
    icon: AlertCircle,
    iconBg: "bg-[#EF4444]/10",
    iconColor: "text-[#EF4444]",
  },
  {
    key: "completed",
    title: "Completed",
    trend: "Resolved",
    icon: CheckCircle,
    iconBg: "bg-[#10B981]/10",
    iconColor: "text-[#10B981]",
  },
] as const;

const WORKFLOW_STEPS = [
  { icon: MessageSquare, title: "Client Request", desc: "User submits request", time: "0s" },
  { icon: Cpu, title: "AI Classification", desc: "Detect category", time: "1.2s" },
  { icon: GitBranch, title: "Department Routing", desc: "Route to department", time: "0.5s" },
  { icon: Inbox, title: "Department Inbox", desc: "Add to queue", time: "0.2s" },
  { icon: UserCheck, title: "Task Assignment", desc: "Assign to team", time: "~5m" },
  { icon: CheckCircle, title: "Completion", desc: "Process & archive", time: "~24h" },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
    enabled: user?.role === "admin",
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled: user?.role === "admin",
  });
  const error = queryError ? String(queryError) : "";

  if (user?.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const totalDocs = requests.length;
  const incoming = requests.filter((r) => r.status === "new").length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const overdue = requests.filter((r) => r.status === "rejected").length;
  const completed = requests.filter((r) => r.status === "resolved").length;

  const metricValues = {
    total: totalDocs,
    incoming,
    inProgress,
    overdue,
    completed,
  };

  const monthlyBarData = buildMonthlyBarData(requests);
  const deptIdToName = new Map(departments.map((d) => [d.id, d.name]));
  const donutData = buildCategoryDonutData(requests, deptIdToName);
  const hasChartData = monthlyBarData.some((m) => m.completed + m.pending + m.overdue > 0);

  const totalTasks = totalDocs;
  const completedCount = completed;
  const pendingCount = incoming + inProgress;
  const overdueCount = overdue;
  const avgCompletionPct =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 1000) / 10 : 0;

  const recentRequests = requests.slice(0, 5);
  const deptCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.department_id] = (acc[r.department_id] ?? 0) + 1;
    return acc;
  }, {});
  const topDeptId = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topDeptName = topDeptId ? departments.find((d) => d.id === topDeptId)?.name ?? null : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-[#7C3AED]" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          System overview and requests
        </p>
      </div>

      {error && (
        <div className="text-sm text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Section 1 — Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon;
          const value = metricValues[card.key];
          return (
            <div
              key={card.key}
              className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md hover:border-[#E5E7EB]/80 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">{card.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#111827] tabular-nums">
                    {loading ? "—" : value}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-gray-500">{card.trend}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2 — Bar chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">Monthly Task Statistics</h3>
              <p className="text-sm text-gray-500 mt-1">Task completion trends over the last 6 months</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 rounded-full px-3 py-1 text-sm font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {loading ? "—" : `${avgCompletionPct}%`} avg completion
            </span>
          </div>
          <div className="h-[300px]">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : !hasChartData ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-sm font-medium">No data yet</p>
                <p className="text-xs mt-1">Charts will populate when requests exist</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData} margin={{ top: 20, right: 20, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.6} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB", strokeOpacity: 0.8 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "12px 16px",
                    }}
                    formatter={(value: number) => [value, ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {!loading && hasChartData && (
            <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-[#E5E7EB]/80">
              <span className="inline-flex items-center gap-2 text-sm text-[#374151]">
                <span className="w-3 h-3 rounded-sm bg-[#10b981]" /> Completed
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-[#374151]">
                <span className="w-3 h-3 rounded-sm bg-[#3b82f6]" /> Pending
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-[#374151]">
                <span className="w-3 h-3 rounded-sm bg-[#ef4444]" /> Overdue
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-6 pt-6 border-t border-[#E5E7EB]">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="mt-1.5 text-2xl font-semibold text-[#111827] tabular-nums">
                {loading ? "—" : totalTasks.toLocaleString()}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="mt-1.5 text-2xl font-semibold text-[#10b981] tabular-nums">
                {loading ? "—" : completedCount.toLocaleString()}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="mt-1.5 text-2xl font-semibold text-[#3b82f6] tabular-nums">
                {loading ? "—" : pendingCount.toLocaleString()}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="mt-1.5 text-2xl font-semibold text-[#ef4444] tabular-nums">
                {loading ? "—" : overdueCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-[#111827]">Department Document Distribution</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution by department</p>
          <div className="mt-6 h-[340px]">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : donutData.length === 0 || (donutData.length === 1 && donutData[0].name === "Ma'lumot yo'q") ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-sm font-medium">No data yet</p>
                <p className="text-xs mt-1">Charts will populate when requests exist</p>
              </div>
            ) : (
              <div className="flex items-center gap-12 w-full h-full">
                <div className="relative w-[60%] min-w-0 h-full flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, _name: string, props: { payload: { count?: number } }) =>
                          [`${value}%`, props.payload.count != null ? `Count: ${props.payload.count}` : ""]
                        }
                        contentStyle={{
                          borderRadius: "0.75rem",
                          border: "1px solid #E5E7EB",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-bold text-[#111827]">{totalDocs}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-base">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between gap-2">
                      <span className="text-[#111827]">{d.name}</span>
                      <span className="font-semibold text-[#111827]">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Routing Flow */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#111827] mb-1">Document Routing Flow</h3>
        <p className="text-sm text-gray-500 mb-6">End-to-end journey of client requests</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center">
                <div className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <p className="font-semibold text-sm text-[#111827]">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{step.time}</p>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-300 mt-2 hidden lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111827]">Recent Requests</h3>
            <button
              type="button"
              onClick={() => navigate("/admin/requests")}
              className="text-sm text-[#7C3AED] hover:underline font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : recentRequests.length === 0 ? (
            <p className="text-sm text-gray-500 py-6">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  onClick={() => navigate(`/admin/requests/${r.id}`)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Recent Activity</h3>
          {loading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : (
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-600">
                <Activity className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                <span>Requests are routed to the right department based on content.</span>
              </li>
              {recentRequests.slice(0, 3).map((r) => (
                <li key={r.id} className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    Request {r.id} — {r.status} · {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* AI Routing Insights + System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827] mb-1">Most Routed Department</h3>
          <p className="text-2xl font-bold text-[#7C3AED]">
            {topDeptName ?? "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Based on request volume</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827] mb-1">Most Common Category</h3>
          <p className="text-2xl font-bold text-[#111827]">Requests</p>
          <p className="text-xs text-gray-500 mt-1">Across departments</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827] mb-1">AI Classification</h3>
          <p className="text-2xl font-bold text-[#10B981]">Active</p>
          <p className="text-xs text-gray-500 mt-1">Domain + intent detection</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Requests processed today", value: totalDocs, icon: ListTodo, color: "text-[#7C3AED]" },
          { label: "Avg. response", value: "—", icon: Clock, color: "text-[#3B82F6]" },
          { label: "Active agents", value: "—", icon: Users, color: "text-[#F59E0B]" },
          { label: "System status", value: "OK", icon: Gauge, color: "text-[#10B981]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Icon className={`w-8 h-8 ${item.color}`} />
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-semibold text-[#111827]">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Workflow (UML) — new section at bottom */}
      <SystemUMLDiagram />
    </div>
  );
}
