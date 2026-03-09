type Status = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    Completed: 'bg-green-100 text-green-700 border-green-200',
    Overdue: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}
