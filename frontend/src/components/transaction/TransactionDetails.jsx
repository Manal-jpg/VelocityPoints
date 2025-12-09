import {
    AlertTriangle,
    ArrowRightLeft,
    Calendar,
    CircleCheck,
    CircleOff,
    DollarSign,
    Gift,
    Hash,
    Settings,
    ShoppingCart,
    Tag,
    User,
    X
} from "lucide-react";
import {processRedemptionTransaction, toggleTransactionSuspicious} from "../../api/transactions.js";
import {useEffect, useState} from "react";

// Format ISO date to readable format
const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });
};

const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit"
    });
};

const renderIcon = (type) => {
    if (type === "purchase") return <ShoppingCart size={25}/>;
    if (type === "transfer") return <ArrowRightLeft size={25}/>;
    if (type === "event") return <Calendar size={25}/>;
    if (type === "redemption") return <Gift size={25}/>;
    if (type === "adjustment") return <Settings size={25}/>;
    return <ShoppingCart size={25}/>
}

// Get background color for transaction type
const getTransactionColor = (type) => {
    const colors = {
        purchase: "#10b981", redemption: "#ef4444", transfer: "#3b82f6", adjustment: "#8b5cf6", event: "#ec4899"
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
export function TransactionDetails({transaction, onClose, hasPermissions, onRefresh}) {
    const [isSuspicious, setisSuspicious] = useState(transaction?.suspicious);
    const [processed, setProcessed] = useState(transaction?.processed);
    const [loading, setLoading] = useState(false);
    // useEffect(() => {
    //     setisSuspicious(transaction?.suspicious ?? false);
    // }, [transaction?.id, transaction?.suspicious]);
    //
    // useEffect(() => {
    //     setProcessed(transaction?.processed ?? false);
    // }, [transaction?.id, transaction?.processed]);

    if (!transaction) return null
    const bgColor = getTransactionColor(transaction.type);





    // API CALL GOES HERE

    const toggleSuspicious = async () => {
        const payload = {suspicious: !isSuspicious};
        const transactionId = transaction.id;
        try {
            const response = await toggleTransactionSuspicious(payload, transactionId);
            console.log(response);
            setisSuspicious(!isSuspicious)
            onRefresh(false);

        } catch (err) {
            console.error('Failed to toggle:', err);
            alert(err.message);

        } finally {
            setLoading(false);

        }

    }

    const processRedemption = async () => {
        const payload = {processed: true};
        const transactionId = transaction.id;
        try {
            const res = await processRedemptionTransaction(payload, transactionId);
            console.log(res);
            setProcessed(true)
            onRefresh(false);
        } catch (err) {
            console.error('Failed to Process Redemption:', err);
            alert(err.message);

        } finally {
            setLoading(false);

        }


    }

    return (// Modal overlay
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {/* Modal content */}
            <div onClick={e => e.stopPropagation()}
                 className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl ">

                {/* Header Section with colored background */}
                <div className="p-6 text-white relative" style={{backgroundColor: bgColor}}>
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
                            <X size={24}/>
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
                            <User size={20} className="text-slate-400 mt-0.5"/>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">{transaction.type === "transfer" ? "Sender" : "Customer"}</p>
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
                        {}
                        {transaction.type !== "purchase" && transaction?.relatedId && (
                            <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                                {transaction.type !== "adjustment" ? (
                                    <User size={20} className="text-slate-400 mt-0.5"/>
                                ) : (
                                    <Hash size={20} className="text-slate-400 mt-0.5"/>
                                )}


                                <div>
                                    <p className="text-xs text-slate-500 mb-1">{transaction.type === "transfer" ? "Recipient" : transaction.type === "redemption" ? "Processed By ID" : "Related Transaction ID"}</p>
                                    <p className="text-base text-slate-900">{transaction.type === "transfer" ? transaction.relatedUtorid : transaction?.relatedId}</p>
                                </div>
                            </div>
                        )}


                        {/* Amount Spent (Purchases Only)*/}
                        {transaction.type === "purchase" && (
                            <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                                <DollarSign size={20} className="text-slate-400 mt-0.5"/>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Amount Spent</p>
                                    <p className="text-base text-slate-900">
                                        {/*${Math.abs(transaction.amount * 0.25).toFixed(2)}*/}
                                        {transaction?.spent}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/*Toggle Suspicious*/}
                        {hasPermissions(["manager", "superuser"]) && (

                            <div className="flex items-center gap-3 border border-slate-100 rounded-lg p-3">
                                {/*sets color*/}
                                <AlertTriangle size={20}
                                               className={isSuspicious ? "text-red-500" : "text-slate-400"}
                                />

                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 mb-1">Suspicious Status</p>

                                    {/*toggle sus*/}
                                    <select value={isSuspicious ? "true" : "false"}
                                            disabled={loading}

                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900
                                                 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"

                                            onChange={async (event) => {
                                                const bool = event.target.value === "true";
                                                if (bool !== isSuspicious) {
                                                    setLoading(true);
                                                    await toggleSuspicious();

                                                }

                                            }}

                                    >
                                        <option value="true">Suspicious</option>
                                        <option value="false">Not Suspicious</option>
                                    </select>

                                </div>
                            </div>


                        )}
                        {/*Process Redemption Transaction*/}
                        {transaction.type === "redemption" && hasPermissions(["manager", "superuser", "cashier"]) && (
                            <div className="flex items-center gap-3 border border-slate-100 rounded-lg p-3">
                                {processed ? (<CircleCheck size={20}/>) : (<CircleOff size={20}/>)}

                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 mb-1">Redemption Status</p>

                                    <select value={processed ? "true" : "false"}
                                            disabled={loading}
                                            onChange={async (event) => {
                                                const bool = event.target.value === "true";
                                                if (bool && bool !== processed) {
                                                    setLoading(true);
                                                    await processRedemption();
                                                }

                                            }}

                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900
                                                 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">

                                        <option value="true">Processed</option>
                                        <option value="false" disabled>Not Processed</option>


                                    </select>
                                </div>

                            </div>


                        )}


                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Transaction ID */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <Hash size={20} className="text-slate-400 mt-0.5"/>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                                <p className="text-base text-slate-900">#{transaction.id}</p>
                            </div>
                        </div>

                        {/* Created By */}
                        <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                            <User size={20} className="text-slate-400 mt-0.5"/>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Created By</p>
                                <p className="text-base text-slate-900">
                                    {transaction.createdBy || "system"}
                                </p>
                            </div>
                        </div>

                        {/* Promotions Applied */}
                        {transaction?.promotionIds.length !== 0 && (
                            <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                                <Tag size={20} className="text-slate-400 mt-0.5"/>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Promotions Applied</p>
                                    <p className="text-base text-slate-900">
                                        {transaction.promotionIds.reduce((acc, currentValue) => acc + " " + "#" + currentValue + " ", "") || "No Promotions Applied"}
                                    </p>
                                </div>
                            </div>
                        )}



                        {transaction.processed && transaction.processedBy?.utorid && (
                            <div className="flex gap-3 border border-slate-100 rounded-lg p-3">
                                <User size={20} className="text-slate-400 mt-0.5"/>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Processed By</p>
                                    <p className="text-base text-slate-900">{transaction.processedBy.utorid}</p>
                                </div>
                            </div>

                        )}


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
        </div>)


}
