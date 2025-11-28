
// import React from "react";
// import PromotionForm from "../components/promotions/PromotionForm";
// import { createPromotion } from "../api/promotions";
// import { useNavigate } from "react-router-dom";

// export default function PromotionCreatePage() {
//   const navigate = useNavigate();

//   async function handleCreate(payload) {
//     const created = await createPromotion(payload);
//     navigate(`/manager/promotions/${created.id}`);
//   }

//   return (
//     <div className="p-4 space-y-4">
//       <h1 className="text-xl font-semibold">Create Promotion</h1>

//       <PromotionForm
//         initialData={null}
//         onSubmit={handleCreate}
//         submitLabel="Create"
//         showPublishedToggle={false}
//       />

//       {/* 👇 Back button under the Create button */}
//       <div className="pt-2">
//         <button
//           type="button"
//           onClick={() => navigate("/manager/promotions")}
//           className="px-4 py-1.5 border rounded text-sm bg-gray-100 hover:bg-gray-200"
//         >
//           ← Back to Promotions
//         </button>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { useNavigate } from "react-router-dom";
import PromotionForm from "../components/promotions/PromotionForm";
import { createPromotion } from "../api/promotions";
import { AppLayout } from "../components/layout/Layout";

export default function PromotionCreatePage() {
  const navigate = useNavigate();

  async function handleCreate(payload) {
    const created = await createPromotion(payload);
    navigate(`/manager/promotions/${created.id}`);
  }

  return (
    <AppLayout title="Create Promotion">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
            New offer
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Create promotion</h1>
          <p className="text-sm text-slate-600">
            Configure the eligibility and rewards. You can edit or delete it later from the promotions list.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <PromotionForm
            initialData={null}
            onSubmit={handleCreate}
            submitLabel="Create"
          />

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/manager/promotions")}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white shadow-sm hover:bg-slate-50"
            >
              ← Back to Promotions
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
