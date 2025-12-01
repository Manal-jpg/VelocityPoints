import {Filter, X} from "lucide-react";

export function TransactionFilters({
                                       showFilters,
                                       setShowFilters,
                                       quickFilters,
                                       advancedFilters,
                                       setAdvancedFilters,
                                       hasPermissions,
                                       setTransactionId,
                                       transactionId,
                                       currentPage, setPage, limit, setLimit,
                                   }) {

    return (

        <div className="bg-white rounded-2xl border border-slate-100 p-6">

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-900">Filter & Search</h4>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                    <Filter size={16}/>
                    {showFilters ? "Hide" : "Show"} Advanced Filters
                </button>
            </div>

            {/* Quick Filter Pills - how to select multiple filters and highlight them */}
            <div className="flex flex-wrap gap-2 pb-5">
                {quickFilters.map((filter) => (<button
                    key={filter.value}
                    onClick={() => setAdvancedFilters(advancedFilters.type === filter.value ? {
                        ...advancedFilters, type: "all"
                    } : {...advancedFilters, type: filter.value})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${advancedFilters.type === filter.value ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                    {filter.label}
                </button>))}

                {/* Transaction ID Search */}
                {hasPermissions["manager", "superuser"] && (
                    <div className="flex items-center gap-2">
                        <input type={"number"} placeholder={"Find by ID"}
                               value={transactionId}
                               onChange={(e) => {
                                   setTransactionId(e.target.value);
                               }}
                               className="w-40 px-3 py-2 border border-slate-200 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-emerald-500"/>

                        {!isNaN(transactionId) && (
                            <button onClick={() => setTransactionId('')} className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={16}/>

                            </button>


                        )}

                    </div>

                )}


            </div>


            {/*{advanced filters}*/}
            {/*{showFilters && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">*/}
            {/*    /!*{input label div}*!/*/}
            {/*    <div>*/}
            {/*        <label className={"block text-sm text-slate-600 mb-1.5"}> Search by Name/UtorId</label>*/}
            {/*        <input type={"text"} value={advancedFilters.name} placeholder={"Search"}*/}
            {/*               onChange={(e) => setAdvancedFilters({...advancedFilters, name: e.target.value})}*/}
            {/*               className={"w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus: border-emerald-500"}/>*/}
            {/*    </div>*/}

            {/*    {hasPermissions(["manager", "superuser"]) && (<div>*/}

            {/*            <div>*/}
            {/*                <label className={"block text-sm text-slate-600 mb-1.5"}>Suspicious</label>*/}
            {/*                <select*/}
            {/*                    value={advancedFilters.suspicious}*/}
            {/*                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"*/}
            {/*                    onChange={(e) => setAdvancedFilters({*/}
            {/*                        ...advancedFilters, suspicious: e.target.value*/}
            {/*                    })}*/}
            {/*                >*/}
            {/*                    <option value="">All</option>*/}
            {/*                    <option value="true">Suspicious</option>*/}
            {/*                    <option value="false">Not Suspicious</option>*/}

            {/*                </select>*/}
            {/*            </div>*/}


            {/*        </div>*/}

            {/*    )*/}

            {/*    }*/}


            {/*</div>)}*/}


            {/* Advanced Filters Section */}
            {showFilters && (<div className="space-y-4 pt-4 border-t border-slate-100">

                {/* Row 1: Name, Created By, Suspicious */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Name/UTORid Search */}
                    {hasPermissions["manager", "superuser"] && (

                        <div>
                            <label className="block text-sm text-slate-600 mb-1.5">
                                Search by Name/UTORid
                            </label>
                            <input
                                type="text"
                                value={advancedFilters.name}
                                placeholder="Search..."
                                onChange={(e) => setAdvancedFilters({
                                    ...advancedFilters, name: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>


                    )}


                    {/* Created By */}
                    {hasPermissions["manager", "superuser"] && (
                        <div>
                            <label className="block text-sm text-slate-600 mb-1.5">
                                Created By (UTORid)
                            </label>
                            <input
                                type="text"
                                value={advancedFilters.createdBy}
                                placeholder="Creator's UTORid"
                                onChange={(e) => setAdvancedFilters({
                                    ...advancedFilters, createdBy: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                    )}


                    {/* Suspicious (Managers only) */}
                    {hasPermissions(["manager", "superuser"]) && (<div>
                        <label className="block text-sm text-slate-600 mb-1.5">
                            Suspicious Status
                        </label>
                        <select
                            value={advancedFilters.suspicious}
                            onChange={(e) => setAdvancedFilters({
                                ...advancedFilters, suspicious: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                        >
                            <option value="">All</option>
                            <option value="false">Not Suspicious</option>
                            <option value="true">⚠️ Suspicious</option>
                        </select>
                    </div>)}
                </div>

                {/* Row 2: Promotion ID, Related ID, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Promotion ID */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1.5">
                            Promotion ID
                        </label>
                        <input
                            type="number"
                            value={advancedFilters.promotionId}
                            placeholder="e.g., 42"
                            onChange={(e) => setAdvancedFilters({
                                ...advancedFilters, promotionId: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Related Transaction ID */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1.5">
                            Related Transaction ID
                        </label>
                        <input
                            type="number"
                            value={advancedFilters.relatedId}
                            placeholder="e.g., 123"
                            onChange={(e) => setAdvancedFilters({
                                ...advancedFilters, relatedId: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Amount Filter */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1.5">
                            Amount (Points)
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={advancedFilters.operator}
                                onChange={(e) => setAdvancedFilters({
                                    ...advancedFilters, operator: e.target.value
                                })}
                                className="w-24 px-2 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                            >
                                <option value="">Any</option>
                                <option value="gte">≥</option>
                                <option value="lte">≤</option>
                                <option value="eq">=</option>
                            </select>
                            <input
                                type="number"
                                value={advancedFilters.amount}
                                placeholder="0"
                                onChange={(e) => setAdvancedFilters({
                                    ...advancedFilters, amount: e.target.value
                                })}
                                disabled={!advancedFilters.operator}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50
  disabled:text-slate-400"
                            />
                        </div>
                    </div>
                </div>


                {/* Row 3: Page, Limit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Page */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1.5">
                            Page Number
                        </label>
                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) {
                                    setPage(val);
                                }
                            }}
                            min="1"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg
  text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Limit */}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1.5">
                            Results Per Page
                        </label>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg
  text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    {/* Empty third column for consistent layout */}
                    <div></div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => {
                            setAdvancedFilters({
                                name: "",
                                createdBy: "",
                                suspicious: "",
                                promotionId: "",
                                relatedId: "",
                                amount: 0,
                                operator: "",
                                type: "all"
                            });
                            setTransactionId('');
                        }}
                        className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50
   transition flex items-center gap-2"
                    >
                        <X size={16}/>
                        Clear All Filters
                    </button>
                </div>
            </div>)}


        </div>)
}