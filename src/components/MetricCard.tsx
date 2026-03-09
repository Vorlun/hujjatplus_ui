import { memo } from "react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

const trendColors = {
  up: "text-[#059669]",
  down: "text-[#DC2626]",
  neutral: "text-[#6B7280]",
};

export const MetricCard = memo(function MetricCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
          {change != null && (
            <p className={`mt-1 text-sm font-medium ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#7C3AED]" />
        </div>
      </div>
    </div>
  );
});
