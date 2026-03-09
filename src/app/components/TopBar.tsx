import { Search, Bell, Plus, ChevronDown } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents, tasks, or people..."
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg text-sm border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 ml-6">
        {/* New Document Button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all">
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-sidebar-accent rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-sidebar-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-sidebar-accent rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-sm">
            JD
          </div>
          <span className="text-sm text-sidebar-foreground">John Doe</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
