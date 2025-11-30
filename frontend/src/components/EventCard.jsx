import { Calendar, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

export function EventCard({ event }) {
  return (
    <Link to={`/manager/events/${event.id}`} className="block">
      <div
        className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all w-full max-w-[350px] mx-auto cursor-pointer"
        style={{
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)";
        }}
      >
        {/* Header banner */}
        <div className="relative h-[200px] bg-gradient-to-br from-[#00a862] to-[#00d477] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Date + Time */}
          <div
            className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-2"
            style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <Calendar size={13} strokeWidth={2} className="text-[#00a862]" />
            <span
              className="text-[12px] text-[#18181b]"
              style={{ fontWeight: 600, letterSpacing: "0.01em" }}
            >
              {event.date} · {event.time}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* ⭐ TITLE */}
          <h4
            className="text-[16px] text-[#18181b] font-semibold mb-2 line-clamp-1"
          >
            {event.title}
          </h4>

          <div className="flex items-center gap-3 mb-4">
            {/* Points badge */}
            <div
              className="flex items-center gap-1.5 bg-[#fff9e6] text-[#d97706] border border-[#fef3c7] px-2.5 py-1 rounded-full text-[12px]"
              style={{ fontWeight: 600 }}
            >
              <Star size={11} fill="#d97706" strokeWidth={0} />
              <span>+{event.points} pts</span>
            </div>

            {/* Guest Count */}
            <div className="flex items-center gap-1.5 text-[#71717a] text-[12px]">
              <Users size={13} strokeWidth={2} />
              <span>{event.rsvps} guests</span>
            </div>
          </div>

          {/* View Event Button*/}
          <button
            className={`w-full h-10 rounded-xl transition-all pointer-events-none ${
              event.rsvped
                ? "bg-[#10b981] text-white"
                : "bg-[#00a862] text-white hover:bg-[#008551] hover:scale-[1.02]"
            }`}
            style={{
              fontWeight: 600,
              fontSize: "13px",
              boxShadow: event.rsvped
                ? "0 4px 6px rgba(16, 185, 129, 0.15)"
                : "0 4px 6px rgba(0, 168, 98, 0.15)",
            }}
          >
            {event.rsvped ? "✓ RSVP'd" : "View Event"}
          </button>
        </div>
      </div>
    </Link>
  );
}
