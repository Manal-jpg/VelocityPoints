import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "../components/EventCard";
import { AppLayout } from "../components/layout/Layout";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FILTERS
  const [nameFilter, setNameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // all | upcoming | past
  const [publishedFilter, setPublishedFilter] = useState("all"); // manager+

  // PAGINATION
  const [page, setPage] = useState(1);
  const limit = 6; // number of events per page

  const { user } = useAuth();
  const isManagerPlus = useMemo(
    () =>
      ["manager", "superuser"].includes(user?.role?.toLowerCase()),
    [user]
  );

  // Load events
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit,
        };

        // Apply Filters
        if (nameFilter.trim()) params.name = nameFilter.trim();
        if (locationFilter.trim()) params.location = locationFilter.trim();

        if (timeFilter === "upcoming") params.started = false;
        if (timeFilter === "past") params.ended = true;

        if (isManagerPlus && publishedFilter !== "all") {
          params.published = publishedFilter === "published";
        }

        const { data } = await api.get("/events", { params });

        setEvents(data.results || []);
        setCount(data.count || 0);

      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Unable to load events."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [page, nameFilter, locationFilter, timeFilter, publishedFilter, isManagerPlus]);

  const totalPages = Math.ceil(count / limit);

  return (
    <AppLayout title="Events">
      <div className="p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Events</h2>

          <Link
            to="/manager/events/new"
            className="bg-[#00a862] text-white px-4 py-2 rounded-lg hover:bg-[#008551]"
          >
            + Create Event
          </Link>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Name Search */}
          <input
            className="input border p-2 rounded"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => {
              setPage(1);
              setNameFilter(e.target.value);
            }}
          />

          {/* Location Filter */}
          <input
            className="input border p-2 rounded"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => {
              setPage(1);
              setLocationFilter(e.target.value);
            }}
          />

          {/* Time Filter */}
          <select
            className="border p-2 rounded"
            value={timeFilter}
            onChange={(e) => {
              setPage(1);
              setTimeFilter(e.target.value);
            }}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          {/* Published Filter (only manager+) */}
          {isManagerPlus ? (
            <select
              className="border p-2 rounded"
              value={publishedFilter}
              onChange={(e) => {
                setPage(1);
                setPublishedFilter(e.target.value);
              }}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          ) : (
            <div></div>
          )}
        </div>

        {/* EVENTS GRID */}
        {loading && <p>Loading events...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && events.length === 0 ? (
            <p className="text-gray-500 col-span-full">No events found.</p>
          ) : (
            events.map((event) => {
              const start = new Date(event.startTime);

              return (
                <EventCard
                  key={event.id}
                  event={{
                    id: event.id,
                    title: event.name,
                    description: event.description,
                    points: event.pointsRemain ?? event.pointsAwarded ?? event.points ?? 0,
                    rsvps: event.numGuests ?? event.rsvpsCount ?? 0,
                    rsvped: false,
                    date: start.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    time: start.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  }}
                />
              );
            })
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center mt-8 gap-4">

          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded ${
              page > 1
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Prev
          </button>

          <span className="text-gray-700">Page {page} of {totalPages || 1}</span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded ${
              page < totalPages
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>

        </div>
      </div>
    </AppLayout>
  );
}
