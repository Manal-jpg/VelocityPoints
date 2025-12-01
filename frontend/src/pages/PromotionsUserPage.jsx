import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPromotions } from "../api/promotions";
import PromotionCard from "../components/promotions/PromotionCard";
import { AppLayout } from "../components/layout/Layout";

export default function PromotionsUserPage() {
  const [promos, setPromos] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const limit = 8;
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await listPromotions({
          page,
          limit,
          name: nameFilter || undefined,
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
  }, [page, nameFilter]);

  const totalPages = Math.max(1, Math.ceil(count / limit));

  return (
    <AppLayout title="Promotions">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Earn more points
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Latest promotions
            </h1>
            <p className="text-sm text-slate-600">
              Browse active offers and tap a card to view details.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => {
                setPage(1);
                setNameFilter(e.target.value);
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="text-sm text-slate-600">Loading promotions...</div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && promos.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-sm text-slate-600">
            No promotions available right now.
          </div>
        )}

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <PromotionCard
              key={promo.id}
              promo={promo}
              onClick={() => navigate(`/promotions/${promo.id}/view`)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <button
              className="border rounded-lg px-3 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="border rounded-lg px-3 py-1 disabled:opacity-50"
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
