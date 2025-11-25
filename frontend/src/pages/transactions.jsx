// transactions page
import {Link, useNavigate, Navigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {AppLayout} from "../components/layout/Layout";
import {useAuth} from "../hooks/useAuth";
import {SummaryCard} from "../components/transaction_components/transactionSummaryLabels.jsx"
import {Plus, Filter} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");


export default function Transactions() {
    const {user} = useAuth();
    const [showCreatePurchase, setshowCreatePurchase] = useState(false)
    const [showCreateAdjustment, setShowCreateAdjustment] = useState(false);
    const [showCreateRedemption, setShowCreateRedemption] = useState(false);
    const [showCreateTransfer, setShowCreateTransfer] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const hasPermissions = (role) => {
        if (!user || !user.role) return false;
        if (!Array.isArray(role)) {
            role = [role]
        }
        ;
        return role.includes(user.role);
    }

    return (

        <AppLayout title="Transactions">
            {/*main div*/}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/*Top bar */}
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Transactions</h1>
                    <p className="text-base text-slate-500 mt-1 p-px"> View and manage all transaction history </p>
                </div>

                {/*button logic based on user authorization*/}
                {/*user and above permissions*/}
                <div className="flex flex-wrap gap-2">
                    {hasPermissions(["regular", "manager", "cashier", "superuser"]) && (
                        <>
                            <button onClick={() => setShowCreateRedemption(true)}
                                    className={"flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"}>
                                <Plus size={16}
                                /> Redeem
                            </button>

                            <button onClick={() => setShowCreateTransfer(true)}
                                    className={"flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"}>
                                <Plus size={16}
                                /> Transfer
                            </button>
                        </>
                    )}
                    {/*cashier and above permissions*/}
                    {hasPermissions(["manager", "cashier", "superuser"]) && (
                        <>
                            <button onClick={() => setshowCreatePurchase(true)}
                                    className={"flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"}>
                                <Plus size={16}
                                /> Purchase
                            </button>

                        </>
                    )}

                    {hasPermissions(["manager", "superuser"]) && (
                        <>
                            <button onClick={() => setShowCreateAdjustment(true)}
                                    className={"flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"}>
                                <Plus size={16}
                                /> Adjustment
                            </button>
                        </>
                    )}

                </div>


                {/*summary view buttons*/}
                {/*<div className="flex flex-wrap gap-2">*/}
                {/*    <SummaryCard label={"hi"} value={5}> </SummaryCard>*/}
                {/*    <SummaryCard label={"hi"} value={5}> </SummaryCard>*/}
                {/*    <SummaryCard label={"bro"} value={5}> </SummaryCard>*/}
                {/*</div>*/}
                {/*container div*/}

            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-7">
                {/* Cards will go here */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
                    Total Transactions
                    <div className="flex text-2xl font-bold text-slate-900 ">
                        {transactions.length}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
                    Points Earned
                    <div className="text-3xl font-bold text-emerald-600 ">
                        {transactions.length}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
                    Points Spent
                    <div className="text-3xl font-bold text-red-600">
                        {transactions.length}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
                    Net Earned
                    <div className="text-3xl font-bold text-slate-900">
                        {user.points}
                    </div>
                </div>


                <div className="flex items-center justify-between mb-4">
                    {/* Header will go here */}
                    <h4 className="text-lg font-semibold text-slate-900"> Filter & Search </h4>
                    {/*button goes here*/}
                    {/*show filter logic goes here*/}
                    <button onClick={() => setShowFilters(!showFilters)} className={"flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition"}>
                    <Filter />
                        {showFilters ? "Hide" : "Show"} Advanced Filters
                    </button>
                    {/* Quick filters will go here */}
                    {/* Advanced filters will go here */}

                </div>


            </div>


        </AppLayout>)
}