import React, { useState } from "react";
import {
  Scale,
  Clock,
  Eye,
  CheckCircle2,
  AlertOctagon,
  X,
  FileText,
  DollarSign,
  User,
  Truck,
  Building2,
  Calendar,
  Download,
  Check,
  AlertTriangle,
  ArrowLeft,
  Activity,
  History,
  TrendingDown,
  ShieldAlert,
  MapPin,
  ClipboardCheck,
  Building,
  Printer
} from "lucide-react";
import { Transaction, TransactionStatus, DocketConfig, Job } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { promptDialog } from "@/src/components/shared/dialog-service";
import { buildDeliveryDocketHtml, openDeliveryDocketPrint, resolveDocketConfig } from "@/src/lib/delivery-docket";
import { buildTaxInvoiceHtml, openTaxInvoicePrint } from "@/src/lib/tax-invoice";

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
  // Printing states
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isReprint, setIsReprint] = useState<boolean>(false);
  const [printType, setPrintType] = useState<"docket" | "invoice">("docket");

  const handlePrintInvoice = (reprintCopy: boolean) => {
    const actionLabel = reprintCopy ? "Invoice Reprinted" : "Invoice Printed";
    const detailLabel = reprintCopy
      ? "Printed duplicate/reprint commercial tax invoice copy for client reference."
      : "First official commercial tax invoice printed successfully.";

    const updated: Transaction = {
      ...transaction,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: actionLabel,
          user: "Admin User",
          details: detailLabel
        }
      ]
    };
    onUpdateTransaction(updated);

    const linkedJob = jobs.find((job) => job.id === transaction.jobOrder) ?? null;
    const printed = openTaxInvoicePrint(
      transaction,
      { linkedJob, transactions },
      docketConfig,
      { reprintCopy }
    );
    if (!printed) {
      toast.info("Popup blocker active! Please allow popups to open the official tax invoice.");
    }
  };

  const handlePrintDocket = (reprintCopy: boolean) => {
    // Log to transaction's audit history
    const actionLabel = reprintCopy ? "Docket Reprinted" : "Docket Printed";
    const detailLabel = reprintCopy
      ? "Printed duplicate/reprint docket copy for driver/carrier reference."
      : "First official weighbridge docket printed successfully.";

    const updated: Transaction = {
      ...transaction,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: actionLabel,
          user: "Admin User",
          details: detailLabel
        }
      ]
    };
    onUpdateTransaction(updated);

    const printed = openDeliveryDocketPrint(transaction, docketConfig, { reprintCopy });
    if (!printed) {
      toast.info("Popup blocker active! Please allow popups to open the official print docket.");
    }
  };

  // Operational states modifications
  const approveTx = () => {
    const updated: Transaction = {
      ...transaction,
      status: TransactionStatus.APPROVED,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: "Status Approved",
          user: "Admin User",
          details: "Approved for billing queue via enterprise action."
        }
      ]
    };
    onUpdateTransaction(updated);
    toast.success(`Weighbridge load ticket ${transaction.ticketNo} has been APPROVED.`);
  };

  const holdTx = async () => {
    const reason = await promptDialog("Enter the reason for flagging or locking this ticket on hold:");
    if (!reason) return;
    const updated: Transaction = {
      ...transaction,
      status: TransactionStatus.ON_HOLD,
      comments: transaction.comments ? `${transaction.comments}. Audit Hold: ${reason}` : reason,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: "Status Locked On-Hold",
          user: "Admin User",
          details: `Billing locked: ${reason}`
        }
      ]
    };
    onUpdateTransaction(updated);
    toast.success(`Weighbridge load ticket ${transaction.ticketNo} is now ON HOLD.`);
  };

  const invoiceTx = () => {
    const updated: Transaction = {
      ...transaction,
      status: TransactionStatus.INVOICED,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: "Status Marked Invoiced",
          user: "Admin User",
          details: "Invoice dispatched to client ledger successfully."
        }
      ]
    };
    onUpdateTransaction(updated);
    toast.success(`Weighbridge load ticket ${transaction.ticketNo} has been set to INVOICED.`);
  };

  const releaseHold = () => {
    const updated: Transaction = {
      ...transaction,
      status: TransactionStatus.PENDING,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: "Hold Released",
          user: "Admin User",
          details: "Cleared billing blockade. Returned ticket to Pending list."
        }
      ]
    };
    onUpdateTransaction(updated);
    toast.info(`Weighbridge load hold on ticket ${transaction.ticketNo} has been RELEASED.`);
  };

  const revertTx = async () => {
    const reason = await promptDialog("Add back-office adjustment reason for moving this entry back to Pending:");
    if (reason === null) return;
    const updated: Transaction = {
      ...transaction,
      status: TransactionStatus.PENDING,
      comments: transaction.comments ? `${transaction.comments}. Reverted: ${reason}` : `Reverted: ${reason}`,
      auditHistory: [
        ...transaction.auditHistory,
        {
          timestamp: new Date().toLocaleString(),
          action: "Reverted to Pending",
          user: "Admin User",
          details: `Reverted: ${reason}`
        }
      ]
    };
    onUpdateTransaction(updated);
    toast.info(`Weighbridge load ticket ${transaction.ticketNo} has been REVERTED to pending.`);
  };

  return (
    <div className="space-y-6">
      {/* Return Navigation */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-info transition bg-card border border-border rounded-md px-3.5 py-2 shadow-xs cursor-pointer inline-flex"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Return to List View</span>
      </button>

      {/* Hero Header Details Block */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border rounded-md px-6 py-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-muted border border-border text-info flex items-center justify-center font-bold text-lg shadow-inner">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Weigh Ticket Internal ID: {transaction.id}
              </span>
              <span
                className={`inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  transaction.status === TransactionStatus.APPROVED
                    ? "bg-success/10 text-success"
                    : transaction.status === TransactionStatus.PENDING
                    ? "bg-info/10 text-info"
                    : transaction.status === TransactionStatus.ON_HOLD
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-foreground"
                }`}
              >
                {transaction.status}
              </span>
              <span
                className={`inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  transaction.type === "Account"
                    ? "bg-muted text-foreground border border-border"
                    : "bg-warning/10 text-warning border border-warning/30"
                }`}
              >
                {transaction.type}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Ticket #{transaction.ticketNo}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded px-2.5 py-1 select-none">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Weigh Date: {transaction.firstWeighTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic header operation links depending on current ticket status */}
        <div className="flex flex-wrap gap-2 self-start md:self-center items-center">
          {/* Universal Print / Reprint Docket button */}
          <button
            onClick={() => {
              const printedBefore = transaction.auditHistory.some(
                (h) => h.action.toLowerCase().includes("print")
              );
              setIsReprint(printedBefore);
              setShowPrintModal(true);
            }}
            className="rounded-md border border-info/25 bg-info/10 hover:bg-info/10 text-xs font-bold text-info px-4 py-2 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>{transaction.auditHistory.some(h => h.action.toLowerCase().includes("print")) ? "Reprint Docket" : "Print Docket"}</span>
          </button>

          {transaction.status === TransactionStatus.PENDING && (
            <>
              <button
                onClick={holdTx}
                className="rounded-md border border-destructive/25 bg-card text-xs font-bold text-destructive px-4 py-2 hover:bg-muted transition cursor-pointer"
              >
                Hold Ticket
              </button>
              <button
                onClick={approveTx}
                className="rounded-md bg-primary text-xs font-bold text-white px-4 py-2 hover:bg-primary/90 transition cursor-pointer flex items-center gap-1.5"
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
                className="rounded-md border border-border bg-card text-xs font-bold text-foreground px-4 py-2 hover:bg-muted transition cursor-pointer"
              >
                Revert to Pending
              </button>
              <button
                onClick={invoiceTx}
                className="rounded-md bg-success text-xs font-bold text-white px-4 py-2 hover:bg-success/90 transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Invoiced
              </button>
            </>
          )}

          {transaction.status === TransactionStatus.ON_HOLD && (
            <button
              onClick={releaseHold}
              className="rounded-md bg-primary text-xs font-bold text-white px-4 py-2 hover:bg-primary/90 transition cursor-pointer"
            >
              Release Hold State
            </button>
          )}

          {transaction.status === TransactionStatus.INVOICED && (
            <div className="flex items-center gap-2">
              <span className="text-success bg-success/10 border border-success/25 rounded-md px-3 py-1.5 text-xs font-bold">
                Accounted & Closed
              </span>
              <button
                onClick={() => {
                  toast.info("Generating secure weight ticket PDF report...");
                }}
                className="flex items-center gap-1 rounded-md border border-border bg-card text-xs font-bold text-foreground px-3.5 py-2 hover:bg-muted transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left sidebar metadata, right expanded tabs */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column Profile info cards: 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
              Shipment Information
            </h3>

            <div className="space-y-4 text-sm text-foreground font-normal">
              {/* Client Debtor */}
              <div className="flex items-start gap-2.5">
                <Building className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Invoiced Customer</div>
                  <div className="font-bold text-foreground">{transaction.customerName}</div>
                  <div className="text-xs text-muted-foreground font-medium">Customer ID: {transaction.customerId}</div>
                </div>
              </div>

              {/* Carrier Transport */}
              <div className="flex items-start gap-2.5">
                <Truck className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Carrier Transport & plates</div>
                  <div className="font-semibold text-foreground">{transaction.carrierName}</div>
                  <div className="font-mono text-xs font-bold text-foreground bg-muted border border-border px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                    {transaction.vehicleReg}
                  </div>
                </div>
              </div>

              {/* Driver */}
              <div className="flex items-start gap-2.5">
                <User className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5">Assigned Operator / Driver</div>
                  <div className="font-bold text-foreground">{transaction.driverName}</div>
                  <div className="text-xs text-muted-foreground">Scale Operator: {transaction.operatorId}</div>
                </div>
              </div>

              {/* Station location */}
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-0.5 font-medium">Site Dispatch Station</div>
                  <div className="font-medium text-foreground">{transaction.siteName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Billing Type Card */}
          <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              <span>Billing / Transaction Type</span>
              <span
                className={`inline-flex items-center rounded-xs px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  transaction.type === "Account"
                    ? "bg-muted text-foreground border border-border"
                    : "bg-warning/10 text-warning border border-warning/30"
                }`}
              >
                {transaction.type}
              </span>
            </h3>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-normal">
                Choose the transaction class recorded for this load. This routes billing to client accounts or cash registers.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (transaction.type !== "Account") {
                      const updated: Transaction = {
                        ...transaction,
                        type: "Account",
                        auditHistory: [
                          ...transaction.auditHistory,
                          {
                            timestamp: new Date().toLocaleString(),
                            action: "Transaction Type Recorded",
                            user: "Admin User",
                            details: "Billing type updated and recorded as: Account"
                          }
                        ]
                      };
                      onUpdateTransaction(updated);
                    }
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-md border transition text-center cursor-pointer ${
                    transaction.type === "Account"
                      ? "bg-info/10 border-info/25 text-info font-bold shadow-inner"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Account
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (transaction.type !== "Cash") {
                      const updated: Transaction = {
                        ...transaction,
                        type: "Cash",
                        auditHistory: [
                          ...transaction.auditHistory,
                          {
                            timestamp: new Date().toLocaleString(),
                            action: "Transaction Type Recorded",
                            user: "Admin User",
                            details: "Billing type updated and recorded as: Cash"
                          }
                        ]
                      };
                      onUpdateTransaction(updated);
                    }
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-md border transition text-center cursor-pointer ${
                    transaction.type === "Cash"
                      ? "bg-warning/10 border-warning/30 text-warning font-bold shadow-inner"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Cash
                </button>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border rounded-md p-4 text-xs space-y-2">
            <span className="font-bold text-foreground block uppercase tracking-wider text-xs">
              Weighbridge Diagnostics
            </span>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inbound Scales:</span>
                <span className="text-foreground font-mono font-bold">{transaction.scaleIdInbound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outbound Scales:</span>
                <span className="text-foreground font-mono font-bold">{transaction.scaleIdOutbound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legal-For-Trade Certification:</span>
                <span className="text-success font-bold">Approved Calibrated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Core Analysis: 8 cols */}
        <div className="lg:col-span-8 bg-card border border-border rounded-md shadow-xs overflow-hidden">
          {/* Overview Content */}
          <div className="p-6 space-y-6 text-sm leading-relaxed text-foreground min-h-[360px]">
            <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Bulk Materials & Loaded weight readings
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Calculated mass measurements registered by legal-for-trade load cells during inbound and outbound operations.
                  </p>
                </div>

                {/* Subtraction layout diagram */}
                <div className="rounded-md border border-info/25 bg-info/10 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 opacity-10">
                    <Scale className="h-28 w-28 text-info" />
                  </div>
                  <h4 className="text-xs font-bold text-info uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5" />
                    Weighbridge Scale Readings (In & Out)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center">
                    <div className="rounded-md bg-card p-3 border border-border">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Gross Weight (Weigh-In)</div>
                      <div className="text-lg font-bold font-mono text-foreground mt-1">
                        {transaction.grossWeight.toFixed(2)} t
                      </div>
                      <span className="text-xs text-muted-foreground block truncate" title={transaction.scaleIdInbound}>
                        {transaction.scaleIdInbound}
                      </span>
                    </div>

                    <div className="flex items-center justify-center text-xs font-bold text-muted-foreground">
                      ― minus tare weight ―
                    </div>

                    <div className="rounded-md bg-card p-3 border border-border">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Tare Weight (Weigh-Out)</div>
                      <div className="text-lg font-bold font-mono text-foreground mt-1">
                        {transaction.tareWeight.toFixed(2)} t
                      </div>
                      <span className="text-xs text-muted-foreground block truncate" title={transaction.scaleIdOutbound}>
                        {transaction.scaleIdOutbound}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-info/25 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground">Loaded Cargo Item:</span>
                      <span className="text-sm font-bold text-foreground block mt-0.5">{transaction.productName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-muted-foreground block mb-0.5">Total Net Cargo:</span>
                      <span className="text-xl font-bold font-mono text-info bg-info/10 border border-info/25 px-3.5 py-1 rounded-md inline-block">
                        {transaction.netWeight.toFixed(2)} Tonnes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logistics timelines */}
                <div className="grid gap-4 sm:grid-cols-2 border-b border-border pb-5">
                  <div className="p-3 bg-muted border border-border rounded-md">
                    <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Inbound entry time
                    </div>
                    <div className="text-xs font-semibold text-foreground font-mono mt-1">
                      {transaction.firstWeighTime}
                    </div>
                  </div>
                  <div className="p-3 bg-muted border border-border rounded-md">
                    <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Outbound resolution time
                    </div>
                    <div className="text-xs font-semibold text-foreground font-mono mt-1">
                      {transaction.secondWeighTime}
                    </div>
                  </div>
                </div>

                {/* Operator comments */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Weighbridge scale comments
                  </h4>
                  <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs font-medium italic text-warning">
                    &ldquo;{transaction.comments || "No comments registered during transaction lifecycle."}&rdquo;
                  </div>
                </div>
              </div>

          </div>
        </div>
      </div>

      {/* Print Preview Modal Overlay */}
      {showPrintModal && (() => {
        const config = resolveDocketConfig(docketConfig);
        const linkedJob = jobs.find((job) => job.id === transaction.jobOrder) ?? null;
        const docketPreviewHtml = buildDeliveryDocketHtml(transaction, config, {
          reprintCopy: isReprint,
          autoPrint: false,
        });
        const invoicePreviewHtml = buildTaxInvoiceHtml(
          transaction,
          config,
          { linkedJob, transactions },
          { reprintCopy: isReprint, autoPrint: false }
        );
        const previewHtml = printType === "docket" ? docketPreviewHtml : invoicePreviewHtml;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-6 md:p-8 overflow-hidden">
            <div className="relative flex h-[min(920px,90vh)] w-full max-w-[min(760px,90vw)] flex-col rounded-md bg-primary p-6 shadow-lg animate-zoom-in">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20 focus:outline-none cursor-pointer transition"
                aria-label="Close print preview"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 border-b border-white/15 pb-4 pr-10 md:flex-row md:items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Printer className="h-4 w-4 text-info" />
                    <span>Official Weighbridge Document Spooler</span>
                  </h3>
                  <p className="text-xs text-white/65 mt-1">
                    Select a document layout type to preview and print.
                  </p>
                </div>
                
                {/* Print Type Switcher */}
                <div className="flex max-w-fit rounded-md border border-white/20 bg-white/5 p-1">
                  <button
                    onClick={() => setPrintType("docket")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      printType === "docket"
                        ? "bg-white text-primary shadow-xs"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Delivery Docket
                  </button>
                  <button
                    onClick={() => setPrintType("invoice")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      printType === "invoice"
                        ? "bg-white text-primary shadow-xs"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Tax Invoice
                  </button>
                </div>
              </div>

              {/* Paper Ticket Representation */}
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-md border border-border bg-white">
                <iframe
                  title={printType === "docket" ? "Delivery docket preview" : "Tax invoice preview"}
                  srcDoc={previewHtml}
                  className="w-full border-0 block"
                  style={{ height: "calc(29.7cm + 12px)", minHeight: "100%" }}
                />
              </div>

              {/* Modal Controls */}
              <div className="mt-5 flex shrink-0 items-center justify-end gap-3 border-t border-white/15 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-md border border-white/25 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer transition"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (printType === "docket") {
                      handlePrintDocket(isReprint);
                    } else {
                      handlePrintInvoice(isReprint);
                    }
                    setShowPrintModal(false);
                  }}
                  className="px-5 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Issue System Print Spooler</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
