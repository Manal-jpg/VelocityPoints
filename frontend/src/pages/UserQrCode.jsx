import { QRCodeCanvas } from "qrcode.react";
import { AppLayout } from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";

export default function UserQrCode() {
  const { user } = useAuth();

  const qrValue = user?.utorid
    ? `${window.location.origin}/scan/user?utorid=${encodeURIComponent(
        user.utorid
      )}`
    : "";

  return (
    <AppLayout title="My QR Code">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Present to cashier
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Your user QR
            </h1>
            <p className="text-sm text-slate-600">
              Cashiers scan this to identify you for transfers or purchases.
            </p>
          </div>

          {qrValue ? (
            <div className="bg-white border border-dashed border-emerald-200 rounded-2xl p-6 flex justify-center">
              <QRCodeCanvas
                value={qrValue}
                size={220}
                bgColor="#ffffff"
                fgColor="#111827"
                includeMargin
              />
            </div>
          ) : (
            <p className="text-sm text-slate-600">No user info available.</p>
          )}

          <div className="text-xs text-slate-500 break-all">
            Encodes: {qrValue}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
