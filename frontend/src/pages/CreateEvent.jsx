import { useState } from "react";
import { AppLayout } from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";

export default function CreateEvent() {
  const { token } = useAuth();

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createEvent = async () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      points: Number(form.points),
      capacity: form.capacity ? Number(form.capacity) : null,
      published: form.published,
    };

    console.log("SENDING PAYLOAD:", payload);

    const res = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("BACKEND RESPONSE STATUS:", res.status);

    const data = await res.json();
    console.log("BACKEND RESPONSE BODY:", data);

    if (res.ok) {
      alert("Event created!");
    } else {
      alert("Error: " + data.error);
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
              />
            </div>
            <div>
              <label className="block font-medium mb-1">End Time</label>
              <input
                name="endTime"
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2"
                onChange={handleChange}
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
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Capacity (optional)</label>
              <input
                name="capacity"
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Max attendees"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              onChange={handleChange}
            />
            <span className="font-medium">Publish Immediately</span>
          </label>

          {/* Submit */}
          <button
            onClick={createEvent}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
          >
            Create Event
          </button>

        </div>
      </div>
    </AppLayout>
  );
}
