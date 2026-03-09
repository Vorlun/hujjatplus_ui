import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { id: 'financial', name: 'Moliya', value: 342 },
  { id: 'hr', name: 'HR', value: 265 },
  { id: 'legal', name: 'Yuridik', value: 198 },
  { id: 'marketing', name: 'Marketing', value: 156 },
  { id: 'it', name: 'IT', value: 128 },
  { id: 'operations', name: 'Operatsiyalar', value: 95 },
];

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CategoryChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Hujjatlar kategoriyalari
        </h3>

        <p className="text-sm text-muted-foreground mt-1">
          Bo‘limlar bo‘yicha hujjatlar taqsimoti
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart id="category-pie-chart">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            id="pie-categories"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((entry, index) => (
          <div key={entry.id} className="flex items-center gap-2">

            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>

            <span className="text-sm text-muted-foreground">
              {entry.name}
            </span>

          </div>
        ))}
      </div>

    </div>
  );
}