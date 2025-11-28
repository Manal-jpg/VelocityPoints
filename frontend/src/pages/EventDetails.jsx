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

  // Load event + detect if user RSVP'd
  const loadEvent = async () => {
    try {
      const { status, data } = await api.get(`/events/${id}`);
      console.log("BACKEND RESPONSE STATUS:", status, data);

      const currentUserId = user?.id;

      // backend returns guests: [{ id, utorid, name, rsvped }]
      const isRSVPed = data?.guests?.some((g) => g.id === currentUserId) || false;

      setEvent({ ...data, rsvped: isRSVPed });
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

  const isOrganizer = event?.organizers?.some(
    (o) => o.id === user?.id || o.utorid === user?.utorid
  );

  // --- RSVP HANDLERS ---
  const handleRSVP = async () => {
    try {
      const { status } = await api.post(`/events/${id}/guests/me`);
      console.log("RSVP SUCCESS:", status);

      setEvent((prev) => ({
        ...prev,
        rsvped: true,
        numGuests: (prev.numGuests || 0) + 1,
      }));
    } catch (err) {
      console.error("RSVP ERROR:", err);
      alert(err?.response?.data?.error || "Unable to RSVP.");
    }
  };

  const handleUnRSVP = async () => {
    try {
      await api.delete(`/events/${id}/guests/me`);

      setEvent((prev) => ({
        ...prev,
        rsvped: false,
        numGuests: (prev.numGuests || 0) - 1,
      }));
    } catch (err) {
      console.error("UN-RSVP ERROR:", err);
      alert(err?.response?.data?.message || "Unable to cancel RSVP.");
    }
  };

  return (
    <AppLayout title="Event Details">

      {/* --- EDIT BUTTON (Managers + Organizers Only) --- */}
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

      {/* --- RSVP BUTTON (Only Regular users) --- */}
      {!isManagerPlus && !isOrganizer && (
        <div className="text-center mt-4">
          {!event.rsvped ? (
            <button
              onClick={handleRSVP}
              className="bg-[#00a862] text-white px-6 py-2 rounded-lg hover:bg-[#008551]"
            >
              RSVP Now
            </button>
          ) : (
            <button
              onClick={handleUnRSVP}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
              Cancel RSVP
            </button>
          )}
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
