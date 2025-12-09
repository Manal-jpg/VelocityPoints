import React from "react";

export default function PromotionCard({ promo, onClick }) {
  const {
    name,
    description,
    type,
    startTime,
    endTime,
    minSpending,
    rate,
    points,
  } = promo;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  const isActive = start <= now && end > now;
  const isUpcoming = start > now;

  const typeLabel = type === "automatic" ? "Automatic" : "One-time";
  const accentClass =
    type === "automatic"
      ? "from-emerald-500 to-emerald-400 border-emerald-200 text-emerald-800"
      : "from-indigo-500 to-indigo-400 border-indigo-200 text-indigo-800";

  return (
    <article
      onClick={onClick}
      className="relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition cursor-pointer overflow-hidden"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`}
      />

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Promotion
            </p>
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-white ${accentClass}`}
            >
              {typeLabel}
            </span>
            {isActive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-100">
                Active
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                Upcoming
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-xs text-slate-500">Starts</p>
            <p className="font-semibold text-slate-900">
              {start.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-xs text-slate-500">Ends</p>
            <p className="font-semibold text-slate-900">
              {end.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm text-slate-800">
          <div className="bg-white border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">Min spend</p>
            <p className="font-semibold">
              {minSpending != null ? `$${minSpending}` : "—"}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">Rate</p>
            <p className="font-semibold">{rate ?? "—"}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">Points</p>
            <p className="font-semibold">{points ?? "—"}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
