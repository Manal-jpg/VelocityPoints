
// import React, { useEffect, useState } from "react";
// import {
//   getPromotion,
//   updatePromotion,
//   deletePromotion,
// } from "../api/promotions";
// import PromotionForm from "../components/promotions/PromotionForm";
// import { useNavigate, useParams } from "react-router-dom";

// export default function PromotionDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [promo, setPromo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [loadError, setLoadError] = useState("");
//   const [deleteError, setDeleteError] = useState("");
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   useEffect(() => {
//     let ignore = false;

//     async function load() {
//       setLoading(true);
//       setLoadError("");
//       try {
//         const data = await getPromotion(id);
//         if (!ignore) setPromo(data);
//       } catch (err) {
//         if (!ignore)
//           setLoadError(err.message || "Failed to load promotion.");
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       ignore = true;
//     };
//   }, [id]);

//   async function handleUpdate(payload) {
//     const updated = await updatePromotion(id, payload);
//     setPromo((prev) => ({ ...prev, ...payload, ...updated }));
//     alert("Promotion updated.");
//     // if you’d rather go back automatically instead of staying on the page:
//     // navigate("/manager/promotions");
//   }

//   async function handleDelete() {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this promotion? It cannot be undone."
//       )
//     ) {
//       return;
//     }
//     setDeleteError("");
//     setDeleteLoading(true);
//     try {
//       await deletePromotion(id);
//       navigate("/manager/promotions");
//     } catch (err) {
//       setDeleteError(err.message || "Failed to delete promotion.");
//     } finally {
//       setDeleteLoading(false);
//     }
//   }

//   const disablePublish =
//     promo && new Date(promo.startTime).getTime() < Date.now();

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (loadError)
//     return (
//       <div className="p-4 text-sm text-red-600">
//         {loadError}
//       </div>
//     );
//   if (!promo)
//     return <div className="p-4 text-sm">Promotion not found.</div>;

//     return (
//         <div className="p-4 space-y-4">
      
//           <div className="flex items-center justify-between gap-2">
//             <h1 className="text-xl font-semibold">Edit Promotion</h1>
//             <button
//               className="px-3 py-1.5 rounded bg-red-600 text-white text-sm disabled:opacity-50"
//               onClick={handleDelete}
//               disabled={deleteLoading}
//             >
//               {deleteLoading ? "Deleting..." : "Delete"}
//             </button>
//           </div>
      
//           {deleteError && (
//             <p className="text-sm text-red-600">{deleteError}</p>
//           )}
      
//           <PromotionForm
//             initialData={promo}
//             onSubmit={handleUpdate}
//             submitLabel="Save Changes"
//             showPublishedToggle={true}
//             disablePublished={disablePublish}
//           />
      
//           {/* 👇 BACK BUTTON POSITIONED UNDER SAVE CHANGES */}
//           <div className="pt-2">
//             <button
//               type="button"
//               onClick={() => navigate("/manager/promotions")}
//               className="px-4 py-1.5 border rounded text-sm bg-gray-100 hover:bg-gray-200"
//             >
//               ← Back to Promotions
//             </button>
//           </div>
      
//         </div>
//       );
      
// }

import React, { useEffect, useState } from "react";
import {
  getPromotion,
  updatePromotion,
  deletePromotion,
} from "../api/promotions";
import PromotionForm from "../components/promotions/PromotionForm";
import { useNavigate, useParams } from "react-router-dom";

export default function PromotionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getPromotion(id);
        if (!ignore) setPromo(data);
      } catch (err) {
        if (!ignore)
          setLoadError(err.message || "Failed to load promotion.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleUpdate(payload) {
    const updated = await updatePromotion(id, payload);
    setPromo((prev) => ({ ...prev, ...payload, ...updated }));
    alert("Promotion updated.");
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Are you sure you want to delete this promotion? It cannot be undone."
      )
    ) {
      return;
    }
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await deletePromotion(id);
      navigate("/manager/promotions");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete promotion.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (loadError)
    return (
      <div className="p-4 text-sm text-red-600">
        {loadError}
      </div>
    );
  if (!promo)
    return <div className="p-4 text-sm">Promotion not found.</div>;

  return (
    <div className="p-4 space-y-4">
      
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Edit Promotion</h1>
        <button
          className="px-3 py-1.5 rounded bg-red-600 text-white text-sm disabled:opacity-50"
          onClick={handleDelete}
          disabled={deleteLoading}
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </button>
      </div>

      {deleteError && (
        <p className="text-sm text-red-600">{deleteError}</p>
      )}

      <PromotionForm
        initialData={promo}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
      />

      {/* BACK BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate("/manager/promotions")}
          className="px-4 py-1.5 border rounded text-sm bg-gray-100 hover:bg-gray-200"
        >
          ← Back to Promotions
        </button>
      </div>

    </div>
  );
}

