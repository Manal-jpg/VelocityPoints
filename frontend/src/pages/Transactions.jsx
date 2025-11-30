// transactions page
import {useEffect, useMemo, useState} from "react";
import {AppLayout} from "../components/layout/Layout";
import {useAuth} from "../hooks/useAuth";
import {TransactionStats} from "../components/transaction/TransactionStats.jsx";
import {TransactionFilters} from "../components/transaction/TransactionFilters.jsx";
import {CreateTransactionButtons} from "../components/transaction/CreateTransactionButtons.jsx";
import {Pagination} from "../components/transaction/Pagination.jsx";
import {TransactionList} from "../components/transaction/TransactionList.jsx";
import {TransactionDetails} from "../components/transaction/TransactionDetails.jsx";
import {CreateTransaction} from "../components/transaction/CreateTransaction.jsx"
import {getAllTransactions} from "../api/transactions.js";

export default function Transactions() {
    const {user} = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateAdjustment, setShowCreateAdjustment] = useState(false);
    const [showCreateRedemption, setShowCreateRedemption] = useState(false);
    const [showCreateTransfer, setShowCreateTransfer] = useState(false);
    const [showCreatePurchase, setShowCreatePurchase] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([])
    const [transactionId, setTransactionId] = useState('')
    const [showFilters, setShowFilters] = useState(false);
    // implementing pagination here
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(20);
    const totalPages = Math.ceil(totalCount / limit);


    // pagination is not included here
    const [advancedFilters, setAdvancedFilters] = useState({
        name: "",
        createdBy: "",
        suspicious: "",
        promotionId: "",
        relatedId: "",
        amount: 0,
        operator: "",
        type: "all",
        page: currentPage,
        limit: limit
    });

    const quickFilters = [{value: "all", label: "All Transactions"}, {
        value: "purchase", label: "Purchases"
    }, {value: "redemption", label: "Redemptions"}, {value: "transfer", label: "Transfers"}, {
        value: "adjustment", label: "Adjustments"
    }, {value: "event", label: "Event Points"}]

    const hasPermissions = (role) => {
        if (!user || !user.role) return false;
        if (!Array.isArray(role)) {
            role = [role]
        }
        return role.includes(user.role);
    }

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // ID search (exact match - highest priority)
            if (transactionId !== '' && !t.id.toString().includes(transactionId)) return false;

            // Type filter
            if (advancedFilters.type !== "all" && advancedFilters.type !== t.type) return false;

            // Name filter
            if (advancedFilters.name && t.utorid && !t.utorid.toLowerCase().includes(advancedFilters.name.toLowerCase())) return false;

            // Created By filter
            if (advancedFilters.createdBy && t.createdBy && !t.createdBy.toLowerCase().includes(advancedFilters.createdBy.toLowerCase())) return false;

            // Suspicious filter
            if (advancedFilters.suspicious !== "" && t.suspicious !== (advancedFilters.suspicious === "true")) return false;

            // Promotion ID filter
            if (advancedFilters.promotionId && t.promotionIds && !t.promotionIds.includes(parseInt(advancedFilters.promotionId))) return false;

            // Related ID filter
            if (advancedFilters.relatedId && t.relatedId !== parseInt(advancedFilters.relatedId)) return false;

            // Amount filter with operator
            if (advancedFilters.operator && advancedFilters.amount) {
                const amount = parseInt(advancedFilters.amount);
                if (advancedFilters.operator === 'gte' && t.amount < amount) return false;
                if (advancedFilters.operator === 'lte' && t.amount > amount) return false;
                if (advancedFilters.operator === 'eq' && t.amount !== amount) return false;
            }

            return true;
        });
    }, [transactions, advancedFilters, transactionId]);
    console.log(filteredTransactions)

    const refreshTransactions = async () => {
        const reqParams = {...advancedFilters, type: advancedFilters.type === "all" ? null : advancedFilters.type};
        const newTransactions = await getAllTransactions(reqParams);
        setTransactions(newTransactions.results || []);
    }

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getAllTransactions({params: {page: currentPage, limit: limit}}); // Your API call
                setTransactions(data.results || []); // Adjust based on your API response
                setTotalCount(data.count || 0);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [currentPage, limit]); // Empty array = run once on mount


    if (loading) {
        return (<AppLayout title="Transactions">
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-500">Loading transactions...</p>
            </div>
        </AppLayout>);
    }

    // Show error state
    if (error) {
        return (<AppLayout title="Transactions">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
            </div>
        </AppLayout>);
    }

    return (

        <AppLayout title="Transactions">
            <CreateTransactionButtons hasPermissions={hasPermissions} setShowCreateRedemption={setShowCreateRedemption}
                                      setShowCreateAdjustment={setShowCreateAdjustment}
                                      setShowCreatePurchase={setShowCreatePurchase}
                                      setShowCreateTransfer={setShowCreateTransfer}/>


            {/*{transaction stats}*/}
            {hasPermissions(['regular']) && (<TransactionStats transactions={transactions}/>

            )}

            {/* Filter Section #################################################################################*/}
            <TransactionFilters showFilters={showFilters}
                                setShowFilters={setShowFilters}
                                quickFilters={quickFilters}
                                advancedFilters={advancedFilters} setAdvancedFilters={setAdvancedFilters}
                                hasPermissions={hasPermissions}
                                setTransactionId={setTransactionId}
                                transactionId={transactionId}
                                page={currentPage} setPage={setCurrentPage} limit={limit} setLimit={setLimit}
            />

            <TransactionList filteredTransactions={filteredTransactions} setSelectedTransaction={setSelectedTransaction}

            />

            {selectedTransaction && (
                <TransactionDetails transaction={selectedTransaction} hasPermissions={hasPermissions}
                                    onRefresh={refreshTransactions}
                                    onClose={() => setSelectedTransaction(null)}
                />)}

            {showCreatePurchase && (<CreateTransaction title={"Create Purchase"}
                                                       onClose={() => setShowCreatePurchase(false)} type={"purchase"}
                                                       onSuccess={refreshTransactions}> </CreateTransaction>)

            }

            {showCreateTransfer && (<CreateTransaction title={"Create Transfer"}
                                                       onClose={() => setShowCreateTransfer(false)} type={"transfer"}
                                                       onSuccess={refreshTransactions}> </CreateTransaction>)

            }

            {showCreateRedemption && (<CreateTransaction title={"Create Redemption"}
                                                         onClose={() => setShowCreateRedemption(false)}
                                                         type={"redemption"}
                                                         onSuccess={refreshTransactions}> </CreateTransaction>)

            }

            {showCreateAdjustment && (<CreateTransaction title={"Create Adjustment"}
                                                         onClose={() => setShowCreateAdjustment(false)}
                                                         type={"adjustment"}
                                                         onSuccess={refreshTransactions}> </CreateTransaction>)

            }

            {/*{Pagination to be fixed - currently not working}*/}
            <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={limit} setLimit={setLimit}
                        totalPages={totalPages}
            />

        </AppLayout>);
}