import { 
  FileText, 
  Brain, 
  Building2, 
  ClipboardCheck, 
  Bell,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const processingSteps = [
  {
    id: 1,
    title: 'Document received',
    description: 'Invoice document uploaded to system',
    department: 'Document Center',
    timestamp: '2 minutes ago',
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    status: 'completed',
  },
  {
    id: 2,
    title: 'AI classified document category',
    description: 'Analyzed content and detected financial invoice',
    department: 'AI Processing',
    timestamp: '1 minute ago',
    icon: Brain,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    status: 'completed',
  },
  {
    id: 3,
    title: 'Department assigned',
    description: 'Routed to Finance Department based on category',
    department: 'Finance Department',
    timestamp: '45 seconds ago',
    icon: Building2,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    status: 'completed',
  },
  {
    id: 4,
    title: 'Task created',
    description: 'Review and approve invoice task generated',
    department: 'Finance Department',
    timestamp: '30 seconds ago',
    icon: ClipboardCheck,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    status: 'completed',
  },
  {
    id: 5,
    title: 'Notification sent',
    description: 'Email sent to assigned team member',
    department: 'Finance Department',
    timestamp: 'Just now',
    icon: Bell,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    status: 'active',
  },
];

const aiClassification = {
  detectedCategory: 'Finance',
  assignedDepartment: 'Finance Department',
  priority: 'Medium',
  suggestedAssignee: 'Sarah Johnson (Accountant)',
  confidenceScore: 92,
};

export function DocumentProcessingFlow() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            Document Processing Flow
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered document classification and routing
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Processing Timeline (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-green-200" />

            {/* Timeline items */}
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === processingSteps.length - 1;
                
                return (
                  <div key={step.id} className="relative flex gap-4 group">
                    {/* Icon */}
                    <div className={`relative z-10 w-10 h-10 rounded-lg ${step.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                      step.status === 'active' ? 'ring-2 ring-purple-400 ring-offset-2' : ''
                    }`}>
                      <Icon className={`w-5 h-5 ${step.iconColor}`} />
                      {step.status === 'completed' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
                      <div className="bg-muted/30 rounded-lg p-4 group-hover:bg-muted/50 transition-colors border border-border/50">
                        {/* Title and Timestamp */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-card-foreground">
                            {step.title}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {step.timestamp}
                          </span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        
                        {/* Department Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background rounded-md border border-border">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-card-foreground">
                            {step.department}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - AI Classification Card (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200 sticky top-6">
            {/* Card Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-card-foreground">
                AI Classification
              </h4>
            </div>

            {/* Classification Details */}
            <div className="space-y-4">
              {/* Detected Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Detected Category
                </label>
                <div className="mt-1.5 px-3 py-2 bg-white rounded-lg border border-purple-200">
                  <span className="text-sm font-semibold text-purple-700">
                    {aiClassification.detectedCategory}
                  </span>
                </div>
              </div>

              {/* Assigned Department */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assigned Department
                </label>
                <div className="mt-1.5 px-3 py-2 bg-white rounded-lg border border-border">
                  <span className="text-sm font-medium text-card-foreground">
                    {aiClassification.assignedDepartment}
                  </span>
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Priority Level
                </label>
                <div className="mt-1.5">
                  <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200">
                    {aiClassification.priority}
                  </span>
                </div>
              </div>

              {/* Suggested Assignee */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggested Assignee
                </label>
                <div className="mt-1.5 px-3 py-2 bg-white rounded-lg border border-border">
                  <span className="text-sm font-medium text-card-foreground">
                    {aiClassification.suggestedAssignee}
                  </span>
                </div>
              </div>

              {/* AI Confidence Score */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                  AI Confidence Score
                </label>
                <div className="space-y-2">
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${aiClassification.confidenceScore}%` }}
                    />
                  </div>
                  {/* Percentage */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">
                      {aiClassification.confidenceScore}%
                    </span>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      High Confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-5 pt-4 border-t border-purple-200">
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI analyzed document structure, content, and metadata to automatically classify and route this document.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
