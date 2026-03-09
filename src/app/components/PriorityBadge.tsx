type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const styles = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-blue-100 text-blue-600',
    High: 'bg-orange-100 text-orange-600',
    Critical: 'bg-red-100 text-red-600',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded font-medium ${styles[priority]} ${sizeStyles[size]}`}>
      {priority}
    </span>
  );
}