import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/Layout";
import { api } from "../api/client";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    points: "",
    capacity: "",
    published: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createEvent = async () => {
    setError("");

    // Client-side validation to match backend rules
    const name = form.name.trim();
    const description = form.description.trim();
    const location = form.location.trim();
    const start = form.startTime ? new Date(form.startTime) : null;
    const end = form.endTime ? new Date(form.endTime) : null;
    const now = new Date();
    const points = Number(form.points);
    const capacity =
      form.capacity !== "" && form.capacity !== null
        ? Number(form.capacity)
        : null;

    if (!name || !description || !location || !start || !end) {
      setError("Please fill out name, description, location, start, and end.");
      return;
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Start and end times must be valid dates.");
      return;
    }
    if (start <= now || end <= now || start >= end) {
      setError("Start/end must be in the future and start must be before end.");
      return;
    }
    if (!Number.isInteger(points) || points <= 0) {
      setError("Points must be a positive whole number.");
      return;
    }
    if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
      setError("Capacity must be a positive whole number or left blank.");
      return;
    }
    if (form.published && start <= now) {
      setError("Cannot publish an event that starts in the past.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description,
        location,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        points,
        capacity,
        published: form.published,
      };

      const { status, data } = await api.post("/events", payload);
      console.log("BACKEND RESPONSE STATUS:", status, data);
      alert("Event created!");
      navigate("/events");
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error creating event.";
      alert("Error: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Event">
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Create Event</h2>

        <div className="space-y-5">
          {/* Event Name */}
          <div>
            <label className="block font-medium mb-1">Event Name</label>
            <input
              name="name"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter event name"
              onChange={handleChange}
              value={form.name}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              className="w-full border rounded-lg px-3 py-2"
              rows={4}
              placeholder="Describe the event"
              onChange={handleChange}
              value={form.description}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium mb-1">Location</label>
            <input
              name="location"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Where will the event take place?"
              onChange={handleChange}
              value={form.location}
            />
          </div>

          {/* Times - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Start Time</label>
              <input
                name="startTime"
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2"
                onChange={handleChange}
                value={form.startTime}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">End Time</label>
              <input
                name="endTime"
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2"
                onChange={handleChange}
                value={form.endTime}
              />
            </div>
          </div>

          {/* Points + Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Points</label>
              <input
                name="points"
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Points earned"
                onChange={handleChange}
                value={form.points}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Capacity (optional)
              </label>
              <input
                name="capacity"
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Max attendees"
                onChange={handleChange}
                value={form.capacity}
              />
            </div>
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              onChange={handleChange}
              checked={form.published}
            />
            <span className="font-medium">Publish Immediately</span>
          </label>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={createEvent}
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-70"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
