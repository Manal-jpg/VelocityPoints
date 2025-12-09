import {Plus} from "lucide-react";

export function CreateTransactionButtons({ hasPermissions, setShowCreateRedemption,  setShowCreateTransfer, setShowCreatePurchase, setShowCreateAdjustment, setShowProcessRedemption}) {
    return (
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
                        <button onClick={() => setShowCreatePurchase(true)}
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

                {hasPermissions(["manager", "superuser", "cashier"]) && (
                    <>
                        <button onClick={() => setShowProcessRedemption(true)}
                                className={"flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"}>
                            <Plus size={16}
                            /> Process Redemption
                        </button>
                    </>
                )}

            </div>

        </div>
    )
}