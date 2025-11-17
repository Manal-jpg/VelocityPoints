import { useMemo, useState } from "react";
import { AppLayout } from "../components/layout/Layout";
import { changeMyPassword } from "../api/auth";

const pwStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

export default function ChangePassword() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const errors = useMemo(() => {
    const list = [];
    if (newPw && !pwStrong.test(newPw)) {
      list.push(
        "New password must be 8-20 chars and include upper, lower, number, and symbol."
      );
    }
    if (newPw && confirmPw && newPw !== confirmPw) {
      list.push("Passwords do not match.");
    }
    return list;
  }, [newPw, confirmPw]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPw || !newPw || !confirmPw) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (errors.length) {
      setStatus({ type: "error", message: errors[0] });
      return;
    }
    if (currentPw === newPw) {
      setStatus({
        type: "error",
        message: "New password must be different from your current one.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await changeMyPassword({ old: currentPw, new: newPw });
      setStatus({
        type: "success",
        message: "Password updated successfully.",
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update password.";
      setStatus({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Password & Security" showSearch={false}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#f4f4f5] p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#18181b]">
            Change password
          </h2>
          <p className="text-sm text-[#52525b] mt-1">
            Use your current password to set a new one. Strong passwords include
            upper, lower, numbers, and symbols.
          </p>
        </div>

        {status && (
          <div
            className={`rounded-xl px-3 py-2 text-sm ${
              status.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#18181b] mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#18181b] focus:border-[#00a862] focus:bg-white outline-none transition"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#18181b] mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#18181b] focus:border-[#00a862] focus:bg-white outline-none transition"
              autoComplete="new-password"
            />
            <p className="text-xs text-[#71717a] mt-1">
              8-20 chars, include upper, lower, number, and symbol.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#18181b] mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#18181b] focus:border-[#00a862] focus:bg-white outline-none transition"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-4 h-11 rounded-xl bg-[#00a862] text-white text-sm font-medium hover:bg-[#008551] transition disabled:cursor-not-allowed disabled:bg-[#9ee2c2]"
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
            {errors.length > 0 && (
              <span className="text-xs text-[#b91c1c]">{errors[0]}</span>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
