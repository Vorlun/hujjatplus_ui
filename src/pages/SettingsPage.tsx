import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { SettingsSidebar, type SettingsSectionId } from "../components/settings/SettingsSidebar";
import {
  SettingsSectionContent,
  type SettingsThemeChoice,
} from "../components/settings/SettingsPanels";
import { Logo } from "../components/ui/Logo";

const STORAGE_NAME = "profile_display_name";
const STORAGE_AVATAR = "settings_avatar_data_url";
const STORAGE_LAST_PW = "settings_password_changed_at";
const STORAGE_NOTIF = "settings_notifications_v1";
const STORAGE_PREF = "settings_preferences_v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function applyRootTheme(t: SettingsThemeChoice) {
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
  } else if (t === "light") {
    root.classList.remove("dark");
  } else {
    root.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<SettingsSectionId>("profile");

  const prefs = readJson(STORAGE_PREF, {
    theme: "light" as SettingsThemeChoice,
    language: "en",
    density: "comfortable" as "comfortable" | "compact",
  });
  const notif = readJson(STORAGE_NOTIF, {
    emailNotif: true,
    systemNotif: true,
    requestUpdates: true,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lastPwChange, setLastPwChange] = useState<string | null>(null);

  const [theme, setTheme] = useState<SettingsThemeChoice>(prefs.theme ?? "light");
  const [language, setLanguage] = useState(prefs.language ?? "en");
  const [density, setDensity] = useState<"comfortable" | "compact">(prefs.density ?? "comfortable");

  const [emailNotif, setEmailNotif] = useState(notif.emailNotif);
  const [systemNotif, setSystemNotif] = useState(notif.systemNotif);
  const [requestUpdates, setRequestUpdates] = useState(notif.requestUpdates);

  const [accountSaving, setAccountSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_NAME);
    const nameFromEmail = user?.email?.split("@")[0] ?? "";
    setFullName(stored ?? nameFromEmail);
    setEmail(user?.email ?? "");
  }, [user?.email]);

  useEffect(() => {
    setLastPwChange(localStorage.getItem(STORAGE_LAST_PW));
    const av = localStorage.getItem(STORAGE_AVATAR);
    if (av) setAvatarDataUrl(av);
    document.documentElement.dataset.density = density;
    document.documentElement.lang = language;
  }, []);

  useEffect(() => {
    applyRootTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyRootTheme("system");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [theme]);

  const lastChangedLabel = lastPwChange
    ? new Date(lastPwChange).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Never";

  async function handleSaveAccount() {
    setAccountSaving(true);
    await delay(450);
    if (fullName.trim()) localStorage.setItem(STORAGE_NAME, fullName.trim());
    setAccountSaving(false);
    toast.success("Account saved", { description: "Your profile details were updated." });
  }

  function handleAvatarFile(file: File) {
    if (file.size > 120_000) {
      toast.error("Image too large", { description: "Please choose an image under 120 KB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setAvatarDataUrl(data);
      localStorage.setItem(STORAGE_AVATAR, data);
      toast.success("Avatar updated");
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdatePassword() {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password too short", { description: "Use at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSecuritySaving(true);
    await delay(600);
    const iso = new Date().toISOString();
    localStorage.setItem(STORAGE_LAST_PW, iso);
    setLastPwChange(iso);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSecuritySaving(false);
    toast.success("Password updated", { description: "Your password change has been recorded." });
  }

  function handleSaveNotifications() {
    localStorage.setItem(
      STORAGE_NOTIF,
      JSON.stringify({ emailNotif, systemNotif, requestUpdates })
    );
    toast.success("Notification settings saved");
  }

  async function handleSavePreferences() {
    setPrefSaving(true);
    await delay(400);
    localStorage.setItem(STORAGE_PREF, JSON.stringify({ theme, language, density }));
    document.documentElement.dataset.density = density;
    document.documentElement.lang = language;
    setPrefSaving(false);
    toast.success("Preferences saved");
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#F8FAFC] -mx-4 -mt-4 px-4 pb-12 pt-4 md:-mx-6 md:px-6 md:pb-16 md:pt-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
          <div className="flex items-start gap-3">
            <Logo variant="icon" size="lg" className="shrink-0" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Profile settings
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your account information and preferences.
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <aside className="shrink-0 md:w-56 md:pt-1">
            <SettingsSidebar active={section} onSelect={setSection} />
          </aside>

          <main className="min-w-0 flex-1 pb-10">
            <SettingsSectionContent
              section={section}
              profile={{
                fullName,
                email,
                user,
                avatarDataUrl,
                onAvatarFile: handleAvatarFile,
                onGoAccount: () => setSection("account"),
              }}
              account={{
                fullName,
                setFullName,
                email,
                setEmail,
                role: user?.role ?? "",
                saving: accountSaving,
                onSave: handleSaveAccount,
              }}
              security={{
                currentPassword,
                setCurrentPassword,
                newPassword,
                setNewPassword,
                confirmPassword,
                setConfirmPassword,
                lastChangedLabel,
                saving: securitySaving,
                onUpdatePassword: handleUpdatePassword,
              }}
              notifications={{
                emailNotif,
                setEmailNotif,
                systemNotif,
                setSystemNotif,
                requestUpdates,
                setRequestUpdates,
                onSave: handleSaveNotifications,
              }}
              preferences={{
                theme,
                setTheme,
                language,
                setLanguage,
                density,
                setDensity,
                saving: prefSaving,
                onSave: handleSavePreferences,
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
