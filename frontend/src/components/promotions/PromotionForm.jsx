// import React, { useEffect, useState } from "react";

// const emptyForm = {
//   name: "",
//   description: "",
//   type: "automatic",
//   startTime: "",
//   endTime: "",
//   minSpending: "",
//   rate: "",
//   points: "",
//   published: false,
// };

// // Convert backend ISO string → value usable in <input type="datetime-local">
// function toInputDateTime(value) {
//   if (!value) return "";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "";

//   const pad = (n) => String(n).padStart(2, "0");
//   const year = d.getFullYear();
//   const month = pad(d.getMonth() + 1);
//   const day = pad(d.getDate());
//   const hours = pad(d.getHours());
//   const minutes = pad(d.getMinutes());

//   // format required by datetime-local: "YYYY-MM-DDTHH:MM"
//   return `${year}-${month}-${day}T${hours}:${minutes}`;
// }

// // Convert datetime-local value → ISO for backend
// function toBackendISO(value) {
//   if (!value) return null;
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return null;
//   return d.toISOString();
// }

// export default function PromotionForm({
//   initialData,
//   onSubmit,
//   submitLabel = "Save",
//   showPublishedToggle = false,
//   disablePublished = false,
// }) {
//   const [form, setForm] = useState(emptyForm);
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [apiError, setApiError] = useState("");

//   // Load initial promotion data
//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         ...emptyForm,
//         ...initialData,
//         type:
//           initialData.type === "onetime" || initialData.type === "automatic"
//             ? initialData.type
//             : "automatic",
//         startTime: toInputDateTime(initialData.startTime),
//         endTime: toInputDateTime(initialData.endTime),
//         minSpending:
//           initialData.minSpending != null
//             ? String(initialData.minSpending)
//             : "",
//         rate: initialData.rate != null ? String(initialData.rate) : "",
//         points: initialData.points != null ? String(initialData.points) : "",
//         published: initialData.published ?? false,
//       });
//     }
//   }, [initialData]);

//   function handleChange(e) {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   }

//   function validate() {
//     const errs = {};

//     if (!form.name.trim()) errs.name = "Name required.";
//     if (!form.description.trim()) errs.description = "Description required.";
//     if (!form.startTime) errs.startTime = "Start time required.";
//     if (!form.endTime) errs.endTime = "End time required.";

//     if (form.startTime && form.endTime) {
//       const s = new Date(form.startTime);
//       const e = new Date(form.endTime);
//       if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
//         if (s >= e) errs.endTime = "End must be after start.";
//       }
//     }

//     return errs;
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setApiError("");

//     const errs = validate();
//     setErrors(errs);
//     if (Object.keys(errs).length) return;

//     setSubmitting(true);

//     try {
//       const payload = {
//         name: form.name.trim(),
//         description: form.description.trim(),
//         type: form.type,
//         startTime: toBackendISO(form.startTime),
//         endTime: toBackendISO(form.endTime),
//       };

//       if (form.minSpending !== "") payload.minSpending = Number(form.minSpending);
//       if (form.rate !== "") payload.rate = Number(form.rate);
//       if (form.points !== "") payload.points = Number(form.points);

//       if (showPublishedToggle) payload.published = form.published;

//       await onSubmit(payload);
//     } catch (err) {
//       const backendMsg =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err.message;
//       setApiError(backendMsg || "Failed to save promotion.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <form className="space-y-4 max-w-xl" onSubmit={handleSubmit} noValidate>
//       {apiError && (
//         <div className="p-2 rounded bg-red-100 text-sm text-red-800">
//           {apiError}
//         </div>
//       )}

//       {/* NAME */}
//       <div>
//         <label className="block text-sm font-medium">
//           Name
//           <input
//             className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//           />
//         </label>
//         {errors.name && (
//           <p className="text-xs text-red-600 mt-1">{errors.name}</p>
//         )}
//       </div>

//       {/* DESCRIPTION */}
//       <div>
//         <label className="block text-sm font-medium">
//           Description
//           <textarea
//             className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//             name="description"
//             rows={3}
//             value={form.description}
//             onChange={handleChange}
//           />
//         </label>
//         {errors.description && (
//           <p className="text-xs text-red-600 mt-1">{errors.description}</p>
//         )}
//       </div>

//       {/* TYPE */}
//       <div>
//         <label className="block text-sm font-medium">
//           Type
//           <select
//             className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//             name="type"
//             value={form.type}
//             onChange={handleChange}
//           >
//             <option value="automatic">Automatic</option>
//             <option value="onetime">One-time</option>
//           </select>
//         </label>
//         {errors.type && (
//           <p className="text-xs text-red-600 mt-1">{errors.type}</p>
//         )}
//       </div>

//       {/* DATES */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium">
//             Start Time
//             <input
//               className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//               type="datetime-local"
//               name="startTime"
//               value={form.startTime}
//               onChange={handleChange}
//             />
//           </label>
//           {errors.startTime && (
//             <p className="text-xs text-red-600 mt-1">{errors.startTime}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium">
//             End Time
//             <input
//               className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//               type="datetime-local"
//               name="endTime"
//               value={form.endTime}
//               onChange={handleChange}
//             />
//           </label>
//           {errors.endTime && (
//             <p className="text-xs text-red-600 mt-1">{errors.endTime}</p>
//           )}
//         </div>
//       </div>

//       {/* NUMERIC FIELDS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium">
//             Min Spending
//             <input
//               className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//               type="number"
//               name="minSpending"
//               value={form.minSpending}
//               onChange={handleChange}
//               min="0"
//             />
//           </label>
//           {errors.minSpending && (
//             <p className="text-xs text-red-600 mt-1">{errors.minSpending}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium">
//             Rate
//             <input
//               className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//               type="number"
//               name="rate"
//               value={form.rate}
//               onChange={handleChange}
//               min="0"
//             />
//           </label>
//           {errors.rate && (
//             <p className="text-xs text-red-600 mt-1">{errors.rate}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium">
//             Points
//             <input
//               className="mt-1 block w-full border rounded px-2 py-1 text-sm"
//               type="number"
//               name="points"
//               value={form.points}
//               onChange={handleChange}
//               min="0"
//             />
//           </label>
//           {errors.points && (
//             <p className="text-xs text-red-600 mt-1">{errors.points}</p>
//           )}
//         </div>
//       </div>

//       {/* PUBLISHED */}
//       {showPublishedToggle && (
//         <div className="flex items-center gap-2">
//           <input
//             id="published"
//             type="checkbox"
//             name="published"
//             checked={form.published}
//             disabled={disablePublished}
//             onChange={handleChange}
//           />
//           <label htmlFor="published" className="text-sm">
//             Published
//           </label>
//           {disablePublished && (
//             <span className="text-xs text-gray-500">
//               (Cannot publish because start time is in the past)
//             </span>
//           )}
//         </div>
//       )}

//       {/* SUBMIT BUTTON */}
//       <button
//         type="submit"
//         disabled={submitting}
//         className="inline-flex items-center px-4 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
//       >
//         {submitting ? "Saving..." : submitLabel}
//       </button>
//     </form>
//   );
// }

import React, { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  type: "automatic",
  startTime: "",
  endTime: "",
  minSpending: "",
  rate: "",
  points: "",
};

function toInputDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toBackendISO(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function PromotionForm({
  initialData,
  onSubmit,
  submitLabel = "Save",
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        type:
          initialData.type === "onetime" || initialData.type === "automatic"
            ? initialData.type
            : "automatic",
        startTime: toInputDateTime(initialData.startTime),
        endTime: toInputDateTime(initialData.endTime),
        minSpending:
          initialData.minSpending != null
            ? String(initialData.minSpending)
            : "",
        rate: initialData.rate != null ? String(initialData.rate) : "",
        points: initialData.points != null ? String(initialData.points) : "",
      });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validate() {
    const errs = {};

    if (!form.name.trim()) errs.name = "Name required.";
    if (!form.description.trim()) errs.description = "Description required.";
    if (!form.startTime) errs.startTime = "Start time required.";
    if (!form.endTime) errs.endTime = "End time required.";

    if (form.startTime && form.endTime) {
      const s = new Date(form.startTime);
      const e = new Date(form.endTime);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
        if (s >= e) errs.endTime = "End must be after start.";
      }
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        startTime: toBackendISO(form.startTime),
        endTime: toBackendISO(form.endTime),
      };

      if (form.minSpending !== "")
        payload.minSpending = Number(form.minSpending);
      if (form.rate !== "") payload.rate = Number(form.rate);
      if (form.points !== "") payload.points = Number(form.points);

      await onSubmit(payload);
    } catch (err) {
      setApiError(err.message || "Failed to save promotion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4 max-w-xl" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="p-2 rounded bg-red-100 text-sm text-red-800">
          {apiError}
        </div>
      )}

      {/* NAME */}
      <div>
        <label className="block text-sm font-medium">
          Name
          <input
            className="mt-1 block w-full border rounded px-2 py-1 text-sm"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="block text-sm font-medium">
          Description
          <textarea
            className="mt-1 block w-full border rounded px-2 py-1 text-sm"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </label>
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* TYPE */}
      <div>
        <label className="block text-sm font-medium">
          Type
          <select
            className="mt-1 block w-full border rounded px-2 py-1 text-sm"
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="automatic">Automatic</option>
            <option value="onetime">One-time</option>
          </select>
        </label>
      </div>

      {/* DATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Start Time
            <input
              className="mt-1 block w-full border rounded px-2 py-1 text-sm"
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
          </label>
          {errors.startTime && (
            <p className="text-xs text-red-600 mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            End Time
            <input
              className="mt-1 block w-full border rounded px-2 py-1 text-sm"
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </label>
          {errors.endTime && (
            <p className="text-xs text-red-600 mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* NUMERIC FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Min Spending
            <input
              className="mt-1 block w-full border rounded px-2 py-1 text-sm"
              type="number"
              name="minSpending"
              value={form.minSpending}
              onChange={handleChange}
              min="0"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Rate
            <input
              className="mt-1 block w-full border rounded px-2 py-1 text-sm"
              type="number"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              min="0"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Points
            <input
              className="mt-1 block w-full border rounded px-2 py-1 text-sm"
              type="number"
              name="points"
              value={form.points}
              onChange={handleChange}
              min="0"
            />
          </label>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center px-4 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
