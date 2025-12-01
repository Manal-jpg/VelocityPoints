import { useLocation } from "react-router-dom";
import { AppLayout } from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";

// Publicly accessible scan result page. Since backend user lookup is protected,
// we show whatever was encoded in the QR (utorid/id) and keep it minimal.
export default function UserScanResult() {
  const location = useLocation();
  const { user } = useAuth();
  const params = new URLSearchParams(location.search);
  const idParam = params.get("id");
  const utoridParam = params.get("utorid");

  const decoded = { utorid: utoridParam, id: idParam };

  const hasInfo = decoded.utorid || decoded.id;

  const content = (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {!hasInfo && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          Missing user identifier in QR code.
        </div>
      )}

      {hasInfo && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            Scanned User
          </h1>
          {decoded.utorid && (
            <p className="text-sm text-slate-700">
              UTORid: <span className="font-semibold">@{decoded.utorid}</span>
            </p>
          )}
          {decoded.id && (
            <p className="text-sm text-slate-700">
              User ID: <span className="font-semibold">{decoded.id}</span>
            </p>
          )}
          <p className="text-xs text-slate-500">
            This QR encodes basic identifiers. Additional details require staff
            lookup.
          </p>
        </div>
      )}
    </div>
  );

  // Public view without layout if not logged in
  if (!user) {
    return <div className="min-h-screen bg-slate-50">{content}</div>;
  }

  return <AppLayout title="User Info">{content}</AppLayout>;
}
