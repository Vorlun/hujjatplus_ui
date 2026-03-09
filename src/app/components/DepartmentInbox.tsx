import { useMemo, useState } from 'react';
import { 
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Paperclip,
  Brain,
  ArrowRight,
  X,
  Download,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useRequests } from '../store/requestStore';
import { formatDepartmentToUzbek, formatPriorityToUzbek, formatStatusToUzbek } from '../utils/helpers';
import type { Request, RequestStatus } from '../types/request';

export function DepartmentInbox() {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');

  const { requests, updateRequestStatus } = useRequests();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'new':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'in_progress':
        return <Clock className="w-3 h-3" />;
      case 'new':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const filteredRequests = useMemo(
    () =>
      requests.filter((req) => {
        const matchesSearch =
          req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [requests, searchQuery, statusFilter],
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all ${selectedRequest ? 'mr-[480px]' : ''}`}>
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-card-foreground">
                  Bo‘lim so‘rovlari
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Mijozlardan kelgan so‘rovlar va hujjatlar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">AI Routed</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 appearance-none cursor-pointer"
              >
                <option value="all">Barcha holatlar</option>
                <option value="new">Yangi</option>
                <option value="in_progress">Jarayonda</option>
                <option value="completed">Yakunlangan</option>
                <option value="rejected">Rad etilgan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-card border-b border-border px-8 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-card-foreground">{requests.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Jami so‘rovlar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {requests.filter(d => d.status === 'new').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Yangi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {requests.filter(d => d.status === 'in_progress').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Jarayonda</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {requests.filter(d => d.status === 'rejected').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Rad etilgan</div>
            </div>
          </div>
        </div>

        {/* Document Table */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Sarlavha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bo‘lim
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ustuvorlik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Holat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Yaratilgan vaqt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Harakat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        selectedRequest?.id === req.id ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-card-foreground">{req.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-card-foreground">{req.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                          {formatDepartmentToUzbek(req.department)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${getPriorityColor(formatPriorityToUzbek(req.priority))}`}>
                          {formatPriorityToUzbek(req.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${getStatusColor(req.status)}`}>
                            {getStatusIcon(req.status)}
                            {formatStatusToUzbek(req.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-card-foreground">
                            {new Date(req.createdAt).toLocaleString('uz-UZ', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">So‘rovlar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {selectedRequest && (
        <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-card border-l border-border shadow-2xl overflow-y-auto z-50">
          {/* Panel Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">So‘rov tafsilotlari</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-6 space-y-6">
            {/* Document Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                <span className="text-xs font-mono text-muted-foreground">{selectedRequest.id}</span>
                  <h4 className="text-lg font-semibold text-card-foreground mt-1">{selectedRequest.title}</h4>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  {formatStatusToUzbek(selectedRequest.status)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${getPriorityColor(formatPriorityToUzbek(selectedRequest.priority))}`}>
                  {formatPriorityToUzbek(selectedRequest.priority)}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                  'bg-cyan-100 text-cyan-700 border border-cyan-200'
                }`}>
                  So‘rov
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h5 className="text-sm font-semibold text-card-foreground mb-2">So‘rov matni</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedRequest.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <select
                value={selectedRequest.status}
                onChange={(e) => updateRequestStatus(selectedRequest.id, e.target.value as RequestStatus)}
                className="flex-1 px-3 py-2 bg-input-background rounded-lg text-sm border border-border focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all cursor-pointer"
              >
                <option value="new">Yangi</option>
                <option value="in_progress">Jarayonda</option>
                <option value="completed">Yakunlangan</option>
                <option value="rejected">Rad etilgan</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
