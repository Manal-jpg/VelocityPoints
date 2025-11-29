// common elements utorid, promotionids, remark
// transfer and redeem are the same type, amount, remark

export function CreateTransactionForm({type, setFormData, formData}) {
    if (type === "redemption" || type === "transfer") {
        return (<div>

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

        </div>)
    }

    return (
        <div>

            <div className={"p-4"}>
                <label className={" text-xs text-slate-500 mb-1.5 block"}>Customer utorid</label>
                <input type={"text"} placeholder={"utorid"}
                       className={" w-full px-3 py-2 border border-slate-100 rounded-lg"} required
                       onChange={(e) => setFormData({...formData, utorid: e.target.value})}
                       value={formData.utorid}

                />
            </div>

            {type === "purchase" && (
                <div className="p-4">
                    <label className="text-xs text-slate-500 mb-1.5 block">
                        Spent
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                        placeholder="Enter $ amount spent"
                        onChange={(e) => setFormData({...formData, spent: e.target.value})}
                        value={formData.spent}
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
                    />


                </div>


            )}

            {type === "adjustment" && (
                <div className={"p-4"}>
                    <label className="text-xs text-slate-500 mb-1.5 block">
                        Related ID
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-100 rounded-lg"
                        placeholder="The ID of the related transaction"
                    />
                </div>

            )}

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


        </div>


    )

}