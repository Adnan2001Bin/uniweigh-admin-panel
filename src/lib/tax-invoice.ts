import { DocketConfig, Job, Transaction } from "../types";
import { MODAL_PREVIEW_CSS, previewBodyClass } from "./print-preview";
import { resolveDocketConfig } from "./delivery-docket";

export interface TaxInvoiceContext {
  linkedJob?: Job | null;
  transactions: Transaction[];
}

export interface TaxInvoicePrintOptions {
  reprintCopy?: boolean;
  autoPrint?: boolean;
}

function buildLogoMarkup(config: DocketConfig): string {
  if (!config.showLogo) return "";
  const raw = (config.logoUrl || "/pdf-icon.png").trim();
  const src =
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
    /^https?:\/\//i.test(raw)
      ? raw
      : typeof window !== "undefined"
        ? new URL(raw, window.location.origin).href
        : raw;
  return `<img src="${src}" alt="Logo" style="max-height: 55px; max-width: 100px; object-fit: contain;" />`;
}

function buildContractHtml(
  transaction: Transaction,
  linkedJob: Job | null | undefined,
  allTransactions: Transaction[],
  accentColor: string
): string {
  if (transaction.type !== "Account" || !linkedJob) return "";

  const totalDeliveredForJob = allTransactions
    .filter(
      (tx) =>
        tx.jobOrder === linkedJob.id &&
        (tx.status === "Approved" ||
          tx.status === "Invoiced" ||
          tx.status === "Committed" ||
          tx.id === transaction.id)
    )
    .reduce((sum, tx) => sum + tx.netWeight, 0);
  const orderQty = linkedJob.orderQty || 10000;
  const remainingQty = Math.max(0, orderQty - totalDeliveredForJob);
  const deliveredPercent = Math.min(100, Number(((totalDeliveredForJob / orderQty) * 100).toFixed(1)));

  return `
    <div style="margin: 15px 0; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #f8fafc;">
      <div style="font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between;">
        <span>Account Contract Verification (PO Progress)</span>
        <span style="color: ${accentColor};">PO: ${linkedJob.customerOrderRef || "PO-" + linkedJob.id}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 10px; margin-bottom: 8px; font-family: monospace;">
        <div>Contract Ordered: <strong>${orderQty.toLocaleString()} t</strong></div>
        <div>Delivered to Date: <strong>${totalDeliveredForJob.toFixed(2)} t</strong></div>
        <div>Remaining PO Balance: <strong style="color: #b45309;">${remainingQty.toFixed(2)} t</strong></div>
      </div>
      <div style="height: 6px; width: 100%; border-radius: 9999px; overflow: hidden; display: flex; background: #e2e8f0;">
        <div style="width: ${deliveredPercent}%; background: ${accentColor}; height: 100%;"></div>
      </div>
      <div style="font-size: 8px; color: #64748b; margin-top: 4px; text-align: right; font-weight: bold;">
        ${deliveredPercent}% of Contract PO Quantity delivered. Balance remaining: ${remainingQty.toFixed(2)} tonnes.
      </div>
    </div>
  `;
}

export function buildTaxInvoiceHtml(
  transaction: Transaction,
  config: DocketConfig,
  context: TaxInvoiceContext,
  options: TaxInvoicePrintOptions = {}
): string {
  const { reprintCopy = false, autoPrint = true } = options;
  const linkedJob = context.linkedJob;
  const accentColor = config.logoColor || "#2563eb";
  const weighbridgeSite = config.weighbridgeLocation || transaction.siteName;
  const unitPrice = transaction.basePrice || 24.5;
  const netWeight = transaction.netWeight;
  const totalExGst = netWeight * unitPrice;
  const gstValue = totalExGst * 0.1;
  const totalIncGst = totalExGst + gstValue;
  const invoiceTitleText = config.invoiceTitle || "Tax Invoice";
  const paymentNotes =
    transaction.type === "Account"
      ? config.accountInvoiceNotes ||
        "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document."
      : config.cashInvoiceNotes ||
        "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.";
  const watermarkHtml =
    transaction.type === "Account"
      ? `<div style="position: absolute; top: 40%; left: 10%; right: 10%; transform: rotate(-15deg); font-size: 50px; font-weight: 900; color: rgba(148, 163, 184, 0.08); border: 8px solid rgba(148, 163, 184, 0.08); padding: 12px; border-radius: 16px; text-align: center; pointer-events: none; text-transform: uppercase;">CHARGED TO ACCOUNT</div>`
      : `<div style="position: absolute; top: 40%; left: 10%; right: 10%; transform: rotate(-15deg); font-size: 55px; font-weight: 900; color: rgba(16, 185, 129, 0.08); border: 8px solid rgba(16, 185, 129, 0.08); padding: 12px; border-radius: 16px; text-align: center; pointer-events: none; text-transform: uppercase;">PAID / RECEIVED</div>`;
  const logoHtml = buildLogoMarkup(config);
  const contractHtml = buildContractHtml(transaction, linkedJob, context.transactions, accentColor);

  return `
    <html>
      <head>
        <title>Tax Invoice - ${transaction.ticketNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;600;700;900&display=swap');
          ${autoPrint ? "" : MODAL_PREVIEW_CSS}
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
              transform: none !important;
            }
          }
        </style>
      </head>
      <body class="${previewBodyClass(autoPrint)}">
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
                <td class="val-col">${weighbridgeSite}</td>
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
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; color: ${accentColor};">$${totalIncGst.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
        ${autoPrint ? `
        <script>
          window.onload = function() {
            window.print();
          }
        </script>` : ""}
      </body>
    </html>
  `;
}

export function openTaxInvoicePrint(
  transaction: Transaction,
  context: TaxInvoiceContext,
  docketConfig?: DocketConfig,
  options: TaxInvoicePrintOptions = {}
): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  const config = resolveDocketConfig(docketConfig);
  printWindow.document.open();
  printWindow.document.write(buildTaxInvoiceHtml(transaction, config, context, options));
  printWindow.document.close();
  return true;
}
