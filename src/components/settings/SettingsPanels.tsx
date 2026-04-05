import { useRef } from "react";
import clsx from "clsx";
import {
  Camera,
  Pencil,
  Loader2,
  Globe,
  LayoutGrid,
  Rows3,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import type { AuthUser } from "../../auth/AuthProvider";
import { SettingsCard } from "./SettingsCard";
import { SettingsToggle } from "./SettingsToggle";
import { PasswordField } from "./PasswordField";
import { getPasswordStrength, strengthBarClass } from "./passwordStrength";
import type { SettingsSectionId } from "./SettingsSidebar";
import { Logo } from "../ui/Logo";

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800 ring-purple-200/60",
    agent: "bg-blue-100 text-blue-800 ring-blue-200/60",
    user: "bg-slate-100 text-slate-800 ring-slate-200/60",
    department: "bg-emerald-100 text-emerald-800 ring-emerald-200/60",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
        styles[role] ?? "bg-slate-100 text-slate-800 ring-slate-200/60"
      )}
    >
      {role.replace("_", " ")}
    </span>
  );
}

interface ProfilePanelProps {
  fullName: string;
  email: string;
  user: AuthUser | null;
  avatarDataUrl: string | null;
  onAvatarFile: (file: File) => void;
  onGoAccount: () => void;
}

export function ProfilePanel({
  fullName,
  email,
  user,
  avatarDataUrl,
  onAvatarFile,
  onGoAccount,
}: ProfilePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <SettingsCard
      title="Profile"
      description="How you appear across the workspace."
      footer={
        <p className="text-xs text-slate-500">
          Profile details sync with your sign-in email where your organization uses SSO.
        </p>
      }
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div
            className={clsx(
              "flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl shadow-lg ring-4 ring-white dark:ring-slate-800/80",
              avatarDataUrl
                ? "bg-gradient-to-br from-[#2563EB] to-indigo-600"
                : "bg-white p-2 dark:bg-slate-900"
            )}
          >
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Logo variant="icon" size="lg" className="min-h-0 min-w-0" />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAvatarFile(f);
              e.target.value = "";
            }}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{fullName || "User"}</h3>
            <p className="mt-1 truncate text-sm text-slate-500">{email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <RoleBadge role={user?.role ?? "user"} />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={clsx(
                "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm",
                "transition-all duration-150 hover:scale-[1.02] hover:border-slate-300 hover:shadow-md"
              )}
            >
              <Camera className="h-4 w-4 text-slate-500" aria-hidden />
              Change avatar
            </button>
            <button
              type="button"
              onClick={onGoAccount}
              className={clsx(
                "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25",
                "transition-all duration-150 hover:scale-[1.02] hover:bg-blue-600 hover:shadow-lg"
              )}
            >
              <Pencil className="h-4 w-4 opacity-90" aria-hidden />
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

interface AccountPanelProps {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  role: string;
  saving: boolean;
  onSave: () => void;
}

export function AccountPanel({
  fullName,
  setFullName,
  email,
  setEmail,
  role,
  saving,
  onSave,
}: AccountPanelProps) {
  return (
    <SettingsCard
      title="Account"
      description="Update your display name and contact email."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className={clsx(
              "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md",
              "transition-all duration-150 hover:scale-[1.02] hover:bg-blue-600 hover:shadow-lg",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-1.5">
          <label htmlFor="acc-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="acc-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className={clsx(
              "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900",
              "transition-all duration-150 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            )}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="acc-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="acc-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={clsx(
              "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900",
              "transition-all duration-150 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            )}
          />
        </div>
        <div className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <input
            type="text"
            value={role}
            readOnly
            className="cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-600"
          />
          <p className="text-xs text-slate-500">Role is managed by your administrator.</p>
        </div>
      </div>
    </SettingsCard>
  );
}

interface SecurityPanelProps {
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  lastChangedLabel: string;
  saving: boolean;
  onUpdatePassword: () => void;
}

export function SecurityPanel({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  lastChangedLabel,
  saving,
  onUpdatePassword,
}: SecurityPanelProps) {
  const strength = getPasswordStrength(newPassword);

  return (
    <SettingsCard
      title="Security"
      description="Keep your account secure with a strong password."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Last changed: <span className="font-medium text-slate-700">{lastChangedLabel}</span>
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={onUpdatePassword}
            className={clsx(
              "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md",
              "transition-all duration-150 hover:scale-[1.02] hover:bg-slate-800 hover:shadow-lg",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update password
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <PasswordField
          id="pw-current"
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          hint="Enter your current password to verify your identity."
          autoComplete="current-password"
        />
        <div className="space-y-2">
          <PasswordField
            id="pw-new"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            hint="Use at least 8 characters with mixed case, numbers, and symbols."
            autoComplete="new-password"
          />
          {newPassword ? (
            <div className="pt-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={clsx(
                      "h-1.5 flex-1 rounded-full transition-colors duration-200",
                      i <= strength.score ? strengthBarClass[strength.level] : "bg-slate-100"
                    )}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs font-medium text-slate-600">
                Strength: <span className="text-slate-900">{strength.label}</span>
              </p>
            </div>
          ) : null}
        </div>
        <PasswordField
          id="pw-confirm"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          hint="Re-enter your new password to confirm."
          autoComplete="new-password"
        />
      </div>
    </SettingsCard>
  );
}

interface NotificationsPanelProps {
  emailNotif: boolean;
  setEmailNotif: (v: boolean) => void;
  systemNotif: boolean;
  setSystemNotif: (v: boolean) => void;
  requestUpdates: boolean;
  setRequestUpdates: (v: boolean) => void;
  onSave: () => void;
}

export function NotificationsPanel({
  emailNotif,
  setEmailNotif,
  systemNotif,
  setSystemNotif,
  requestUpdates,
  setRequestUpdates,
  onSave,
}: NotificationsPanelProps) {
  const rows = [
    {
      title: "Email notifications",
      description: "Receive updates via email",
      value: emailNotif,
      set: setEmailNotif,
      id: "notif-email",
    },
    {
      title: "System notifications",
      description: "Browser and in-app alerts for important events",
      value: systemNotif,
      set: setSystemNotif,
      id: "notif-system",
    },
    {
      title: "Request updates",
      description: "When requests you follow change status",
      value: requestUpdates,
      set: setRequestUpdates,
      id: "notif-requests",
    },
  ];

  return (
    <SettingsCard
      title="Notifications"
      description="Choose how we reach you."
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className={clsx(
              "rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md",
              "transition-all duration-150 hover:scale-[1.02] hover:bg-blue-600 hover:shadow-lg"
            )}
          >
            Save notification settings
          </button>
        </div>
      }
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className={clsx(
              "flex items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-slate-50/40 p-4",
              "transition-shadow duration-150 hover:border-slate-300 hover:shadow-sm"
            )}
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{row.title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{row.description}</p>
            </div>
            <SettingsToggle checked={row.value} onCheckedChange={row.set} id={row.id} />
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}

export type SettingsThemeChoice = "light" | "dark" | "system";

interface PreferencesPanelProps {
  theme: SettingsThemeChoice;
  setTheme: (t: SettingsThemeChoice) => void;
  language: string;
  setLanguage: (v: string) => void;
  density: "comfortable" | "compact";
  setDensity: (v: "comfortable" | "compact") => void;
  saving: boolean;
  onSave: () => void;
}

export function PreferencesPanel({
  theme,
  setTheme,
  language,
  setLanguage,
  density,
  setDensity,
  saving,
  onSave,
}: PreferencesPanelProps) {
  return (
    <SettingsCard
      title="Preferences"
      description="Appearance and layout for this device."
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className={clsx(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-md",
              "transition-all duration-150 hover:scale-[1.02] hover:bg-blue-600 hover:shadow-lg",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save preferences
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-slate-900">Theme</p>
          <p className="mt-0.5 text-sm text-slate-500">Choose how the interface looks.</p>
          <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-inner">
            {(
              [
                { id: "light" as SettingsThemeChoice, icon: Sun, label: "Light" },
                { id: "dark" as SettingsThemeChoice, icon: Moon, label: "Dark" },
                { id: "system" as SettingsThemeChoice, icon: Monitor, label: "System" },
              ] as const
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={clsx(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150",
                  theme === id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Globe className="h-4 w-4 text-slate-400" aria-hidden />
            Language
          </p>
          <p className="mt-0.5 text-sm text-slate-500">Interface language.</p>
          <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1">
            {(
              [
                { value: "en", label: "English" },
                { value: "uz", label: "Oʻzbek" },
                { value: "ru", label: "Русский" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLanguage(value)}
                className={clsx(
                  "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150",
                  language === value
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:bg-white/70"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Density</p>
          <p className="mt-0.5 text-sm text-slate-500">Spacing in lists and tables.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-150",
                density === "comfortable"
                  ? "border-[#2563EB] bg-blue-50/80 text-blue-900 shadow-sm ring-1 ring-blue-200/60"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              )}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Comfortable
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-150",
                density === "compact"
                  ? "border-[#2563EB] bg-blue-50/80 text-blue-900 shadow-sm ring-1 ring-blue-200/60"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              )}
            >
              <Rows3 className="h-4 w-4" aria-hidden />
              Compact
            </button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

export function SettingsSectionContent(props: {
  section: SettingsSectionId;
  profile: ProfilePanelProps;
  account: AccountPanelProps;
  security: SecurityPanelProps;
  notifications: NotificationsPanelProps;
  preferences: PreferencesPanelProps;
}) {
  const { section, profile, account, security, notifications, preferences } = props;
  return (
    <div
      key={section}
      className="animate-in fade-in slide-in-from-right-3 duration-200 ease-out motion-reduce:animate-none motion-reduce:opacity-100"
    >
      {section === "profile" && <ProfilePanel {...profile} />}
      {section === "account" && <AccountPanel {...account} />}
      {section === "security" && <SecurityPanel {...security} />}
      {section === "notifications" && <NotificationsPanel {...notifications} />}
      {section === "preferences" && <PreferencesPanel {...preferences} />}
    </div>
  );
}
