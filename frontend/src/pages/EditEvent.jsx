import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { AppLayout } from "../components/layout/Layout";

export default function EditEvent() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);

  // Load existing event
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);

        setForm({
          name: data.name,
          description: data.description,
          location: data.location,
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
          points: data.pointsRemain ?? data.pointsAwarded ?? 0,
          capacity: data.capacity ?? "",
          published: data.published,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load event.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Update event
  const updateEvent = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
        points: Number(form.points),
        capacity: form.capacity ? Number(form.capacity) : null,
        published: form.published,
      };

      const { status, data } = await api.patch(`/events/${id}`, payload);
      console.log("UPDATED EVENT:", status, data);

      alert("Event updated!");
      navigate(`/manager/events/${id}`);
    } catch (err) {
      console.error(err);
      alert("Error updating event.");
    }
  };

  if (loading) {
    return (
      <AppLayout title="Edit Event">
        <div className="p-8">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Event">
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-md mt-10">

        <h2 className="text-2xl font-bold mb-6 text-center">Edit Event</h2>

        <div className="space-y-4">
          <input
            className="input"
            placeholder="Event Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            className="input min-h-[100px]"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            className="input"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <label className="block text-sm font-semibold">Start Time</label>
          <input
            type="datetime-local"
            className="input"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />

          <label className="block text-sm font-semibold">End Time</label>
          <input
            type="datetime-local"
            className="input"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />

          <input
            type="number"
            className="input"
            placeholder="Points"
            value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })}
          />

          <input
            type="number"
            className="input"
            placeholder="Capacity (optional)"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publish event
          </label>

          <button
            onClick={updateEvent}
            className="w-full bg-[#00a862] text-white py-2 rounded-lg hover:bg-[#008551]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
