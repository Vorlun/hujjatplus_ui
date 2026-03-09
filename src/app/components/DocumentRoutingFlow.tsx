import { 
  MessageSquare, 
  Brain, 
  GitBranch, 
  Inbox, 
  UserCheck, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  Zap
} from 'lucide-react';

const routingSteps = [
  {
    id: 1,
    title: 'Client Request',
    description: 'User submits request via chat or upload',
    icon: MessageSquare,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    time: '0s',
  },
  {
    id: 2,
    title: 'AI Classification',
    description: 'Analyze content & detect category',
    icon: Brain,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    badge: 'AI',
    time: '1.2s',
  },
  {
    id: 3,
    title: 'Department Routing',
    description: 'Route to correct department',
    icon: GitBranch,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    cardBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
    borderColor: 'border-cyan-200',
    time: '0.5s',
  },
  {
    id: 4,
    title: 'Department Inbox',
    description: 'Add to department queue',
    icon: Inbox,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    time: '0.2s',
  },
  {
    id: 5,
    title: 'Task Assignment',
    description: 'Assign to team member',
    icon: UserCheck,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    cardBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    time: '~5m',
  },
  {
    id: 6,
    title: 'Completion',
    description: 'Process & archive',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    cardBg: 'bg-gradient-to-br from-green-50 to-green-100',
    borderColor: 'border-green-200',
    time: '~24h',
  },
];

export function DocumentRoutingFlow() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">
              Document Routing Flow
            </h3>
            <p className="text-sm text-muted-foreground">
              End-to-end journey of client requests through the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Automated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Horizontal Flow */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-3">
          {routingSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === routingSteps.length - 1;

            return (
              <div key={step.id} className="flex items-start flex-1">
                {/* Step Card */}
                <div className="flex-1 group">
                  <div className={`relative ${step.cardBg} border-2 ${step.borderColor} rounded-xl p-5 transition-all hover:shadow-lg hover:scale-105 cursor-pointer min-h-[180px] flex flex-col`}>
                    {/* AI Badge */}
                    {step.badge && (
                      <div className="absolute -top-2 -right-2 w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg z-10">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Step Number */}
                    <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-muted-foreground">
                        {step.id}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 ${step.iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
                      <Icon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-card-foreground mb-2 leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Time Badge */}
                    <div className="mt-3 pt-3 border-t border-white/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {step.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {!isLast && (
                  <div className="flex items-center justify-center px-2 pt-16">
                    <div className="relative">
                      <ArrowRight className="w-7 h-7 text-purple-400" strokeWidth={2.5} />
                      {/* Animated pulse */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet View - Vertical Flow */}
      <div className="lg:hidden space-y-3">
        {routingSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === routingSteps.length - 1;

          return (
            <div key={step.id}>
              {/* Step Card */}
              <div className={`relative ${step.cardBg} border-2 ${step.borderColor} rounded-xl p-4 transition-all hover:shadow-lg`}>
                {/* AI Badge */}
                {step.badge && (
                  <div className="absolute -top-2 -right-2 w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${step.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-card-foreground">
                        {step.title}
                      </h4>
                      <div className="w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-muted-foreground">
                          {step.id}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {step.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              {!isLast && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-6 h-6 text-purple-400 rotate-90" strokeWidth={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Process Info Banner */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border border-purple-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-card-foreground mb-2">
              Intelligent Automation in Action
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Our AI-powered routing system automatically processes every client request through this workflow. From initial submission to final completion, the entire process is monitored, tracked, and optimized for maximum efficiency.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                <span className="text-xs font-medium text-card-foreground">Fully Automated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-xs font-medium text-card-foreground">Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-600 rounded-full" />
                <span className="text-xs font-medium text-card-foreground">Smart Routing</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              2.3s
            </span>
            <span className="text-xs text-muted-foreground">Avg. Process Time</span>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <div className="text-lg font-bold text-purple-600">98.5%</div>
          <div className="text-xs text-muted-foreground mt-1">Routing Accuracy</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <div className="text-lg font-bold text-blue-600">1,284</div>
          <div className="text-xs text-muted-foreground mt-1">Requests/Month</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <div className="text-lg font-bold text-cyan-600">85%</div>
          <div className="text-xs text-muted-foreground mt-1">Time Saved</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <div className="text-lg font-bold text-green-600">24/7</div>
          <div className="text-xs text-muted-foreground mt-1">Availability</div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          How the Routing Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-card-foreground mb-1">
                AI Content Analysis
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Advanced NLP algorithms analyze document content, detect intent, and classify categories with 98%+ accuracy.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-card-foreground mb-1">
                Smart Department Matching
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Intelligent routing engine matches requests to departments based on category, priority, and workload.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-card-foreground mb-1">
                Automatic Task Creation
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                System generates tasks with priorities, deadlines, and assigns to available team members automatically.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-card-foreground mb-1">
                Continuous Tracking
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time status updates and activity logs ensure transparency throughout the entire process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
