import {
  Bell,
  ChevronRight,
  Download,
  LogOut,
  Shield,
  Smartphone,
  Star,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AppLayout } from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";

const getInitials = (name, utorid) => {
  const source = name || utorid || "";
  if (!source) return "??";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const initials = getInitials(user?.name, user?.utorid);

  const settings = [
    { icon: User, label: "Account Information", hasChevron: true },
    { icon: Smartphone, label: "Switch Interface", hasChevron: true },
    { icon: Shield, label: "Password & Security", hasChevron: true },
    { icon: Bell, label: "Notification Settings", hasChevron: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppLayout title="Profile" showSearch={false}>
      <div className="max-w-[600px] mx-auto space-y-8">
        <div
          className="bg-white rounded-2xl p-8 text-center"
          style={{
            boxShadow:
              "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="inline-block relative mb-6">
            <div
              className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#00a862] to-[#00d477] flex items-center justify-center text-white border-4 border-[#e6f7f0]"
              style={{ boxShadow: "0 10px 15px rgba(0, 168, 98, 0.15)" }}
            >
              <span className="text-[40px]" style={{ fontWeight: 700 }}>
                {initials}
              </span>
            </div>
          </div>

          <h2 className="text-[#18181b] mb-1.5">{user?.name || "User Name"}</h2>
          <p className="text-[15px] text-[#71717a] mb-5">
            @{user?.utorid || "username"}
          </p>

          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ffc947] to-[#ffb020] text-white px-4 py-2 rounded-full mb-8"
            style={{ boxShadow: "0 4px 6px rgba(255, 201, 71, 0.2)" }}
          >
            <Star size={14} fill="white" strokeWidth={0} />
            <span className="text-[13px]" style={{ fontWeight: 600 }}>
              {user?.verified ? "Gold Member" : "Member"}
            </span>
          </div>

          <div>
            <p
              className="text-[13px] text-[#a1a1aa] mb-2"
              style={{ letterSpacing: "0.01em" }}
            >
              Total Points
            </p>
            <h3
              className="text-[48px] text-[#18181b]"
              style={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {(user?.points ?? 0).toLocaleString()}
            </h3>
          </div>
        </div>

        <div
          className="bg-[#e6f7f0] rounded-2xl p-8"
          style={{
            boxShadow:
              "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
          }}
        >
          <h3 className="text-[#18181b] text-center mb-6">Your QR Code</h3>

          <div
            className="bg-white p-6 rounded-2xl border-2 border-dashed border-[#00a862] mb-5"
            style={{
              boxShadow:
                "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="w-[200px] h-[200px] mx-auto bg-white">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <rect width="200" height="200" fill="white" />
                <g fill="black">
                  <rect x="10" y="10" width="60" height="60" />
                  <rect x="20" y="20" width="40" height="40" fill="white" />
                  <rect x="30" y="30" width="20" height="20" />

                  <rect x="130" y="10" width="60" height="60" />
                  <rect x="140" y="20" width="40" height="40" fill="white" />
                  <rect x="150" y="30" width="20" height="20" />

                  <rect x="10" y="130" width="60" height="60" />
                  <rect x="20" y="140" width="40" height="40" fill="white" />
                  <rect x="30" y="150" width="20" height="20" />

                  <rect x="90" y="30" width="10" height="10" />
                  <rect x="110" y="30" width="10" height="10" />
                  <rect x="100" y="50" width="10" height="10" />
                  <rect x="90" y="70" width="10" height="10" />
                  <rect x="110" y="70" width="10" height="10" />

                  <rect x="30" y="90" width="10" height="10" />
                  <rect x="50" y="90" width="10" height="10" />
                  <rect x="70" y="90" width="10" height="10" />
                  <rect x="90" y="90" width="10" height="10" />
                  <rect x="110" y="90" width="10" height="10" />
                  <rect x="130" y="90" width="10" height="10" />
                  <rect x="150" y="90" width="10" height="10" />
                  <rect x="170" y="90" width="10" height="10" />

                  <rect x="90" y="110" width="10" height="10" />
                  <rect x="110" y="110" width="10" height="10" />
                  <rect x="130" y="110" width="10" height="10" />
                  <rect x="150" y="110" width="10" height="10" />
                  <rect x="170" y="110" width="10" height="10" />

                  <rect x="90" y="130" width="10" height="10" />
                  <rect x="110" y="150" width="10" height="10" />
                  <rect x="130" y="130" width="10" height="10" />
                  <rect x="150" y="150" width="10" height="10" />
                  <rect x="170" y="170" width="10" height="10" />
                </g>
              </svg>
            </div>
          </div>

          <p className="text-center text-[13px] text-[#71717a] mb-5">
            Show this to cashiers to earn points
          </p>

          <button
            className="w-full flex items-center justify-center gap-2 h-11 bg-[#00a862] text-white rounded-xl hover:bg-[#008551] hover:scale-[1.02] transition-all"
            style={{
              fontWeight: 600,
              fontSize: "15px",
              boxShadow: "0 4px 6px rgba(0, 168, 98, 0.15)",
            }}
            type="button"
          >
            <Download size={18} strokeWidth={2} />
            <span>Download QR Code</span>
          </button>
        </div>

        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
          }}
        >
          {settings.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <button
                key={setting.label}
                className={`w-full flex items-center justify-between px-6 h-14 hover:bg-[#fafaf9] transition-all ${
                  index !== settings.length - 1
                    ? "border-b border-[#f4f4f5]"
                    : ""
                }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-[#71717a]"
                  />
                  <span
                    className="text-[15px] text-[#18181b]"
                    style={{ fontWeight: 500 }}
                  >
                    {setting.label}
                  </span>
                </div>
                {setting.hasChevron && (
                  <ChevronRight
                    size={18}
                    strokeWidth={2}
                    className="text-[#a1a1aa]"
                  />
                )}
              </button>
            );
          })}

          <button
            className="w-full flex items-center gap-3 px-6 h-14 hover:bg-[#fff4f4] transition-all text-[#ff6b6b] border-t border-[#f4f4f5]"
            type="button"
            onClick={() => setConfirming(true)}
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="text-[15px]" style={{ fontWeight: 500 }}>
              Log Out
            </span>
          </button>
        </div>
      </div>
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-[#f4f4f5]">
            <h3 className="text-lg font-semibold text-[#18181b]">
              Log out of PointsVelocity?
            </h3>
            <p className="text-sm text-[#52525b]">
              You will need to sign in again to access your account.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="flex-1 h-11 rounded-xl border border-[#e4e4e7] text-[#18181b] hover:bg-[#f9fafb] transition"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 h-11 rounded-xl bg-[#ff6b6b] text-white font-medium hover:bg-[#f25555] transition shadow-sm"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
