// import React, { useEffect, useState } from "react";
// import { listPromotions, deletePromotion } from "../api/promotions";
// import { useNavigate } from "react-router-dom";

// export default function PromotionsManagerListPage() {
//   const [promos, setPromos] = useState([]);
//   const [count, setCount] = useState(0);
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const [nameFilter, setNameFilter] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [publishedFilter, setPublishedFilter] = useState("all"); // all | true | false
//   const [statusFilter, setStatusFilter] = useState("all"); // all | upcoming | active | ended

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [deleteError, setDeleteError] = useState("");
//   const [deletingId, setDeletingId] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     let ignore = false;

//     async function load() {
//       setLoading(true);
//       setError("");
//       try {
//         let started;
//         let ended;

//         // map statusFilter to backend's started/ended
//         if (statusFilter === "upcoming") {
//           started = false;
//         } else if (statusFilter === "active") {
//           started = true; // don't send ended, backend handles
//         } else if (statusFilter === "ended") {
//           ended = true;
//         }

//         const data = await listPromotions({
//           page,
//           limit,
//           name: nameFilter || undefined,
//           type: typeFilter === "all" ? undefined : typeFilter,
//           published:
//             publishedFilter === "all"
//               ? "all"
//               : publishedFilter === "true",
//           started,
//           ended,
//         });

//         if (!ignore) {
//           setPromos(data.results || []);
//           setCount(data.count || 0);
//         }
//       } catch (err) {
//         if (!ignore) setError(err.message || "Failed to load promotions.");
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       ignore = true;
//     };
//   }, [page, nameFilter, typeFilter, publishedFilter, statusFilter]);

//   const totalPages = Math.max(1, Math.ceil(count / limit));

//   async function handleDelete(id) {
//     if (!window.confirm("Delete this promotion? This cannot be undone.")) {
//       return;
//     }
//     setDeleteError("");
//     setDeletingId(id);
//     try {
//       await deletePromotion(id);

//       const data = await listPromotions({
//         page,
//         limit,
//         name: nameFilter || undefined,
//       });
//       setPromos(data.results || []);
//       setCount(data.count || 0);
//     } catch (err) {
//       setDeleteError(err.message || "Failed to delete promotion.");
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <h1 className="text-xl font-semibold">Manage Promotions</h1>
//         <button
//           className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
//           onClick={() => navigate("/manager/promotions/create")}
//         >
//           + New Promotion
//         </button>
//       </div>

//       <div className="border rounded-md p-3 bg-gray-50 space-y-2 text-sm">
//         <div className="flex flex-wrap gap-2">
//           <input
//             className="border rounded px-2 py-1 text-sm"
//             placeholder="Search by name..."
//             value={nameFilter}
//             onChange={(e) => {
//               setPage(1);
//               setNameFilter(e.target.value);
//             }}
//           />

//           <select
//             className="border rounded px-2 py-1 text-sm"
//             value={typeFilter}
//             onChange={(e) => {
//               setPage(1);
//               setTypeFilter(e.target.value);
//             }}
//           >
//             <option value="all">All types</option>
//             <option value="automatic">Automatic</option>
//             <option value="one-time">onetime</option>
//           </select>

//           <select
//             className="border rounded px-2 py-1 text-sm"
//             value={publishedFilter}
//             onChange={(e) => {
//               setPage(1);
//               setPublishedFilter(e.target.value);
//             }}
//           >
//             <option value="all">All (published & draft)</option>
//             <option value="true">Published only</option>
//             <option value="false">Draft/unpublished</option>
//           </select>

//           <select
//             className="border rounded px-2 py-1 text-sm"
//             value={statusFilter}
//             onChange={(e) => {
//               setPage(1);
//               setStatusFilter(e.target.value);
//             }}
//           >
//             <option value="all">All status</option>
//             <option value="upcoming">Upcoming</option>
//             <option value="active">Active (started)</option>
//             <option value="ended">Ended</option>
//           </select>
//         </div>
//       </div>

//       {loading && <p>Loading promotions...</p>}
//       {error && <p className="text-sm text-red-600">{error}</p>}
//       {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

//       {!loading && !error && promos.length === 0 && (
//         <p className="text-sm text-gray-600">No promotions found.</p>
//       )}

//       {!loading && promos.length > 0 && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-2 py-1 text-left">Name</th>
//                 <th className="border px-2 py-1">Type</th>
//                 <th className="border px-2 py-1">Start</th>
//                 <th className="border px-2 py-1">End</th>
//                 <th className="border px-2 py-1">Min Spending</th>
//                 <th className="border px-2 py-1">Rate</th>
//                 <th className="border px-2 py-1">Points</th>
//                 <th className="border px-2 py-1">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {promos.map((p) => (
//                 <tr key={p.id} className="border-t">
//                   <td className="border px-2 py-1">{p.name}</td>
//                   <td className="border px-2 py-1 text-center">{p.type}</td>
//                   <td className="border px-2 py-1 text-xs">
//                     {new Date(p.startTime).toLocaleString()}
//                   </td>
//                   <td className="border px-2 py-1 text-xs">
//                     {new Date(p.endTime).toLocaleString()}
//                   </td>
//                   <td className="border px-2 py-1 text-center">
//                     {p.minSpending ?? "-"}
//                   </td>
//                   <td className="border px-2 py-1 text-center">
//                     {p.rate ?? "-"}
//                   </td>
//                   <td className="border px-2 py-1 text-center">
//                     {p.points ?? "-"}
//                   </td>
//                   <td className="border px-2 py-1 text-center space-x-2">
//                     <button
//                       className="text-blue-600 hover:underline"
//                       onClick={() =>
//                         navigate(`/manager/promotions/${p.id}`)
//                       }
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="text-red-600 hover:underline disabled:opacity-50"
//                       disabled={deletingId === p.id}
//                       onClick={() => handleDelete(p.id)}
//                     >
//                       {deletingId === p.id ? "Deleting..." : "Delete"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {totalPages > 1 && (
//         <div className="flex items-center gap-2 mt-4 text-sm">
//           <button
//             className="border rounded px-2 py-1 disabled:opacity-50"
//             disabled={page <= 1}
//             onClick={() => setPage((p) => p - 1)}
//           >
//             Prev
//           </button>
//           <span>
//             Page {page} of {totalPages}
//           </span>
//           <button
//             className="border rounded px-2 py-1 disabled:opacity-50"
//             disabled={page >= totalPages}
//             onClick={() => setPage((p) => p + 1)}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPromotions, deletePromotion } from "../api/promotions";
import { AppLayout } from "../components/layout/Layout";

export default function PromotionsManagerListPage() {
  const [promos, setPromos] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // automatic | onetime | all
  const [statusFilter, setStatusFilter] = useState("all"); // all | upcoming | active | ended

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        let started;
        let ended;

        // Convert statusFilter → backend flags
        if (statusFilter === "upcoming") {
          started = false; // startTime > now
        } else if (statusFilter === "active") {
          started = true; // startTime <= now AND endTime > now
        } else if (statusFilter === "ended") {
          ended = true; // endTime <= now
        }

        const data = await listPromotions({
          page,
          limit,
          name: nameFilter || undefined,
          type: typeFilter === "all" ? undefined : typeFilter,
          started,
          ended,
        });

        if (!ignore) {
          setPromos(data.results || []);
          setCount(data.count || 0);
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load promotions.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [page, nameFilter, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(count / limit));

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

  const statusLabel = useMemo(() => {
    const now = Date.now();
    return (promo) => {
      if (!promo?.startTime || !promo?.endTime)
        return { text: "Draft", tone: "slate" };
      const start = new Date(promo.startTime).getTime();
      const end = new Date(promo.endTime).getTime();
      if (now < start) return { text: "Upcoming", tone: "amber" };
      if (now >= start && now < end) return { text: "Active", tone: "emerald" };
      return { text: "Ended", tone: "slate" };
    };
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this promotion? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    setDeleteError("");

    try {
      await deletePromotion(id);

      const data = await listPromotions({
        page,
        limit,
        name: nameFilter || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        // keep same status filter mapping after delete
      });
      setPromos(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete promotion.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppLayout title="Manage Promotions">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-slate-900">Manage Promotions</h1>
          <button
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-600"
            onClick={() => navigate("/manager/promotions/create")}
          >
            + New Promotion
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm">
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => {
                setPage(1);
                setNameFilter(e.target.value);
              }}
            />

            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
              value={typeFilter}
              onChange={(e) => {
                setPage(1);
                setTypeFilter(e.target.value);
              }}
            >
              <option value="all">All types</option>
              <option value="automatic">Automatic</option>
              <option value="onetime">One-time</option>
            </select>

            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="all">All status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-600">Loading promotions...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

        {!loading && !error && promos.length === 0 && (
          <p className="text-sm text-slate-600">No promotions found.</p>
        )}

        {!loading && promos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promos.map((p) => {
              const status = statusLabel(p);
              const statusClasses =
                status.tone === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : status.tone === "amber"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-slate-100 text-slate-700 border border-slate-200";

              return (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Promotion</p>
                      <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {p.type === "automatic" ? "Automatic" : "One-time"}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full ${statusClasses}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-slate-600">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Starts</p>
                        <p className="font-medium text-slate-800">{formatDate(p.startTime)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Ends</p>
                        <p className="font-medium text-slate-800">{formatDate(p.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Min spend</p>
                      <p className="font-semibold text-slate-900">
                        {p.minSpending != null ? `$${p.minSpending}` : "—"}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="font-semibold text-slate-900">{p.rate ?? "—"}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Points</p>
                      <p className="font-semibold text-slate-900">{p.points ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 hover:bg-slate-50"
                      onClick={() => navigate(`/manager/promotions/${p.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                    >
                      {deletingId === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-2 mt-4 text-sm">
            <button
              className="border rounded px-3 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="border rounded px-3 py-1 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
