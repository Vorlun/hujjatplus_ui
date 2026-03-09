import { FileText, Calendar, User, Building2 } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  department: string;
  author: string;
  date: string;
  category: string;
  priority: Priority;
  documentType: string;
}

interface SearchResultCardProps {
  result: SearchResult;
  query: string;
}

export function SearchResultCard({ result, query }: SearchResultCardProps) {
  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-card-foreground px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-card-foreground mb-1 group-hover:text-purple-700 transition-colors">
              {highlightText(result.title, query)}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                {result.category}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {result.documentType}
              </span>
              <PriorityBadge priority={result.priority} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {highlightText(result.summary, query)}
      </p>

      {/* Footer Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          <span>{result.department}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{result.author}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
