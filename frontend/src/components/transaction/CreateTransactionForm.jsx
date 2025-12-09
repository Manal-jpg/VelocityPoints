// common elements utorid, promotionids, remark
// transfer and redeem are the same type, amount, remark

import {CircleCheck} from "lucide-react";

function CreateTransferRedemptionForm({setFormData, formData, onSubmit, type}) {
    return (<form id="transaction-form" onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
    }}>
        {type === "transfer" && (<div className="p-4">
                <label className="text-xs text-slate-500 mb-1.5 block">
                    Receiver User ID
                </label>
                <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                    placeholder="Enter Receiver User ID"
                    value={formData.receiverUserId}
                    onChange={(e) => setFormData({...formData, receiverUserId: e.target.value})}
                    required
                />
            </div>

        )}


        <div className="p-4">
            <label className="text-xs text-slate-500 mb-1.5 block">
                Amount (Points)
            </label>
            <input
                type="number"
                className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
            />
        </div>

        <div className="p-4">
            <label className="text-xs text-slate-500 mb-1.5 block">
                Remark (Optional)
            </label>
            <textarea
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
                value={formData.remark}
                className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                rows="3"
            />
        </div>


    </form>)
}

function CreateProcessRedemption({setFormData, formData, onSubmit, type}) {
    return (<form id="transaction-form" onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }}>

            <div className="p-4">
                <label className="text-xs text-slate-500 mb-1.5 block">
                    Transaction ID
                </label>

                <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                    placeholder="Enter Transaction ID"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    required
                />

                <label className="text-xs text-slate-500 mb-1.5 block">
                    Redemption Status
                </label>

                <div className="flex items-center gap-3 border border-slate-100 rounded-lg p-3">
                    {(<CircleCheck size={20}/>)}
                    <select>
                        <option>Processed</option>
                        <option disabled>Not Processed</option>

                    </select>


                </div>

            </div>
        </form>

    )


}

export function CreateTransactionForm({type, setFormData, formData, onSubmit}) {
    if (type === "redemption" || type === "transfer") {
        return (<CreateTransferRedemptionForm setFormData={setFormData} onSubmit={onSubmit} formData={formData}
                                              type={type}/>

        )
    }
    if (type === "processRedemption") {
        return (<CreateProcessRedemption setFormData={setFormData} onSubmit={onSubmit} formData={formData}
                                         type={type}/>)
    }

    return (<form id="transaction-form" onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }}>

            <div className={"p-4"}>
                <label className={"text-xs text-slate-500 mb-1.5 block"}>Customer utorid</label>
                <input type={"text"} placeholder={"utorid"}
                       className={" w-full px-3 py-2 border border-slate-100 rounded-lg"} required
                       onChange={(e) => setFormData({...formData, utorid: e.target.value})}
                       value={formData.utorid}

                />
            </div>

            {type === "purchase" && (<div className="p-4">
                    <label className="text-xs text-slate-500 mb-1.5 block">
                        Spent
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                        placeholder="Enter $ amount spent"
                        onChange={(e) => setFormData({...formData, spent: e.target.value})}
                        value={formData.spent}
                        required
                    />
                </div>


            )}

            {type === "adjustment" && (

                <div className="p-4">

                    <label className="text-xs text-slate-500 mb-1.5 block">
                        Amount (Points)
                    </label>

                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                        placeholder="Enter point amount adjusted in this transaction"
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        value={formData.amount}
                        required
                    />


                </div>


            )}

            {type === "adjustment" && (<div className={"p-4"}>
                    <label className="text-xs text-slate-500 mb-1.5 block">
                        Related ID
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                        placeholder="The ID of the related transaction"
                        onChange={(e) => setFormData({...formData, relatedId: e.target.value})}
                        value={formData.relatedId}
                    />
                </div>

            )}

            {/* Promotion IDs */}
            <div className="p-4">

                <label className="text-xs text-slate-500 mb-1.5 block">
                    Promotion IDs (Optional)
                </label>

                <div className={"flex gap-2 mb-2"}>
                    <input type={"number"} placeholder={"PromotionId"}
                           className={"flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"}
                           onChange={(e) => setFormData({...formData, currentPromoId: e.target.value})}
                    />
                    <button
                        type="button"
                        className={"px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"}
                        onClick={(e) => {
                            e.preventDefault();
                            const promoid = parseInt(formData.currentPromoId, 10);
                            if (!isNaN(promoid) && !formData.promotionIds.includes(promoid)) {
                                const newpromotionIds = [...formData.promotionIds, promoid];
                                setFormData({
                                    ...formData, promotionIds: newpromotionIds,
                                });
                            }

                        }}>


                        Add
                    </button>


                    {/* Show added promotion IDs */}
                    {formData.promotionIds.length > 0 && (<div className="flex flex-wrap gap-2">
                        {formData.promotionIds.map(id => (<span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm"
                        >
                                #{id}
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev, promotionIds: prev.promotionIds.filter(i => i !== id)
                                    }));
                                }}
                                className="text-emerald-600 hover:text-emerald-800 font-bold"
                            >
                                    ×
                                </button>
                            </span>))}
                    </div>)}


                </div>


            </div>


            <div className="p-4">
                <label className="text-xs text-slate-500 mb-1.5 block">
                    Remark (Optional)
                </label>
                <textarea
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    value={formData.remark}
                    className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                    rows="3"
                />
            </div>


        </form>


    )

}
