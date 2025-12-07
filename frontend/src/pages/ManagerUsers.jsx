import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Search,
  Shield,
  X,
} from "lucide-react";
import { AppLayout } from "../components/layout/Layout";
import { createUser, listUsers } from "../api/users";
import { useAuth } from "../hooks/useAuth";
import { updateUserById } from "../api/users";

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
  const roleEditOptions = useMemo(() => {
    if (roleSet.has("superuser")) {
      return [
        { label: "Regular", value: "regular" },
        { label: "Cashier", value: "cashier" },
        { label: "Manager", value: "manager" },
        { label: "Superuser", value: "superuser" },
      ];
    }
    if (roleSet.has("manager")) {
      return [
        { label: "Regular", value: "regular" },
        { label: "Cashier", value: "cashier" },
      ];
    }
    return [];
  }, [roleSet]);

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
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    utorid: "",
    name: "",
    email: "",
  });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    verified: false,
    role: "",
    suspicious: false,
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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
  }, [page, limit, filters, canView, authLoading, refreshKey]);

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

  const handleOpenCreate = () => {
    setShowCreate(true);
    setCreateError("");
    setCreateSuccess("");
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
    setCreateForm({ utorid: "", name: "", email: "" });
    setCreateError("");
    setCreateSuccess("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const utorid = createForm.utorid.trim();
    const name = createForm.name.trim();
    const email = createForm.email.trim();

    if (!utorid || !name || !email) {
      setCreateError("UTORid, name, and email are required.");
      setCreateSuccess("");
      return;
    }

    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      await createUser({ utorid, name, email });
      setCreateSuccess("User registered successfully.");
      setCreateForm({ utorid: "", name: "", email: "" });
      setPage(1);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to register user. Please try again.";
      setCreateError(apiMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditForm({
      verified: Boolean(userToEdit?.verified),
      role: userToEdit?.role || "",
      suspicious: Boolean(userToEdit?.suspicious),
    });
    setEditError("");
    setEditSuccess("");
  };

  const handleCloseEdit = () => {
    setSelectedUser(null);
    setEditForm({ verified: false, role: "", suspicious: false });
    setEditError("");
    setEditSuccess("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = {
      verified: Boolean(editForm.verified),
      suspicious: Boolean(editForm.suspicious),
    };

    // Only include role changes if the current user has permission.
    if (roleEditOptions.length && editForm.role) {
      payload.role = editForm.role;
    }

    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      await updateUserById(selectedUser.id, payload);
      setEditSuccess("User updated successfully.");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to update user.";
      setEditError(apiMsg);
    } finally {
      setEditLoading(false);
    }
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
              <div className="relative w-full min-w-0 md:w-[320px]">
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
              <div className="flex flex-wrap items-center gap-2">
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
                {canView && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="h-11 px-4 rounded-xl bg-[#00a862] text-sm text-white hover:bg-[#0c9158] flex items-center gap-2 shrink-0"
                  >
                    <Plus size={16} />
                    Register user
                  </button>
                )}
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
                  <th className="px-6 py-3 font-medium text-right">Manage</th>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-[#e4e4e7] text-sm text-[#18181b] hover:bg-[#f9fafb]"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
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

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={handleCloseCreate}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#f4f4f5] px-5 py-4">
              <div>
                <p className="text-sm text-[#71717a]">Register a new user</p>
                <h3
                  className="text-lg text-[#18181b]"
                  style={{ fontWeight: 600 }}
                >
                  Add UTORid access
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCreate}
                className="p-2 rounded-lg text-[#71717a] hover:bg-[#f4f4f5]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="px-5 py-4 space-y-4" onSubmit={handleCreateSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-[#3f3f46]">UTORid</label>
                <input
                  type="text"
                  value={createForm.utorid}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      utorid: e.target.value,
                    }))
                  }
                  placeholder="e.g. jsmith"
                  className="w-full h-11 rounded-xl border border-[#e4e4e7] px-3 text-sm focus:border-[#00a862] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#3f3f46]">Full name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  className="w-full h-11 rounded-xl border border-[#e4e4e7] px-3 text-sm focus:border-[#00a862] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#3f3f46]">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                  className="w-full h-11 rounded-xl border border-[#e4e4e7] px-3 text-sm focus:border-[#00a862] focus:outline-none"
                />
              </div>

              {createError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="h-11 px-4 rounded-xl border border-[#e4e4e7] text-sm text-[#18181b] hover:bg-[#f9fafb]"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="h-11 px-4 rounded-xl bg-[#00a862] text-sm text-white hover:bg-[#0c9158] flex items-center gap-2 disabled:opacity-70"
                >
                  {createLoading && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={handleCloseEdit}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#f4f4f5] px-5 py-4">
              <div>
                <p className="text-sm text-[#71717a]">
                  Update user: @{selectedUser.utorid}
                </p>
                <h3
                  className="text-lg text-[#18181b]"
                  style={{ fontWeight: 600 }}
                >
                  {selectedUser.name || "Unnamed user"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-2 rounded-lg text-[#71717a] hover:bg-[#f4f4f5]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="px-5 py-4 space-y-4" onSubmit={handleEditSubmit}>
              <div className="flex items-center gap-3">
                <input
                  id="verified"
                  type="checkbox"
                  checked={Boolean(editForm.verified)}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      verified: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-[#e4e4e7] text-[#00a862] focus:ring-[#00a862]"
                />
                <label htmlFor="verified" className="text-sm text-[#3f3f46]">
                  Mark as verified
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="suspicious"
                  type="checkbox"
                  checked={Boolean(editForm.suspicious)}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      suspicious: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-[#e4e4e7] text-[#f59e0b] focus:ring-[#f59e0b]"
                />
                <label htmlFor="suspicious" className="text-sm text-[#3f3f46]">
                  Mark as suspicious
                </label>
              </div>

              {roleEditOptions.length > 0 && (
                <div className="space-y-1">
                  <label className="text-sm text-[#3f3f46]">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 text-sm focus:border-[#00a862] focus:outline-none"
                  >
                    {roleEditOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {!roleSet.has("superuser") && (
                    <p className="text-xs text-[#71717a]">
                      Managers can promote up to Cashier.
                    </p>
                  )}
                </div>
              )}

              {editError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  <span>{editSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="h-11 px-4 rounded-xl border border-[#e4e4e7] text-sm text-[#18181b] hover:bg-[#f9fafb]"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="h-11 px-4 rounded-xl bg-[#00a862] text-sm text-white hover:bg-[#0c9158] flex items-center gap-2 disabled:opacity-70"
                >
                  {editLoading && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
