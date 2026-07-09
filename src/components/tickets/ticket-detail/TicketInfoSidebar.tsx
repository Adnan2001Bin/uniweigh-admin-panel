import { Building, Truck, User, MapPin } from "lucide-react";
import { Transaction } from "../../../types";

interface TicketInfoSidebarProps {
  transaction: Transaction;
  onUpdateTransaction: (updatedTx: Transaction) => void;
}

export default function TicketInfoSidebar({ transaction, onUpdateTransaction }: TicketInfoSidebarProps) {
  const setType = (newType: "Account" | "Cash") => {
    if (transaction.type === newType) return;
    onUpdateTransaction({
      ...transaction,
      type: newType,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: "Transaction Type Recorded",
          user: "Admin User",
          details: `Billing type updated and recorded as: ${newType}`
        }
      ]
    });
  };

  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
          Shipment Information
        </h3>

        <div className="space-y-4 text-sm text-gray-700 font-normal">
          <div className="flex items-start gap-2.5">
            <Building className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-0.5">Invoiced Customer</div>
              <div className="font-bold text-gray-900">{transaction.customerName}</div>
              <div className="text-xs text-slate-500 font-medium">Customer ID: {transaction.customerId}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Truck className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-0.5">Carrier Transport & plates</div>
              <div className="font-semibold text-gray-800">{transaction.carrierName}</div>
              <div className="font-mono text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                {transaction.vehicleReg}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <User className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-0.5">Assigned Operator / Driver</div>
              <div className="font-bold text-gray-800">{transaction.driverName}</div>
              <div className="text-xs text-gray-400">Scale Operator: {transaction.operatorId}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-0.5 font-medium">Site Dispatch Station</div>
              <div className="font-medium text-gray-800">{transaction.siteName}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
          <span>Billing / Transaction Type</span>
          <span
            className={`inline-flex items-center rounded-xs px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              transaction.type === "Account"
                ? "bg-slate-100 text-slate-800 border border-slate-200"
                : "bg-amber-50 text-amber-800 border border-amber-200/50"
            }`}
          >
            {transaction.type}
          </span>
        </h3>

        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-normal">
            Choose the transaction class recorded for this load. This routes billing to client accounts or cash registers.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("Account")}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                transaction.type === "Account"
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-extrabold shadow-inner"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Account
            </button>

            <button
              type="button"
              onClick={() => setType("Cash")}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                transaction.type === "Cash"
                  ? "bg-amber-50 border-amber-200 text-amber-700 font-extrabold shadow-inner"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Cash
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 text-xs space-y-2 shadow-sm">
        <span className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">
          Weighbridge Diagnostics
        </span>
        <div className="space-y-1.5 font-medium">
          <div className="flex justify-between">
            <span className="text-gray-500">Inbound Scales:</span>
            <span className="text-slate-800 font-mono font-bold">{transaction.scaleIdInbound}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Outbound Scales:</span>
            <span className="text-slate-800 font-mono font-bold">{transaction.scaleIdOutbound}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Legal-For-Trade Certification:</span>
            <span className="text-emerald-700 font-bold">Approved Calibrated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
