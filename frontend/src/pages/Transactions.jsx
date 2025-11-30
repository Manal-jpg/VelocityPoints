// transactions page
import {Link, useNavigate, Navigate} from "react-router-dom";
import {useState, useEffect, useMemo} from "react";
import {AppLayout} from "../components/layout/Layout";
import {useAuth} from "../hooks/useAuth";
import {Plus, Filter} from "lucide-react";
import {TransactionStats} from "../components/transaction/TransactionStats.jsx";
import {TransactionFilters} from "../components/transaction/TransactionFilters.jsx";
import {CreateTransactionButtons} from "../components/transaction/CreateTransactionButtons.jsx";
import {TransactionCard} from "../components/transaction/TransactionCard.jsx";
import {Pagination} from "../components/transaction/Pagination.jsx";
import {TransactionList} from "../components/transaction/TransactionList.jsx";
import {TransactionDetails} from "../components/transaction/TransactionDetails.jsx";
import {CreateTransaction} from "../components/transaction/CreateTransaction.jsx"
import {getAllTransactions} from "../api/transactions.js";


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");


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


    const [showFilters, setShowFilters] = useState(false);


    // pagination is not included here
    const [advancedFilters, setAdvancedFilters] = useState({
        name: "", createdBy: "", suspicious: "", promotionId: "", relatedId: "", amount: 0, operator: "", type: "all"
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
    /// use Memo is > use effect for this case
    const filteredTransactions = useMemo(() => {
            return transactions.filter(t => {
                if (advancedFilters.type !== "all" && advancedFilters.type !== t.type) return false;

                if (advancedFilters.name && !t.utorid.toLowerCase().includes(advancedFilters.name.toLowerCase())) return false

                return !(advancedFilters.suspicious !== "" && t.suspicious !== (advancedFilters.suspicious === "true"));


            })
        }

        , [transactions, advancedFilters])
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
                const data = await getAllTransactions({}); // Your API call
                setTransactions(data.results || []); // Adjust based on your API response
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []); // Empty array = run once on mount


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
            <TransactionStats transactions={transactions}/>

            {/* Filter Section #################################################################################*/}
            <TransactionFilters showFilters={showFilters}
                                setShowFilters={setShowFilters}
                                quickFilters={quickFilters}
                                advancedFilters={advancedFilters} setAdvancedFilters={setAdvancedFilters}
                                hasPermissions={hasPermissions}
            />

            <TransactionList filteredTransactions={filteredTransactions} setSelectedTransaction={setSelectedTransaction}

            />

            {selectedTransaction && (
                <TransactionDetails transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)}/>)}

            {showCreatePurchase && (<CreateTransaction title={"Create Purchase"}
                                                       onClose={() => setShowCreatePurchase(false)} type={"purchase"}
                                                       onSucess={refreshTransactions}> </CreateTransaction>)

            }

            {showCreateTransfer && (<CreateTransaction title={"Create Transfer"}
                                                       onClose={() => setShowCreateTransfer(false)} type={"transfer"}
                                                       onSucess={refreshTransactions()}> </CreateTransaction>)

            }

            {showCreateRedemption && (<CreateTransaction title={"Create Redemption"}
                                                         onClose={() => setShowCreateRedemption(false)}
                                                         type={"redemption"}
                                                         onSucess={refreshTransactions()}> </CreateTransaction>)

            }

            {showCreateAdjustment && (<CreateTransaction title={"Create Adjustment"}
                                                         onClose={() => setShowCreateAdjustment(false)}
                                                         type={"adjustment"}
                                                         onSucess={refreshTransactions}> </CreateTransaction>)

            }

            {/*{Pagination to be fixed - currently not working}*/}
            <Pagination/>

        </AppLayout>);
}