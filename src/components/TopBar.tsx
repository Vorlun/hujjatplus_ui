import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu, MessageSquare, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests } from "../api/requests";
import { fetchAllDocuments } from "../api/documents";
import { fetchDepartments } from "../api/departments";

interface TopBarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const recentNotifications = [
  { id: "1", message: "New request assigned", time: "2 min ago", icon: MessageSquare },
  { id: "2", message: "Request status updated to Resolved", time: "15 min ago", icon: CheckCircle },
  { id: "3", message: "Document uploaded for review", time: "1 hour ago", icon: FileText },
];

export function TopBar({ onMenuClick, showMenuButton = false }: TopBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [] } = useQuery({ queryKey: ["requests"], queryFn: fetchAllRequests });
  const { data: documents = [] } = useQuery({ queryKey: ["documents"], queryFn: fetchAllDocuments });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });

  const myRequests = user?.id ? requests.filter((r) => r.requester_id === user.id) : requests;
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  const searchResults = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q || q.length < 2) return { requests: [], documents: [] };
    const reqs = (user?.role === "user" ? myRequests : requests)
      .filter((r) => r.title?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
      .slice(0, 5);
    const docs = documents
      .filter((d) => d.title?.toLowerCase().includes(q) || d.id?.toLowerCase().includes(q))
      .slice(0, 5);
    return { requests: reqs, documents: docs };
  }, [searchValue, user?.role, myRequests, requests, documents]);

  const hasSearchResults = searchResults.requests.length > 0 || searchResults.documents.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between gap-2 px-4 md:px-6 bg-white border-b border-gray-200 sticky top-0 z-20">
      {showMenuButton && (
        <button type="button" aria-label="Open menu" onClick={onMenuClick} className="p-2 rounded-xl hover:bg-gray-100 text-[#111827]">
          <Menu className="w-5 h-5" />
        </button>
      )}
      <div className="flex-1 min-w-0 max-w-xl relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search requests or documents..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#111827] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
        />
        {searchOpen && searchValue.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 max-h-80 overflow-y-auto">
            {!hasSearchResults ? (
              <p className="px-4 py-3 text-sm text-gray-500">No results</p>
            ) : (
              <>
                {searchResults.requests.length > 0 && (
                  <div className="px-2 pb-1">
                    <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Requests</p>
                    {searchResults.requests.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { setSearchOpen(false); setSearchValue(""); navigate(user?.role === "user" ? `/my-requests/${r.id}` : `/admin/requests`); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg flex flex-col"
                      >
                        <span className="font-medium text-[#111827] truncate">{r.title || r.id}</span>
                        <span className="text-xs text-gray-500 font-mono">{r.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.documents.length > 0 && (
                  <div className="px-2">
                    <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Documents</p>
                    {searchResults.documents.map((d) => (
                      <a
                        key={d.id}
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { setSearchOpen(false); setSearchValue(""); }}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-[#111827] truncate">{d.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-[#111827] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7C3AED] rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#111827]">Notifications</p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {recentNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <li key={n.id} className="px-4 py-3 hover:bg-gray-50 flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#7C3AED]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#111827]">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.slice(0, 2).toUpperCase() ?? "U"}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-[#111827] truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button type="button" onClick={() => { setProfileOpen(false); navigate("/settings"); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111827] hover:bg-gray-50 text-left">
                <User className="w-4 h-4" /> Profile
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); navigate("/settings"); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111827] hover:bg-gray-50 text-left">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 text-left">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
