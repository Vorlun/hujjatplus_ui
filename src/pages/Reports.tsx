import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  LabelList,
} from "recharts";
import { BarChart3, Shield, Download, CheckCircle, Clock, Flame } from "lucide-react";
import { fetchAllRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { buildMonthlyBarData } from "../utils/chartData";
import { Skeleton } from "../components/ui/Skeleton";

const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const PRIORITY_COLORS = { High: "#EF4444", Medium: "#F59E0B", Low: "#6B7280" };

export function Reports() {
  const { data: requests = [], isLoading } = useQuery({ queryKey: ["requests"], queryFn: fetchAllRequests });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });

  const resolvedCount = requests.filter((r) => r.status === "resolved").length;
  const highPriorityCount = requests.filter((r) => r.priority === "High").length;
  const monthlyData = buildMonthlyBarData(requests);
  const requestsPerMonth = useMemo(
    () =>
      monthlyData.map((d) => ({
        month: d.month,
        total: d.completed + d.pending + d.overdue,
        resolved: d.completed,
      })),
    [monthlyData]
  );

  const monthlyInsight = useMemo(() => {
    if (requestsPerMonth.length < 2) return null;
    const last = requestsPerMonth[requestsPerMonth.length - 1].total;
    const prev = requestsPerMonth[requestsPerMonth.length - 2].total;
    if (prev === 0) return last > 0 ? "Requests started this period." : null;
    const pct = Math.round(((last - prev) / prev) * 100);
    return pct >= 0
      ? `Requests increased by ${pct}% compared to last month.`
      : `Requests decreased by ${Math.abs(pct)}% compared to last month.`;
  }, [requestsPerMonth]);

  const byDept = useMemo(() => {
    const list = departments
      .map((d) => ({
        name: d.name,
        count: requests.filter((r) => r.department_id === d.id).length,
        fill: COLORS[departments.indexOf(d) % COLORS.length],
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
    const total = requests.length || 1;
    return list.map((d) => ({ ...d, pct: Math.round((d.count / total) * 100) }));
  }, [departments, requests]);
  const deptBarData = byDept.length ? byDept : [{ name: "No data", count: 0, fill: "#E5E7EB", pct: 0 }];

  const priorityData = useMemo(() => {
    const high = requests.filter((r) => r.priority === "High").length;
    const medium = requests.filter((r) => r.priority === "Medium").length;
    const low = requests.filter((r) => r.priority === "Low").length;
    return [
      { name: "High", value: high, fill: PRIORITY_COLORS.High },
      { name: "Medium", value: medium, fill: PRIORITY_COLORS.Medium },
      { name: "Low", value: low, fill: PRIORITY_COLORS.Low },
    ].filter((d) => d.value > 0);
  }, [requests]);
  const priorityTotal = priorityData.reduce((s, d) => s + d.value, 0);
  const donutData = priorityData.length ? priorityData : [{ name: "No data", value: 1, fill: "#E5E7EB" }];

  const resolutionTrend = useMemo(
    () =>
      monthlyData.map((d) => {
        const total = d.completed + d.pending + d.overdue;
        const rate = total > 0 ? Math.round((d.completed / total) * 100) : 0;
        return { month: d.month, resolved: d.completed, total, rate };
      }),
    [monthlyData]
  );

  const resolutionInsight = useMemo(() => {
    if (resolutionTrend.length < 2) return null;
    const last = resolutionTrend[resolutionTrend.length - 1].rate;
    const prev = resolutionTrend[resolutionTrend.length - 2].rate;
    if (prev === 0) return last > 0 ? "Resolution rate improved this month." : null;
    const delta = last - prev;
    return delta >= 0
      ? `Resolution rate improved by ${delta}% this month.`
      : `Resolution rate decreased by ${Math.abs(delta)}% this month.`;
  }, [resolutionTrend]);

  const slaPercent = requests.length ? Math.round((resolvedCount / requests.length) * 100) : 0;
  const hasData = requests.length > 0;
  const avgResolutionDisplay = "2h 14m";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#7C3AED]" />
          Reports & Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Key performance metrics and trends</p>
      </div>

      {/* Top analytics summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-3xl font-bold text-[#111827] tabular-nums">{isLoading ? "—" : requests.length}</p>
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 tabular-nums">{isLoading ? "—" : resolvedCount}</p>
          <p className="text-sm font-medium text-gray-500">Resolved Requests</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-[#111827] tabular-nums">{isLoading ? "—" : avgResolutionDisplay}</p>
          <p className="text-sm font-medium text-gray-500">Avg Resolution Time</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600 tabular-nums">{isLoading ? "—" : highPriorityCount}</p>
          <p className="text-sm font-medium text-gray-500">High Priority Requests</p>
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
        {/* Chart 1 — Requests per month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Requests per month</h3>
          <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : !hasData ? (
            <div className="mt-4 h-[260px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-500">No request data available yet.</p>
            </div>
          ) : (
            <>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={requestsPerMonth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: number) => [value, ""]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      fill="url(#totalGrad)"
                      dot={{ fill: "#7C3AED", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#7C3AED", stroke: "#fff", strokeWidth: 2 }}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {monthlyInsight && <p className="text-sm text-gray-600 mt-3 px-1">{monthlyInsight}</p>}
            </>
          )}
        </div>

        {/* Chart 2 — Priority distribution donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Priority distribution</h3>
          <p className="text-sm text-gray-500 mt-1">By priority level</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : !hasData ? (
            <div className="mt-4 h-[260px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-500">No request data available yet.</p>
            </div>
          ) : (
            <div className="mt-4 h-[260px] flex items-center gap-6">
              <div className="relative flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={donutData[i].fill} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: number, _name: string, props: { payload: { name: string; value: number } }) => {
                        const total = priorityTotal || 1;
                        const pct = Math.round((props.payload.value / total) * 100);
                        return [`${value} (${pct}%)`, props.payload.name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-[#111827] tabular-nums">{priorityTotal}</p>
                  <p className="text-xs text-gray-500 font-medium">Total</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                {donutData.filter((d) => d.name !== "No data").map((d) => {
                  const pct = priorityTotal ? Math.round((d.value / priorityTotal) * 100) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-sm text-gray-700">{d.name}</span>
                      <span className="text-sm font-medium text-gray-900 tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3 — Department workload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Department workload</h3>
          <p className="text-sm text-gray-500 mt-1">Requests by department (sorted by volume)</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : !hasData ? (
            <div className="mt-4 h-[260px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-500">No request data available yet.</p>
            </div>
          ) : (
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBarData} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
                  <defs>
                    {deptBarData.map((d, i) => (
                      <linearGradient key={i} id={`deptBar-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={d.fill} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={d.fill} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: number, _name: string, props: { payload: { pct?: number } }) => [
                      `${value} requests${props.payload.pct != null ? ` (${props.payload.pct}%)` : ""}`,
                      "",
                    ]}
                  />
                  <Bar dataKey="count" name="Requests" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {deptBarData.map((_, i) => (
                      <Cell key={i} fill={deptBarData[i].name === "No data" ? "#E5E7EB" : `url(#deptBar-${i})`} />
                    ))}
                    <LabelList dataKey="pct" position="right" formatter={(v: number) => (v > 0 ? `${v}%` : "")} style={{ fontSize: 12, fill: "#6B7280" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 4 — Resolution time trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#111827]">Resolution time trend</h3>
          <p className="text-sm text-gray-500 mt-1">Resolved count and resolution rate by month</p>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full mt-4 rounded-lg" />
          ) : !hasData ? (
            <div className="mt-4 h-[260px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-500">No request data available yet.</p>
            </div>
          ) : (
            <>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={resolutionTrend} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(value: number, name: string) => [name === "rate" ? `${value}%` : value, name === "rate" ? "Resolution rate" : "Resolved"]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="resolved" name="resolved" stroke="#10B981" fill="url(#resolvedGrad)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="rate" name="rate" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED", r: 3 }} strokeDasharray="4 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {resolutionInsight && <p className="text-sm text-gray-600 mt-3 px-1">{resolutionInsight}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
