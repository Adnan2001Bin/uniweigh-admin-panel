import { Scale, Calendar } from "lucide-react";
import { Transaction } from "../../../types";
import { StatusBadge, TypeBadge } from "../../shared/Badges";

interface TicketHeaderProps {
  transaction: Transaction;
}

export default function TicketHeader({ transaction }: TicketHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 text-blue-700 flex items-center justify-center font-black text-lg shadow-inner">
        <Scale className="h-6 w-6" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Weigh Ticket Internal ID: {transaction.id}
          </span>
          <StatusBadge status={transaction.status} />
          <TypeBadge type={transaction.type} />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 mt-1">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Ticket #{transaction.ticketNo}
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-550 bg-gray-50 border border-gray-200 rounded px-2.5 py-1 select-none">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>Weigh Date: {transaction.firstWeighTime}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
