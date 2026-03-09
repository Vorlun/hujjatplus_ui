import { FilePlus, ClipboardList, Upload, Search } from 'lucide-react';

const actions = [
  {
    id: 1,
    title: 'Create Document',
    description: 'Start a new document',
    icon: FilePlus,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    hoverBg: 'hover:bg-purple-50',
  },
  {
    id: 2,
    title: 'Assign Task',
    description: 'Delegate to team member',
    icon: ClipboardList,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-50',
  },
  {
    id: 3,
    title: 'Upload File',
    description: 'Add documents to system',
    icon: Upload,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    hoverBg: 'hover:bg-green-50',
  },
  {
    id: 4,
    title: 'Search Documents',
    description: 'Find what you need',
    icon: Search,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    hoverBg: 'hover:bg-cyan-50',
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">
          Quick Actions
        </h3>
        <p className="text-sm text-muted-foreground">
          Common workflow tasks
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className={`flex flex-col items-start gap-3 p-4 rounded-lg border border-border ${action.hoverBg} transition-all hover:shadow-sm hover:border-purple-200 group`}
            >
              <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-card-foreground mb-0.5">
                  {action.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
