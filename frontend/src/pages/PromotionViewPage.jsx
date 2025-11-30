import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPromotion } from "../api/promotions";
import { AppLayout } from "../components/layout/Layout";

export default function PromotionViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getPromotion(id);
        if (!ignore) setPromo(data);
      } catch (err) {
        if (!ignore)
          setError(err.message || "Failed to load promotion details.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => (ignore = true);
  }, [id]);

  if (loading)
    return (
      <AppLayout title="Promotion Details">
        <div className="p-6 text-sm text-slate-600">Loading…</div>
      </AppLayout>
    );

  if (error)
    return (
      <AppLayout title="Promotion Details">
        <div className="p-6 text-red-600 text-sm">{error}</div>
      </AppLayout>
    );

  if (!promo)
    return (
      <AppLayout title="Promotion Details">
        <div className="p-6 text-sm text-slate-700">Promotion not found.</div>
      </AppLayout>
    );

  const start = new Date(promo.startTime);
  const end = new Date(promo.endTime);

  const typeLabel = promo.type === "automatic" ? "Automatic" : "One-time";
  const accentClass =
    promo.type === "automatic"
      ? "from-emerald-500 to-emerald-400 border-emerald-200 text-emerald-800"
      : "from-indigo-500 to-indigo-400 border-indigo-200 text-indigo-800";

  return (
    <AppLayout title="Promotion Details">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Promotion
            </p>
            <h1 className="text-3xl font-bold text-slate-900">{promo.name}</h1>
            <p className="text-sm text-slate-600">{promo.description}</p>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border bg-white ${accentClass}`}
          >
            {typeLabel}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Starts</p>
              <p className="font-semibold text-slate-900">{start.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Ends</p>
              <p className="font-semibold text-slate-900">{end.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Min spending</p>
              <p className="font-semibold text-slate-900">
                {promo.minSpending != null ? `$${promo.minSpending}` : "—"}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Rate</p>
              <p className="font-semibold text-slate-900">{promo.rate ?? "—"}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Points</p>
              <p className="font-semibold text-slate-900">{promo.points ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/promotions")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 shadow-sm hover:bg-slate-50"
          >
            ← Back to Promotions
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
