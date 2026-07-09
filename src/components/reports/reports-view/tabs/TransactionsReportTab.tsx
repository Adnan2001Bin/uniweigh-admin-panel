import { useMemo, useRef } from "react";
import { FileSpreadsheet } from "lucide-react";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { Transaction } from "../../../../types";
import { exportReportCsv } from "../utils/exportHelpers";

interface TransactionsReportTabProps {
  siteFilteredTxs: Transaction[];
  selectedSite: string;
  daysRange: number;
  onViewTicketDetails?: (ticketId: string) => void;
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

function TicketRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-bold text-gray-800 whitespace-nowrap">
        {params.value}
      </span>
    </div>
  );
}

function ClientRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-medium text-gray-900 truncate max-w-[160px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function CarrierRenderer(params: ICellRendererParams<Transaction>) {
  const data = params.data;
  return (
    <div className="flex items-center h-full">
      <span className="text-xs text-gray-500 truncate max-w-[160px]" title={data?.carrierName}>
        {data?.carrierName}{" "}
        <span className="font-mono text-gray-450">({data?.vehicleReg})</span>
      </span>
    </div>
  );
}

function MaterialRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs text-blue-700 font-medium truncate max-w-[160px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function WeightRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs font-mono font-bold whitespace-nowrap">
        {Number(params.value).toFixed(2)} t
      </span>
    </div>
  );
}

function CostRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs font-mono font-bold text-gray-900 whitespace-nowrap">
        ${Number(params.value).toFixed(2)}
      </span>
    </div>
  );
}

function AuditCodeRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
        {params.value}
      </span>
    </div>
  );
}

export default function TransactionsReportTab({
  siteFilteredTxs,
  selectedSite,
  daysRange,
  onViewTicketDetails,
}: TransactionsReportTabProps) {
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs = useMemo<ColDef<Transaction>[]>(
    () => [
      {
        field: "ticketNo",
        headerName: "Ticket ID",
        width: 130,
        minWidth: 110,
        cellRenderer: TicketRenderer,
      },
      {
        field: "customerName",
        headerName: "Client",
        width: 170,
        minWidth: 140,
        cellRenderer: ClientRenderer,
      },
      {
        field: "carrierName",
        headerName: "Carrier / Reg",
        width: 180,
        minWidth: 150,
        cellRenderer: CarrierRenderer,
      },
      {
        field: "productName",
        headerName: "Loaded Material",
        width: 170,
        minWidth: 140,
        cellRenderer: MaterialRenderer,
      },
      {
        field: "netWeight",
        headerName: "Net Tonnes",
        width: 130,
        minWidth: 110,
        cellRenderer: WeightRenderer,
      },
      {
        field: "totalValue",
        headerName: "Total Cost",
        width: 130,
        minWidth: 110,
        cellRenderer: CostRenderer,
      },
      {
        field: "id",
        headerName: "Audit Code",
        width: 120,
        minWidth: 100,
        cellRenderer: AuditCodeRenderer,
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
          <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Report Output: Weigh Ticket Registry</h3>
          <p className="text-xs text-gray-400">Timeframe: Prior {daysRange} days operational • Site: {selectedSite}</p>
        </div>
        <button
          onClick={() => exportReportCsv("transactions", selectedSite, daysRange)}
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
            rowData={siteFilteredTxs}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            theme={gridTheme}
            getRowId={(params) => params.data.id}
            rowHeight={56}
            headerHeight={52}
            overlayNoRowsTemplate="No transactions matched the selected site and date range."
            onRowClicked={(event) => {
              if (event.data) onViewTicketDetails?.(event.data.id);
            }}
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
