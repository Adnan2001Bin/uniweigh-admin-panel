import { DocketConfig, Transaction } from "../types";

export const DEFAULT_DOCKET_CONFIG: DocketConfig = {
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
  cashInvoiceNotes:
    "Thank you for your business. For cash/card sales, EFT payments are processed prior to vehicle dispatch.",
  accountInvoiceNotes:
    "Tax Invoice raised directly against approved credit ledger. Contract Terms apply. Do not pay this document."
};

export function resolveDocketConfig(config?: DocketConfig): DocketConfig {
  return config ?? DEFAULT_DOCKET_CONFIG;
}

export interface DeliveryDocketPrintOptions {
  reprintCopy?: boolean;
}

export function buildDeliveryDocketHtml(
  transaction: Transaction,
  config: DocketConfig,
  options: DeliveryDocketPrintOptions = {}
): string {
  const { reprintCopy = false } = options;
  const driverComments =
    transaction.comments?.trim() ||
    `Own Driver. Wear appropriate high-vis PPE, safety glasses, and steel caps at all times. Follow strict 20 km/h quarry limits. Weighbridge certified under scale ID ${transaction.scaleIdInbound}.`;

  return `
    <html>
      <head>
        <title>Weighbridge Ticket - ${transaction.ticketNo}</title>
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
          .weights-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            background-color: #f8fafc;
            padding: 12px;
            margin: 15px 0;
          }
          .weights-table {
            width: 100%;
            border-collapse: collapse;
          }
          .weights-table th {
            text-align: center;
            font-size: 9px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            padding-bottom: 6px;
            border-bottom: 2px solid #cbd5e1;
          }
          .weights-table td {
            text-align: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
            padding-top: 8px;
          }
          .comments-box {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 9px;
            color: #475569;
            margin-bottom: 15px;
          }
          .comments-title {
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          .pricing-section {
            border-top: 1.5px dashed #cbd5e1;
            padding-top: 12px;
            margin-top: 12px;
          }
          .pricing-table {
            width: 100%;
            border-collapse: collapse;
          }
          .pricing-table td {
            font-size: 11px;
            padding: 5px 0;
          }
          .pricing-total {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            border-top: 2px solid #0f172a;
            padding-top: 6px;
          }
          .eft-box {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 10px;
            font-size: 9px;
            color: #475569;
            margin-bottom: 15px;
          }
          .eft-title {
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
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
          <div>
            <table class="header-table">
              <tr>
                ${config.showLogo ? `
                <td class="logo-cell">
                  <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5L90 35L75 90L25 90L10 35L50 5Z" fill="${config.logoColor}" opacity="0.15" />
                    <path d="M50 15L80 40H20L50 15Z" fill="${config.logoColor}" />
                    <path d="M45 40H55V85H45V40Z" fill="${config.logoColor}" />
                    <path d="M30 55L50 45L70 55L50 65L30 55Z" fill="#fff" opacity="0.9" />
                    <path d="M50 5L95 38L78 92H22L5 38L50 5ZM50 10L10 40L25 87H75L90 40L50 10Z" fill="${config.logoColor}" />
                  </svg>
                </td>
                ` : ""}
                <td class="brand-cell">
                  <h1 class="brand-name">${config.eftAccountName}</h1>
                  <div class="brand-subtitle">Certified Weighbridge Material Record</div>
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
              <h2 class="docket-title">DELIVERY DOCKET</h2>
              ${reprintCopy ? '<div class="reprint-badge">REPRINT / DUPLICATE COPY</div>' : ""}
            </div>

            <table class="details-table">
              <tr>
                <td class="label-col">DATE & TIME IN:</td>
                <td class="val-col">${transaction.firstWeighTime}</td>
                <td class="label-col">DATE & TIME OUT:</td>
                <td class="val-col">${transaction.secondWeighTime || "PENDING OUTBOUND"}</td>
              </tr>
              <tr>
                <td class="label-col">CUSTOMER / DEBTOR:</td>
                <td class="val-col" style="font-size: 11px; font-weight: 900;">${transaction.customerName}</td>
                <td class="label-col">JOB / REFERENCE:</td>
                <td class="val-col">${transaction.jobOrder || "N/A"}</td>
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
                <td class="label-col">DOCKET NUMBER:</td>
                <td class="val-col" style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 900; color: #1e293b;">${transaction.ticketNo}</td>
              </tr>
              <tr>
                <td class="label-col">MATERIAL PRODUCT:</td>
                <td class="val-col" style="font-weight: 900; color: #1e293b;">${transaction.productName}</td>
                <td class="label-col">LOT NUMBER:</td>
                <td class="val-col" style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${transaction.lotNo || "N/A"}</td>
              </tr>
              <tr>
                <td class="label-col">INBOUND SCALE:</td>
                <td class="val-col" style="font-family: 'JetBrains Mono', monospace;">${transaction.scaleIdInbound}</td>
                <td class="label-col">WEIGHBRIDGE SITE:</td>
                <td class="val-col">${config.weighbridgeLocation}</td>
              </tr>
            </table>

            <div class="weights-box">
              <table class="weights-table">
                <thead>
                  <tr>
                    <th>Gross Weight (t)</th>
                    <th>Tare Weight (t)</th>
                    <th>Net Product Weight (t)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${transaction.grossWeight.toFixed(2)}</td>
                    <td>${transaction.tareWeight.toFixed(2)}</td>
                    <td style="font-size: 16px; font-weight: 900; color: #1e293b;">${transaction.netWeight.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="comments-box">
              <div class="comments-title">Driver Comments & Special Site Instructions</div>
              <p style="margin: 0;">${driverComments}</p>
            </div>

            ${transaction.type !== "Account" ? `
            <div class="pricing-section">
              <table class="pricing-table">
                <tr>
                  <td style="font-weight: 700; color: #475569;">BILLING CLASS / PAYMENT TYPE:</td>
                  <td style="text-align: right; font-weight: 800; color: #0f172a;">${transaction.type} sale</td>
                </tr>
                <tr>
                  <td style="color: #475569;">Material Unit Base Rate:</td>
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace;">$${transaction.basePrice.toFixed(2)} / t</td>
                </tr>
                <tr>
                  <td style="color: #475569;">Gross Billable Value (Ex. GST):</td>
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace;">$${transaction.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="pricing-total">
                  <td style="font-weight: 900;">TOTAL DUE (EX. GST):</td>
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 900; color: #2563eb;">$${transaction.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
            </div>
            ` : `
            <div class="pricing-section" style="text-align: center; border: 1px dashed #cbd5e1; padding: 10px; border-radius: 6px; background-color: #f8fafc;">
              <span style="font-size: 10px; font-weight: 900; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">
                ACCOUNT CLIENT TRANSACTION - PRICING EXCLUDED FROM DOCKET
              </span>
              <p style="font-size: 8px; color: #94a3b8; margin: 3px 0 0 0;">Pricing information is suppressed. Total value is compiled and raised directly in the commercial accounting system as a monthly tax invoice.</p>
            </div>
            `}
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
                  <div>Operator Authorized Signature (ID: ${transaction.operatorId})</div>
                </td>
                <td>
                  <div class="signature-line"></div>
                  <div>Driver Authorized Receipt Signature</div>
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
}

export function openDeliveryDocketPrint(
  transaction: Transaction,
  docketConfig?: DocketConfig,
  options: DeliveryDocketPrintOptions = {}
): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  const config = resolveDocketConfig(docketConfig);
  printWindow.document.open();
  printWindow.document.write(buildDeliveryDocketHtml(transaction, config, options));
  printWindow.document.close();
  return true;
}
