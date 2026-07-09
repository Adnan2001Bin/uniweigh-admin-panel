import { useState } from "react";
import { CheckCircle2, AlertTriangle, FileText, X, ExternalLink, Clock } from "lucide-react";
import { Transaction, TransactionStatus } from "../../../types";

interface TransactionPreviewPanelProps {
  activeTx: Transaction;
  onUpdateTransaction: (updatedTx: Transaction) => void;
  onViewTicketDetails: (ticketId: string) => void;
  onClose: () => void;
}

export default function TransactionPreviewPanel({
  activeTx,
  onUpdateTransaction,
  onViewTicketDetails,
  onClose
}: TransactionPreviewPanelProps) {
  const [previewTab, setPreviewTab] = useState<"overview" | "pricing" | "weights" | "audit">("overview");

  const handleUpdateStatus = (newStatus: TransactionStatus, commentText: string) => {
    onUpdateTransaction({
      ...activeTx,
      status: newStatus,
      auditHistory: [
        ...activeTx.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: `Status set to ${newStatus}`,
          user: "Admin User",
          details: commentText || `Status transitioned back-office to ${newStatus}.`
        }
      ]
    });
  };

  return (
    <div className="lg:col-span-4 bg-white border border-gray-150 rounded-2xl shadow-lg overflow-hidden shrink-0 h-auto sticky top-4 animate-fade-in">
      <div className="border-b border-gray-150 p-4 bg-gray-50/50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-gray-900">{activeTx.ticketNo}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                activeTx.type === "Account"
                  ? "bg-slate-150 text-slate-900 border border-slate-200"
                  : "bg-amber-100 text-amber-900 border border-amber-200/50"
              }`}
            >
              {activeTx.type}
            </span>
          </div>
          <div className="font-mono text-[10px] text-gray-400">
            Code: {activeTx.id} | {activeTx.transactionCode || "N/A"}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              activeTx.status === TransactionStatus.APPROVED
                ? "bg-green-100 text-green-800 border border-green-200/30"
                : activeTx.status === TransactionStatus.PENDING
                ? "bg-blue-105 text-blue-800 border border-blue-200/30"
                : activeTx.status === TransactionStatus.ON_HOLD
                ? "bg-red-101 text-red-800 border border-red-200/30"
                : activeTx.status === TransactionStatus.CANCELLED
                ? "bg-red-100/30 text-red-700 border border-red-200/20"
                : activeTx.status === TransactionStatus.COMMITTED
                ? "bg-violet-100 text-violet-800 border border-violet-200/30"
                : "bg-gray-100 text-gray-800 border border-gray-250/30"
            }`}
          >
            {activeTx.status}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
            title="Close preview"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none bg-gray-50/20">
        {[
          { id: "overview", label: "Overview" },
          { id: "pricing", label: "Financials" },
          { id: "weights", label: "Weights" },
          { id: "audit", label: "Audits" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewTab(tab.id as typeof previewTab)}
            className={`w-1/4 py-2.5 text-center transition cursor-pointer ${
              previewTab === tab.id
                ? "bg-white border-b-2 border-b-blue-600 text-blue-700 font-bold"
                : "hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 min-h-[280px]">
        {previewTab === "overview" && (
          <div className="space-y-3">
            <div>
              <span className="block text-[10px] font-black uppercase text-gray-400">Customer / Ledger account</span>
              <span className="text-[13px] font-black text-gray-900">{activeTx.customerName}</span>
              <span className="block font-mono text-[10px] text-gray-400">Ledger ID: {activeTx.customerId}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[10px] font-black uppercase text-gray-400">Job / Order Ref</span>
                <span className="text-[12px] font-bold text-gray-800">{activeTx.jobOrder || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-gray-400">Lot Registered</span>
                <span className="text-[12px] font-bold text-gray-800">{activeTx.lotNo || "N/A"}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase text-gray-400">Material / Product</span>
              <span className="text-[13px] font-bold text-gray-800">{activeTx.productName}</span>
              <span className="block text-[10px] text-gray-400">Code: {activeTx.productId}</span>
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase text-gray-400">Transport Logistics</span>
              <span className="text-[12px] font-semibold text-gray-700">{activeTx.carrierName}</span>
              <span className="block text-[11px] text-gray-400">
                Driver: {activeTx.driverName} • Truck: {activeTx.vehicleReg}
              </span>
            </div>
          </div>
        )}

        {previewTab === "pricing" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 border border-gray-150">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-500 font-medium">Net Weight:</span>
                <span className="font-bold font-mono text-gray-800">{activeTx.netWeight.toFixed(2)} t</span>
              </div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Unit Price:</span>
                <span className="font-bold font-mono text-gray-800">${activeTx.basePrice.toFixed(2)} / t</span>
              </div>
              <div className="border-t border-gray-200 my-1.5 pt-1.5 flex justify-between items-center">
                <span className="text-xs font-black text-gray-950 uppercase">Staged Value:</span>
                <span className="text-sm font-black font-mono text-blue-700">
                  ${activeTx.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase text-gray-400 mb-1">Client Account Status</span>
              <div
                className={`rounded-xl p-3 border ${
                  activeTx.accountBalance < 0
                    ? "bg-red-50 border-red-150 text-red-900"
                    : "bg-emerald-50 border-emerald-150 text-emerald-900"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Current Ledger Balance:</span>
                  <span className="font-black font-mono">
                    ${activeTx.accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-gray-450 mt-1">
                  {activeTx.accountBalance < 0
                    ? "CRITICAL WARNING: Client account exhibits negative credit balance limit or is currently marked suspended."
                    : "Ledger status healthy. Clear to post further transactional weight batches."}
                </p>
              </div>
            </div>
          </div>
        )}

        {previewTab === "weights" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-150 bg-slate-50/50 p-3 text-center">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Load Audit Gauge</span>
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-gray-900">{activeTx.netWeight.toFixed(2)}</span>
                <span className="text-sm font-bold text-gray-400">t Net Weight</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min((activeTx.netWeight / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 border border-gray-100 rounded-lg">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Gross Weight</span>
                <span className="font-mono font-bold text-gray-950">{activeTx.grossWeight.toFixed(2)} t</span>
              </div>
              <div className="p-2 border border-gray-100 rounded-lg">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Tare Weight</span>
                <span className="font-mono font-bold text-gray-950">{activeTx.tareWeight.toFixed(2)} t</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span>
                  Inbound Weigh: <span className="font-semibold">{activeTx.firstWeighTime}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span>
                  Outbound Weigh: <span className="font-semibold">{activeTx.secondWeighTime}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {previewTab === "audit" && (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            <span className="block text-[10px] font-black uppercase text-gray-400">Transaction Audit Ledger</span>
            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {activeTx.auditHistory.map((h, i) => (
                <div key={i} className="text-xs relative">
                  <span className="absolute -left-4.5 top-1 h-2 w-2 rounded-full bg-blue-600"></span>
                  <div className="font-black text-gray-800">{h.action}</div>
                  <div className="text-[10px] text-gray-400">
                    {h.timestamp} • User: {h.user}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{h.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-150 p-4 bg-gray-55/40 space-y-2">
        <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1 flex items-center justify-between">
          <span>Back-office Operations Workflow</span>
          <span className="text-gray-400 text-[9px]">ID: {activeTx.id}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {activeTx.status === TransactionStatus.PENDING && (
            <>
              <button
                onClick={() => {
                  handleUpdateStatus(TransactionStatus.APPROVED, "Enterprise back-office billing approval issued.");
                  alert(`Ticket ${activeTx.ticketNo} has been APPROVED.`);
                }}
                className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2.5 rounded-lg text-xs cursor-pointer transition shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => {
                  const reason = prompt("Enter the reason for flagging or locking this ticket on hold:");
                  if (!reason) return;
                  handleUpdateStatus(TransactionStatus.ON_HOLD, `Locked on audit hold: ${reason}`);
                  alert(`Ticket ${activeTx.ticketNo} placed ON HOLD.`);
                }}
                className="flex items-center justify-center gap-1.5 bg-red-650 hover:bg-red-700 text-white font-bold py-2 px-2.5 rounded-lg text-xs cursor-pointer transition shadow-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>On Hold</span>
              </button>
            </>
          )}

          {(activeTx.status === TransactionStatus.APPROVED || activeTx.status === TransactionStatus.COMMITTED) && (
            <button
              onClick={() => {
                handleUpdateStatus(TransactionStatus.INVOICED, "Invoice generated and posted to client ledger.");
                alert(`Ticket ${activeTx.ticketNo} has been INVOICED.`);
              }}
              className="col-span-2 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition shadow-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Dispatch Invoice Batch</span>
            </button>
          )}

          {activeTx.status === TransactionStatus.ON_HOLD && (
            <button
              onClick={() => {
                handleUpdateStatus(TransactionStatus.PENDING, "Released from billing block. Returned to review list.");
                alert(`Hold on ticket ${activeTx.ticketNo} has been RELEASED.`);
              }}
              className="col-span-2 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Release Audit Hold</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {activeTx.status !== TransactionStatus.CANCELLED && (
            <button
              onClick={() => {
                const yes = confirm(
                  `Are you sure you want to CANCEL ticket ${activeTx.ticketNo}? This action is permanent.`
                );
                if (!yes) return;
                handleUpdateStatus(TransactionStatus.CANCELLED, "Transaction canceled by back-office controller.");
              }}
              className="w-1/2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold py-1.5 px-2 rounded-lg text-[11px] text-center cursor-pointer transition"
            >
              Cancel Transaction
            </button>
          )}

          {activeTx.status === TransactionStatus.PENDING && (
            <button
              onClick={() => {
                handleUpdateStatus(
                  TransactionStatus.COMMITTED,
                  "Transaction committed by back-office controller, ready for invoicing."
                );
                alert(`Ticket ${activeTx.ticketNo} committed to queue.`);
              }}
              className="w-1/2 border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold py-1.5 px-2 rounded-lg text-[11px] text-center cursor-pointer transition"
            >
              Commit Queue
            </button>
          )}
        </div>

        <button
          id="btn-full-details-redirect"
          onClick={() => onViewTicketDetails(activeTx.id)}
          className="w-full mt-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
        >
          <span>Open Full Page Overview</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
