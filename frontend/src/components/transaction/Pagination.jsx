export function Pagination() {

    return (<div className={"flex items-center justify-between mt-6 pt-6 border-t border-slate-100"}>

        <div className={"text-sm text-slate-500"}>
            Page 1 of 1
        </div>
        <div>
            <div className={"flex gap-2"}>
                <button disabled
                        className={"px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled: cursor-not-allowed"}>
                    Previous
                </button>
                <button disabled
                        className={"px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled: cursor-not-allowed"}>
                    Next
                </button>

            </div>
        </div>


    </div>)

}