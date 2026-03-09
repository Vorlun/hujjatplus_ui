import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MoreHorizontal } from 'lucide-react';

type Status = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Document {
  id: string;
  title: string;
  category: string;
  assignedTo: string;
  priority: Priority;
  deadline: string;
  status: Status;
}

const documents: Document[] = [
  {
    id: '1',
    title: 'Q1 Financial Report 2026',
    category: 'Financial',
    assignedTo: 'Sarah Johnson',
    priority: 'High',
    deadline: '2026-03-15',
    status: 'In Progress',
  },
  {
    id: '2',
    title: 'Employee Onboarding Checklist',
    category: 'HR',
    assignedTo: 'Michael Chen',
    priority: 'Medium',
    deadline: '2026-03-10',
    status: 'Pending',
  },
  {
    id: '3',
    title: 'Project Proposal - Website Redesign',
    category: 'Marketing',
    assignedTo: 'Emily Rodriguez',
    priority: 'Critical',
    deadline: '2026-03-08',
    status: 'Overdue',
  },
  {
    id: '4',
    title: 'Vendor Contract Agreement',
    category: 'Legal',
    assignedTo: 'David Park',
    priority: 'High',
    deadline: '2026-03-12',
    status: 'In Progress',
  },
  {
    id: '5',
    title: 'IT Security Audit Report',
    category: 'IT',
    assignedTo: 'Lisa Thompson',
    priority: 'Critical',
    deadline: '2026-03-09',
    status: 'Completed',
  },
  {
    id: '6',
    title: 'Monthly Newsletter Draft',
    category: 'Communications',
    assignedTo: 'James Wilson',
    priority: 'Low',
    deadline: '2026-03-20',
    status: 'Pending',
  },
  {
    id: '7',
    title: 'Customer Satisfaction Survey',
    category: 'Customer Service',
    assignedTo: 'Maria Garcia',
    priority: 'Medium',
    deadline: '2026-03-18',
    status: 'In Progress',
  },
];

export function RecentDocumentsTable() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Documents</h3>
        <p className="text-sm text-muted-foreground mt-1">Track and manage all your documents</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Document Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-card-foreground">{doc.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{doc.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs mr-2">
                      {doc.assignedTo.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-sm text-card-foreground">{doc.assignedTo}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={doc.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(doc.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="p-1 hover:bg-muted rounded transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
