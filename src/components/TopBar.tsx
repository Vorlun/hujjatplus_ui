import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests } from "../api/requests";
import { fetchAllDocuments } from "../api/documents";
import { NotificationDropdown } from "./topbar/NotificationDropdown";
import { ProfileMenu } from "./topbar/ProfileMenu";
import { Logo } from "./ui/Logo";

interface TopBarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

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
  const myRequests = user?.id ? requests.filter((r) => r.requester_id === user.id) : requests;

  const searchResults = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q || q.length < 2) return { requests: [], documents: [] };
    const reqs = (user?.role === "user" ? myRequests : requests)
      .filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q)
      )
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
    <header className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        {showMenuButton && (
          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuClick}
            className="shrink-0 rounded-xl p-2 text-[#111827] transition-transform duration-150 hover:scale-105 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Logo variant="icon" size="sm" className="shrink-0" />
        <div className="relative min-w-0 max-w-xl flex-1" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search requests or documents..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
        />
        {searchOpen && searchValue.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {!hasSearchResults ? (
              <p className="px-4 py-3 text-sm text-slate-500">No results</p>
            ) : (
              <>
                {searchResults.requests.length > 0 && (
                  <div className="px-2 pb-1">
                    <p className="px-2 py-1 text-xs font-medium uppercase text-slate-500">Requests</p>
                    {searchResults.requests.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchValue("");
                          navigate(
                            user?.role === "user"
                              ? `/my-requests/${r.id}`
                              : `/admin/requests`
                          );
                        }}
                        className="flex w-full flex-col rounded-lg px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="truncate font-medium text-slate-900">{r.title || r.id}</span>
                        <span className="font-mono text-xs text-slate-500">{r.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.documents.length > 0 && (
                  <div className="px-2">
                    <p className="px-2 py-1 text-xs font-medium uppercase text-slate-500">Documents</p>
                    {searchResults.documents.map((d) => (
                      <a
                        key={d.id}
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchValue("");
                        }}
                        className="block rounded-lg px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <span className="truncate font-medium text-slate-900">{d.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-1 sm:ml-4 sm:gap-2">
        <div className="relative" ref={notifRef}>
          <NotificationDropdown
            open={notifOpen}
            onOpenChange={(o) => {
              setNotifOpen(o);
              if (o) setProfileOpen(false);
            }}
            userRole={user?.role}
          />
        </div>

        <div className="relative" ref={profileRef}>
          <ProfileMenu
            open={profileOpen}
            onOpenChange={(o) => {
              setProfileOpen(o);
              if (o) setNotifOpen(false);
            }}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
