import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Transaction, TransactionStatus, DocketConfig, Job } from "../../../types";
import { generateDocketHtml, generateInvoiceHtml, getDefaultDocketConfig } from "./utils/printHelpers";
import TicketHeader from "./TicketHeader";
import TicketStatusActions from "./TicketStatusActions";
import TicketInfoSidebar from "./TicketInfoSidebar";
import TicketWeightSummary from "./TicketWeightSummary";
import TicketDocketPreview from "./TicketDocketPreview";

interface TicketDetailViewProps {
  transaction: Transaction;
  onUpdateTransaction: (updatedTx: Transaction) => void;
  onBack: () => void;
  docketConfig?: DocketConfig;
  jobs?: Job[];
  transactions?: Transaction[];
}

export default function TicketDetailView({
  transaction,
  onUpdateTransaction,
  onBack,
  docketConfig,
  jobs = [],
  transactions = []
}: TicketDetailViewProps) {
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isReprint, setIsReprint] = useState<boolean>(false);
  const [printType, setPrintType] = useState<"docket" | "invoice">("docket");

  const openPrintModal = (reprint: boolean) => {
    setIsReprint(reprint);
    setShowPrintModal(true);
  };

  const appendPrintAudit = (action: string, details: string): Transaction => ({
    ...transaction,
    auditHistory: [
      ...transaction.auditHistory,
      { timestamp: new Date().toLocaleString(), action, user: "Admin User", details }
    ]
  });

  const handlePrintInvoice = (reprintCopy: boolean) => {
    onUpdateTransaction(
      appendPrintAudit(
        reprintCopy ? "Invoice Reprinted" : "Invoice Printed",
        reprintCopy
          ? "Printed duplicate/reprint commercial tax invoice copy for client reference."
          : "First official commercial tax invoice printed successfully."
      )
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups to open the official tax invoice.");
      return;
    }

    const config = docketConfig || getDefaultDocketConfig();
    const htmlContent = generateInvoiceHtml(transaction, config, reprintCopy, jobs, transactions);

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintDocket = (reprintCopy: boolean) => {
    onUpdateTransaction(
      appendPrintAudit(
        reprintCopy ? "Docket Reprinted" : "Docket Printed",
        reprintCopy
          ? "Printed duplicate/reprint docket copy for driver/carrier reference."
          : "First official weighbridge docket printed successfully."
      )
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups to open the official print docket.");
      return;
    }

    const config = docketConfig || getDefaultDocketConfig();
    const htmlContent = generateDocketHtml(transaction, config, reprintCopy);

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition bg-white border border-gray-150 rounded-lg px-3.5 py-2 shadow-xs cursor-pointer inline-flex"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Return to List View</span>
      </button>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm">
        <TicketHeader transaction={transaction} />
        <TicketStatusActions
          transaction={transaction}
          onUpdateTransaction={onUpdateTransaction}
          onOpenPrintModal={openPrintModal}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <TicketInfoSidebar transaction={transaction} onUpdateTransaction={onUpdateTransaction} />

        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6 text-sm leading-relaxed text-gray-700 min-h-[360px]">
          <TicketWeightSummary transaction={transaction} />
        </div>
      </div>

      {showPrintModal && (
        <TicketDocketPreview
          transaction={transaction}
          docketConfig={docketConfig}
          jobs={jobs}
          transactions={transactions}
          isReprint={isReprint}
          printType={printType}
          onPrintTypeChange={setPrintType}
          onClose={() => setShowPrintModal(false)}
          onPrint={() => {
            if (printType === "docket") {
              handlePrintDocket(isReprint);
            } else {
              handlePrintInvoice(isReprint);
            }
            setShowPrintModal(false);
          }}
        />
      )}
    </div>
  );
}
