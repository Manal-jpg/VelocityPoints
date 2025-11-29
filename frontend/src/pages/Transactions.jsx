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


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");


export default function Transactions() {
    const {user} = useAuth();
    const [showCreatePurchase, setshowCreatePurchase] = useState(false)
    const [showCreateAdjustment, setShowCreateAdjustment] = useState(false);
    const [showCreateRedemption, setShowCreateRedemption] = useState(false);
    const [showCreateTransfer, setShowCreateTransfer] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([
        {
            id: "TXN-123",
            title: "Purchase at Campus Store",
            date: "2025-11-13T14:30:00",
            amount: 250,
            type: "purchase",
            icon: "🛍",
            utorid: "johndoe1",
            suspicious: false,
        },
        {
            id: "TXN-124",
            title: "Redeemed Gift Card",
            date: "2025-11-12T16:15:00",
            amount: -500,
            type: "redemption",
            icon: "🎁",
            utorid: "johndoe1",
            suspicious: false,
            processed: false, // pending redemption
        }]);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTypeFilter, setActiveTypeFilter] = useState("");


    // pagination is not included here
    const [advancedFilters, setAdvancedFilters] = useState([{
        name: "", createdBy: "", suspicious: "", promotionId: "", relatedId: "", amount: 0, operator: "", type: "all"
    }]);

    const quickFilters = [{value: "all", label: "All Transactions"}, {
        value: "purchase",
        label: "Purchases"
    }, {value: "redemption", label: "Redemptions"}, {value: "transfer", label: "Transfers"}, {
        value: "adjustment",
        label: "Adjustments"
    }, {value: "event", label: "Event Points"}]

    const hasPermissions = (role) => {
        if (!user || !user.role) return false;
        if (!Array.isArray(role)) {
            role = [role]
        }
        return role.includes(user.role);
    }
    /// use Memo is > use effect for this case
    const filteredTransactions = useMemo(
        () => {
            return transactions.filter(t => {
                if (advancedFilters.type !== "all" && advancedFilters.type !== t.type) return false;

                if (advancedFilters.name && !t.utorid.toLowerCase().includes(advancedFilters.name.toLowerCase())) return false

                return !(advancedFilters.suspicious !== "" && t.suspicious !== (advancedFilters.suspicious === "true"));



            })
        }

        , [transactions, advancedFilters])
    console.log(filteredTransactions)


    return (

        <AppLayout title="Transactions">
            <CreateTransactionButtons hasPermissions={hasPermissions} setShowCreateRedemption={setShowCreateRedemption}
                                      setShowCreateAdjustment={setShowCreateAdjustment}
                                      setShowCreateTransfer={setShowCreateTransfer}
                                      setShowCreateTransfer={setShowCreateTransfer}/>

            {/*{transaction stats}*/}
            <TransactionStats transactions={transactions}/>

            {/* Filter Section #################################################################################*/}
            <TransactionFilters showFilters={showFilters} activeFilters={activeTypeFilter} setShowFilters={setShowFilters}
                                setActiveFilter={setActiveTypeFilter} quickFilters={quickFilters}
                                advancedFilters={advancedFilters} setAdvancedFilters={setAdvancedFilters}
                                hasPermissions={hasPermissions}
            />

            <TransactionList filteredTransactions={filteredTransactions} setSelectedTransaction={setSelectedTransaction}

            />

            <Pagination/>

        </AppLayout>);
}