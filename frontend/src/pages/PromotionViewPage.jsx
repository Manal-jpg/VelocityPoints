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
        <div className="p-4">Loading…</div>
      </AppLayout>
    );

  if (error)
    return (
      <AppLayout title="Promotion Details">
        <div className="p-4 text-red-600 text-sm">{error}</div>
      </AppLayout>
    );

  if (!promo)
    return (
      <AppLayout title="Promotion Details">
        <div className="p-4 text-sm">Promotion not found.</div>
      </AppLayout>
    );

  const start = new Date(promo.startTime);
  const end = new Date(promo.endTime);

  return (
    <AppLayout title="Promotion Details">
      <div className="p-4 space-y-6 bg-white border rounded-xl max-w-2xl shadow-sm">

        <h1 className="text-2xl font-semibold">{promo.name}</h1>

        <p className="text-gray-700">{promo.description}</p>

        <div className="text-sm space-y-2">
          <div>
            <span className="font-medium">Type:</span>{" "}
            {promo.type === "automatic" ? "Automatic" : "One-time"}
          </div>

          {promo.minSpending != null && (
            <div>
              <span className="font-medium">Min Spending:</span> ${promo.minSpending}
            </div>
          )}

          {promo.rate != null && (
            <div>
              <span className="font-medium">Rate:</span> {promo.rate}
            </div>
          )}

          {promo.points != null && (
            <div>
              <span className="font-medium">Points:</span> {promo.points}
            </div>
          )}

          <div>
            <span className="font-medium">Valid:</span>{" "}
            {start.toLocaleString()} – {end.toLocaleString()}
          </div>
        </div>

        {/* ⭐ Back button (under content) */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate("/promotions")}
            className="px-4 py-1.5 border rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
          >
            ← Back to Promotions
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
