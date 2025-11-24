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

import React, { useEffect, useState } from "react";
import { listPromotions, deletePromotion } from "../api/promotions";
import { useNavigate } from "react-router-dom";

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
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Manage Promotions</h1>
        <button
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
          onClick={() => navigate("/manager/promotions/create")}
        >
          + New Promotion
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="border rounded-md p-3 bg-gray-50 space-y-2 text-sm">
        <div className="flex flex-wrap gap-2">
          {/* NAME FILTER */}
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => {
              setPage(1);
              setNameFilter(e.target.value);
            }}
          />

          {/* TYPE FILTER */}
          <select
            className="border rounded px-2 py-1 text-sm"
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

          {/* STATUS FILTER */}
          <select
            className="border rounded px-2 py-1 text-sm"
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

      {/* LOADING / ERRORS */}
      {loading && <p>Loading promotions...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

      {/* EMPTY STATE */}
      {!loading && !error && promos.length === 0 && (
        <p className="text-sm text-gray-600">No promotions found.</p>
      )}

      {/* RESULTS TABLE */}
      {!loading && promos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Name</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Start</th>
                <th className="border px-2 py-1">End</th>
                <th className="border px-2 py-1">Min Spending</th>
                <th className="border px-2 py-1">Rate</th>
                <th className="border px-2 py-1">Points</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="border px-2 py-1">{p.name}</td>
                  <td className="border px-2 py-1 text-center">{p.type}</td>
                  <td className="border px-2 py-1 text-xs">
                    {new Date(p.startTime).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1 text-xs">
                    {new Date(p.endTime).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {p.minSpending ?? "-"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {p.rate ?? "-"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {p.points ?? "-"}
                  </td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/manager/promotions/${p.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline disabled:opacity-50"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                    >
                      {deletingId === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 text-sm">
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
