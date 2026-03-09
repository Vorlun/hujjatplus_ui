import { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const monthlyData = [
  {
    month: 'Jan',
    completed: 245,
    pending: 68,
    overdue: 12,
  },
  {
    month: 'Feb',
    completed: 298,
    pending: 82,
    overdue: 15,
  },
  {
    month: 'Mar',
    completed: 312,
    pending: 95,
    overdue: 18,
  },
  {
    month: 'Apr',
    completed: 285,
    pending: 110,
    overdue: 22,
  },
  {
    month: 'May',
    completed: 328,
    pending: 88,
    overdue: 14,
  },
  {
    month: 'Jun',
    completed: 342,
    pending: 110,
    overdue: 50,
  },
];

const barColors = {
  completed: '#10b981',
  pending: '#3b82f6',
  overdue: '#ef4444',
};

export function MonthlyTaskStats() {
  const [hoveredBar, setHoveredBar] = useState<{ month: string; type: string } | null>(null);

  // Calculate totals
  const totalCompleted = monthlyData.reduce((sum, month) => sum + month.completed, 0);
  const totalPending = monthlyData.reduce((sum, month) => sum + month.pending, 0);
  const totalOverdue = monthlyData.reduce((sum, month) => sum + month.overdue, 0);
  const grandTotal = totalCompleted + totalPending + totalOverdue;

  // Calculate average completion rate
  const avgCompletionRate = ((totalCompleted / grandTotal) * 100).toFixed(1);

  // Find max value for scaling
  const maxValue = Math.max(
    ...monthlyData.map(d => Math.max(d.completed, d.pending, d.overdue))
  );
  const yAxisMax = Math.ceil(maxValue / 50) * 50;

  // Generate Y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => 
    Math.round((yAxisMax / yAxisSteps) * i)
  ).reverse();

  const chartHeight = 350;
  const chartPadding = { top: 40, right: 30, bottom: 60, left: 60 };
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const barGroupWidth = 80;
  const barWidth = 22;
  const barGap = 4;

  const getBarHeight = (value: number) => {
    return (value / yAxisMax) * plotHeight;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            Monthly Task Statistics
          </h3>
          <p className="text-sm text-muted-foreground">
            Task completion trends over the last 6 months
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">
            {avgCompletionRate}% avg completion
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between" style={{ 
          width: `${chartPadding.left - 10}px`,
          paddingTop: `${chartPadding.top}px`,
          paddingBottom: `${chartPadding.bottom}px`
        }}>
          {yAxisLabels.map((label, idx) => (
            <div key={`y-axis-${label}-${idx}`} className="text-xs text-muted-foreground text-right pr-2">
              {label}
            </div>
          ))}
        </div>

        {/* Y-axis title */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
          style={{ 
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg) translateY(-50%)',
            transformOrigin: 'left center'
          }}
        >
          Number of Tasks
        </div>

        {/* Grid lines and bars container */}
        <div className="absolute" style={{ 
          left: `${chartPadding.left}px`,
          right: `${chartPadding.right}px`,
          top: `${chartPadding.top}px`,
          bottom: `${chartPadding.bottom}px`
        }}>
          {/* Horizontal grid lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {yAxisLabels.map((_, idx) => {
              const y = (plotHeight / (yAxisLabels.length - 1)) * idx;
              return (
                <line
                  key={`grid-line-${idx}`}
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              );
            })}
          </svg>

          {/* Bars */}
          <div className="relative h-full flex items-end justify-around px-4">
            {monthlyData.map((data, monthIdx) => {
              const totalForMonth = data.completed + data.pending + data.overdue;
              
              return (
                <div key={`month-group-${data.month}-${monthIdx}`} className="flex flex-col items-center">
                  {/* Bars group */}
                  <div className="flex items-end gap-1 mb-2" style={{ height: `${plotHeight}px` }}>
                    {/* Completed bar */}
                    <div
                      className="relative group cursor-pointer transition-all duration-200"
                      style={{ width: `${barWidth}px` }}
                      onMouseEnter={() => setHoveredBar({ month: data.month, type: 'completed' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div
                        className="rounded-t transition-all duration-300"
                        style={{
                          height: `${getBarHeight(data.completed)}px`,
                          backgroundColor: barColors.completed,
                          opacity: hoveredBar && (hoveredBar.month !== data.month || hoveredBar.type !== 'completed') ? 0.4 : 1
                        }}
                      />
                      {/* Value label */}
                      <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {data.completed}
                      </div>
                      {/* Tooltip */}
                      {hoveredBar?.month === data.month && hoveredBar?.type === 'completed' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 bg-card border border-border rounded-lg shadow-xl p-3 z-10 whitespace-nowrap">
                          <p className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {data.month}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: barColors.completed }} />
                            <span className="text-sm text-muted-foreground">Completed:</span>
                            <span className="text-sm font-semibold text-card-foreground">{data.completed}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pending bar */}
                    <div
                      className="relative group cursor-pointer transition-all duration-200"
                      style={{ width: `${barWidth}px` }}
                      onMouseEnter={() => setHoveredBar({ month: data.month, type: 'pending' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div
                        className="rounded-t transition-all duration-300"
                        style={{
                          height: `${getBarHeight(data.pending)}px`,
                          backgroundColor: barColors.pending,
                          opacity: hoveredBar && (hoveredBar.month !== data.month || hoveredBar.type !== 'pending') ? 0.4 : 1
                        }}
                      />
                      {/* Value label */}
                      <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {data.pending}
                      </div>
                      {/* Tooltip */}
                      {hoveredBar?.month === data.month && hoveredBar?.type === 'pending' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 bg-card border border-border rounded-lg shadow-xl p-3 z-10 whitespace-nowrap">
                          <p className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {data.month}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: barColors.pending }} />
                            <span className="text-sm text-muted-foreground">Pending:</span>
                            <span className="text-sm font-semibold text-card-foreground">{data.pending}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Overdue bar */}
                    <div
                      className="relative group cursor-pointer transition-all duration-200"
                      style={{ width: `${barWidth}px` }}
                      onMouseEnter={() => setHoveredBar({ month: data.month, type: 'overdue' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div
                        className="rounded-t transition-all duration-300"
                        style={{
                          height: `${getBarHeight(data.overdue)}px`,
                          backgroundColor: barColors.overdue,
                          opacity: hoveredBar && (hoveredBar.month !== data.month || hoveredBar.type !== 'overdue') ? 0.4 : 1
                        }}
                      />
                      {/* Value label */}
                      <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {data.overdue}
                      </div>
                      {/* Tooltip */}
                      {hoveredBar?.month === data.month && hoveredBar?.type === 'overdue' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 bg-card border border-border rounded-lg shadow-xl p-3 z-10 whitespace-nowrap">
                          <p className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {data.month}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: barColors.overdue }} />
                            <span className="text-sm text-muted-foreground">Overdue:</span>
                            <span className="text-sm font-semibold text-card-foreground">{data.overdue}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Month label */}
                  <div className="text-sm font-medium text-muted-foreground mt-2">
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: barColors.completed }} />
          <span className="text-sm font-medium text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: barColors.pending }} />
          <span className="text-sm font-medium text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: barColors.overdue }} />
          <span className="text-sm font-medium text-muted-foreground">Overdue</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-card-foreground">{grandTotal.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{totalCompleted.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-bold text-blue-600">{totalPending.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{totalOverdue.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
