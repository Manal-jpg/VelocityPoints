// src/pages/Login.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { requestPasswordReset } from "../api/auth";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const getInitials = (name, utorid) => {
  const source = name || utorid || "";
  if (!source) return "??";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Login() {
  const { user, login, error } = useAuth();
  const navigate = useNavigate();

  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetInfo, setResetInfo] = useState(null);

  const storedProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem("authUserProfile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const storedAvatarUrl = storedProfile?.avatarUrl
    ? `${API_BASE_URL}${storedProfile.avatarUrl}`
    : null;
  const storedInitials = getInitials(
    storedProfile?.name,
    storedProfile?.utorid
  );

  // If already logged in, send to main dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!utorid || !password) {
      setLocalError("Please enter both UTORid and password.");
      return;
    }

    try {
      setSubmitting(true);
      await login({ utorid, password });
      navigate("/"); // TODO => redirect to role-based dashboard later!!!!!!! If someone else sees this, please remind me!
    } catch {
      // context `error` is already set by login()
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!utorid.trim()) {
      setResetError("Please enter your UTORid first.");
      setResetInfo(null);
      return;
    }

    setResetLoading(true);
    setResetError("");
    setResetInfo(null);
    try {
      const data = await requestPasswordReset({ utorid: utorid.trim() });
      setResetInfo(data);
    } catch (e) {
      console.error(e);
      setResetError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Unable to send reset token."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {/* Overall content wrapper with max width */}
      <div className="w-full max-w-5xl flex bg-transparent">
        {/* Left brand / welcome panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-white border border-slate-100 rounded-3xl px-12 py-10 mr-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
              PV
            </div>
            <span className="text-xl font-semibold text-slate-900">
              PointsVelocity
            </span>
          </div>

          <div className="mt-20 space-y-4 max-w-md">
            <h1 className="text-3xl font-semibold text-slate-900">
              Welcome back,
            </h1>
            <p className="text-slate-600">
              Sign in to view your points, track transactions, and manage events
              all in one place.
            </p>

            <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-sm text-emerald-800 font-medium">
                Tip: Managers and cashiers can switch interfaces after logging
                in from the top-right menu.
              </p>
            </div>
          </div>

          <div className="mt-auto text-xs text-slate-400">
            © {new Date().getFullYear()} PointsVelocity · Internal use only
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Brand for mobile */}
            <div className="mb-10 lg:hidden flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                PV
              </div>
              <span className="text-xl font-semibold text-slate-900">
                PointsVelocity
              </span>
            </div>

            {storedProfile && (
              <div className="mb-6 inline-flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold overflow-hidden">
                  {storedAvatarUrl ? (
                    <img
                      src={storedAvatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{storedInitials}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-900 font-semibold leading-tight">
                    {storedProfile.name || storedProfile.utorid || "Welcome"}
                  </p>
                  <p className="text-xs text-slate-500">Welcome back</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-8 py-10">
              <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use your assigned UTORid and password to access the portal.
              </p>

              {(localError || error) && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {localError || error}
                </div>
              )}
              {resetError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {resetError}
                </div>
              )}
              {resetInfo && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  <p className="font-semibold">Reset token generated</p>
                  <p className="text-slate-700">
                    We emailed the reset details to the admin inbox. You can
                    also copy the token below for testing.
                  </p>
                  <p className="break-all text-slate-600 mt-2">
                    Token: {resetInfo.resetToken}
                  </p>
                  {resetInfo.expiresAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Expires: {new Date(resetInfo.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="utorid"
                    className="block text-sm font-medium text-slate-700"
                  >
                    UTORid
                  </label>
                  <input
                    id="utorid"
                    type="text"
                    value={utorid}
                    onChange={(e) => setUtorid(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g. munkhb10"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {submitting ? "Signing in..." : "Sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetLoading ? "Sending reset..." : "Forgot password?"}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    Already have a token?{" "}
                    <Link
                      to="/reset"
                      className="text-emerald-600 hover:underline"
                    >
                      Go to reset page
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
