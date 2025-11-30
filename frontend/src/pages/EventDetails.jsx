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

  const [addUtorid, setAddUtorid] = useState("");
  const [adding, setAdding] = useState(false);

  // -------------------------------
  // LOAD EVENT WITH RSVP CHECK
  // -------------------------------
  const loadEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);

      let isRSVPed = false;

      try {
        await api.post(`/events/${id}/guests/me`);
        await api.delete(`/events/${id}/guests/me`);
        isRSVPed = false;
      } catch (err) {
        isRSVPed = true;
      }

      setEvent({
        ...data,
        rsvped: isRSVPed,
        numGuests: data.numGuests ?? data.guests?.length ?? 0,
        guests: data.guests || [],
        points: data.pointsRemain ?? data.pointsAwarded ?? data.pointsTotal ?? 0,
      });
    } catch (err) {
      console.error("LOAD EVENT ERROR:", err);
      setError("Error loading event.");
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

  const isManagerPlus = ["manager", "superuser"].includes(
    user?.role?.toLowerCase()
  );
  const isOrganizer = event?.organizers?.some((o) => o.id === user?.id);

  // -------------------------------
  // RSVP
  // -------------------------------
  const handleRSVP = async () => {
    try {
      await api.post(`/events/${id}/guests/me`);

      setEvent((prev) => ({
        ...prev,
        rsvped: true,
        numGuests: prev.numGuests + 1,
        guests: [
          ...(prev.guests || []),
          {
            id: user.id,
            name: user.name,
            utorid: user.utorid,
          },
        ],
      }));
    } catch (err) {
      console.error("RSVP ERROR:", err);
      alert("Unable to RSVP.");
    }
  };

  const handleUnRSVP = async () => {
    try {
      await api.delete(`/events/${id}/guests/me`);

      setEvent((prev) => ({
        ...prev,
        rsvped: false,
        numGuests: prev.numGuests - 1,
        guests: prev.guests.filter((g) => g.id !== user.id),
      }));
    } catch (err) {
      console.error("UN-RSVP ERROR:", err);
      alert("Unable to cancel RSVP.");
    }
  };

  // -------------------------------
  // ADD GUEST
  // -------------------------------
  const handleAddGuest = async () => {
    if (!addUtorid.trim()) {
      alert("Enter a UTORid.");
      return;
    }

    try {
      setAdding(true);

      const res = await api.post(`/events/${id}/guests`, {
        utorid: addUtorid.trim(),
      });

      const newGuest = res.data.guestAdded;

      setEvent((prev) => ({
        ...prev,
        numGuests: prev.numGuests + 1,
        guests: [...prev.guests, newGuest],
      }));

      setAddUtorid("");
      alert("Guest added!");
    } catch (err) {
      console.error("ADD GUEST ERROR:", err);
      alert("Unable to add guest.");
    } finally {
      setAdding(false);
    }
  };

  // -------------------------------
  // REMOVE GUEST
  // -------------------------------
  const handleRemoveGuest = async (guestId) => {
    try {
      await api.delete(`/events/${id}/guests/${guestId}`);

      setEvent((prev) => ({
        ...prev,
        numGuests: prev.numGuests - 1,
        guests: prev.guests.filter((g) => g.id !== guestId),
      }));
    } catch (err) {
      console.error("REMOVE GUEST ERROR:", err);
      alert("Unable to remove guest.");
    }
  };

  return (
    <AppLayout title="Event Details">

      {/* BACK BUTTON */}
      <div className="text-center mt-4">
        <Link
          to="/events"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Events
        </Link>
      </div>

      {/* EDIT BUTTON */}
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

      {/* RSVP BUTTON */}
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

      {/* ADD USER TO EVENT */}
      {(isManagerPlus || isOrganizer) && (
        <div className="flex justify-center mt-8 px-4">
          <div className="w-full max-w-2xl bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Add Guest to Event</h3>

            <input
              type="text"
              placeholder="Enter UTORid"
              value={addUtorid}
              onChange={(e) => setAddUtorid(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <button
              onClick={handleAddGuest}
              disabled={adding}
              className="bg-[#00a862] text-white px-4 py-2 rounded-lg hover:bg-[#008551] disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Guest"}
            </button>
          </div>
        </div>
      )}

      {/* DETAILS CARD */}
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

            <p><strong>Description:</strong><br />{event.description}</p>
            <p><strong>Location:</strong><br />{event.location}</p>

            <p><strong>Start:</strong><br />{new Date(event.startTime).toLocaleString()}</p>
            <p><strong>End:</strong><br />{new Date(event.endTime).toLocaleString()}</p>

            {event.capacity !== null && (
              <p><strong>Capacity:</strong><br />{event.capacity}</p>
            )}

            {/* ⭐ ADD POINTS HERE */}
            <p>
              <strong>Points:</strong><br />
              {event.points} pts
            </p>

            <p><strong>Guests:</strong><br />{event.numGuests}</p>
          </div>
        </div>
      </div>

      {/* GUEST LIST WITH REMOVE BUTTON */}
      {(isManagerPlus || isOrganizer) && (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">Guests</h3>

          {event.guests.length === 0 ? (
            <p className="text-gray-600">No guests yet.</p>
          ) : (
            <ul className="space-y-2">
              {event.guests.map((g) => (
                <li
                  key={g.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>{g.name} ({g.utorid})</span>

                  {(isManagerPlus || isOrganizer) && (
                    <button
                      onClick={() => handleRemoveGuest(g.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppLayout>
  );
}
