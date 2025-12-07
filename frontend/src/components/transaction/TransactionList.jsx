import {TransactionCard} from "./TransactionCard.jsx";

// Format ISO date to readable format
const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
};

// Get border color based on transaction type
const getBorderColor = (type) => {
    const colors = {
        purchase: "#10b981",    // Green
        redemption: "#ef4444",  // Red
        transfer: "#3b82f6",    // Blue
        adjustment: "#8b5cf6",  // Purple
        event: "#ec4899",       // Pink
    };
    return colors[type] || "#71717a"; // Default gray
};

export function TransactionList({transactions, setSelectedTransaction, hasPermissions, user, totalCount}) {
    return (
        // {Transaction List Heading}
        <div>
            <div>
                <div className={"flex items-center justify-between mb-4"}>
                    <h3 className={"text-lg font-semibold text-slate-900"}>
                        Showing {totalCount} Transaction{totalCount !== 1 ? "s" : ""}
                    </h3>
                    <div className={"flex items-center gap-2 text-sm text-slate-500"}>
                        <span> Nov 2025</span>
                    </div>
                </div>
            </div>


            <div className={"space-y-3"}>
                {transactions.map((t) => (
                    <TransactionCard
                        key={t.id}
                        id={t.id}
                        title={`${t.type.charAt(0).toUpperCase() + t.type.slice(1)} Transaction`}
                        date={formatDate(t.createdAt)}
                        time={formatTime(t.createdAt)}
                        amount={t.amount}
                        type={t.type}
                        borderColor={getBorderColor(t.type)}
                        suspicious={t.suspicious}
                        processed={t.processed}
                        transaction={t}
                        onClick={() => setSelectedTransaction(t)}
                        hasPermissions={hasPermissions}
                        user={user}

                    />
                ))}
            </div>

        </div>


    )
}