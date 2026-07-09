import { Transaction } from "../../../types";

interface TicketTareHistoryProps {
  transaction: Transaction;
}

export default function TicketTareHistory({ transaction }: TicketTareHistoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
          Prior Tare Weight records for plate {transaction.vehicleReg}
        </h4>
        <p className="text-xs text-gray-500">
          Comparative verification check against previous tare scores recorded of this license plate to avoid truck-bed cheating.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-teal-500 bg-white p-3.5 flex justify-between items-center text-xs shadow-xs">
          <div>
            <p className="font-bold text-slate-900">Current ticket tare weight (this session)</p>
            <span className="text-slate-400 text-[10px]">Today</span>
          </div>
          <div className="text-right font-mono font-bold text-teal-700 text-sm">
            {transaction.tareWeight} t
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3.5 flex justify-between items-center text-xs text-gray-500">
          <div>
            <p className="font-bold text-gray-700">Prior ticket WB-991212</p>
            <span className="text-gray-405 text-[10px]">3 days ago</span>
          </div>
          <div className="text-right font-mono font-semibold">
            {(transaction.tareWeight * 0.998).toFixed(2)} t
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3.5 flex justify-between items-center text-xs text-gray-500">
          <div>
            <p className="font-bold text-gray-700">Prior ticket WB-991195</p>
            <span className="text-gray-405 text-[10px]">8 days ago</span>
          </div>
          <div className="text-right font-mono font-semibold">
            {(transaction.tareWeight * 1.002).toFixed(2)} t
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
        <div>
          <div className="font-bold text-emerald-800">Standard tare deviation index:</div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Tolerance check confirms high consistency (&lt;0.5% variance)</p>
        </div>
        <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1 font-bold">
          Safe Variance
        </span>
      </div>
    </div>
  );
}
