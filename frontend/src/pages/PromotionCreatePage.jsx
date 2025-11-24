
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
import PromotionForm from "../components/promotions/PromotionForm";
import { createPromotion } from "../api/promotions";
import { useNavigate } from "react-router-dom";

export default function PromotionCreatePage() {
  const navigate = useNavigate();

  async function handleCreate(payload) {
    const created = await createPromotion(payload);
    navigate(`/manager/promotions/${created.id}`);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Create Promotion</h1>

      <PromotionForm
        initialData={null}
        onSubmit={handleCreate}
        submitLabel="Create"
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
