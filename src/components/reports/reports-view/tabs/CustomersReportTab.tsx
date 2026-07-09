import { useMemo, useRef } from "react";
import { FileSpreadsheet } from "lucide-react";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { Transaction, Customer } from "../../../../types";
import { exportReportCsv } from "../utils/exportHelpers";

interface CustomersReportTabProps {
  siteFilteredTxs: Transaction[];
  customers: Customer[];
  selectedSite: string;
  daysRange: number;
}

interface CustomerReportRow {
  id: string;
  name: string;
  uninvoicedTons: number;
  invoicedTons: number;
  outstandingBalance: number;
}

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

function IdRenderer(params: ICellRendererParams<CustomerReportRow>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-bold font-mono text-gray-500 whitespace-nowrap">
        {params.value}
      </span>
    </div>
  );
}

function NameRenderer(params: ICellRendererParams<CustomerReportRow>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function TonsRenderer(params: ICellRendererParams<CustomerReportRow>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs whitespace-nowrap">
        {Number(params.value).toFixed(2)} t
      </span>
    </div>
  );
}

function BalanceRenderer(params: ICellRendererParams<CustomerReportRow>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs font-mono font-black text-emerald-700 whitespace-nowrap">
        ${Number(params.value).toFixed(2)}
      </span>
    </div>
  );
}

export default function CustomersReportTab({
  siteFilteredTxs,
  customers,
  selectedSite,
  daysRange,
}: CustomersReportTabProps) {
  const gridRef = useRef<AgGridReact>(null);

  const rowData = useMemo<CustomerReportRow[]>(() => {
    return customers.map((c) => {
      const allClientTxs = siteFilteredTxs.filter((t) => t.customerId === c.id);
      const uninvoicedSumRegs = allClientTxs.filter((t) => t.status !== "Invoiced");
      const invoicedSumRegs = allClientTxs.filter((t) => t.status === "Invoiced");

      const uninvoicedTons = uninvoicedSumRegs.reduce((s, curr) => s + curr.netWeight, 0);
      const invoicedTons = invoicedSumRegs.reduce((s, curr) => s + curr.netWeight, 0);
      const costSum = uninvoicedSumRegs.reduce((s, curr) => s + curr.totalValue, 0);

      return {
        id: c.id,
        name: c.name,
        uninvoicedTons,
        invoicedTons,
        outstandingBalance: costSum,
      };
    });
  }, [customers, siteFilteredTxs]);

  const columnDefs = useMemo<ColDef<CustomerReportRow>[]>(
    () => [
      {
        field: "id",
        headerName: "Debtor ID",
        width: 120,
        minWidth: 100,
        cellRenderer: IdRenderer,
      },
      {
        field: "name",
        headerName: "Customer Client Name",
        width: 240,
        minWidth: 180,
        cellRenderer: NameRenderer,
      },
      {
        field: "uninvoicedTons",
        headerName: "Uninvoiced Weights",
        width: 160,
        minWidth: 140,
        cellRenderer: TonsRenderer,
      },
      {
        field: "invoicedTons",
        headerName: "Invoiced Weights",
        width: 150,
        minWidth: 130,
        cellRenderer: TonsRenderer,
      },
      {
        field: "outstandingBalance",
        headerName: "Outstanding Period Balance",
        width: 200,
        minWidth: 170,
        cellRenderer: BalanceRenderer,
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
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Report Output: Client Ledger Invoice Breakdown</h3>
          <p className="text-xs text-gray-400">Timeframe: Prior {daysRange} days operational • Site: {selectedSite}</p>
        </div>
        <button
          onClick={() => exportReportCsv("customers", selectedSite, daysRange)}
          className="rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5 focus:outline-hidden"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export formatted CSV</span>
        </button>
      </div>

      <AgGridProvider modules={[AllCommunityModule]}>
        <div
          className="w-full"
          style={{ height: "calc(100vh - 420px)", minHeight: 280 }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            theme={gridTheme}
            getRowId={(params) => params.data.id}
            rowHeight={56}
            headerHeight={52}
            overlayNoRowsTemplate="No customers matched the selected site and date range."
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
