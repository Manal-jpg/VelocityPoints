import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "../components/layout/Layout";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvent = async () => {
    try {
      const { status, data } = await api.get(`/events/${id}`);
      console.log("BACKEND RESPONSE STATUS:", status, data);
      setEvent(data);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error loading event.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <AppLayout title="Event Details">
        <div className="p-8">Loading...</div>
      </AppLayout>
    );
  }

  if (error || !event) {
    return (
      <AppLayout title="Event Details">
        <div className="p-8 text-red-600">{error}</div>
      </AppLayout>
    );
  }

  // --- ROLE CHECKS ---
  const isManagerPlus = ["manager", "superuser"].includes(
    user?.role?.toLowerCase()
  );

  // Your backend returns organizers like: { id, utorid, name }
  const isOrganizer = event?.organizers?.some(
    (o) => o.id === user?.id || o.utorid === user?.utorid
  );

  return (
    <AppLayout title="Event Details">

      {/* --- EDIT BUTTON --- */}
      {(isManagerPlus || isOrganizer) && (
        <div className="text-center mt-6">
          <Link
            to={`/manager/events/${id}/edit`}
            className="bg-[#00a862] text-white px-5 py-2 rounded-lg hover:bg-[#008551] transition"
          >
            Edit Event
          </Link>
        </div>
      )}

      {/* --- EVENT CARD --- */}
      <div className="flex justify-center items-start mt-10 px-4">
        <div
          className="w-full max-w-2xl rounded-2xl p-8 shadow-md"
          style={{
            background: "#8df39eff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {event.name}
          </h1>

          <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed">
            <p>
              <strong className="text-gray-900">Description:</strong><br />
              {event.description}
            </p>

            <p>
              <strong className="text-gray-900">Location:</strong><br />
              {event.location}
            </p>

            <p>
              <strong className="text-gray-900">Start:</strong><br />
              {new Date(event.startTime).toLocaleString()}
            </p>

            <p>
              <strong className="text-gray-900">End:</strong><br />
              {new Date(event.endTime).toLocaleString()}
            </p>

            {event.capacity !== null && (
              <p>
                <strong className="text-gray-900">Capacity:</strong><br />
                {event.capacity}
              </p>
            )}

            {"pointsRemain" in event && (
              <p>
                <strong className="text-gray-900">Points:</strong><br />
                {event.pointsRemain}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
