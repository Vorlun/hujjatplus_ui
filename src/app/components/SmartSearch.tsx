import { useMemo, useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  X, 
  SlidersHorizontal, 
  ChevronDown,
  TrendingUp,
  Clock,
  Lightbulb,
} from 'lucide-react';
import { SearchResultCard } from './SearchResultCard';
import { useRequests } from '../store/requestStore';
import { formatDepartmentToUzbek, formatPriorityToUzbek, formatStatusToUzbek } from '../utils/helpers';
import type { Request } from '../types/request';

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

interface AISuggestion {
  id: string;
  text: string;
  type: 'related' | 'recent' | 'trending';
  relatedDocs: number;
}

const mapRequestToSearchResult = (request: Request): SearchResult => {
  const department = formatDepartmentToUzbek(request.department);

  return {
    id: request.id,
    title: request.title,
    summary: request.message,
    department,
    author: department,
    date: request.createdAt,
    category: department,
    priority: 'High',
    documentType: 'Request',
  };
};

const aiSuggestions: AISuggestion[] = [
  {
    id: 's1',
    text: 'marketing strategy',
    type: 'trending',
    relatedDocs: 12,
  },
  {
    id: 's2',
    text: 'employee onboarding',
    type: 'recent',
    relatedDocs: 8,
  },
  {
    id: 's3',
    text: 'security audit',
    type: 'related',
    relatedDocs: 15,
  },
  {
    id: 's4',
    text: 'budget report',
    type: 'trending',
    relatedDocs: 10,
  },
  {
    id: 's5',
    text: 'customer feedback',
    type: 'recent',
    relatedDocs: 6,
  },
];

export function SmartSearch() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<AISuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const { requests } = useRequests();

  useEffect(() => {
    if (query.length > 0) {
      setShowSuggestions(true);
      const filtered = aiSuggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [query]);

  const handleSearch = () => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    const allResults = requests.map(mapRequestToSearchResult);

    const filtered = allResults.filter((result) => {
      const q = query.toLowerCase();

      const matchesQuery =
        result.title.toLowerCase().includes(q) ||
        result.summary.toLowerCase().includes(q) ||
        result.department.toLowerCase().includes(q) ||
        result.id.toLowerCase().includes(q);

      const matchesDepartment =
        selectedDepartment === 'all' ||
        result.department.toLowerCase().includes(selectedDepartment.toLowerCase());

      const matchesStatus =
        selectedCategory === 'all' ||
        formatStatusToUzbek((requests.find((r) => r.id === result.id) ?? requests[0])!.status)
          .toLowerCase()
          .includes(selectedCategory.toLowerCase());

      return matchesQuery && matchesDepartment && matchesStatus;
    });

    setResults(filtered);
    setIsSearching(false);
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    // Trigger search with suggestion
    setTimeout(() => handleSearch(), 100);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedDepartment('all');
    setSelectedDocType('all');
    setSelectedPriority('all');
    setDateRange('all');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="w-3.5 h-3.5 text-orange-500" />;
      case 'recent':
        return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      case 'related':
        return <Lightbulb className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Search className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const activeFilterCount = [selectedCategory, selectedDepartment, selectedDocType, selectedPriority, dateRange].filter(
    (f) => f !== 'all'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Smart Document Search</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered search to find documents, tasks, and information instantly
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search documents, tasks, or departments..."
              className="w-full pl-12 pr-12 py-4 text-base bg-card border-2 border-border rounded-xl focus:outline-none focus:border-purple-500 transition-all shadow-lg"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* AI Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
              <div className="p-3 bg-purple-50 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">AI Suggestions</span>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="text-sm text-card-foreground">{suggestion.text}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.relatedDocs} documents
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Departments</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                {/* Document Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Document Type</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Report">Report</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Audit">Audit</option>
                    <option value="Contract">Contract</option>
                    <option value="Survey">Survey</option>
                    <option value="Roadmap">Roadmap</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching with AI...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Search Results</h2>
                <p className="text-sm text-muted-foreground">
                  Found {results.length} {results.length === 1 ? 'document' : 'documents'} matching your query
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">AI-ranked results</span>
              </div>
            </div>
            <div className="space-y-4">
              {results.map((result) => (
                <SearchResultCard key={result.id} result={result} query={query} />
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Start searching</h3>
            <p className="text-muted-foreground mb-6">
              Enter a keyword to search across all documents, tasks, and departments
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {aiSuggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
