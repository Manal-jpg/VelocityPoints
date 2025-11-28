import {Filter} from "lucide-react";
import * as events from "node:events";

export function TransactionFilters({
                                       showFilters,
                                       setShowFilters,
                                       quickFilters,
                                       setActiveFilters,
                                       activeFilters,
                                       advancedFilters,
                                       setAdvancedFilters,
                                       hasPermissions
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
                {quickFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setActiveFilters([...activeFilters, filter.value])}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            activeFilters.includes(filter.value)
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            {/*{advanced filters}*/}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 pt-5">
                    {/*{input label div}*/}
                    <div>
                        <label className={"block text-sm text-slate-600 mb-1.5"}> Search by Name/UtorId</label>
                        <input type={"text"} value={advancedFilters.name} placeholder={"Search"}
                               onChange={(e) => setAdvancedFilters({...advancedFilters, name: e.target.value})}
                               className={"w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus: border-emerald-500"}/>
                    </div>

                    {hasPermissions(["manager", "superuser"]) && (
                        <div>
                            <label className={"block text-sm text-slate-600 mb-1.5"}>Suspicious</label>
                            <select
                                value={activeFilters.suspicious}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                onChange={(e) => setAdvancedFilters({...advancedFilters, suspicious: e.target.value === true})}
                            >
                                <option value="true">All</option>
                                <option value="false">Suspicious</option>
                                <option value="">Not Suspicious</option>

                            </select>
                        </div>

                    )

                    }


                </div>
            )}


        </div>)
}