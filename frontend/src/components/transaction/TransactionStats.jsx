
export function TransactionStats({transactions, user}) {
    const totalTransactions = transactions.length;
    const pointsEarned = transactions.reduce((acc, t) => (t.amount > 0 && !t.suspicious && (t.redeemed === undefined || t.redeemed)) ? acc + t.amount : acc, 0);
    const pointsSpent = transactions.reduce((acc, t) => (t.amount < 0 && !t.suspicious && (t.redeemed === undefined || t.redeemed)) ? acc + t.amount : acc, 0);
    const netEarned = user.points;

    return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-7">
        {/* Cards will go here */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
            Total Transactions
            <div className="flex text-2xl font-bold text-slate-900 ">
                {totalTransactions}
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
            Points Earned
            <div className="text-3xl font-bold text-emerald-600 ">
                {pointsEarned}
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
            Points Spent
            <div className="text-3xl font-bold text-red-600">
                {pointsSpent}
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 ">
            Net Earned
            <div className="text-3xl font-bold text-slate-900">
                {netEarned}
            </div>
        </div>
    </div>
        )
}
