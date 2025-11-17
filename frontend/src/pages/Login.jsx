// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { user, login, error } = useAuth();
  const navigate = useNavigate();

  const [utorid, setUtorid] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {/* Overall content wrapper with max width */}
      <div className="w-full max-w-5xl flex bg-transparent">
        {/* Left brand / welcome panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-white border border-slate-100 rounded-3xl px-12 py-10 mr-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
              ⚡
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
                ⚡
              </div>
              <span className="text-xl font-semibold text-slate-900">
                PointsVelocity
              </span>
            </div>

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

                <p className="text-xs text-slate-500">
                  Having trouble logging in? Contact a manager.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
