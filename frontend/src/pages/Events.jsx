import { useEffect, useState } from "react";
import { EventCard } from "../components/EventCard";
import { AppLayout } from "../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Events() {
  const [events, setEvents] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("http://localhost:3000/events", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        // backend returns { events: [...] }
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    }

    loadEvents();
  }, [token]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
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
                    points: event.points,
                    rsvps: event.rsvpsCount ?? 0,
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
