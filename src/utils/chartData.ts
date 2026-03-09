/**
 * Backend request ma'lumotlaridan chart uchun ma'lumot tayyorlash.
 */

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface RequestForChart {
  created_at: string;
  status: string;
  category?: string;
  department_id?: string;
}

/** So'nggi 6 oy uchun oylik statistikalar (completed, pending, overdue) */
export function buildMonthlyBarData(requests: RequestForChart[]): {
  month: string;
  completed: number;
  pending: number;
  overdue: number;
}[] {
  const now = new Date();
  const result: { month: string; completed: number; pending: number; overdue: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = MONTH_NAMES[d.getMonth()];

    let completed = 0;
    let pending = 0;
    let overdue = 0;

    requests.forEach((r) => {
      const created = r.created_at.slice(0, 7);
      if (created !== monthKey) return;

      if (r.status === "resolved") completed += 1;
      else if (r.status === "new" || r.status === "in_progress") pending += 1;
      else if (r.status === "rejected") overdue += 1;
    });

    result.push({ month: monthLabel, completed, pending, overdue });
  }

  return result;
}

/** Bo‘lim/kategoriya bo‘yicha taqsimot (donut uchun): name, value (%), count, fill */
const CATEGORY_COLORS: Record<string, string> = {
  financial: "#7C3AED",
  finance: "#7C3AED",
  hr: "#3B82F6",
  it: "#10B981",
  legal: "#F59E0B",
  marketing: "#EF4444",
  operations: "#8B5CF6",
};

const CATEGORY_LABELS: Record<string, string> = {
  financial: "Moliya",
  finance: "Moliya",
  hr: "Kadrlar",
  it: "IT",
  legal: "Huquqiy",
  marketing: "Marketing",
  operations: "Operatsiyalar",
};

const CATEGORY_ORDER = ["financial", "finance", "hr", "it", "legal", "marketing", "operations"];

export function buildCategoryDonutData(
  requests: RequestForChart[],
  departmentIdToName?: Map<string, string>
): { name: string; value: number; count: number; fill: string }[] {
  const byKey: Record<string, number> = {};

  requests.forEach((r) => {
    const key = (r.category || r.department_id || "other").toLowerCase().trim();
    byKey[key] = (byKey[key] ?? 0) + 1;
  });

  const total = requests.length;
  if (total === 0) {
    return [{ name: "Ma'lumot yo'q", value: 100, count: 0, fill: "#E5E7EB" }];
  }

  const sortedKeys = Object.keys(byKey).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) >= 0 ? CATEGORY_ORDER.indexOf(a) : 99) - (CATEGORY_ORDER.indexOf(b) >= 0 ? CATEGORY_ORDER.indexOf(b) : 99)
  );

  const colorList = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return sortedKeys.map((key, i) => {
    const count = byKey[key];
    const name =
      departmentIdToName?.get(key) || CATEGORY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
    const value = Math.round((count / total) * 100);
    const fill = CATEGORY_COLORS[key] ?? colorList[i % colorList.length];
    return { name, value, count, fill };
  });
}
