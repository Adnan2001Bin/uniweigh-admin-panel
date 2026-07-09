import { useMemo } from "react";
import { Transaction } from "../../../../types";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";

interface TransactionsTabProps {
  matchingTxs: Transaction[];
}

export default function TransactionsTab({ matchingTxs }: TransactionsTabProps) {
  const gridTheme = themeQuartz.withParams({
    spacing: 8,
    fontSize: 15,
    headerFontSize: 13,
    fontFamily: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    headerFontWeight: 700,
    foregroundColor: "#1f2937",
    backgroundColor: "#ffffff",
    headerBackgroundColor: "#f8fafc",
    headerTextColor: "#6b7280",
    borderColor: "transparent",
    wrapperBorder: false,
    columnBorder: false,
    headerColumnBorder: { width: 1, style: "solid", color: "#e5e7eb" },
    rowBorder: { width: 1, style: "solid", color: "#f3f4f6" },
    rowHoverColor: "#f8fafc",
    accentColor: "#2563eb",
  });

  const columnDefs = useMemo<ColDef<Transaction>[]>(
    () => [
      { field: "id", headerName: "Transaction ID", minWidth: 140, width: 150 },
      { field: "type", headerName: "Transaction Type", minWidth: 130, width: 140 },
      { field: "ticketNo", headerName: "Ticket Number", minWidth: 140, width: 150 },
      {
        field: "transactionCode",
        headerName: "Transaction Code",
        minWidth: 140,
        width: 150,
        valueGetter: (p) => p.data?.transactionCode || `TC-${(p.data?.id || "").replace("TX-", "")}`,
      },
      { field: "jobOrder", headerName: "Job", minWidth: 120, width: 120 },
      { field: "productName", headerName: "Product", minWidth: 170, flex: 1 },
      {
        field: "lotNo",
        headerName: "Lot",
        minWidth: 110,
        width: 110,
        valueGetter: (p) => p.data?.lotNo || "LOT-1",
      },
      {
        field: "netWeight",
        headerName: "Net Weight",
        minWidth: 130,
        width: 130,
        cellClass: "text-right",
        valueFormatter: (p) => `${Number(p.value || 0).toLocaleString()} t`,
      },
      {
        field: "totalValue",
        headerName: "Total Amount",
        minWidth: 140,
        width: 140,
        cellClass: "text-right",
        valueFormatter: (p) =>
          `$${Number(p.value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      },
      { field: "status", headerName: "Status", minWidth: 120, width: 120 },
      {
        field: "firstWeighTime",
        headerName: "Created Date",
        minWidth: 130,
        width: 130,
        valueFormatter: (p) => (p.value ? String(p.value).split("T")[0] : ""),
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    [],
  );

  return (
    <div>
      <AgGridProvider modules={[AllCommunityModule]}>
        <div className="w-full">
          <AgGridReact
            rowData={matchingTxs}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            theme={gridTheme}
            rowHeight={72}
            headerHeight={55}
            domLayout="autoHeight"
            suppressRowClickSelection
            overlayNoRowsTemplate="No weight-bridge ticket transactions recorded for this customer."
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
