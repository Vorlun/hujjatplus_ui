import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchDepartmentRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { LayoutDashboard } from "lucide-react";
import { StatsCards, StatsCardsSkeleton, type DashboardStats } from "../components/department-dashboard/StatsCards";
import { RequestsTable } from "../components/department-dashboard/RequestsTable";
import { ActivityTimeline } from "../components/department-dashboard/ActivityTimeline";

export function DepartmentDashboard() {
  const { user } = useAuth();
  const departmentId = user?.department_id ?? "";

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["department-requests", departmentId],
    queryFn: () => fetchDepartmentRequests(departmentId),
    enabled: !!departmentId && (user?.role === "agent" || user?.role === "admin"),
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const departmentName = departmentId ? getDeptName(departmentId) : "Your department";

  const stats: DashboardStats = useMemo(
    () => ({
      new: requests.filter((r) => r.status === "new").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      resolved: requests.filter((r) => r.status === "resolved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests]
  );

  const recentActivity = useMemo(() => requests.slice(0, 5), [requests]);

  if (user?.role !== "agent" && user?.role !== "admin") {
    return (
      <div className="text-slate-500 p-6">Access denied. Department or Admin only.</div>
    );
  }

  if (!departmentId && user?.role === "agent") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 text-amber-800">
        <p className="font-medium">No department assigned</p>
        <p className="text-sm mt-1">
          Contact your administrator to assign you to a department (HR, IT, Finance, Legal, Marketing,
          Operations).
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] -mx-4 -mt-4 px-4 pb-10 pt-4 md:-mx-6 md:px-6 md:pb-12 md:pt-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
              <LayoutDashboard className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Department Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">{departmentName}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {String(error)}
          </div>
        )}

        {isLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <RequestsTable requests={requests} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-4">
            <ActivityTimeline items={recentActivity} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
