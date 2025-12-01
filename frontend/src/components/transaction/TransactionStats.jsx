
export function TransactionStats({totalCount, user}) {
    // Note: Can't accurately calculate earned/spent from paginated data
    // These would need to come from a dedicated backend endpoint
    const totalTransactions = totalCount || 0;
    const currentBalance = user.points;

    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-7">
        {/* Total Transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-sm text-slate-600 mb-2">Total Transactions</p>
            <div className="text-3xl font-bold text-slate-900">
                {totalTransactions}
            </div>
        </div>

        {/* Current Balance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-sm text-slate-600 mb-2">Current Balance</p>
            <div className="text-3xl font-bold text-emerald-600">
                {currentBalance} pts
            </div>
        </div>
    </div>
        )
}
