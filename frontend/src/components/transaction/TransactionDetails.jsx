import {
    X,
    ShoppingCart,
    Gift,
    ArrowRightLeft,
    Settings,
    Calendar,
    User,
    Hash,
    Clock,
    DollarSign,
    Tag
} from "lucide-react";

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

const renderIcon = (type) => {
    if (type === "purchase") return <ShoppingCart size={25} />;
    if (type === "transfer") return <ArrowRightLeft size={25} />;
    if (type === "event") return <Calendar size={25} />;
    if (type === "redemption") return <Gift size={25} />;
    if (type === "adjustment") return <Settings size={25} />;
    return <ShoppingCart size={25} />
}

// Get background color for transaction type
const getTransactionColor = (type) => {
    const colors = {
        purchase: "#10b981",
        redemption: "#ef4444",
        transfer: "#3b82f6",
        adjustment: "#8b5cf6",
        event: "#ec4899"
    };
    return colors[type] || "#10b981";
};

// Get transaction title
const getTransactionTitle = (type) => {
    const titles = {
        purchase: "Purchase Transaction",
        redemption: "Redemption Transaction",
        transfer: "Transfer Transaction",
        adjustment: "Adjustment Transaction",
        event: "Event Transaction"
    };
    return titles[type] || "Transaction";
};

// set Selected Transaction - the use State decides which is this card will be rendered
export function TransactionDetails({transaction, onClose}) {
    if (!transaction) return null

    const bgColor = getTransactionColor(transaction.type);

    return (
        // Modal overlay
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {/* Modal content */}
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl ">

                {/* Header Section with colored background */}
                <div className="p-6 text-white relative" style={{ backgroundColor: bgColor }}>
                    <div className="flex items-start gap-3">
                        <span className="text-4xl">{renderIcon(transaction.type)}</span>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{getTransactionTitle(transaction.type)}</h2>
                            <p className="text-white/80 text-sm">Transaction #{transaction.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-1 transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Points Impact Section */}
                <div className="bg-slate-50 py-8">
                    <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Points Impact</p>
                        <p className={`text-5xl font-bold ${transaction.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                            <span className="text-2xl text-slate-500 ml-2">pts</span>
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Customer */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <User size={20} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Customer</p>
                                <p className="text-base text-slate-900">{transaction.utorid}</p>
                            </div>
                        </div>

                        {/*/!* Created At *!/*/}
                        {/*<div className="flex gap-3 border border-slate-100 rounded-lg p-3">*/}
                        {/*    <Clock size={20} className="text-slate-400 mt-0.5" />*/}
                        {/*    <div>*/}
                        {/*        <p className="text-xs text-slate-500 mb-1">Created At</p>*/}
                        {/*        <p className="text-base text-slate-900">*/}
                        {/*            {formatDate(transaction.createdAt)} {formatTime(transaction.createdAt)}*/}
                        {/*        </p>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Amount Spent */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <DollarSign size={20} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Amount Spent</p>
                                <p className="text-base text-slate-900">
                                    ${Math.abs(transaction.amount * 0.25).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Transaction ID */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <Hash size={20} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                                <p className="text-base text-slate-900">#{transaction.id}</p>
                            </div>
                        </div>

                        {/* Created By */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <User size={20} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Created By</p>
                                <p className="text-base text-slate-900">
                                    {transaction.createdBy || "system"}
                                </p>
                            </div>
                        </div>

                        {/* Promotions Applied */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <Tag size={20} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Promotions Applied</p>
                                <p className="text-base text-slate-900">
                                    {transaction.promotionIds.reduce((acc, currentValue) => acc + " " + "#" + currentValue+ " ", "")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )


}