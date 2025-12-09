import {X} from "lucide-react";
import {CreateTransactionForm} from "./CreateTransactionForm";
import {useState} from "react";
import {
    createRedemptionTransaction,
    createTransaction,
    createTransferTransaction,
    processRedemptionTransaction
} from "../../api/transactions.js";

const createData = (formData) => {
    if (formData.type === "purchase") {
        return {
            utorid: formData.utorid,
            spent: parseFloat(formData.spent),
            remark: formData.remark,
            promotionIds: formData.promotionIds,
            type: formData.type,
        }

    }

    if (formData.type === "adjustment") {
        return {
            utorid: formData.utorid,
            amount: parseFloat(formData.amount),
            remark: formData.remark,
            relatedId: formData.relatedId,
            promotionIds: formData.promotionIds,
            type: formData.type,
        }
    }

    if (formData.type === "transfer") {
        return {
            receiverUserId: parseFloat(formData.receiverUserId),
            amount: parseFloat(formData.amount),
            remark: formData.remark,
            type: formData.type,
        }
    }

    if (formData.type === "redemption") {
        return {
            amount: parseFloat(formData.amount), remark: formData.remark, type: formData.type,
        }
    }
    if (formData.type === "processRedemption") {
        return {
            processed: true, transactionId: formData.transactionId
        }
    }

}

export function CreateTransaction({title, onClose, type, onSuccess}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({

        utorid: '',
        amount: '',
        spent: '',
        remark: '',
        promotionIds: [],
        relatedId: '',
        type: type,
        currentPromoId: '',
        receiverUserId: '',
        processed: true,
        transactionId: ''

    });

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        const requestBody = createData(formData);
        try {
            let result;
            if (formData.type === "purchase" || formData.type === "adjustment") {
                result = await createTransaction(requestBody)
            }
            if (formData.type === "transfer") {
                result = await createTransferTransaction(requestBody, requestBody.receiverUserId)
                console.log(result)
            }
            if (formData.type === "redemption") {
                result = await createRedemptionTransaction(requestBody)
            }
            if (formData.type === "processRedemption") {
                result = await processRedemptionTransaction(requestBody, requestBody.transactionId)
            }
            console.log("Transaction created", result)
            onClose();
            await onSuccess()

        } catch (error) {
            setError(error.message || "Failed to Create Transaction");
            console.error(error)
        } finally {
            setLoading(false);
        }


    }

    return (// Modal overlay
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            {/* Modal content */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
                {/* Header Section with emerald background */}
                <div className="p-6 bg-emerald-500 text-white relative">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-1 transition"
                        >
                            <X size={24}/>
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <CreateTransactionForm type={type} setFormData={setFormData} formData={formData}
                                       onSubmit={handleSubmit}/>


                {/* Close Button */}
                <div className="px-6 pb-6">
                    <button
                        type="submit"
                        form={"transaction-form"}
                        disabled={loading}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                    >
                        {loading ? "Creating..." : "Submit"}
                    </button>

                </div>

                {/* Show error */}
                {error && (// Outer container: Full width (implicit), uses consistent padding (p-4)
                    <div className="p-4">
                        {/* Inner block: Full width, background, styling, text-centered */}
                        <p className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-red-600 font-medium rounded-lg transition text-center">
                            {error}
                        </p>
                    </div>)}
            </div>
        </div>);
}