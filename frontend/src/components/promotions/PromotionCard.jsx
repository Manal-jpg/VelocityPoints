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

  return (
    <article
      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
      onClick={onClick}
      aria-label={`Promotion ${name}`}
    >
      <header className="mb-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        <span className="inline-block text-xs px-2 py-0.5 mt-1 rounded-full bg-gray-100">
          {type === "automatic" ? "Automatic" : "One-time"}
        </span>
      </header>

      <p className="text-sm text-gray-700 line-clamp-3">{description}</p>

      <dl className="mt-3 text-xs text-gray-600 space-y-1">
        {minSpending != null && (
          <div className="flex gap-1">
            <dt className="font-medium">Min Spending:</dt>
            <dd>${minSpending}</dd>
          </div>
        )}
        {rate != null && (
          <div className="flex gap-1">
            <dt className="font-medium">Rate:</dt>
            <dd>{rate}</dd>
          </div>
        )}
        {points != null && (
          <div className="flex gap-1">
            <dt className="font-medium">Points:</dt>
            <dd>{points}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-medium">Valid:</dt>
          <dd>
            {start.toLocaleString()} – {end.toLocaleString()}
          </dd>
        </div>
      </dl>
    </article>
  );
}
