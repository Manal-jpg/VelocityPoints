// transactions page
import {useEffect, useState} from "react";
import {AppLayout} from "../components/layout/Layout";
import {useAuth} from "../hooks/useAuth";
import {TransactionStats} from "../components/transaction/TransactionStats.jsx";
import {TransactionFilters} from "../components/transaction/TransactionFilters.jsx";
import {CreateTransactionButtons} from "../components/transaction/CreateTransactionButtons.jsx";
import {Pagination} from "../components/transaction/Pagination.jsx";
import {TransactionList} from "../components/transaction/TransactionList.jsx";
import {TransactionDetails} from "../components/transaction/TransactionDetails.jsx";
import {CreateTransaction} from "../components/transaction/CreateTransaction.jsx"
import {getAllTransactions, getTransactionById, getUserTransactions} from "../api/transactions.js";

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
    const [limit, setLimit] = useState(10);
    const totalPages = Math.ceil(totalCount / limit);


    // pagination is not included here
    const [advancedFilters, setAdvancedFilters] = useState({
        name: "", createdBy: "", suspicious: "", promotionId: "", relatedId: "", amount: '', operator: "", type: "all"
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

    // Unified fetch function - respects current page, limit, and filters
    const fetchTransactions = async () => {
        setLoading(true);
        setError('');

        try {
            // Build params with page and limit
            const params = {
                page: currentPage, limit: limit
            };

            // Only add filters if they have valid values
            if (advancedFilters.type && advancedFilters.type !== "all") {
                params.type = advancedFilters.type;
            }

            if (advancedFilters.name && advancedFilters.name.trim() !== "") {
                params.name = advancedFilters.name;
            }

            if (advancedFilters.createdBy && advancedFilters.createdBy.trim() !== "") {
                params.createdBy = advancedFilters.createdBy;
            }

            if (advancedFilters.suspicious !== "") {
                params.suspicious = advancedFilters.suspicious;
            }

            if (advancedFilters.promotionId && advancedFilters.promotionId.trim() !== "") {
                params.promotionId = parseInt(advancedFilters.promotionId);
            }

            if (advancedFilters.relatedId && advancedFilters.relatedId.trim() !== "") {
                params.relatedId = parseInt(advancedFilters.relatedId);
            }

            // CRITICAL: Only include amount if BOTH amount AND operator are valid
            if (advancedFilters.amount && advancedFilters.amount !== '' && advancedFilters.amount !== '0' && advancedFilters.operator && advancedFilters.operator !== '') {
                params.amount = parseInt(advancedFilters.amount);
                params.operator = advancedFilters.operator;
            }

            if (transactionId && transactionId !== '') {
                params.transactionId = parseInt(transactionId);
            }

            // Switch endpoint based on role
            const data = hasPermissions(['manager', 'superuser']) ? await getAllTransactions(params) : await getUserTransactions(params);

            setTransactions(data.results || []);
            setTotalCount(data.count || 0);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    };
    const fetchById = async (id) => {
        const data = await getTransactionById(id)
        setTransactions([data])
    }
    useEffect(() => {
        if (transactionId !== '') {
            fetchById(transactionId)
        }
        else{
            fetchTransactions()
        }


    }, [transactionId])

    useEffect(() => {
        // Debounce: Wait 500ms after user stops typing before fetching
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 500);

        // Cancel previous timer if user keeps typing
        return () => clearTimeout(timer);
    }, [currentPage, limit, advancedFilters]); // Re-fetch when filters change


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
            {hasPermissions(['regular', "cashier"]) && (<TransactionStats totalCount={totalCount} user={user}/>

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

            <TransactionList transactions={transactions} setSelectedTransaction={setSelectedTransaction}
                             hasPermissions={hasPermissions} user={user} totalCount={totalCount}/>

            {selectedTransaction && (
                <TransactionDetails transaction={selectedTransaction} hasPermissions={hasPermissions}
                                    onRefresh={fetchTransactions}
                                    onClose={() => setSelectedTransaction(null)}
                />)}

            {showCreatePurchase && (<CreateTransaction title={"Create Purchase"}
                                                       onClose={() => setShowCreatePurchase(false)} type={"purchase"}
                                                       onSuccess={fetchTransactions}> </CreateTransaction>)

            }

            {showCreateTransfer && (<CreateTransaction title={"Create Transfer"}
                                                       onClose={() => setShowCreateTransfer(false)} type={"transfer"}
                                                       onSuccess={fetchTransactions}> </CreateTransaction>)

            }

            {showCreateRedemption && (<CreateTransaction title={"Create Redemption"}
                                                         onClose={() => setShowCreateRedemption(false)}
                                                         type={"redemption"}
                                                         onSuccess={fetchTransactions}> </CreateTransaction>)

            }

            {showCreateAdjustment && (<CreateTransaction title={"Create Adjustment"}
                                                         onClose={() => setShowCreateAdjustment(false)}
                                                         type={"adjustment"}
                                                         onSuccess={fetchTransactions}> </CreateTransaction>)

            }

            {/*{Pagination to be fixed - currently not working}*/}
            <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={limit} setLimit={setLimit}
                        totalPages={totalPages}
            />

        </AppLayout>);
}