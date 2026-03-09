import { useState, useEffect } from "react";
import { Settings, User, Shield, Bell, Moon, Sun } from "lucide-react";
import { useAuth } from "../auth/useAuth";

const STORAGE_NAME = "profile_display_name";

export function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("en");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [emailNotif, setEmailNotif] = useState(true);
  const [systemNotif, setSystemNotif] = useState(true);
  const [requestUpdates, setRequestUpdates] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_NAME);
    const nameFromEmail = user?.email?.split("@")[0] ?? "";
    setFullName(stored ?? nameFromEmail);
    setEmail(user?.email ?? "");
  }, [user?.email]);

  const initials = fullName.trim().split(/\s+/).map((s) => s[0]).join("").toUpperCase().slice(0, 2) || (user?.email?.slice(0, 2).toUpperCase() ?? "U");

  const handleSaveAccount = () => {
    if (fullName.trim()) localStorage.setItem(STORAGE_NAME, fullName.trim());
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#7C3AED]" />
          Profile Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences.</p>
      </div>

      {/* Profile summary card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[#111827]">{fullName || "User"}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role ?? "—"}</p>
            <a href={`mailto:${user?.email}`} className="text-sm text-[#7C3AED] hover:underline truncate block">
              {user?.email}
            </a>
          </div>
        </div>
      </div>

      {/* Section 1: Account Information */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#7C3AED]" />
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Role</label>
            <input
              type="text"
              value={user?.role ?? ""}
              readOnly
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 cursor-not-allowed capitalize"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveAccount}
            className="px-4 py-2 rounded-md bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Section 2: Security */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#7C3AED]" />
          Security
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400 mt-1">Enter your current password to verify your identity.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400 mt-1">Use at least 8 characters with a mix of letters and numbers.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400 mt-1">Re-enter your new password to confirm.</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Section 3: Notification Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#7C3AED]" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-700">Email Notifications</label>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotif}
              onClick={() => setEmailNotif((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${emailNotif ? "bg-[#7C3AED]" : "bg-gray-200"}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${emailNotif ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-700">System Notifications</label>
            <button
              type="button"
              role="switch"
              aria-checked={systemNotif}
              onClick={() => setSystemNotif((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${systemNotif ? "bg-[#7C3AED]" : "bg-gray-200"}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${systemNotif ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-700">Request Updates</label>
            <button
              type="button"
              role="switch"
              aria-checked={requestUpdates}
              onClick={() => setRequestUpdates((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${requestUpdates ? "bg-[#7C3AED]" : "bg-gray-200"}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${requestUpdates ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Interface Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-[#7C3AED]" />
          Interface Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Theme</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${theme === "light" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${theme === "dark" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="uz">O‘zbek</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Dashboard density</label>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as "comfortable" | "compact")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
