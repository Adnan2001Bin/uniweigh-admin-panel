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
import { openDeliveryDocketPrint } from "@/src/lib/delivery-docket";

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

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.info("Popup blocker active! Please allow popups to open the official tax invoice.");
      return;
    }

    const config: DocketConfig = docketConfig || {
      businessName: "BLACK OAK ENTERPRISES PTY LTD",
      poBox: "P.O. BOX 1184, MELBOURNE VIC 3001",
      contact: "Ph: 1300 551 229 / Mob: 0409 112 344",
      fax: "Fax: (03) 9876 5432",
      email: "accounts@blackoak.com.au",
      abn: "99 123 456 789",
      eftAccountName: "BLACK OAK QUARRIES PTY LTD",
      eftBsb: "033-000",
      eftAccountNo: "1234-5678",
      logoColor: "#2563eb",
      themeColor: "#2563eb",
      showLogo: true,
      weighbridgeLocation: "MELBOURNE EASTERN DEPT",
      invoiceTitle: "Tax Invoice",
      cashInvoiceNotes: "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.",
      accountInvoiceNotes: "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document."
    };

    const linkedJob = jobs.find(j => j.id === transaction.jobOrder);
    let contractHtml = "";
    if (transaction.type === "Account" && linkedJob) {
      const totalDeliveredForJob = transactions
        .filter(tx => tx.jobOrder === linkedJob.id && (tx.status === "Approved" || tx.status === "Invoiced" || tx.status === "Committed" || tx.id === transaction.id))
        .reduce((sum, tx) => sum + tx.netWeight, 0);
      const orderQty = linkedJob.orderQty || 10000;
      const remainingQty = Math.max(0, orderQty - totalDeliveredForJob);
      const deliveredPercent = Math.min(100, Number(((totalDeliveredForJob / orderQty) * 100).toFixed(1)));

      contractHtml = `
        <div style="margin: 15px 0; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #f8fafc;">
          <div style="font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>Account Contract Verification (PO Progress)</span>
            <span style="color: #2563eb;">PO: ${linkedJob.customerOrderRef || "PO-" + linkedJob.id}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 10px; margin-bottom: 8px; font-family: monospace;">
            <div>Contract Ordered: <strong>${orderQty.toLocaleString()} t</strong></div>
            <div>Delivered to Date: <strong>${totalDeliveredForJob.toFixed(2)} t</strong></div>
            <div>Remaining PO Balance: <strong style="color: #b45309;">${remainingQty.toFixed(2)} t</strong></div>
          </div>
          <div style="height: 6px; width: 100%; border-radius: 9999px; overflow: hidden; display: flex; background: #e2e8f0;">
            <div style="width: ${deliveredPercent}%; background: #2563eb; height: 100%;"></div>
          </div>
          <div style="font-size: 8px; color: #64748b; margin-top: 4px; text-align: right; font-weight: bold;">
            ${deliveredPercent}% of Contract PO Quantity delivered. Balance remaining: ${remainingQty.toFixed(2)} tonnes.
          </div>
        </div>
      `;
    }

    const unitPrice = transaction.basePrice || 24.50;
    const netWeight = transaction.netWeight;
    const totalExGst = netWeight * unitPrice;
    const gstValue = totalExGst * 0.10;
    const totalIncGst = totalExGst + gstValue;

    const invoiceTitleText = config.invoiceTitle || "Tax Invoice";
    const paymentNotes = transaction.type === "Account" 
      ? (config.accountInvoiceNotes || "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document.")
      : (config.cashInvoiceNotes || "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.");

    const watermarkHtml = transaction.type === "Account"
      ? `<div style="position: absolute; top: 40%; left: 10%; right: 10%; transform: rotate(-15deg); font-size: 50px; font-weight: 900; color: rgba(148, 163, 184, 0.08); border: 8px solid rgba(148, 163, 184, 0.08); padding: 12px; border-radius: 16px; text-align: center; pointer-events: none; text-transform: uppercase;">CHARGED TO ACCOUNT</div>`
      : `<div style="position: absolute; top: 40%; left: 10%; right: 10%; transform: rotate(-15deg); font-size: 55px; font-weight: 900; color: rgba(16, 185, 129, 0.08); border: 8px solid rgba(16, 185, 129, 0.08); padding: 12px; border-radius: 16px; text-align: center; pointer-events: none; text-transform: uppercase;">PAID / RECEIVED</div>`;

    const logoHtml = config.showLogo ? (
      config.logoUrl ? `<img src="${config.logoUrl}" style="max-height: 55px; max-width: 100px; object-fit: contain;" />` : `
      <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5L90 35L75 90L25 90L10 35L50 5Z" fill="${config.logoColor}" opacity="0.15" />
        <path d="M50 15L80 40H20L50 15Z" fill="${config.logoColor}" />
        <path d="M45 40H55V85H45V40Z" fill="${config.logoColor}" />
        <path d="M30 55L50 45L70 55L50 65L30 55Z" fill="#fff" opacity="0.9" />
        <path d="M50 5L95 38L78 92H22L5 38L50 5ZM50 10L10 40L25 87H75L90 40L50 10Z" fill="${config.logoColor}" />
      </svg>
      `
    ) : "";

    const htmlContent = `
      <html>
        <head>
          <title>Tax Invoice - ${transaction.ticketNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;600;700;900&display=swap');
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              background: #fff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              width: 21cm;
              min-height: 29.7cm;
              padding: 1.5cm;
              margin: 0 auto;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #fff;
              position: relative;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 15px;
            }
            .logo-cell {
              width: 65px;
              vertical-align: top;
              padding-bottom: 15px;
            }
            .brand-cell {
              vertical-align: top;
              padding-left: 15px;
              padding-bottom: 15px;
            }
            .brand-name {
              font-size: 15px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .brand-subtitle {
              font-size: 8px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 2px;
            }
            .contact-cell {
              text-align: right;
              vertical-align: top;
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
              padding-bottom: 15px;
            }
            .contact-name {
              font-weight: 800;
              color: #0f172a;
              font-size: 10px;
            }
            .docket-title-container {
              text-align: center;
              margin: 15px 0;
              border-top: 2px solid #0f172a;
              border-bottom: 2px solid #0f172a;
              padding: 6px 0;
              position: relative;
            }
            .docket-title {
              font-size: 14px;
              font-weight: 900;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #0f172a;
              margin: 0;
            }
            .reprint-badge {
              display: inline-block;
              background: #0f172a;
              color: #fff;
              font-size: 8px;
              font-weight: 900;
              padding: 2px 10px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 4px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .details-table td {
              padding: 6px 8px;
              font-size: 11px;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: top;
            }
            .label-col {
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              font-size: 9px;
              width: 25%;
            }
            .val-col {
              font-weight: 800;
              color: #0f172a;
              width: 25%;
            }
            .pricing-section {
              margin-top: 15px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px;
              background-color: #f8fafc;
            }
            .pricing-table {
              width: 100%;
              border-collapse: collapse;
            }
            .pricing-table td {
              padding: 4px 0;
              font-size: 11px;
            }
            .pricing-total {
              border-top: 2px solid #cbd5e1;
              font-weight: bold;
            }
            .pricing-total td {
              padding-top: 8px;
              font-size: 12px;
            }
            .eft-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 10px;
              background: #f8fafc;
              margin-top: 15px;
              font-size: 9px;
            }
            .eft-title {
              font-weight: 900;
              color: #475569;
              font-size: 8px;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            .barcode-box {
              text-align: center;
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              letter-spacing: 5px;
              color: #94a3b8;
              margin: 15px 0;
            }
            .footer-section {
              font-size: 9px;
              color: #64748b;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
            }
            .signatures-table {
              width: 100%;
              margin-top: 35px;
              margin-bottom: 15px;
            }
            .signatures-table td {
              width: 50%;
              vertical-align: bottom;
              font-size: 9px;
              color: #475569;
              text-align: center;
            }
            .signature-line {
              width: 75%;
              margin: 0 auto 4px auto;
              border-top: 1px solid #475569;
            }
            @media print {
              body {
                background: none;
              }
              .page {
                width: 21cm;
                height: 29.7cm;
                padding: 1.5cm;
                margin: 0;
                box-shadow: none;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${watermarkHtml}
            <div>
              <table class="header-table">
                <tr>
                  <td class="logo-cell">${logoHtml}</td>
                  <td class="brand-cell">
                    <h1 class="brand-name">${config.eftAccountName}</h1>
                    <div class="brand-subtitle">Commercial Tax Invoice Record</div>
                  </td>
                  <td class="contact-cell">
                    <div class="contact-name">${config.businessName}</div>
                    <div>${config.poBox}</div>
                    <div>CONTACT: ${config.contact}</div>
                    <div>FAX: ${config.fax}</div>
                    <div>EMAIL: ${config.email}</div>
                    <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">ABN: ${config.abn}</div>
                  </td>
                </tr>
              </table>

              <div class="docket-title-container">
                <h2 class="docket-title">${invoiceTitleText}</h2>
                ${reprintCopy ? '<div class="reprint-badge">DUPLICATE TAX INVOICE COPY</div>' : ""}
              </div>

              <table class="details-table">
                <tr>
                  <td class="label-col">DATE & TIME IN:</td>
                  <td class="val-col">${transaction.firstWeighTime}</td>
                  <td class="label-col">DATE & TIME OUT:</td>
                  <td class="val-col">${transaction.secondWeighTime || "COMPLETED"}</td>
                </tr>
                <tr>
                  <td class="label-col">CUSTOMER / DEBTOR:</td>
                  <td class="val-col" style="font-size: 11px; font-weight: 900;">${transaction.customerName}</td>
                  <td class="label-col">WEIGHBRIDGE SITE:</td>
                  <td class="val-col">${config.weighbridgeLocation}</td>
                </tr>
                <tr>
                  <td class="label-col">CARRIER / TRANSPORT:</td>
                  <td class="val-col">${transaction.carrierName}</td>
                  <td class="label-col">VEHICLE REG NO:</td>
                  <td class="val-col" style="font-family: 'JetBrains Mono', monospace; font-weight: 900;">${transaction.vehicleReg}</td>
                </tr>
                <tr>
                  <td class="label-col">DRIVER NAME:</td>
                  <td class="val-col">${transaction.driverName}</td>
                  <td class="label-col">INVOICE NO:</td>
                  <td class="val-col" style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 900; color: #1e293b;">INV-${transaction.ticketNo.replace("WB-", "")}</td>
                </tr>
                <tr>
                  <td class="label-col">MATERIAL PRODUCT:</td>
                  <td class="val-col" style="font-weight: 900; color: #1e293b;">${transaction.productName}</td>
                  <td class="label-col">LOT NUMBER:</td>
                  <td class="val-col" style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${transaction.lotNo || "N/A"}</td>
                </tr>
              </table>

              ${contractHtml}

              <div style="margin-top: 15px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-weight: 800; color: #475569; text-transform: uppercase;">
                      <th style="padding: 6px; text-align: left;">Item Description</th>
                      <th style="padding: 6px; text-align: center;">Net Weight (t)</th>
                      <th style="padding: 6px; text-align: right;">Unit Rate ($/t)</th>
                      <th style="padding: 6px; text-align: right;">Total (Ex. GST)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 8px; font-weight: 700;">${transaction.productName}</td>
                      <td style="padding: 8px; text-align: center; font-family: monospace;">${netWeight.toFixed(2)} t</td>
                      <td style="padding: 8px; text-align: right; font-family: monospace;">$${unitPrice.toFixed(2)}</td>
                      <td style="padding: 8px; text-align: right; font-family: monospace; font-weight: 700;">$${totalExGst.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="pricing-section">
                <table class="pricing-table">
                  <tr>
                    <td style="font-weight: 700; color: #475569;">BILLING METHOD / ACCOUNT TYPE:</td>
                    <td style="text-align: right; font-weight: 800; color: #0f172a; text-transform: uppercase;">${transaction.type} Basis</td>
                  </tr>
                  <tr>
                    <td style="color: #475569;">Gross Goods Value (Ex. GST):</td>
                    <td style="text-align: right; font-family: 'JetBrains Mono', monospace;">$${totalExGst.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="color: #475569;">10% GST Taxes:</td>
                    <td style="text-align: right; font-family: 'JetBrains Mono', monospace;">$${gstValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="pricing-total">
                    <td style="font-weight: 900; color: #0f172a;">TOTAL AMOUNT DUE (INC. GST):</td>
                    <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; color: #2563eb;">$${totalIncGst.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 15px; padding: 10px; border-left: 3px solid #64748b; background-color: #f8fafc; font-size: 9px; color: #475569; border-radius: 0 4px 4px 0; line-height: 1.4;">
                <div style="font-weight: 800; text-transform: uppercase; color: #1e293b; margin-bottom: 2px;">Billing Terms & Instructions</div>
                ${paymentNotes}
              </div>
            </div>

            <div>
              <div class="eft-box">
                <div class="eft-title">EFT PAYMENTS BANK DIRECT DEPOSIT</div>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="font-weight: 700; width: 33%;">Account Name: <span style="font-weight: 500;">${config.eftAccountName}</span></td>
                    <td style="font-weight: 700; width: 33%;">BSB: <span style="font-weight: 500; font-family: 'JetBrains Mono', monospace;">${config.eftBsb}</span></td>
                    <td style="font-weight: 700; width: 33%;">Account No: <span style="font-weight: 500; font-family: 'JetBrains Mono', monospace;">${config.eftAccountNo}</span></td>
                  </tr>
                </table>
              </div>

              <div class="barcode-box">
                ||||| | ||||| | || | ||| |||| | ||||| | |||
                <div style="font-size: 7px; color: #94a3b8; margin-top: 2px;">TXN AUTH CODE: ${transaction.transactionCode || transaction.id}</div>
              </div>

              <table class="signatures-table">
                <tr>
                  <td>
                    <div class="signature-line"></div>
                    <div>Authorized Audit Officer Signature</div>
                  </td>
                  <td>
                    <div class="signature-line"></div>
                    <div>Debtor Acceptance / Recipient Signature</div>
                  </td>
                </tr>
              </table>

              <div class="footer-section">
                Thank you for your business. Certified Weighbridge Load Record under National Measurement Guidelines.<br/>
                Please ensure your load is properly secured and correct before exiting the depot gates.
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
        const config: DocketConfig = docketConfig || {
          businessName: "BLACK OAK ENTERPRISES PTY LTD",
          poBox: "P.O. BOX 1184, MELBOURNE VIC 3001",
          contact: "Ph: 1300 551 229 / Mob: 0409 112 344",
          fax: "Fax: (03) 9876 5432",
          email: "accounts@blackoak.com.au",
          abn: "99 123 456 789",
          eftAccountName: "BLACK OAK QUARRIES PTY LTD",
          eftBsb: "033-000",
          eftAccountNo: "1234-5678",
          logoColor: "#2563eb",
          themeColor: "#2563eb",
          showLogo: true,
          weighbridgeLocation: "MELBOURNE EASTERN DEPT",
          invoiceTitle: "Tax Invoice",
          cashInvoiceNotes: "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.",
          accountInvoiceNotes: "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document."
        };

        const linkedJob = jobs.find(j => j.id === transaction.jobOrder);
        const totalDeliveredForJob = linkedJob ? transactions
          .filter(tx => tx.jobOrder === linkedJob.id && (tx.status === "Approved" || tx.status === "Invoiced" || tx.status === "Committed" || tx.id === transaction.id))
          .reduce((sum, tx) => sum + tx.netWeight, 0) : 0;
        const orderQty = linkedJob?.orderQty || 10000;
        const remainingQty = Math.max(0, orderQty - totalDeliveredForJob);
        const deliveredPercent = Math.min(100, Number(((totalDeliveredForJob / orderQty) * 100).toFixed(1)));

        const unitPrice = transaction.basePrice || 24.50;
        const netWeight = transaction.netWeight;
        const totalExGst = netWeight * unitPrice;
        const gstValue = totalExGst * 0.10;
        const totalIncGst = totalExGst + gstValue;

        const paymentNotes = transaction.type === "Account" 
          ? (config.accountInvoiceNotes || "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document.")
          : (config.cashInvoiceNotes || "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.");

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-primary rounded-md shadow-lg p-6 relative animate-zoom-in my-8">
              {/* Modal Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-primary pb-4 mb-4 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Printer className="h-4 w-4 text-info" />
                    <span>Official Weighbridge Document Spooler</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a document layout type to preview and print.
                  </p>
                </div>
                
                {/* Print Type Switcher */}
                <div className="flex bg-primary p-1 rounded-md border border-input max-w-fit">
                  <button
                    onClick={() => setPrintType("docket")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      printType === "docket"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Delivery Docket
                  </button>
                  <button
                    onClick={() => setPrintType("invoice")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                      printType === "invoice"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Tax Invoice
                  </button>
                </div>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-primary/90 hover:text-white transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Paper Ticket Representation */}
              <div className="bg-card text-foreground p-6 sm:p-8 rounded-md shadow-inner border border-border font-sans max-h-[55vh] overflow-y-auto relative">
                
                {/* Watermarks */}
                {printType === "invoice" && (
                  transaction.type === "Account" ? (
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] font-bold text-4xl text-muted-foreground border-4 border-dashed border-input p-4 rounded-md text-center pointer-events-none select-none uppercase tracking-widest">
                      Charged to Account
                    </div>
                  ) : (
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] font-bold text-5xl text-success border-4 border-dashed border-success p-4 rounded-md text-center pointer-events-none select-none uppercase tracking-widest">
                      Paid / Received
                    </div>
                  )
                )}

                {/* Company Header */}
                <div className="flex justify-between items-start border-b border-border pb-4 mb-4 text-xs leading-relaxed">
                  <div className="flex gap-3">
                    {config.showLogo && (
                      <div className="flex-shrink-0">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} alt="Logo" className="max-h-12 max-w-[80px] object-contain" />
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="text-info">
                            <path d="M50 5L90 35L75 90L25 90L10 35L50 5Z" fill="currentColor" opacity="0.15" />
                            <path d="M50 15L80 40H20L50 15Z" fill="currentColor" />
                            <path d="M45 40H55V85H45V40Z" fill="currentColor" />
                            <path d="M50 5L95 38L78 92H22L5 38L50 5ZM50 10L10 40L25 87H75L90 40L50 10Z" fill="currentColor" />
                          </svg>
                        )}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{config.eftAccountName}</h4>
                      <p className="text-xs text-muted-foreground font-medium">Certified Weighbridge Material Record</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{config.businessName}</p>
                    <p className="text-muted-foreground text-xs">{config.poBox}</p>
                    <p className="text-muted-foreground text-xs">CONTACT: {config.contact}</p>
                    <p className="text-muted-foreground text-xs">ABN: {config.abn}</p>
                  </div>
                </div>

                <div className="text-center border-y-2 border-foreground py-2 mb-4">
                  <h2 className="text-sm font-bold tracking-widest text-foreground uppercase">
                    {printType === "docket" ? "Delivery Docket" : (config.invoiceTitle || "Tax Invoice")}
                  </h2>
                  {isReprint && (
                    <div className="inline-block bg-primary text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded mt-1.5 select-none">
                      REPRINT / DUPLICATE COPY
                    </div>
                  )}
                  <div className="text-xs font-mono font-bold mt-1 text-foreground">
                    {printType === "docket" ? `DOCKET #${transaction.ticketNo}` : `INVOICE #INV-${transaction.ticketNo.replace("WB-", "")}`}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs border-b border-border pb-4 mb-4">
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Date & Weigh In</span>
                    <span className="font-semibold text-foreground">{transaction.firstWeighTime}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Date & Weigh Out</span>
                    <span className="font-semibold text-foreground">{transaction.secondWeighTime || "Completed"}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer / Debtor</span>
                    <span className="font-bold text-foreground text-xs">{transaction.customerName}</span>
                    <span className="text-xs text-muted-foreground block">Account Code: {transaction.customerId}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Weighbridge Location</span>
                    <span className="font-semibold text-foreground">{config.weighbridgeLocation}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Rego</span>
                    <span className="font-mono font-bold text-foreground">{transaction.vehicleReg}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Material Product</span>
                    <span className="font-bold text-foreground">{transaction.productName}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Lot Number</span>
                    <span className="font-mono font-semibold text-foreground">{transaction.lotNo || "N/A"}</span>
                  </div>
                </div>

                {/* ACCOUNT PO CONTRACT VERIFICATION IF APPLICABLE */}
                {printType === "invoice" && transaction.type === "Account" && linkedJob && (
                  <div className="border border-border bg-muted rounded-md p-3 mb-4 text-xs">
                    <div className="flex justify-between font-bold text-foreground uppercase text-xs tracking-wider mb-1.5">
                      <span>Account Contract PO Fulfillment Verification</span>
                      <span className="text-info font-mono">PO: {linkedJob.customerOrderRef || "PO-" + linkedJob.id}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono mb-2 text-foreground">
                      <div>Ordered: <span className="font-bold">{orderQty.toLocaleString()} t</span></div>
                      <div>Delivered: <span className="font-bold text-foreground">{totalDeliveredForJob.toFixed(2)} t</span></div>
                      <div>Remaining Balance: <span className="font-bold text-warning">{remainingQty.toFixed(2)} t</span></div>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-1">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${deliveredPercent}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right font-medium">
                      {deliveredPercent}% of Contract PO quantity fulfilled. {remainingQty.toFixed(2)} t balance remains.
                    </p>
                  </div>
                )}

                {/* Specific Layout Output: DOCKET vs INVOICE */}
                {printType === "docket" ? (
                  <>
                    {/* Weights Table for Docket */}
                    <div className="bg-muted border border-border rounded-md p-3 mb-4 font-mono text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground uppercase">Gross Weight:</span>
                        <span className="font-bold text-foreground">{transaction.grossWeight.toFixed(2)} t</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground uppercase">Tare Weight:</span>
                        <span className="font-bold text-foreground">{transaction.tareWeight.toFixed(2)} t</span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5">
                        <span className="font-bold text-foreground uppercase">NET WEIGHT:</span>
                        <span className="font-bold text-info text-xs">{transaction.netWeight.toFixed(2)} tonnes</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Pricing Table for Invoice */}
                    <div className="border border-border rounded-md overflow-hidden mb-4">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted border-b border-border font-bold text-muted-foreground">
                            <th className="p-2">Description</th>
                            <th className="p-2 text-center">Net Qty (t)</th>
                            <th className="p-2 text-right">Rate ($/t)</th>
                            <th className="p-2 text-right">Total (Ex. GST)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border">
                            <td className="p-2 font-semibold text-foreground">{transaction.productName}</td>
                            <td className="p-2 text-center font-mono">{netWeight.toFixed(2)}</td>
                            <td className="p-2 text-right font-mono">${unitPrice.toFixed(2)}</td>
                            <td className="p-2 text-right font-mono">${totalExGst.toFixed(2)}</td>
                          </tr>
                          <tr className="text-muted-foreground text-xs">
                            <td colSpan={3} className="p-2 text-right">Gross Total:</td>
                            <td className="p-2 text-right font-mono">${totalExGst.toFixed(2)}</td>
                          </tr>
                          <tr className="text-muted-foreground text-xs">
                            <td colSpan={3} className="p-2 text-right">GST (10%):</td>
                            <td className="p-2 text-right font-mono">${gstValue.toFixed(2)}</td>
                          </tr>
                          <tr className="bg-info/10 font-bold text-foreground">
                            <td colSpan={3} className="p-2 text-right uppercase">Amount Due (Inc. GST):</td>
                            <td className="p-2 text-right font-mono text-info">${totalIncGst.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Custom Notes Section */}
                {printType === "invoice" && (
                  <div className="p-3 bg-muted border-l-2 border-input rounded-r-lg text-xs text-muted-foreground mb-4 leading-normal">
                    <span className="block font-bold uppercase text-xs tracking-wider text-foreground mb-0.5">Billing terms & Payment Advice</span>
                    {paymentNotes}
                  </div>
                )}

                {/* EFT banking details box */}
                {printType === "invoice" && (
                  <div className="border border-border rounded-md p-2.5 bg-muted text-xs mb-4">
                    <span className="block font-bold text-xs text-muted-foreground uppercase tracking-wider mb-1">EFT Direct Deposit Info</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-foreground">
                      <div>Name: <span className="font-semibold">{config.eftAccountName}</span></div>
                      <div>BSB: <span className="font-semibold">{config.eftBsb}</span></div>
                      <div>Account: <span className="font-semibold">{config.eftAccountNo}</span></div>
                    </div>
                  </div>
                )}

                {/* Barcode & Signatures footer */}
                <div className="text-center font-mono text-xs tracking-[5px] text-muted-foreground my-4 select-none">
                  ||||| | ||||| | || | ||| |||| | ||||| | |||
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6 pt-2 border-t border-border text-xs text-muted-foreground font-semibold">
                  <div className="text-center">
                    <div className="border-b border-input w-32 mx-auto mb-1 h-4"></div>
                    Operator Signature (ID: {transaction.operatorId})
                  </div>
                  <div className="text-center">
                    <div className="border-b border-input w-32 mx-auto mb-1 h-4"></div>
                    Driver / Receiver Signature
                  </div>
                </div>
              </div>

              {/* Modal Controls */}
              <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-primary">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-md border border-input hover:bg-primary/90 text-xs font-semibold text-muted-foreground hover:text-white cursor-pointer transition"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    if (printType === "docket") {
                      handlePrintDocket(isReprint);
                    } else {
                      handlePrintInvoice(isReprint);
                    }
                    setShowPrintModal(false);
                  }}
                  className="px-5 py-2 rounded-md bg-primary hover:bg-primary/90 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer"
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
