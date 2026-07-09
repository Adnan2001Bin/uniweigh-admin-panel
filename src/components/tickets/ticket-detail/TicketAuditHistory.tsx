import { Transaction } from "../../../types";

interface TicketAuditHistoryProps {
  transaction: Transaction;
}

export default function TicketAuditHistory({ transaction }: TicketAuditHistoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
          Security Transaction Log history
        </h4>
        <p className="text-xs text-gray-400">
          Real-time track records and adjustments of this weigh receipt logged on the ledger.
        </p>
      </div>

      <div className="relative border-l border-gray-200 pl-5 ml-2.5 space-y-6 pt-1">
        {transaction.auditHistory.map((log, i) => (
          <div key={i} className="relative text-xs">
            <span className="absolute -left-[29px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 border-blue-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </span>
            <div className="font-bold text-slate-900 text-[13px]">{log.action}</div>
            <div className="text-gray-400 text-[11px] font-medium mt-0.5">
              {log.timestamp} &bull; User: {log.user}
            </div>
            <p className="text-gray-600 leading-relaxed mt-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              {log.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
