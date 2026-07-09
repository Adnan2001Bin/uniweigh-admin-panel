import { Printer, Check, CheckCircle2, Download } from "lucide-react";
import { Transaction, TransactionStatus } from "../../../types";

interface TicketStatusActionsProps {
  transaction: Transaction;
  onUpdateTransaction: (updatedTx: Transaction) => void;
  onOpenPrintModal: (reprint: boolean) => void;
}

export default function TicketStatusActions({ transaction, onUpdateTransaction, onOpenPrintModal }: TicketStatusActionsProps) {
  const printedBefore = transaction.auditHistory.some((h) => h.action.toLowerCase().includes("print"));

  const appendAudit = (action: string, details: string): Transaction => ({
    ...transaction,
    auditHistory: [
      ...transaction.auditHistory,
      { timestamp: new Date().toLocaleString(), action, user: "Admin User", details }
    ]
  });

  const approveTx = () => {
    onUpdateTransaction(appendAudit("Status Approved", "Approved for billing queue via enterprise action."));
    alert(`Weighbridge load ticket ${transaction.ticketNo} has been APPROVED.`);
  };

  const holdTx = () => {
    const reason = prompt("Enter the reason for flagging or locking this ticket on hold:");
    if (!reason) return;
    const updated: Transaction = {
      ...appendAudit("Status Locked On-Hold", `Billing locked: ${reason}`),
      status: TransactionStatus.ON_HOLD,
      comments: transaction.comments ? `${transaction.comments}. Audit Hold: ${reason}` : reason
    };
    onUpdateTransaction(updated);
    alert(`Weighbridge load ticket ${transaction.ticketNo} is now ON HOLD.`);
  };

  const invoiceTx = () => {
    onUpdateTransaction({
      ...appendAudit("Status Marked Invoiced", "Invoice dispatched to client ledger successfully."),
      status: TransactionStatus.INVOICED
    });
    alert(`Weighbridge load ticket ${transaction.ticketNo} has been set to INVOICED.`);
  };

  const releaseHold = () => {
    onUpdateTransaction({
      ...appendAudit("Hold Released", "Cleared billing blockade. Returned ticket to Pending list."),
      status: TransactionStatus.PENDING
    });
    alert(`Weighbridge load hold on ticket ${transaction.ticketNo} has been RELEASED.`);
  };

  const revertTx = () => {
    const reason = prompt("Add back-office adjustment reason for moving this entry back to Pending:");
    if (reason === null) return;
    const updated: Transaction = {
      ...appendAudit("Reverted to Pending", `Reverted: ${reason}`),
      status: TransactionStatus.PENDING,
      comments: transaction.comments ? `${transaction.comments}. Reverted: ${reason}` : `Reverted: ${reason}`
    };
    onUpdateTransaction(updated);
    alert(`Weighbridge load ticket ${transaction.ticketNo} has been REVERTED to pending.`);
  };

  return (
    <div className="flex flex-wrap gap-2 self-start md:self-center items-center">
      <button
        onClick={() => onOpenPrintModal(printedBefore)}
        className="rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-xs font-bold text-blue-700 px-4 py-2 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
      >
        <Printer className="h-4 w-4" />
        <span>{printedBefore ? "Reprint Docket" : "Print Docket"}</span>
      </button>

      {transaction.status === TransactionStatus.PENDING && (
        <>
          <button
            onClick={holdTx}
            className="rounded-lg border border-red-200 bg-white text-xs font-bold text-red-600 px-4 py-2 hover:bg-slate-50 transition cursor-pointer"
          >
            Hold Ticket
          </button>
          <button
            onClick={approveTx}
            className="rounded-lg bg-blue-600 text-xs font-bold text-white px-4 py-2 hover:bg-blue-705 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Approve & Release Load
          </button>
        </>
      )}

      {transaction.status === TransactionStatus.APPROVED && (
        <>
          <button
            onClick={revertTx}
            className="rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 px-4 py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            Revert to Pending
          </button>
          <button
            onClick={invoiceTx}
            className="rounded-lg bg-emerald-600 text-xs font-bold text-white px-4 py-2 hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Invoiced
          </button>
        </>
      )}

      {transaction.status === TransactionStatus.ON_HOLD && (
        <button
          onClick={releaseHold}
          className="rounded-lg bg-blue-600 text-xs font-bold text-white px-4 py-2 hover:bg-blue-700 transition cursor-pointer"
        >
          Release Hold State
        </button>
      )}

      {transaction.status === TransactionStatus.INVOICED && (
        <div className="flex items-center gap-2">
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-1.5 text-xs font-bold">
            Accounted & Closed
          </span>
          <button
            onClick={() => {
              alert("Generating secure weight ticket PDF report...");
            }}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 px-3.5 py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
