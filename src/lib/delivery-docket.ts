import { DocketConfig, Transaction } from "../types";
import { DEFAULT_DOCKET_CONFIG } from "../data";
import { MODAL_PREVIEW_CSS, previewBodyClass } from "./print-preview";

export { DEFAULT_DOCKET_CONFIG };

const DEFAULT_DOCKET_LOGO_SRC = "/pdf-icon.png";

export function resolveDocketConfig(config?: DocketConfig): DocketConfig {
  const base = config ?? DEFAULT_DOCKET_CONFIG;
  return {
    ...DEFAULT_DOCKET_CONFIG,
    ...base,
    logoUrl: base.logoUrl?.trim() || DEFAULT_DOCKET_CONFIG.logoUrl || DEFAULT_DOCKET_LOGO_SRC,
  };
}

export interface DeliveryDocketPrintOptions {
  reprintCopy?: boolean;
  autoPrint?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDocketDateTime(raw: string): { date: string; time: string } {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { date: "—", time: "—" };

  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    let hours = parsed.getHours();
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hours} : ${minutes} ${ampm}`,
    };
  }

  const [datePart, timePart = ""] = trimmed.split(/\s+/);
  return { date: datePart || trimmed, time: timePart || "—" };
}

/** Resolve logo paths so print windows (about:blank) can still load them. */
function resolveLogoSrc(logoUrl?: string): string {
  const url = (logoUrl || DEFAULT_DOCKET_LOGO_SRC).trim();
  if (!url) return DEFAULT_DOCKET_LOGO_SRC;
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    /^https?:\/\//i.test(url)
  ) {
    return url;
  }
  if (typeof window !== "undefined") {
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      return url;
    }
  }
  return url;
}

/** True when the logo asset already includes the brand wordmark. */
function logoIncludesBrandName(logoUrl?: string): boolean {
  const url = (logoUrl || "").trim();
  return !url || /pdf-icon/i.test(url);
}

function buildLogoMarkup(config: DocketConfig): string {
  if (!config.showLogo) return "";
  const src = resolveLogoSrc(config.logoUrl);
  return `<img src="${src}" alt="Logo" class="logo-img" />`;
}

function metaField(label: string, value: string): string {
  return `<tr>
    <td class="meta-label">${escapeHtml(label)}</td>
    <td class="meta-colon">:</td>
    <td class="meta-value">${escapeHtml(value)}</td>
  </tr>`;
}

/** Classic account-billing docket matching ADMIN | Print | BQA23648 layout. */
function buildAccountBillingDocketHtml(
  transaction: Transaction,
  config: DocketConfig,
  options: DeliveryDocketPrintOptions
): string {
  const { reprintCopy = false, autoPrint = true } = options;
  const weighbridgeSite = config.weighbridgeLocation || transaction.siteName;
  const { date, time } = formatDocketDateTime(
    transaction.secondWeighTime || transaction.firstWeighTime
  );
  const purchaseOrder =
    transaction.purchaseOrder?.trim() || transaction.jobOrder || "N/A";
  const destination =
    transaction.destinationName?.trim() || transaction.siteName || "N/A";
  const contactLabel =
    transaction.siteContactName?.trim() || transaction.carrierName || "—";
  const driverLabel = transaction.driverName?.trim() || "Own Driver";
  const logoMarkup = buildLogoMarkup(config);
  const brandName = escapeHtml(config.eftAccountName);
  const showBrandName =
    !config.showLogo || !logoIncludesBrandName(config.logoUrl);
  const gross = transaction.grossWeight.toFixed(2);
  const tare = transaction.tareWeight.toFixed(2);
  const nett = transaction.netWeight.toFixed(2);

  return `
    <html>
      <head>
        <title></title>
        <style>
          ${autoPrint ? "" : MODAL_PREVIEW_CSS}
          @page {
            size: A4;
            /* Zero page margin hides Chrome date/title/URL/page headers */
            margin: 0;
          }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #222;
            background: #fff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 9.5pt;
            font-weight: 400;
            line-height: 1.3;
          }
          .page {
            width: 21cm;
            min-height: 29.7cm;
            /* Match ADMIN | Print | BQA23648 page margins (as padding) */
            padding: 21mm 26mm 20mm 19mm;
            margin: 0 auto;
            background: #fff;
            box-sizing: border-box;
          }
          table { border-collapse: collapse; }
          .header {
            display: flex;
            align-items: stretch;
            justify-content: space-between;
            gap: 16px;
            width: 100%;
            margin-bottom: 4px;
          }
          .brand-cell {
            display: flex;
            align-items: stretch;
            flex: 0 0 auto;
            max-width: 42%;
          }
          .logo-img {
            /* Height is set to match .contact-inner via script / CSS fallback */
            height: calc(6 * 8pt * 1.35);
            width: auto;
            max-width: 100%;
            object-fit: contain;
            object-position: left top;
            display: block;
          }
          .brand-name {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            font-weight: 700;
            text-transform: uppercase;
            margin: 0;
            padding-left: 6px;
            line-height: 1.15;
            align-self: center;
          }
          .contact-cell {
            flex: 1 1 auto;
            display: flex;
            justify-content: flex-end;
            font-size: 8pt;
            line-height: 1.35;
            font-weight: 400;
            color: #333;
          }
          .contact-inner {
            text-align: left;
          }
          .contact-inner .biz-name {
            font-weight: 700;
            color: #111;
          }
          .docket-title {
            text-align: center;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            font-weight: 700;
            color: #111;
            letter-spacing: 0.8px;
            margin: 12px 0 12px;
            text-transform: uppercase;
          }
          .reprint-badge {
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin: -6px 0 10px;
            text-transform: uppercase;
          }
          .meta-outer {
            width: 100%;
            margin-bottom: 12px;
          }
          .meta-outer > tbody > tr > td {
            vertical-align: top;
          }
          .meta-outer .meta-left {
            width: 58%;
            padding-right: 18px;
          }
          .meta-outer .meta-right {
            width: 42%;
            padding-left: 0;
          }
          .meta-fields {
            width: auto;
          }
          .meta-fields td {
            padding: 1px 0;
            vertical-align: top;
            font-size: 9.5pt;
            line-height: 1.35;
            color: #222;
          }
          .meta-label {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            white-space: nowrap;
            padding-right: 2px !important;
            width: 1%;
          }
          .meta-colon {
            font-weight: 700;
            color: #111;
            padding: 1px 5px 1px 0 !important;
            width: 1%;
            white-space: nowrap;
          }
          .meta-value {
            width: auto;
            padding-right: 6px !important;
            font-weight: 400;
            color: #222;
          }
          .load-table {
            display: flex;
            align-items: stretch;
            width: 100%;
            margin: 2px 0 12px;
          }
          .load-contact {
            width: 22%;
            flex: 0 0 22%;
            display: flex;
            align-items: center; /* vertically center carrier / site contact */
            font-weight: 700;
            font-size: 9.5pt;
            color: #222;
            padding: 4px 10px 4px 0;
            border-right: 1px solid #b0b0b0;
            box-sizing: border-box;
          }
          .load-product {
            width: 46%;
            flex: 0 0 46%;
            padding: 4px 10px;
            border-right: 1px solid #b0b0b0;
            box-sizing: border-box;
          }
          .load-weights {
            width: 32%;
            flex: 0 0 32%;
            padding: 4px 0 4px 10px;
            box-sizing: border-box;
          }
          .load-line {
            margin: 0 0 2px;
            font-size: 9.5pt;
            font-weight: 400;
            color: #222;
            line-height: 1.35;
          }
          .load-line:last-child { margin-bottom: 0; }
          .load-k {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
          }
          .section-heading {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            margin: 0 0 1mm;
            font-size: 9.5pt;
          }
          .totals-wrap {
            width: 100%;
            margin-bottom: 1.5mm;
          }
          .totals-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
          }
          .totals-table .totals-head td {
            font-weight: 700;
            font-size: 8.8pt;
            color: #111;
            padding: 0 6px 3px 6px;
            text-align: left;
            border: none;
            width: 33.333%;
          }
          .totals-table .totals-body td {
            border: 1px solid #b0b0b0;
            padding: 4px 6px;
            font-size: 8.8pt;
            font-weight: 400;
            color: #222;
            text-align: left;
            width: 33.333%;
          }
          /* Reference: DRIVER label above empty notes box */
          .driver-line {
            font-weight: 700;
            color: #111;
            margin: 0 0 1mm;
            text-transform: uppercase;
            font-size: 8.8pt;
            line-height: 1.25;
          }
          .notes-box {
            border: 1px solid #b0b0b0;
            height: 15.3mm;
            margin-bottom: 8mm;
            box-sizing: border-box;
          }
          .eft-table {
            width: 100%;
            border: 1px solid #cccccc;
            margin-bottom: 15mm;
          }
          .eft-table td {
            vertical-align: middle;
          }
          .eft-label {
            width: 72px;
            border-right: 1px solid #cccccc;
            font-weight: 700;
            color: #111;
            text-align: left;
            vertical-align: middle;
            padding: 6px 8px;
            font-size: 9.5pt;
            line-height: 1.2;
          }
          .eft-details {
            padding: 6px 10px;
            line-height: 1.35;
            font-size: 9.5pt;
            font-weight: 400;
            color: #222;
          }
          .eft-details .eft-k {
            font-weight: 700;
            color: #111;
          }
          .customer-copy {
            font-weight: 700;
            color: #111;
            margin: 0 0 2.5mm;
            font-size: 9.5pt;
          }
          .signature-box {
            border: 1px solid #cccccc;
            height: 15mm;
            padding: 2.5mm 3mm;
            box-sizing: border-box;
          }
          .signature-label {
            font-weight: 700;
            font-size: 9.5pt;
            color: #111;
            line-height: 1.25;
          }
          .signature-sub {
            margin-top: 1px;
            font-size: 9.5pt;
            font-weight: 700;
            font-style: italic;
            color: #111;
            line-height: 1.25;
          }
          @media print {
            body { background: none; }
            .page {
              width: auto;
              min-height: auto;
              /* Keep padding — @page margin is 0 to suppress browser chrome */
              padding: 21mm 26mm 20mm 19mm;
              margin: 0;
            }
          }
        </style>
      </head>
      <body class="${previewBodyClass(autoPrint)}">
        <div class="page">
          <div class="header">
            <div class="brand-cell">
              ${config.showLogo ? logoMarkup : ""}
              ${showBrandName ? `<h1 class="brand-name">${brandName}</h1>` : ""}
            </div>
            <div class="contact-cell">
              <div class="contact-inner">
                <div class="biz-name">${escapeHtml(config.businessName)}</div>
                <div>${escapeHtml(config.poBox)}</div>
                <div>CONTACT: ${escapeHtml(config.contact)}</div>
                <div>FAX: ${escapeHtml(config.fax)}</div>
                <div>EMAIL: ${escapeHtml(config.email)}</div>
                <div>ABN: ${escapeHtml(config.abn)}</div>
              </div>
            </div>
          </div>

          <div class="docket-title">DELIVERY DOCKET</div>
          ${reprintCopy ? '<div class="reprint-badge">REPRINT / DUPLICATE COPY</div>' : ""}

          <table class="meta-outer">
            <tr>
              <td class="meta-left">
                <table class="meta-fields">
                  ${metaField("TO", transaction.customerName)}
                  ${metaField("JOB NUMBER", transaction.jobOrder || "N/A")}
                  ${metaField("PURCHASE ORDER", purchaseOrder)}
                  ${metaField("TRANSPORT COMPANY", transaction.carrierName)}
                  ${metaField("WEIGHBRIDGE LOCATION", weighbridgeSite)}
                </table>
              </td>
              <td class="meta-right">
                <table class="meta-fields">
                  ${metaField("DATE", date)}
                  ${metaField("TIME", time)}
                  ${metaField("DOCKET NUMBER", transaction.ticketNo)}
                  ${metaField("DESTINATION", destination)}
                </table>
              </td>
            </tr>
          </table>

          <div class="load-table">
            <div class="load-contact">${escapeHtml(contactLabel)}</div>
            <div class="load-product">
              <div class="load-line"><span class="load-k">REG NO. :</span> ${escapeHtml(transaction.vehicleReg)}</div>
              <div class="load-line"><span class="load-k">PRODUCT:</span> ${escapeHtml(transaction.productName)}</div>
              <div class="load-line"><span class="load-k">LOT:</span> ${escapeHtml(transaction.lotNo || "N/A")}</div>
            </div>
            <div class="load-weights">
              <div class="load-line"><span class="load-k">GROSS :</span> ${gross}</div>
              <div class="load-line"><span class="load-k">STORED TARE :</span> ${tare}</div>
              <div class="load-line"><span class="load-k">NETT :</span> ${nett}</div>
            </div>
          </div>

          <div class="section-heading">TOTAL ORDER WEIGHT :</div>
          <div class="totals-wrap">
            <table class="totals-table">
              <tr class="totals-head">
                <td>Gross</td>
                <td>Tare</td>
                <td>Net</td>
              </tr>
              <tr class="totals-body">
                <td>${gross}</td>
                <td>${tare}</td>
                <td>${nett}</td>
              </tr>
            </table>
          </div>

          <div class="driver-line">DRIVER: ${escapeHtml(driverLabel)}</div>
          <div class="notes-box"></div>

          <table class="eft-table">
            <tr>
              <td class="eft-label">EFT<br/>Payments</td>
              <td class="eft-details">
                <div><span class="eft-k">Account Name:</span> ${escapeHtml(config.eftAccountName)}</div>
                <div><span class="eft-k">BSB:</span> ${escapeHtml(config.eftBsb)}</div>
                <div><span class="eft-k">Account No.:</span> ${escapeHtml(config.eftAccountNo)}</div>
              </td>
            </tr>
          </table>

          <div class="customer-copy">Customer Copy:</div>
          <div class="signature-box">
            <div class="signature-label">Signature:</div>
            <div class="signature-sub">(For ${escapeHtml(config.eftAccountName)})</div>
          </div>
        </div>
        <script>
          function sizeDocketLogo() {
            var contact = document.querySelector('.contact-inner');
            var logo = document.querySelector('.logo-img');
            if (!contact || !logo) return;
            var h = contact.offsetHeight;
            if (h > 0) {
              logo.style.height = h + 'px';
              logo.style.width = 'auto';
            }
          }
          var didPrint = false;
          function readyPrint() {
            sizeDocketLogo();
            ${autoPrint ? `
            if (!didPrint) {
              didPrint = true;
              window.print();
            }` : ""}
          }
          window.addEventListener('load', function() {
            var logo = document.querySelector('.logo-img');
            if (logo && !logo.complete) {
              logo.addEventListener('load', readyPrint, { once: true });
              setTimeout(readyPrint, 500);
            } else {
              readyPrint();
            }
          });
        </script>
      </body>
    </html>
  `;
}

function buildCashDeliveryDocketHtml(
  transaction: Transaction,
  config: DocketConfig,
  options: DeliveryDocketPrintOptions
): string {
  const { reprintCopy = false, autoPrint = true } = options;
  const weighbridgeSite = config.weighbridgeLocation || transaction.siteName;
  const { date, time } = formatDocketDateTime(
    transaction.secondWeighTime || transaction.firstWeighTime
  );
  const purchaseOrder =
    transaction.purchaseOrder?.trim() || transaction.jobOrder || "N/A";
  const destination =
    transaction.destinationName?.trim() || transaction.siteName || "N/A";
  const tipperLabel =
    transaction.carrierName?.trim() ||
    `${config.eftAccountName} Tipper`;
  const driverLabel = transaction.driverName?.trim() || "Own Driver";
  const logoMarkup = buildLogoMarkup(config);
  const brandName = escapeHtml(config.eftAccountName);
  const showBrandName =
    !config.showLogo || !logoIncludesBrandName(config.logoUrl);
  const gross = transaction.grossWeight.toFixed(2);
  const tare = transaction.tareWeight.toFixed(2);
  const nett = transaction.netWeight.toFixed(2);
  const amountExGst = transaction.totalValue;
  const gst = amountExGst * 0.1;
  const totalInclGst = amountExGst + gst;
  const cartageIncluded = "YES";
  const cartagePrice = "0";
  const paymentTypeLabel = "EFT";

  return `
    <html>
      <head>
        <title></title>
        <style>
          ${autoPrint ? "" : MODAL_PREVIEW_CSS}
          @page {
            size: A4;
            margin: 0;
          }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #222;
            background: #fff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 9.5pt;
            font-weight: 400;
            line-height: 1.3;
          }
          .page {
            width: 21cm;
            min-height: 29.7cm;
            padding: 21mm 26mm 20mm 19mm;
            margin: 0 auto;
            background: #fff;
            box-sizing: border-box;
          }
          table { border-collapse: collapse; }
          .header {
            display: flex;
            align-items: stretch;
            justify-content: space-between;
            gap: 16px;
            width: 100%;
            margin-bottom: 4px;
          }
          .brand-cell {
            display: flex;
            align-items: stretch;
            flex: 0 0 auto;
            max-width: 42%;
          }
          .logo-img {
            height: calc(6 * 8pt * 1.35);
            width: auto;
            max-width: 100%;
            object-fit: contain;
            object-position: left top;
            display: block;
          }
          .brand-name {
            font-size: 11pt;
            font-weight: 700;
            text-transform: uppercase;
            margin: 0;
            padding-left: 6px;
            line-height: 1.15;
            align-self: center;
            color: #111;
          }
          .contact-cell {
            flex: 1 1 auto;
            display: flex;
            justify-content: flex-end;
            font-size: 8pt;
            line-height: 1.35;
            color: #333;
          }
          .contact-inner { text-align: left; }
          .contact-inner .biz-name {
            font-weight: 700;
            color: #111;
          }
          .docket-title {
            text-align: center;
            font-size: 10pt;
            font-weight: 700;
            color: #111;
            letter-spacing: 0.8px;
            margin: 12px 0 12px;
            text-transform: uppercase;
          }
          .reprint-badge {
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin: -6px 0 10px;
            text-transform: uppercase;
          }
          .meta-outer {
            width: 100%;
            margin-bottom: 12px;
          }
          .meta-outer > tbody > tr > td { vertical-align: top; }
          .meta-outer .meta-left {
            width: 58%;
            padding-right: 18px;
          }
          .meta-outer .meta-right { width: 42%; }
          .meta-fields { width: auto; }
          .meta-fields td {
            padding: 1px 0;
            vertical-align: top;
            font-size: 9.5pt;
            line-height: 1.35;
            color: #222;
          }
          .meta-label {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            white-space: nowrap;
            padding-right: 2px !important;
            width: 1%;
          }
          .meta-colon {
            font-weight: 700;
            color: #111;
            padding: 1px 5px 1px 0 !important;
            width: 1%;
            white-space: nowrap;
          }
          .meta-value {
            width: auto;
            padding-right: 6px !important;
            font-weight: 400;
            color: #222;
          }
          .load-table {
            display: flex;
            align-items: stretch;
            width: 100%;
            margin: 2px 0 12px;
          }
          .load-contact {
            width: 22%;
            flex: 0 0 22%;
            display: flex;
            align-items: center;
            font-weight: 700;
            font-size: 9.5pt;
            color: #222;
            padding: 4px 10px 4px 0;
            border-right: 1px solid #b0b0b0;
            box-sizing: border-box;
          }
          .load-product {
            width: 46%;
            flex: 0 0 46%;
            padding: 4px 10px;
            border-right: 1px solid #b0b0b0;
            box-sizing: border-box;
          }
          .load-weights {
            width: 32%;
            flex: 0 0 32%;
            padding: 4px 0 4px 10px;
            box-sizing: border-box;
          }
          .load-line {
            margin: 0 0 2px;
            font-size: 9.5pt;
            color: #222;
            line-height: 1.35;
          }
          .load-line:last-child { margin-bottom: 0; }
          .load-k {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
          }
          .section-heading {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            margin: 0 0 1mm;
            font-size: 9.5pt;
          }
          .totals-wrap {
            width: 100%;
            margin-bottom: 3mm;
          }
          .totals-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
          }
          .totals-table .totals-head td {
            font-weight: 700;
            font-size: 8.8pt;
            color: #111;
            padding: 0 6px 3px 6px;
            text-align: left;
            border: none;
            width: 33.333%;
          }
          .totals-table .totals-body td {
            border: 1px solid #b0b0b0;
            padding: 4px 6px;
            font-size: 8.8pt;
            color: #222;
            text-align: left;
            width: 33.333%;
          }
          .cartage-line {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            font-size: 9.5pt;
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            margin: 0 0 4mm;
          }
          .cartage-line span { font-weight: 400; color: #222; text-transform: none; }
          .payment-heading {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            margin: 0 0 1mm;
            font-size: 9.5pt;
          }
          .payment-type {
            font-weight: 700;
            color: #111;
            text-transform: uppercase;
            font-size: 9.5pt;
            margin: 2mm 0 4mm;
          }
          .payment-type span { font-weight: 400; color: #222; text-transform: none; }
          .notes-box {
            border: 1px solid #b0b0b0;
            height: 18mm;
            margin-bottom: 8mm;
            box-sizing: border-box;
          }
          .eft-table {
            width: 100%;
            border: 1px solid #cccccc;
            margin-bottom: 15mm;
          }
          .eft-table td { vertical-align: middle; }
          .eft-label {
            width: 72px;
            border-right: 1px solid #cccccc;
            font-weight: 700;
            color: #111;
            text-align: left;
            vertical-align: middle;
            padding: 6px 8px;
            font-size: 9.5pt;
            line-height: 1.2;
          }
          .eft-details {
            padding: 6px 10px;
            line-height: 1.35;
            font-size: 9.5pt;
            color: #222;
          }
          .eft-details .eft-k {
            font-weight: 700;
            color: #111;
          }
          .customer-copy {
            font-weight: 700;
            color: #111;
            margin: 0 0 2.5mm;
            font-size: 9.5pt;
          }
          .signature-box {
            border: 1px solid #cccccc;
            height: 15mm;
            padding: 2.5mm 3mm;
            box-sizing: border-box;
          }
          .signature-label {
            font-weight: 700;
            font-size: 9.5pt;
            color: #111;
            line-height: 1.25;
          }
          .signature-sub {
            margin-top: 1px;
            font-size: 9.5pt;
            font-weight: 700;
            font-style: italic;
            color: #111;
            line-height: 1.25;
          }
          @media print {
            body { background: none; }
            .page {
              width: auto;
              min-height: auto;
              padding: 21mm 26mm 20mm 19mm;
              margin: 0;
            }
          }
        </style>
      </head>
      <body class="${previewBodyClass(autoPrint)}">
        <div class="page">
          <div class="header">
            <div class="brand-cell">
              ${config.showLogo ? logoMarkup : ""}
              ${showBrandName ? `<h1 class="brand-name">${brandName}</h1>` : ""}
            </div>
            <div class="contact-cell">
              <div class="contact-inner">
                <div class="biz-name">${escapeHtml(config.businessName)}</div>
                <div>${escapeHtml(config.poBox)}</div>
                <div>CONTACT: ${escapeHtml(config.contact)}</div>
                <div>FAX: ${escapeHtml(config.fax)}</div>
                <div>EMAIL: ${escapeHtml(config.email)}</div>
                <div>ABN: ${escapeHtml(config.abn)}</div>
              </div>
            </div>
          </div>

          <div class="docket-title">DELIVERY DOCKET</div>
          ${reprintCopy ? '<div class="reprint-badge">REPRINT / DUPLICATE COPY</div>' : ""}

          <table class="meta-outer">
            <tr>
              <td class="meta-left">
                <table class="meta-fields">
                  ${metaField("TO", transaction.customerName)}
                  ${metaField("PURCHASE ORDER", purchaseOrder)}
                  ${metaField("TRANSPORT COMPANY", transaction.carrierName)}
                  ${metaField("WEIGHBRIDGE LOCATION", weighbridgeSite)}
                </table>
              </td>
              <td class="meta-right">
                <table class="meta-fields">
                  ${metaField("DATE", date)}
                  ${metaField("TIME", time)}
                  ${metaField("DOCKET NUMBER", transaction.ticketNo)}
                  ${metaField("DESTINATION", destination)}
                </table>
              </td>
            </tr>
          </table>

          <div class="load-table">
            <div class="load-contact">${escapeHtml(tipperLabel)}</div>
            <div class="load-product">
              <div class="load-line"><span class="load-k">REG NO. :</span> ${escapeHtml(transaction.vehicleReg)}</div>
              <div class="load-line"><span class="load-k">PRODUCT:</span> ${escapeHtml(transaction.productName)}</div>
              <div class="load-line"><span class="load-k">LOT:</span> ${escapeHtml(transaction.lotNo || "N/A")}</div>
              <div class="load-line"><span class="load-k">DRIVER:</span> ${escapeHtml(driverLabel)}</div>
            </div>
            <div class="load-weights">
              <div class="load-line"><span class="load-k">GROSS :</span> ${gross}</div>
              <div class="load-line"><span class="load-k">STORED TARE :</span> ${tare}</div>
              <div class="load-line"><span class="load-k">NETT :</span> ${nett}</div>
            </div>
          </div>

          <div class="section-heading">TOTAL ORDER WEIGHT :</div>
          <div class="totals-wrap">
            <table class="totals-table">
              <tr class="totals-head">
                <td>Gross</td>
                <td>Tare</td>
                <td>Net</td>
              </tr>
              <tr class="totals-body">
                <td>${gross}</td>
                <td>${tare}</td>
                <td>${nett}</td>
              </tr>
            </table>
          </div>

          <div class="cartage-line">
            <div>CARTAGE INCLUDED : <span>${cartageIncluded}</span></div>
            <div>CARTAGE PRICE: <span>${cartagePrice}</span></div>
          </div>

          <div class="payment-heading">PAYMENT :</div>
          <div class="totals-wrap">
            <table class="totals-table">
              <tr class="totals-head">
                <td>Amount (Ex GST)</td>
                <td>GST</td>
                <td>Total Amount (Incl GST)</td>
              </tr>
              <tr class="totals-body">
                <td>${amountExGst.toFixed(2)}</td>
                <td>${gst.toFixed(2)}</td>
                <td>${totalInclGst.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="payment-type">PAYMENT TYPE : <span>${paymentTypeLabel}</span></div>

          <div class="notes-box"></div>

          <table class="eft-table">
            <tr>
              <td class="eft-label">EFT<br/>Payments</td>
              <td class="eft-details">
                <div><span class="eft-k">Account Name:</span> ${escapeHtml(config.eftAccountName)}</div>
                <div><span class="eft-k">BSB:</span> ${escapeHtml(config.eftBsb)}</div>
                <div><span class="eft-k">Account No.:</span> ${escapeHtml(config.eftAccountNo)}</div>
              </td>
            </tr>
          </table>

          <div class="customer-copy">Customer Copy:</div>
          <div class="signature-box">
            <div class="signature-label">Signature:</div>
            <div class="signature-sub">(For ${escapeHtml(config.eftAccountName)})</div>
          </div>
        </div>
        <script>
          function sizeDocketLogo() {
            var contact = document.querySelector('.contact-inner');
            var logo = document.querySelector('.logo-img');
            if (!contact || !logo) return;
            var h = contact.offsetHeight;
            if (h > 0) {
              logo.style.height = h + 'px';
              logo.style.width = 'auto';
            }
          }
          var didPrint = false;
          function readyPrint() {
            sizeDocketLogo();
            ${autoPrint ? `
            if (!didPrint) {
              didPrint = true;
              window.print();
            }` : ""}
          }
          window.addEventListener('load', function() {
            var logo = document.querySelector('.logo-img');
            if (logo && !logo.complete) {
              logo.addEventListener('load', readyPrint, { once: true });
              setTimeout(readyPrint, 500);
            } else {
              readyPrint();
            }
          });
        </script>
      </body>
    </html>
  `;
}

export function buildDeliveryDocketHtml(
  transaction: Transaction,
  config: DocketConfig,
  options: DeliveryDocketPrintOptions = {}
): string {
  const resolved = resolveDocketConfig(config);
  if (transaction.type === "Account") {
    return buildAccountBillingDocketHtml(transaction, resolved, options);
  }
  return buildCashDeliveryDocketHtml(transaction, resolved, options);
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
