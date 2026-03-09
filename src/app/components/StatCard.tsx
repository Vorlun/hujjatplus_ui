import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = 'text-purple-600', iconBg = 'bg-purple-100' }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-semibold text-card-foreground mb-2">{value}</h3>
          {trend && (
            <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
