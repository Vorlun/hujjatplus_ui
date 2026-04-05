export type StrengthLevel = "weak" | "fair" | "good" | "strong";

/** 0–3 inclusive → four-segment bar (fill segments 0..score) */
export function getPasswordStrength(password: string): { score: number; level: StrengthLevel; label: string } {
  let raw = 0;
  if (password.length >= 6) raw++;
  if (password.length >= 10) raw++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) raw++;
  if (/\d/.test(password)) raw++;
  if (/[^a-zA-Z0-9]/.test(password)) raw++;

  const score = Math.min(3, Math.floor(raw * 0.65));
  const level: StrengthLevel =
    score <= 0 ? "weak" : score === 1 ? "fair" : score === 2 ? "good" : "strong";
  const labels: Record<StrengthLevel, string> = {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
  };
  return { score, level, label: labels[level] };
}

export const strengthBarClass: Record<StrengthLevel, string> = {
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-blue-500",
  strong: "bg-emerald-500",
};
