import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { DocumentPreviewPanel } from './DocumentPreviewPanel';

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

const mockDocuments: Document[] = [
  {
    id: 'DOC-2026-001',
    title: 'Annual Financial Audit Report Q4 2025',
    department: 'Finance',
    assignedTo: 'Sarah Johnson',
    priority: 'High',
    deadline: '2026-03-15',
    status: 'In Progress',
    description: 'Comprehensive financial audit report covering all transactions and financial statements for Q4 2025. Requires detailed review and approval from finance department head.',
    attachments: [
      { name: 'Q4_Audit_Report.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'Financial_Summary.xlsx', size: '856 KB', type: 'Excel' },
    ],
    createdBy: 'External Auditor',
    createdDate: '2026-03-05T10:30:00',
    receivedDate: '2026-03-05T11:00:00',
  },
  {
    id: 'DOC-2026-002',
    title: 'New Employee Onboarding Documentation',
    department: 'HR',
    assignedTo: 'Michael Chen',
    priority: 'Medium',
    deadline: '2026-03-12',
    status: 'Pending',
    description: 'Complete onboarding package for 5 new employees joining next week. Includes contracts, benefits enrollment, and training schedules.',
    attachments: [
      { name: 'Onboarding_Checklist.pdf', size: '1.2 MB', type: 'PDF' },
      { name: 'Benefits_Info.pdf', size: '3.1 MB', type: 'PDF' },
    ],
    createdBy: 'HR Manager',
    createdDate: '2026-03-04T14:20:00',
    receivedDate: '2026-03-04T14:25:00',
  },
  {
    id: 'DOC-2026-003',
    title: 'Marketing Campaign Proposal - Spring 2026',
    department: 'Marketing',
    assignedTo: 'Emily Rodriguez',
    priority: 'Critical',
    deadline: '2026-03-09',
    status: 'Overdue',
    description: 'Comprehensive marketing campaign proposal for Spring 2026 product launch. Includes budget allocation, timeline, and expected ROI analysis.',
    attachments: [
      { name: 'Campaign_Proposal.pptx', size: '15.8 MB', type: 'PowerPoint' },
      { name: 'Budget_Breakdown.xlsx', size: '642 KB', type: 'Excel' },
      { name: 'Market_Research.pdf', size: '4.2 MB', type: 'PDF' },
    ],
    createdBy: 'Marketing Director',
    createdDate: '2026-02-28T09:15:00',
    receivedDate: '2026-02-28T09:30:00',
  },
  {
    id: 'DOC-2026-004',
    title: 'Vendor Service Agreement - Tech Solutions Inc',
    department: 'Legal',
    assignedTo: 'David Park',
    priority: 'High',
    deadline: '2026-03-14',
    status: 'In Progress',
    description: 'Legal review and approval required for vendor service agreement with Tech Solutions Inc. Contract value: $250,000 annually.',
    attachments: [
      { name: 'Service_Agreement.pdf', size: '1.8 MB', type: 'PDF' },
    ],
    createdBy: 'Procurement Team',
    createdDate: '2026-03-03T11:45:00',
    receivedDate: '2026-03-03T12:00:00',
  },
  {
    id: 'DOC-2026-005',
    title: 'IT Security Compliance Audit',
    department: 'IT',
    assignedTo: 'Lisa Thompson',
    priority: 'Critical',
    deadline: '2026-03-10',
    status: 'Completed',
    description: 'Annual IT security compliance audit covering network security, data protection, and access controls. All findings documented and remediation plan included.',
    attachments: [
      { name: 'Security_Audit.pdf', size: '5.6 MB', type: 'PDF' },
      { name: 'Remediation_Plan.docx', size: '1.1 MB', type: 'Word' },
    ],
    createdBy: 'Security Team',
    createdDate: '2026-03-01T08:00:00',
    receivedDate: '2026-03-01T08:15:00',
  },
  {
    id: 'DOC-2026-006',
    title: 'Customer Complaint Resolution Report',
    department: 'Customer Service',
    assignedTo: 'Maria Garcia',
    priority: 'Medium',
    deadline: '2026-03-18',
    status: 'Pending',
    description: 'Monthly customer complaint resolution report with analysis of common issues and proposed solutions.',
    attachments: [
      { name: 'Complaint_Report.pdf', size: '2.8 MB', type: 'PDF' },
    ],
    createdBy: 'CS Manager',
    createdDate: '2026-03-06T16:30:00',
    receivedDate: '2026-03-06T17:00:00',
  },
  {
    id: 'DOC-2026-007',
    title: 'Office Lease Renewal Agreement',
    department: 'Operations',
    assignedTo: 'James Wilson',
    priority: 'High',
    deadline: '2026-03-11',
    status: 'In Progress',
    description: 'Review and approval needed for office lease renewal. New terms include 5% rent increase and upgraded facilities.',
    attachments: [
      { name: 'Lease_Agreement.pdf', size: '2.1 MB', type: 'PDF' },
      { name: 'Facility_Upgrade_Plan.pdf', size: '3.4 MB', type: 'PDF' },
    ],
    createdBy: 'Property Manager',
    createdDate: '2026-03-02T13:20:00',
    receivedDate: '2026-03-02T13:45:00',
  },
  {
    id: 'DOC-2026-008',
    title: 'Product Development Roadmap Q2 2026',
    department: 'Product',
    assignedTo: 'Alex Kim',
    priority: 'Medium',
    deadline: '2026-03-16',
    status: 'Pending',
    description: 'Q2 product development roadmap with feature prioritization and resource allocation.',
    attachments: [
      { name: 'Roadmap_Q2.pdf', size: '4.5 MB', type: 'PDF' },
    ],
    createdBy: 'Product Manager',
    createdDate: '2026-03-05T15:00:00',
    receivedDate: '2026-03-05T15:20:00',
  },
];

export function IncomingDocuments() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All',
    department: 'All',
    status: 'All',
    dateRange: 'All',
  });

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filters.priority === 'All' || doc.priority === filters.priority;
    const matchesDepartment = filters.department === 'All' || doc.department === filters.department;
    const matchesStatus = filters.status === 'All' || doc.status === filters.status;
    
    return matchesSearch && matchesPriority && matchesDepartment && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Incoming Documents</h1>
              <p className="text-muted-foreground">
                Manage and track all incoming documents requiring action
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              <Plus className="w-5 h-5" />
              <span>Add Document</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or document ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="px-4 py-2.5 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-4 py-2.5 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="px-4 py-2.5 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Legal">Legal</option>
                <option value="IT">IT</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Operations">Operations</option>
                <option value="Product">Product</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2.5 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>

              <button className="p-2.5 bg-input-background rounded-lg hover:bg-muted transition-colors">
                <Filter className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDocuments.length} of {mockDocuments.length} documents
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className={`bg-card rounded-xl border border-border overflow-hidden transition-all ${selectedDocument ? 'mr-[480px]' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Document ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Assigned Person
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className={`hover:bg-muted/20 transition-colors cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-purple-50' : ''}`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-purple-600">{doc.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-card-foreground max-w-xs">{doc.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-muted-foreground">{doc.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs">
                          {doc.assignedTo.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-card-foreground">{doc.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={doc.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {new Date(doc.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <DocumentPreviewPanel 
        document={selectedDocument} 
        onClose={() => setSelectedDocument(null)} 
      />
    </div>
  );
}
