import { X, Download, Paperclip, Clock, MessageSquare, User, Calendar } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

type Status = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Document {
  id: string;
  title: string;
  department: string;
  assignedTo: string;
  priority: Priority;
  deadline: string;
  status: Status;
  description: string;
  attachments: { name: string; size: string; type: string }[];
  createdBy: string;
  createdDate: string;
  receivedDate: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface Comment {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}

interface DocumentPreviewPanelProps {
  document: Document | null;
  onClose: () => void;
}

export function DocumentPreviewPanel({ document, onClose }: DocumentPreviewPanelProps) {
  if (!document) return null;

  const activities: Activity[] = [
    {
      id: '1',
      user: 'System',
      action: 'Document received',
      timestamp: document.receivedDate,
    },
    {
      id: '2',
      user: document.createdBy,
      action: 'Document uploaded',
      timestamp: document.createdDate,
    },
    {
      id: '3',
      user: 'Sarah Johnson',
      action: 'Assigned to ' + document.assignedTo,
      timestamp: '2026-03-06T14:30:00',
    },
    {
      id: '4',
      user: document.assignedTo,
      action: 'Status changed to In Progress',
      timestamp: '2026-03-07T09:15:00',
    },
  ];

  const comments: Comment[] = [
    {
      id: '1',
      user: 'Sarah Johnson',
      message: 'Please review this document by end of day. Priority is high.',
      timestamp: '2026-03-06T14:35:00',
    },
    {
      id: '2',
      user: document.assignedTo,
      message: 'Working on it. Will have it ready by tomorrow morning.',
      timestamp: '2026-03-07T10:20:00',
    },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-card-foreground mb-2">{document.title}</h2>
          <p className="text-sm text-muted-foreground">ID: {document.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Details Grid */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Document Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="text-sm font-medium text-card-foreground">{document.department}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Priority</span>
              <PriorityBadge priority={document.priority} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={document.status} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Assigned To</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs">
                  {document.assignedTo.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-medium text-card-foreground">{document.assignedTo}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Deadline</span>
              <span className="text-sm font-medium text-card-foreground">
                {new Date(document.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Received Date</span>
              <span className="text-sm font-medium text-card-foreground">
                {new Date(document.receivedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{document.description}</p>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Attachments ({document.attachments.length})
          </h3>
          <div className="space-y-2">
            {document.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{attachment.size} • {attachment.type}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity Timeline
          </h3>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px h-8 bg-border mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-card-foreground">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comments ({comments.length})
          </h3>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                  {comment.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-card-foreground mb-1">{comment.user}</p>
                    <p className="text-sm text-muted-foreground">{comment.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(comment.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="mt-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                JD
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all resize-none"
                  rows={3}
                />
                <button className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
