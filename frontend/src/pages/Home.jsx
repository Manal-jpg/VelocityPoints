import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  ArrowUpRight,
  CalendarRange,
  CreditCard,
  Star,
  QrCode,
  Sparkles,
  Users,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../components/layout/Layout";
import { getUserTransactions } from "../api/transactions";

function RegularDashboard({ user }) {
  const roleLabel = (user?.role || "User").replace(/^\w/, (c) =>
    c.toUpperCase()
  );
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getUserTransactions({ limit: 5, page: 1 });
        if (!ignore) setRecent(data.results || []);
      } catch {
        if (!ignore) setRecent([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AppLayout title="Dashboard" showSearch={false}>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-400 text-white p-6 shadow-md">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold">
              <Star size={14} />
              {roleLabel}
            </span>
            <p className="text-sm text-emerald-50">Your Points Balance</p>
            <h1 className="text-4xl font-bold tracking-tight">
              {(user?.points ?? 0).toLocaleString()}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <ArrowUpRight size={16} />
                Transfer
              </Link>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <Gift size={16} />
                Redeem
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <CalendarRange size={16} />
                Events
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900">
                Recent Activity
              </p>
              <Link
                to="/transactions"
                className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>
            {loading && <p className="text-sm text-slate-600">Loading...</p>}
            {!loading && !recent.length && (
              <p className="text-sm text-slate-600">No recent transactions.</p>
            )}
            <div className="space-y-2">
              {recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <CreditCard size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold capitalize">
                        {tx.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      tx.amount > 0 ? "text-emerald-600" : "text-slate-800"
                    }`}
                  >
                    {tx.amount ?? tx.points ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-emerald-900">
                Your Events
              </p>
              <Link
                to="/events"
                className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3 text-sm text-emerald-900">
              <Link
                to="/events"
                className="block bg-white border border-emerald-100 rounded-xl p-3 shadow-xs hover:border-emerald-200 hover:shadow-sm transition"
              >
                <p className="font-semibold">Events</p>
                <p className="text-xs text-emerald-700">
                  Browse and RSVP to events.
                </p>
              </Link>
              <Link
                to="/promotions"
                className="block bg-white border border-emerald-100 rounded-xl p-3 shadow-xs hover:border-emerald-200 hover:shadow-sm transition"
              >
                <p className="font-semibold">Promotions</p>
                <p className="text-xs text-emerald-700">Check active offers.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function CashierDashboard() {
  return (
    <AppLayout title="Cashier" showSearch={false}>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-400 text-white p-6 shadow-md">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold">
              <Sparkles size={14} /> Cashier
            </span>
            <p className="text-sm text-emerald-50">
              Process transactions and redemptions quickly.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <CreditCard size={16} /> New Transaction
              </Link>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <Gift size={16} /> Process Redemption
              </Link>
              <Link
                to="/qr"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <QrCode size={16} /> Scan User
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/transactions"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Quick Action
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Create transaction
            </h2>
            <p className="text-sm text-slate-600">
              Start a new purchase or adjustment.
            </p>
          </Link>
          <Link
            to="/transactions"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Gift size={18} />
            </div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Scan & Serve
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Process redemption
            </h2>
            <p className="text-sm text-slate-600">
              Scan and complete pending redemptions.
            </p>
          </Link>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-900">
                Today&apos;s Focus
              </p>
              <ArrowRight size={16} className="text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-800">
              Keep the line moving: verify user QR codes, process redemptions,
              and log purchases.
            </p>
            <div className="flex gap-2 text-xs text-emerald-900">
              <span className="px-2 py-1 bg-white rounded-full border border-emerald-100">
                Scan QR
              </span>
              <span className="px-2 py-1 bg-white rounded-full border border-emerald-100">
                Create TX
              </span>
              <span className="px-2 py-1 bg-white rounded-full border border-emerald-100">
                Redeem
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ManagerDashboard() {
  return (
    <AppLayout title="Manager" showSearch={false}>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white p-6 shadow-md">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold">
              <Sparkles size={14} /> Manager Overview
            </span>
            <p className="text-sm text-emerald-50">
              Stay on top of users, events, and promotions.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                to="/manager/users"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <Users size={16} /> Manage Users
              </Link>
              <Link
                to="/manager/promotions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <Gift size={16} /> Promotions
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
              >
                <CalendarRange size={16} /> Events
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manager/users"
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users size={18} />
            </div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Users
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              Manage users
            </h3>
            <p className="text-sm text-slate-600">
              Verify, promote, and review accounts.
            </p>
          </Link>
          <Link
            to="/manager/promotions"
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Gift size={18} />
            </div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Promotions
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              Promotions overview
            </h3>
            <p className="text-sm text-slate-600">
              Create and edit active offers.
            </p>
          </Link>
          <Link
            to="/events"
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
              Events
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              Events & awarding
            </h3>
            <p className="text-sm text-slate-600">
              Manage events, guests, and awards.
            </p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Home() {
  const { user, activeRole } = useAuth();
  const role = (activeRole || user?.role || "regular").toLowerCase();

  if (role === "cashier") return <CashierDashboard />;
  if (role === "manager" || role === "superuser") return <ManagerDashboard />;
  return <RegularDashboard user={user} />;
}
