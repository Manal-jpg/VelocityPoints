import React, { useEffect, useState } from "react";
import { listPromotions } from "../api/promotions";
import PromotionCard from "../components/promotions/PromotionCard";
import { useNavigate } from "react-router-dom";

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
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Promotions</h1>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => {
            setPage(1);
            setNameFilter(e.target.value);
          }}
        />
      </div>

      {loading && <p>Loading promotions...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && promos.length === 0 && (
        <p className="text-sm text-gray-600">No promotions available.</p>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <PromotionCard
            key={promo.id}
            promo={promo}
            onClick={() => navigate(`/promotions/${promo.id}`)} // optional detail page
          />
        ))}
      </div>

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

