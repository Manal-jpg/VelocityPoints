// transactions page
import {Link, useNavigate, Navigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {AppLayout} from "../components/layout/Layout";
import {useAuth} from "../hooks/useAuth";
import {Plus, Filter} from "lucide-react";
import {TransactionStats} from "../components/transaction/TransactionStats.jsx";
import {TransactionFilters} from "../components/transaction/TransactionFilters.jsx";
import {CreateTransactionButtons} from "../components/transaction/CreateTransactionButtons.jsx";


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");


export default function Transactions() {
    const {user} = useAuth();
    const [showCreatePurchase, setshowCreatePurchase] = useState(false)
    const [showCreateAdjustment, setShowCreateAdjustment] = useState(false);
    const [showCreateRedemption, setShowCreateRedemption] = useState(false);
    const [showCreateTransfer, setShowCreateTransfer] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // pagination is not included here
    const [advancedFilters, setAdvancedFilters] = useState([{
        name: "", createdBy: "", suspicious: "", promotionId: "", relatedId: "", amount: 0, operator: ""
    }]);

    const quickFilters = [{value: "all", label: "All Transactions"}, {
        value: "purchase",
        label: "Purchases"
    }, {value: "redemption", label: "Redemptions"}, {value: "transfer", label: "Transfers"}, {
        value: "adjustment",
        label: "Adjustments"
    }, {value: "event", label: "Event Points"},]

    const hasPermissions = (role) => {
        if (!user || !user.role) return false;
        if (!Array.isArray(role)) {
            role = [role]
        }
        return role.includes(user.role);
    }

    return (

        <AppLayout title="Transactions">
            <CreateTransactionButtons hasPermissions={hasPermissions} setShowCreateRedemption={setShowCreateRedemption}
                                      setShowCreateAdjustment={setShowCreateAdjustment}
                                      setShowCreateTransfer={setShowCreateTransfer}
                                      setShowCreateTransfer={setShowCreateTransfer}/>

            {/*{transaction stats}*/}
            <TransactionStats transactions={transactions}/>

            {/* Filter Section #################################################################################*/}
            <TransactionFilters showFilters={showFilters} activeFilters={activeFilters} setShowFilters={setShowFilters}
                                setActiveFilters={setActiveFilters} quickFilters={quickFilters} advancedFilters={advancedFilters} setAdvancedFilters={setAdvancedFilters}
                                hasPermissions={hasPermissions}
            />

        </AppLayout>);
}