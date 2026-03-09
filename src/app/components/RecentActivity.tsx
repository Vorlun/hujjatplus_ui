import { FileText, UserPlus, CheckCircle2, AlertTriangle, Upload, UserCheck } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'document_created',
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    title: 'New document created',
    description: 'Budget Report 2026 created by Sarah Johnson',
    time: '5 minutes ago',
  },
  {
    id: 2,
    type: 'task_assigned',
    icon: UserPlus,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    title: 'Task assigned',
    description: 'Review Contract assigned to Michael Chen',
    time: '12 minutes ago',
  },
  {
    id: 3,
    type: 'task_completed',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    title: 'Task completed',
    description: 'Approval Process completed by David Miller',
    time: '28 minutes ago',
  },
  {
    id: 4,
    type: 'file_uploaded',
    icon: Upload,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    title: 'File uploaded',
    description: 'Financial Statement Q1.pdf uploaded',
    time: '1 hour ago',
  },
  {
    id: 5,
    type: 'overdue_alert',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    title: 'Overdue alert',
    description: 'Student Enrollment Form is overdue',
    time: '2 hours ago',
  },
  {
    id: 6,
    type: 'document_approved',
    icon: UserCheck,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    title: 'Document approved',
    description: 'HR Policy Update approved by Admin',
    time: '3 hours ago',
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">
          Recent Activity
        </h3>
        <p className="text-sm text-muted-foreground">
          Latest updates from your team
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

        {/* Activity items */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative flex gap-4 group">
                {/* Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-lg ${activity.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="bg-muted/30 rounded-lg p-3 group-hover:bg-muted/50 transition-colors">
                    <h4 className="text-sm font-semibold text-card-foreground mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-border text-center">
        <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}
