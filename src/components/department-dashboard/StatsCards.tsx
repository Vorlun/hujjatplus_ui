import { Inbox, ListTodo, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "../ui/Skeleton";

export interface DashboardStats {
  new: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

interface StatConfig {
  key: keyof DashboardStats;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const ENTER_DELAYS = ["delay-0", "delay-75", "delay-100", "delay-150"] as const;

const STAT_CONFIG: StatConfig[] = [
  {
    key: "new",
    label: "New Requests",
    description: "Awaiting triage",
    icon: Inbox,
    gradient: "from-blue-50 via-white to-white",
    iconBg: "bg-blue-100",
    iconColor: "text-[#2563EB]",
  },
  {
    key: "in_progress",
    label: "In Progress",
    description: "Actively handled",
    icon: ListTodo,
    gradient: "from-amber-50 via-white to-white",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    key: "resolved",
    label: "Resolved",
    description: "Completed successfully",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    gradient: "from-emerald-50 via-white to-white",
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "Closed without resolution",
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    gradient: "from-red-50 via-white to-white",
  },
];

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STAT_CONFIG.map((c) => (
        <div
          key={c.key}
          className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-12 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-3 w-24" />
          <Skeleton className="mt-2 h-3 w-full max-w-[8rem]" />
        </div>
      ))}
    </div>
  );
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STAT_CONFIG.map((c, i) => {
        const Icon = c.icon;
        const value = stats[c.key];
        return (
          <div
            key={c.key}
            className={clsx(
              "group relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5",
              "bg-gradient-to-br transition-all duration-150 ease-out",
              "hover:z-[1] hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/60",
              "animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none",
              ENTER_DELAYS[i] ?? "delay-150",
              c.gradient
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105",
                  c.iconBg
                )}
              >
                <Icon className={clsx("h-5 w-5", c.iconColor)} aria-hidden />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
              {value}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{c.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{c.description}</p>
          </div>
        );
      })}
    </div>
  );
}
