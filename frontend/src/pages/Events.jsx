import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "../components/EventCard";
import { AppLayout } from "../components/layout/Layout";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const isManagerPlus = useMemo(
    () => (user?.role || "").toLowerCase() === "manager" || (user?.role || "").toLowerCase() === "superuser",
    [user]
  );

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");
        const params = isManagerPlus ? {} : { published: true };
        const { data } = await api.get("/events", { params });
        // backend returns { count, results }
        setEvents(data.results || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(err?.response?.data?.error || "Unable to load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [isManagerPlus]);

  return (
    <AppLayout title="Events">
      <div className="p-6">

        {/* HEADER + CREATE BUTTON */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>

          <Link
            to="/manager/events/new"
            className="bg-[#00a862] text-white px-4 py-2 rounded-lg hover:bg-[#008551]"
          >
            + Create Event
          </Link>
        </div>

        {/* EVENTS GRID */}
        {loading && <p className="text-sm text-slate-600">Loading events...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 && !loading && !error ? (
            <p className="text-gray-500">No events yet.</p>
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
      </div>
    </AppLayout>
  );
}
