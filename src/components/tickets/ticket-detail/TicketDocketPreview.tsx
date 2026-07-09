import { Printer, X } from "lucide-react";
import { Transaction, DocketConfig, Job } from "../../../types";
import { getDefaultDocketConfig } from "./utils/printHelpers";

interface TicketDocketPreviewProps {
  transaction: Transaction;
  docketConfig?: DocketConfig;
  jobs?: Job[];
  transactions?: Transaction[];
  isReprint: boolean;
  printType: "docket" | "invoice";
  onPrintTypeChange: (type: "docket" | "invoice") => void;
  onClose: () => void;
  onPrint: () => void;
}

export default function TicketDocketPreview({
  transaction,
  docketConfig,
  jobs = [],
  transactions = [],
  isReprint,
  printType,
  onPrintTypeChange,
  onClose,
  onPrint
}: TicketDocketPreviewProps) {
  const config = docketConfig || getDefaultDocketConfig();

  const linkedJob = jobs.find((j) => j.id === transaction.jobOrder);
  const totalDeliveredForJob = linkedJob
    ? transactions
        .filter(
          (tx) =>
            tx.jobOrder === linkedJob.id &&
            (tx.status === "Approved" || tx.status === "Invoiced" || tx.status === "Committed" || tx.id === transaction.id)
        )
        .reduce((sum, tx) => sum + tx.netWeight, 0)
    : 0;
  const orderQty = linkedJob?.orderQty || 10000;
  const remainingQty = Math.max(0, orderQty - totalDeliveredForJob);
  const deliveredPercent = Math.min(100, Number(((totalDeliveredForJob / orderQty) * 100).toFixed(1)));

  const unitPrice = transaction.basePrice || 24.50;
  const netWeight = transaction.netWeight;
  const totalExGst = netWeight * unitPrice;
  const gstValue = totalExGst * 0.10;
  const totalIncGst = totalExGst + gstValue;

  const paymentNotes =
    transaction.type === "Account"
      ? config.accountInvoiceNotes || "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document."
      : config.cashInvoiceNotes || "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl p-6 relative animate-zoom-in my-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Printer className="h-4 w-4 text-blue-500" />
              <span>Official Weighbridge Document Spooler</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a document layout type to preview and print.
            </p>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 max-w-fit">
            <button
              onClick={() => onPrintTypeChange("docket")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                printType === "docket" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Delivery Docket
            </button>
            <button
              onClick={() => onPrintTypeChange("invoice")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                printType === "invoice" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Tax Invoice
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-inner border border-slate-200 font-sans max-h-[55vh] overflow-y-auto relative">
          {printType === "invoice" && (
            transaction.type === "Account" ? (
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] font-black text-[40px] text-slate-400/5 border-4 border-dashed border-slate-400/5 p-4 rounded-xl text-center pointer-events-none select-none uppercase tracking-widest">
                Charged to Account
              </div>
            ) : (
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] font-black text-[45px] text-emerald-500/5 border-4 border-dashed border-emerald-500/5 p-4 rounded-xl text-center pointer-events-none select-none uppercase tracking-widest">
                Paid / Received
              </div>
            )
          )}

          <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4 text-[11px] leading-relaxed">
            <div className="flex gap-3">
              {config.showLogo && (
                <div className="flex-shrink-0">
                  {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="max-h-12 max-w-[80px] object-contain" />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="text-blue-600">
                      <path d="M50 5L90 35L75 90L25 90L10 35L50 5Z" fill="currentColor" opacity="0.15" />
                      <path d="M50 15L80 40H20L50 15Z" fill="currentColor" />
                      <path d="M45 40H55V85H45V40Z" fill="currentColor" />
                      <path d="M50 5L95 38L78 92H22L5 38L50 5ZM50 10L10 40L25 87H75L90 40L50 10Z" fill="currentColor" />
                    </svg>
                  )}
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">{config.eftAccountName}</h4>
                <p className="text-[10px] text-slate-500 font-medium">Certified Weighbridge Material Record</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">{config.businessName}</p>
              <p className="text-slate-500 text-[10px]">{config.poBox}</p>
              <p className="text-slate-500 text-[10px]">CONTACT: {config.contact}</p>
              <p className="text-slate-500 text-[10px]">ABN: {config.abn}</p>
            </div>
          </div>

          <div className="text-center border-y-2 border-slate-950 py-2 mb-4">
            <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase">
              {printType === "docket" ? "Delivery Docket" : config.invoiceTitle || "Tax Invoice"}
            </h2>
            {isReprint && (
              <div className="inline-block bg-slate-900 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded mt-1.5 select-none">
                REPRINT / DUPLICATE COPY
              </div>
            )}
            <div className="text-xs font-mono font-bold mt-1 text-slate-800">
              {printType === "docket"
                ? `DOCKET #${transaction.ticketNo}`
                : `INVOICE #INV-${transaction.ticketNo.replace("WB-", "")}`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Date & Weigh In</span>
              <span className="font-semibold text-slate-800">{transaction.firstWeighTime}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Date & Weigh Out</span>
              <span className="font-semibold text-slate-800">{transaction.secondWeighTime || "Completed"}</span>
            </div>

            <div className="col-span-2">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Customer / Debtor</span>
              <span className="font-bold text-slate-900 text-xs">{transaction.customerName}</span>
              <span className="text-[10px] text-slate-500 block">Account Code: {transaction.customerId}</span>
            </div>

            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Weighbridge Location</span>
              <span className="font-semibold text-slate-800">{config.weighbridgeLocation}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Rego</span>
              <span className="font-mono font-bold text-slate-800">{transaction.vehicleReg}</span>
            </div>

            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Material Product</span>
              <span className="font-bold text-slate-800">{transaction.productName}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Lot Number</span>
              <span className="font-mono font-semibold text-slate-800">{transaction.lotNo || "N/A"}</span>
            </div>
          </div>

          {printType === "invoice" && transaction.type === "Account" && linkedJob && (
            <div className="border border-slate-200 bg-slate-50 rounded-lg p-3 mb-4 text-[10px]">
              <div className="flex justify-between font-bold text-slate-900 uppercase text-[9px] tracking-wider mb-1.5">
                <span>Account Contract PO Fulfillment Verification</span>
                <span className="text-blue-600 font-mono">PO: {linkedJob.customerOrderRef || "PO-" + linkedJob.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono mb-2 text-slate-700">
                <div>Ordered: <span className="font-bold">{orderQty.toLocaleString()} t</span></div>
                <div>Delivered: <span className="font-bold text-slate-900">{totalDeliveredForJob.toFixed(2)} t</span></div>
                <div>Remaining Balance: <span className="font-bold text-amber-700">{remainingQty.toFixed(2)} t</span></div>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${deliveredPercent}%` }}></div>
              </div>
              <p className="text-[8px] text-slate-500 text-right font-medium">
                {deliveredPercent}% of Contract PO quantity fulfilled. {remainingQty.toFixed(2)} t balance remains.
              </p>
            </div>
          )}

          {printType === "docket" ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 font-mono text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 uppercase">Gross Weight:</span>
                <span className="font-bold text-slate-800">{transaction.grossWeight.toFixed(2)} t</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 uppercase">Tare Weight:</span>
                <span className="font-bold text-slate-800">{transaction.tareWeight.toFixed(2)} t</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="font-black text-slate-900 uppercase">NET WEIGHT:</span>
                <span className="font-black text-blue-600 text-xs">{transaction.netWeight.toFixed(2)} tonnes</span>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-2">Description</th>
                    <th className="p-2 text-center">Net Qty (t)</th>
                    <th className="p-2 text-right">Rate ($/t)</th>
                    <th className="p-2 text-right">Total (Ex. GST)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-2 font-semibold text-slate-800">{transaction.productName}</td>
                    <td className="p-2 text-center font-mono">{netWeight.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">${unitPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">${totalExGst.toFixed(2)}</td>
                  </tr>
                  <tr className="text-slate-500 text-[10px]">
                    <td colSpan={3} className="p-2 text-right">Gross Total:</td>
                    <td className="p-2 text-right font-mono">${totalExGst.toFixed(2)}</td>
                  </tr>
                  <tr className="text-slate-500 text-[10px]">
                    <td colSpan={3} className="p-2 text-right">GST (10%):</td>
                    <td className="p-2 text-right font-mono">${gstValue.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-blue-50/50 font-bold text-slate-900">
                    <td colSpan={3} className="p-2 text-right uppercase">Amount Due (Inc. GST):</td>
                    <td className="p-2 text-right font-mono text-blue-600">${totalIncGst.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {printType === "invoice" && (
            <div className="p-3 bg-slate-50 border-l-2 border-slate-400 rounded-r-lg text-[9px] text-slate-600 mb-4 leading-normal">
              <span className="block font-extrabold uppercase text-[8px] tracking-wider text-slate-800 mb-0.5">Billing terms & Payment Advice</span>
              {paymentNotes}
            </div>
          )}

          {printType === "invoice" && (
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 text-[9px] mb-4">
              <span className="block font-bold text-[8px] text-slate-500 uppercase tracking-wider mb-1">EFT Direct Deposit Info</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-slate-700">
                <div>Name: <span className="font-semibold">{config.eftAccountName}</span></div>
                <div>BSB: <span className="font-semibold">{config.eftBsb}</span></div>
                <div>Account: <span className="font-semibold">{config.eftAccountNo}</span></div>
              </div>
            </div>
          )}

          <div className="text-center font-mono text-[8px] tracking-[5px] text-slate-300 my-4 select-none">
            ||||| | ||||| | || | ||| |||| | ||||| | |||
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
            <div className="text-center">
              <div className="border-b border-slate-300 w-32 mx-auto mb-1 h-4"></div>
              Operator Signature (ID: {transaction.operatorId})
            </div>
            <div className="text-center">
              <div className="border-b border-slate-300 w-32 mx-auto mb-1 h-4"></div>
              Driver / Receiver Signature
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition"
          >
            Close Preview
          </button>
          <button
            onClick={onPrint}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Issue System Print Spooler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
