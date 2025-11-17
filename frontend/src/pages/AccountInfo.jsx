import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Loader2,
  Mail,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { AppLayout } from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import { updateMe } from "../api/users";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const isUofTEmail = (value) =>
  /^[^@]+@mail\.utoronto\.ca$/i.test((value || "").trim());

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  const [yy, mm, dd] = value.split("-").map(Number);
  return (
    d.getUTCFullYear() === yy &&
    d.getUTCMonth() + 1 === mm &&
    d.getUTCDate() === dd
  );
};

export default function AccountInfo() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [birthday, setBirthday] = useState(user?.birthday ?? "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null
  );
  const [objectUrl, setObjectUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setBirthday(user.birthday ?? "");
    if (!avatarFile) {
      setPreviewUrl(user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null);
    }
  }, [user, avatarFile]);

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl]
  );

  const baseAvatarFallback = useMemo(
    () => (user?.name || user?.utorid || "User").slice(0, 2).toUpperCase(),
    [user?.name, user?.utorid]
  );

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const currentBirthday = user?.birthday ?? "";

  const hasChanges =
    avatarFile ||
    trimmedName !== (user?.name ?? "") ||
    trimmedEmail !== (user?.email ?? "") ||
    birthday !== currentBirthday;

  const handleAvatarChange = (file) => {
    if (!file) return;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setPreviewUrl(url);
    setObjectUrl(url);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!hasChanges) {
      setStatus({ type: "error", message: "No changes to save yet." });
      return;
    }

    if (trimmedName && (trimmedName.length < 1 || trimmedName.length > 50)) {
      setStatus({
        type: "error",
        message: "Name must be between 1 and 50 characters.",
      });
      return;
    }

    if (trimmedEmail && !isUofTEmail(trimmedEmail)) {
      setStatus({
        type: "error",
        message: "Use a valid @mail.utoronto.ca email address.",
      });
      return;
    }

    if (birthday && !isValidDate(birthday)) {
      setStatus({
        type: "error",
        message: "Birthday must be a valid date (YYYY-MM-DD).",
      });
      return;
    }

    const payload = {};
    if (trimmedName && trimmedName !== (user?.name ?? "")) {
      payload.name = trimmedName;
    }
    if (trimmedEmail && trimmedEmail !== (user?.email ?? "")) {
      payload.email = trimmedEmail;
    }
    if (birthday && birthday !== currentBirthday) {
      payload.birthday = birthday;
    }
    if (avatarFile) {
      payload.avatar = avatarFile;
    }

    if (!Object.keys(payload).length) {
      setStatus({ type: "error", message: "No changes to save yet." });
      return;
    }

    try {
      setSaving(true);
      const updated = await updateMe(payload);
      setUser(updated);
      setAvatarFile(null);
      setStatus({ type: "success", message: "Account updated successfully." });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update account.";
      setStatus({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Account Information" showSearch={false}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#f4f4f5] p-6">
          <h2 className="text-xl font-semibold text-[#18181b] mb-2">
            Keep your details up to date
          </h2>
          <p className="text-sm text-[#52525b]">
            Your name, UofT email, birthday, and avatar are used across the
            portal. Changes apply to future redemptions and check-ins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          <div className="bg-white rounded-2xl border border-[#f4f4f5] p-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-[#f4f4f5] flex items-center justify-center overflow-hidden text-[#18181b] text-2xl font-semibold mb-4 border border-[#e4e4e7]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{baseAvatarFallback}</span>
              )}
            </div>
            <div className="text-sm text-[#52525b] mb-4 text-center">
              Upload a square image (PNG, JPG, or WEBP).
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a862] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#008551] transition shadow-sm">
              <Camera size={18} strokeWidth={1.8} />
              <span>Change photo</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
            </label>
            {avatarFile && (
              <p className="mt-3 text-xs text-[#2563eb]">
                Selected: {avatarFile.name}
              </p>
            )}
          </div>

          <form
            className="bg-white rounded-2xl border border-[#f4f4f5] p-6 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#18181b] mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <UserIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#18181b] focus:border-[#00a862] focus:bg-white outline-none transition"
                  />
                </div>
                <p className="mt-1 text-xs text-[#71717a]">
                  1-50 characters. This appears on receipts and badges.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#18181b] mb-1.5">
                  UofT email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mail.utoronto.ca"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#18181b] focus:border-[#00a862] focus:bg-white outline-none transition"
                  />
                </div>
                <p className="mt-1 text-xs text-[#71717a]">
                  Must end with @mail.utoronto.ca
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#18181b] mb-1.5">
                  Birthday
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
                  />
                  <input
                    type="date"
                    value={birthday || ""}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#18181b] focus:border-[#00a862] focus:bg-white outline-none transition"
                  />
                </div>
                <p className="mt-1 text-xs text-[#71717a]">
                  Optional, format YYYY-MM-DD.
                </p>
              </div>
            </div>

            {status && (
              <div
                className={`rounded-xl px-3 py-2 text-sm ${
                  status.type === "success"
                    ? "bg-[#ecfdf3] text-[#166534] border border-[#bbf7d0]"
                    : "bg-[#fef2f2] text-[#b91c1c] border border-[#fecdd3]"
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-[#00a862] text-white text-sm font-medium hover:bg-[#008551] transition disabled:cursor-not-allowed disabled:bg-[#9ee2c2]"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Saving changes..." : "Save changes"}
              </button>
              {!hasChanges && (
                <span className="text-xs text-[#71717a]">
                  Make an update to enable saving.
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
