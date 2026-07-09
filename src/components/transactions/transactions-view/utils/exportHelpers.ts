import { Transaction } from "../../../../types";

export function buildTransactionExport(
  items: Transaction[],
  format: string,
  scope: string
): { blob: Blob; fileName: string } {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `uniweigh_${scope}_export_${dateStr}`;

  if (format === "CSV") {
    let csv = "Ticket No,ID,Type,Status,Vehicle,Driver,Customer,Product,Net Weight(t),Job Order,Lot,Tx Code,Account Balance($)\n";
    items.forEach((t) => {
      csv += `"${t.ticketNo}","${t.id}","${t.type}","${t.status}","${t.vehicleReg}","${t.driverName}","${t.customerName}","${t.productName}",${t.netWeight},"${t.jobOrder}","${t.lotNo}","${t.transactionCode}",${t.accountBalance}\n`;
    });
    return {
      blob: new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      fileName: `${fileName}.csv`
    };
  }

  if (format === "Excel") {
    let xls = "Ticket No\tID\tType\tStatus\tVehicle\tDriver\tCustomer\tProduct\tNet Weight(t)\tJob Order\tLot\tTx Code\tAccount Balance($)\n";
    items.forEach((t) => {
      xls += `${t.ticketNo}\t${t.id}\t${t.type}\t${t.status}\t${t.vehicleReg}\t${t.driverName}\t${t.customerName}\t${t.productName}\t${t.netWeight}\t${t.jobOrder}\t${t.lotNo}\t${t.transactionCode}\t${t.accountBalance}\n`;
    });
    return {
      blob: new Blob([xls], { type: "application/vnd.ms-excel;charset=utf-8;" }),
      fileName: `${fileName}.xls`
    };
  }

  // PDF acts as a structured text report
  let pdfText = `========================================================================\n`;
  pdfText += `              UNIWEIGH WEIGHBRIDGE SYSTEMS - AUDIT REPORT               \n`;
  pdfText += `              Export Scope: ${scope.toUpperCase()}                 \n`;
  pdfText += `              Timestamp: ${new Date().toLocaleString()}                 \n`;
  pdfText += `========================================================================\n\n`;
  pdfText += `Summary: ${items.length} transactions exported.\n\n`;

  items.forEach((t, i) => {
    pdfText += `${i + 1}. Ticket: ${t.ticketNo}  |  Code: ${t.id}  |  Type: ${t.type}  |  Status: ${t.status}\n`;
    pdfText += `   Vehicle: ${t.vehicleReg}  |  Driver: ${t.driverName}  |  Carter: ${t.carrierName}\n`;
    pdfText += `   Customer: ${t.customerName} [${t.customerId}]\n`;
    pdfText += `   Product: ${t.productName}  |  Net Weight: ${t.netWeight.toFixed(2)} t\n`;
    pdfText += `   Job Order: ${t.jobOrder || "N/A"}  |  Lot Number: ${t.lotNo || "N/A"}  |  Tx Code: ${t.transactionCode || "N/A"}\n`;
    pdfText += `   Account Balance: $${t.accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n`;
    pdfText += `   Remarks: ${t.comments || "No back-office comments."}\n`;
    pdfText += `   Weigh Times: Inbound ${t.firstWeighTime} | Outbound ${t.secondWeighTime}\n`;
    pdfText += `------------------------------------------------------------------------\n`;
  });

  return {
    blob: new Blob([pdfText], { type: "text/plain;charset=utf-8;" }),
    fileName: `${fileName}.txt`
  };
}
