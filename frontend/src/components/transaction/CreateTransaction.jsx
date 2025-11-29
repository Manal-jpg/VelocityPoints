import { X } from "lucide-react";
import {CreateTransactionForm} from "./CreateTransactionForm";
import {useState} from "react";

export function CreateTransaction({ title, onClose, type}) {
    const [formData, setFormData] = useState({

        utorid: '',
        amount: '',
        spent: '',
        remark: '',
        promotionIds: [],
        relatedId: ''

    });
    return (
        // Modal overlay
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
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <CreateTransactionForm type={type} setFormData={setFormData} formData={formData} />


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
    );
}