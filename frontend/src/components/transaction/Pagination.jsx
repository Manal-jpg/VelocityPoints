export function Pagination({totalPages, currentPage, limit, setCurrentPage, setLimit}) {

    return (<div className={"flex items-center justify-between mt-6 pt-6 border-t border-slate-100"}>

        <div className={"text-sm text-slate-500"}>
            Page {currentPage} of {totalPages}
        </div>
        <div>
            <div className={"flex gap-2"}>
                <button disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className={"px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 "}>
                    Previous
                </button>
                <button disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={"px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 "}>
                    Next
                </button>

            </div>
        </div>


    </div>)

}