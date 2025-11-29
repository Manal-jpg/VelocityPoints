import {ChevronRight, AlertTriangle} from "lucide-react";

export function TransactionCard({
                                    id,
                                    icon,
                                    title,
                                    date,
                                    time,
                                    amount,
                                    type,
                                    borderColor,
                                    suspicious,
                                    processed,
                                    onClick
                                }) {

    return (<div on onClick={onClick}
                 className={"bg-white rounded-lg p-6 border-l-4 border border-slate-100 hover:shadow-lg transition-all cursor-pointer"}
                 style={{borderLeftColor: borderColor}}
    >
        <div className="flex items-start gap-4">
            {/* Icon */}
            {/* Title row will go here */}
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{backgroundColor: `${borderColor}15`}}
            >
                {icon}
            </div>
            {/*{content}*/}
            <div className={"flex-1 min-w-0"}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="text-base font-semibold text-slate-900">
                        {title}
                    </h4>
                    {suspicious && (
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
      <AlertTriangle size={11}/>
      SUSPICIOUS
    </span>
                    )}
                    {processed === false && (
                        <span
                            className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">
      PENDING
    </span>
                    )}

                </div>
                {/* Date/time will go here */}
                <p className={"text-sm  text-slate-500 mb-1"}>
                    {date} at {time}
                </p>
                {/* Transaction ID will go here */}
                <p className={"text-sm text-slate-500 mb-1"}>
                    Transaction ID: {id}
                </p>
            </div>

            {/* Amount and arrow will go here */}
            <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${amount > 0 ? "text-emerald-600" :"text-red-600"}`}>
                    {amount > 0 ? "+" : ""}{amount}
                </span>

            </div>
            <ChevronRight size={20} className="text-slate-400" />

        </div>

        {/* Card content will go here */}

    </div>);
}

