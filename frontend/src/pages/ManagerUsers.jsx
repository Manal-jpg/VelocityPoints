import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Shield,
} from "lucide-react";
import { AppLayout } from "../components/layout/Layout";
import { listUsers } from "../api/users";
import { useAuth } from "../hooks/useAuth";

const roleOptions = [
  { label: "All roles", value: "" },
  { label: "Regular", value: "regular" },
  { label: "Cashier", value: "cashier" },
  { label: "Manager", value: "manager" },
  { label: "Superuser", value: "superuser" },
];

const verifiedOptions = [
  { label: "Any verification", value: "" },
  { label: "Verified", value: "true" },
  { label: "Unverified", value: "false" },
];

const activationOptions = [
  { label: "Any activity", value: "" },
  { label: "Activated", value: "true" },
  { label: "Never logged in", value: "false" },
];

const sortOptions = [
  { label: "Newest first", value: "created-desc" },
  { label: "Recently active", value: "lastLogin-desc" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Role", value: "role-asc" },
];

const toRoleSet = (user) => {
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];
  return new Set(roles.map((r) => String(r).toLowerCase()));
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ManagerUsers() {
  const { user, loading: authLoading } = useAuth();
  const roleSet = useMemo(() => toRoleSet(user), [user]);
  const canView = roleSet.has("manager") || roleSet.has("superuser");

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    verified: "",
    activated: "",
  });
  const [sortBy, setSortBy] = useState("created-desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !canView) return;

    let cancelled = false;
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { page, limit };
        if (filters.search.trim()) params.name = filters.search.trim();
        if (filters.role) params.role = filters.role;
        if (filters.verified !== "") params.verified = filters.verified;
        if (filters.activated !== "") params.activated = filters.activated;

        const { results = [], count = 0 } = await listUsers(params);
        if (!cancelled) {
          setUsers(results);
          setTotal(count);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Unable to load users right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page, limit, filters, canView, authLoading]);

  const sortedUsers = useMemo(() => {
    const sorted = [...users];
    const toTime = (value) => (value ? new Date(value).getTime() || 0 : 0);

    sorted.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || a.utorid || "").localeCompare(
            b.name || b.utorid || ""
          );
        case "role-asc":
          return (a.role || "").localeCompare(b.role || "");
        case "lastLogin-desc":
          return toTime(b.lastLogin) - toTime(a.lastLogin);
        case "created-desc":
        default:
          return toTime(b.createdAt) - toTime(a.createdAt);
      }
    });
    return sorted;
  }, [users, sortBy]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  if (!authLoading && !canView) {
    return <Navigate to="/" replace />;
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", role: "", verified: "", activated: "" });
    setPage(1);
  };

  return (
    <AppLayout title="Users">
      <div className="space-y-5">
        <div className="bg-white border border-[#f4f4f5] rounded-2xl p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-[#71717a]">User directory</p>
              <h2
                className="text-xl text-[#18181b]"
                style={{ fontWeight: 600 }}
              >
                {total.toLocaleString()} users found
              </h2>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-[320px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
                  size={18}
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by name or UTORid"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#e4e4e7] bg-white text-sm focus:border-[#00a862] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 rounded-xl border border-[#e4e4e7] bg-white px-3 text-sm focus:border-[#00a862] focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-11 px-4 rounded-xl border border-[#e4e4e7] text-sm text-[#18181b] hover:bg-[#f9fafb]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280]">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="h-10 rounded-lg border border-[#e4e4e7] bg-white px-3 text-sm focus:border-[#00a862] focus:outline-none"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280]">Verification</label>
              <select
                value={filters.verified}
                onChange={(e) => handleFilterChange("verified", e.target.value)}
                className="h-10 rounded-lg border border-[#e4e4e7] bg-white px-3 text-sm focus:border-[#00a862] focus:outline-none"
              >
                {verifiedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280]">Activation</label>
              <select
                value={filters.activated}
                onChange={(e) =>
                  handleFilterChange("activated", e.target.value)
                }
                className="h-10 rounded-lg border border-[#e4e4e7] bg-white px-3 text-sm focus:border-[#00a862] focus:outline-none"
              >
                {activationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#6b7280]">Rows per page</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-[#e4e4e7] bg-white px-3 text-sm focus:border-[#00a862] focus:outline-none"
              >
                {[10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} rows
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#f4f4f5] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f9fafb] text-left text-xs text-[#71717a]">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Activity</th>
                  <th className="px-6 py-3 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f5] text-[#18181b]">
                {sortedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f9fafb]">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm" style={{ fontWeight: 600 }}>
                          {u.name || "Unnamed user"}
                        </span>
                        <span className="text-xs text-[#71717a]">
                          @{u.utorid}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span>{u.email || "No email"}</span>
                        <span className="text-xs text-[#71717a]">
                          Role: {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            u.verified
                              ? "bg-[#e6f7f0] text-[#0f9a61]"
                              : "bg-[#fef2f2] text-[#b91c1c]"
                          }`}
                        >
                          {u.verified ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Shield size={14} />
                          )}
                          {u.verified ? "Verified" : "Unverified"}
                        </span>
                        <span className="text-xs text-[#71717a]">
                          Created {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span>Last login: {formatDate(u.lastLogin)}</span>
                        <span className="text-xs text-[#71717a]">
                          {u.lastLogin ? "Activated" : "Never logged in"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {(u.points ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {!loading && !sortedUsers.length && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-[#71717a]"
                    >
                      No users match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10 text-[#71717a] gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading users...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-6 py-4 text-sm text-red-600 bg-red-50">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-[#71717a]">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className={`flex items-center gap-1 h-10 px-3 rounded-lg border ${
                page === 1 || loading
                  ? "border-[#e4e4e7] text-[#a1a1aa] bg-white"
                  : "border-[#e4e4e7] text-[#18181b] bg-white hover:bg-[#f9fafb]"
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className={`flex items-center gap-1 h-10 px-3 rounded-lg border ${
                page >= totalPages || loading
                  ? "border-[#e4e4e7] text-[#a1a1aa] bg-white"
                  : "border-[#e4e4e7] text-[#18181b] bg-white hover:bg-[#f9fafb]"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
