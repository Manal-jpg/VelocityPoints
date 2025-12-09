import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { AppLayout } from "../components/layout/Layout";
import { getUserTransactions } from "../api/transactions";

export default function RedemptionQrCode() {
  const [pendingList, setPendingList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserTransactions({ type: "redemption", limit: 50 });
        if (!ignore) {
          const pending = (data?.results || []).filter((t) => t.processed === false);
          setPendingList(pending);
          setSelected(pending[0] || null);
        }
      } catch (err) {
        if (!ignore) {
          const status = err?.response?.status;
          if (status === 404) {
            setPendingList([]);
            setSelected(null);
          } else {
            setError("Unable to load pending redemption.");
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const qrValue = useMemo(() => {
    if (!selected?.id) return "";
    return JSON.stringify({ type: "redemption", redemptionId: selected.id });
  }, [selected?.id]);

  return (
    <AppLayout title="Redemption QR">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Pending redemption
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Show this to a cashier
            </h1>
            <p className="text-sm text-slate-600">
              Cashier scans this QR to process your unprocessed redemption
              request.
            </p>
          </div>

          {loading && <p className="text-sm text-slate-600">Loading...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && pendingList.length === 0 && !error && (
            <p className="text-sm text-slate-600">
              You have no pending redemption requests.
            </p>
          )}

          {!loading && pendingList.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {pendingList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`px-3 py-2 rounded-xl border text-sm ${
                      selected?.id === item.id
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    #{item.id} · {item.redeemed ?? item.amount} pts
                  </button>
                ))}
              </div>

              {selected && (
                <div className="space-y-3">
                  <div className="bg-white border border-dashed border-emerald-200 rounded-2xl p-6 flex justify-center">
                    <QRCodeCanvas
                      value={qrValue}
                      size={220}
                      bgColor="#ffffff"
                      fgColor="#111827"
                      includeMargin
                    />
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Redemption ID: {selected.id}</div>
                    <div>Points: {selected.redeemed ?? selected.amount}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
