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
  const [awardAll, setAwardAll] = useState(true);
  const [awardUtorid, setAwardUtorid] = useState("");
  const [awardPoints, setAwardPoints] = useState("");
  const [awardRemark, setAwardRemark] = useState("");
  const [awarding, setAwarding] = useState(false);
  const [awardError, setAwardError] = useState("");

  const isManagerPlus = ["manager", "superuser"].includes(
    user?.role?.toLowerCase()
  );

  // local cache to remember RSVP status for regular users when backend doesn't return membership
  const getCachedRSVP = (eventId) => {
    try {
      const raw = localStorage.getItem("eventRsvps");
      const map = raw ? JSON.parse(raw) : {};
      return Boolean(map[eventId]);
    } catch {
      return false;
    }
  };

  const setCachedRSVP = (eventId, value) => {
    try {
      const raw = localStorage.getItem("eventRsvps");
      const map = raw ? JSON.parse(raw) : {};
      map[eventId] = Boolean(value);
      localStorage.setItem("eventRsvps", JSON.stringify(map));
    } catch {
      /* ignore */
    }
  };

  const loadEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      const currentUserId = user?.id;
      const isRSVPedFromGuests = Array.isArray(data.guests)
        ? data.guests.some(
            (g) => g.id === currentUserId || g.userId === currentUserId
          )
        : false;
      const cached = getCachedRSVP(id);
      const isRSVPed = isRSVPedFromGuests || cached || data.rsvped || false;

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

  const isOrganizer = event?.organizers?.some((o) => o.id === user?.id);

  const handleRSVP = async () => {
    try {
      await api.post(`/events/${id}/guests/me`);
      setEvent((prev) => ({
        ...prev,
        rsvped: true,
        numGuests: prev.numGuests + 1,
        guests: [
          ...(prev.guests || []),
          { id: user.id, name: user.name, utorid: user.utorid },
        ],
      }));
      setCachedRSVP(id, true);
    } catch (err) {
      console.error("RSVP ERROR:", err);
      const status = err?.response?.status;
      if (status === 400) {
        setEvent((prev) => ({ ...prev, rsvped: true }));
        alert("You are already RSVP'd to this event.");
      } else if (status === 410) {
        alert("This event is full or has ended.");
      } else {
        alert("Unable to RSVP.");
      }
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
      setCachedRSVP(id, false);
    } catch (err) {
      console.error("UN-RSVP ERROR:", err);
      const status = err?.response?.status;
      if (status === 410) {
        alert("Cannot cancel after the event has ended.");
      } else {
        alert("Unable to cancel RSVP.");
      }
    }
  };

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

  const handleAward = async () => {
    setAwardError("");
    const pts = Number(awardPoints);
    if (!Number.isInteger(pts) || pts <= 0) {
      setAwardError("Points must be a positive whole number.");
      return;
    }
    if (!awardAll && !awardUtorid.trim()) {
      setAwardError("Enter a UTORid to award a single guest.");
      return;
    }

    try {
      setAwarding(true);
      const payload = {
        type: "event",
        amount: pts,
        remark: awardRemark || undefined,
      };
      if (!awardAll) payload.utorid = awardUtorid.trim();

      await api.post(`/events/${id}/transactions`, payload);
      alert("Points awarded.");
      // optionally refresh event stats
      loadEvent();
      setAwardPoints("");
      setAwardRemark("");
      if (!awardAll) setAwardUtorid("");
    } catch (err) {
      console.error("AWARD ERROR:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to award points.";
      setAwardError(msg);
    } finally {
      setAwarding(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Event Details">
        <div className="p-8 text-sm text-slate-600">Loading...</div>
      </AppLayout>
    );
  }

  if (error || !event) {
    return (
      <AppLayout title="Event Details">
        <div className="p-8 text-sm text-red-600">{error || "Event not found."}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Event Details">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 shadow-sm hover:bg-slate-50"
          >
            ← Back to Events
          </Link>

          <div className="flex items-center gap-2">
            {(isManagerPlus || isOrganizer) && (
              <Link
                to={`/manager/events/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-600"
              >
                Edit Event
              </Link>
            )}

            {!isManagerPlus && !isOrganizer && (
              <button
                onClick={event.rsvped ? handleUnRSVP : handleRSVP}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition ${
                  event.rsvped
                    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                {event.rsvped ? "Cancel RSVP" : "RSVP Now"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Event</p>
            <h1 className="text-3xl font-bold text-slate-900">{event.name}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Location</p>
              <p className="font-semibold text-slate-900">{event.location}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Capacity</p>
              <p className="font-semibold text-slate-900">
                {event.capacity ?? "Unlimited"}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Start</p>
              <p className="font-semibold text-slate-900">
                {new Date(event.startTime).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">End</p>
              <p className="font-semibold text-slate-900">
                {new Date(event.endTime).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Points</p>
              <p className="font-semibold text-slate-900">
                {event.pointsRemain ?? event.pointsAwarded ?? event.pointsTotal ?? 0}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Attendees</p>
              <p className="font-semibold text-slate-900">
                {event.numGuests ?? event.guests?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700">
            <p className="text-xs text-slate-500 mb-1">Organizers</p>
            <p className="font-semibold text-slate-900">
              {event.organizers?.map((o) => o.name).join(", ") || "None"}
            </p>
          </div>
        </div>

        {(isManagerPlus || isOrganizer) && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Add Guest to Event</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter UTORid"
                value={addUtorid}
                onChange={(e) => setAddUtorid(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1"
              />
              <button
                onClick={handleAddGuest}
                disabled={adding}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-600 disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Guest"}
              </button>
            </div>
          </div>
        )}

        {(isManagerPlus || isOrganizer) && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Award Points</h3>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={awardAll}
                  onChange={(e) => setAwardAll(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Award all guests
              </label>
            </div>

            {!awardAll && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-sm text-slate-600">Guest UTORid</label>
                  <input
                    type="text"
                    value={awardUtorid}
                    onChange={(e) => setAwardUtorid(e.target.value)}
                    placeholder="Enter guest UTORid"
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">Points to award</label>
                <input
                  type="number"
                  min="1"
                  value={awardPoints}
                  onChange={(e) => setAwardPoints(e.target.value)}
                  placeholder="e.g. 50"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Remark (optional)</label>
                <input
                  type="text"
                  value={awardRemark}
                  onChange={(e) => setAwardRemark(e.target.value)}
                  placeholder="Reason or note"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {awardError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {awardError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleAward}
                disabled={awarding}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-600 disabled:opacity-50"
              >
                {awarding ? "Awarding..." : "Award Points"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
