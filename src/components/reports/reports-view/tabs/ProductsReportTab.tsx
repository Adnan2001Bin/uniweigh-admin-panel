import { useMemo, useRef } from "react";
import { FileSpreadsheet } from "lucide-react";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { Transaction, Product } from "../../../../types";
import { exportReportCsv } from "../utils/exportHelpers";

interface ProductsReportTabProps {
  siteFilteredTxs: Transaction[];
  products: Product[];
  selectedSite: string;
  daysRange: number;
}

interface ProductReportRow {
  id: string;
  name: string;
  registeredWeighs: number;
  accumulatedTonnes: number;
  representativeValue: number;
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

function CodeRenderer(params: ICellRendererParams<ProductReportRow>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-black text-gray-950 font-mono whitespace-nowrap">
        {params.value}
      </span>
    </div>
  );
}

function NameRenderer(params: ICellRendererParams<ProductReportRow>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function WeighsRenderer(params: ICellRendererParams<ProductReportRow>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs font-semibold whitespace-nowrap">
        {params.value} loads
      </span>
    </div>
  );
}

function TonnesRenderer(params: ICellRendererParams<ProductReportRow>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs font-mono font-bold text-blue-700 whitespace-nowrap">
        {Number(params.value).toFixed(2)} t
      </span>
    </div>
  );
}

function ValueRenderer(params: ICellRendererParams<ProductReportRow>) {
  return (
    <div className="flex items-center justify-end h-full">
      <span className="text-xs font-mono font-bold text-emerald-700 whitespace-nowrap">
        ${Number(params.value).toFixed(2)}
      </span>
    </div>
  );
}

export default function ProductsReportTab({
  siteFilteredTxs,
  products,
  selectedSite,
  daysRange,
}: ProductsReportTabProps) {
  const gridRef = useRef<AgGridReact>(null);

  const rowData = useMemo<ProductReportRow[]>(() => {
    return products.map((p) => {
      const matchingTxs = siteFilteredTxs.filter((t) => t.productId === p.id);
      const weightSum = matchingTxs.reduce((sum, current) => sum + current.netWeight, 0);
      const costSum = matchingTxs.reduce((sum, current) => sum + current.totalValue, 0);
      return {
        id: p.id,
        name: p.name,
        registeredWeighs: matchingTxs.length,
        accumulatedTonnes: weightSum,
        representativeValue: costSum,
      };
    });
  }, [products, siteFilteredTxs]);

  const columnDefs = useMemo<ColDef<ProductReportRow>[]>(
    () => [
      {
        field: "id",
        headerName: "Material Code",
        width: 140,
        minWidth: 120,
        cellRenderer: CodeRenderer,
      },
      {
        field: "name",
        headerName: "Description",
        width: 260,
        minWidth: 200,
        cellRenderer: NameRenderer,
      },
      {
        field: "registeredWeighs",
        headerName: "Registered Weighs",
        width: 160,
        minWidth: 140,
        cellRenderer: WeighsRenderer,
      },
      {
        field: "accumulatedTonnes",
        headerName: "Accumulated Tonnes",
        width: 170,
        minWidth: 150,
        cellRenderer: TonnesRenderer,
      },
      {
        field: "representativeValue",
        headerName: "Representative Value",
        width: 170,
        minWidth: 150,
        cellRenderer: ValueRenderer,
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
          <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Report Output: Product Volume ledger</h3>
          <p className="text-xs text-gray-400">Timeframe: Prior {daysRange} days operational • Site: {selectedSite}</p>
        </div>
        <button
          onClick={() => exportReportCsv("products", selectedSite, daysRange)}
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
            overlayNoRowsTemplate="No products matched the selected site and date range."
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
