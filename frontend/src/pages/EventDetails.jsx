import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "../components/layout/Layout";
import { api } from "../api/client";


export default function EventDetails() {


  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvent = async () => {
    try {
      const { status, data } = await api.get(`/events/${id}`);
      console.log("BACKEND RESPONSE STATUS:", status, data);

      setEvent(data); // backend returns a single event object
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
    return <AppLayout title="Event Details"><div className="p-8">Loading...</div></AppLayout>;
  }

  if (error || !event) {
    return <AppLayout title="Event Details"><div className="p-8 text-red-600">{error}</div></AppLayout>;
  }

  return (
    <AppLayout title="Event Details">
      <div className="flex justify-center items-start mt-10 px-4">
          <div
            className="w-full max-w-2xl rounded-2xl p-8 shadow-md"
            style={{
              background: "#4ae664ff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            }}
          >
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {event.name}
          </h1>

          {/* Info List */}
          <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed">

            <p>
              <strong className="text-gray-900">Description:</strong><br />
              {event.description || "No description provided."}
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

            {"capacity" in event && event.capacity !== null && (
              <p>
                <strong className="text-gray-900">Capacity:</strong><br />
                {event.capacity}
              </p>
            )}

            {"points" in event && (
              <p>
                <strong className="text-gray-900">Points:</strong><br />
                {event.points}
              </p>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );

}
