import { useMemo } from "react";
import { FileText } from "lucide-react";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";

interface CustomerJob {
  id: string;
  ref: string;
  product: string;
  orderQty: number;
  delQty: number;
  status: string;
}

interface JobsTabProps {
  customerJobs: CustomerJob[];
}

export default function JobsTab({ customerJobs }: JobsTabProps) {
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

  const columnDefs = useMemo<ColDef<CustomerJob>[]>(
    () => [
      { field: "id", headerName: "Job ID", minWidth: 130, width: 140 },
      {
        field: "ref",
        headerName: "Customer Order Reference",
        minWidth: 210,
        width: 220,
      },
      { field: "product", headerName: "Product", minWidth: 210, flex: 1 },
      {
        field: "orderQty",
        headerName: "Order Quantity",
        minWidth: 140,
        width: 150,
        cellClass: "text-right",
        valueFormatter: (p) => `${Number(p.value || 0).toLocaleString()} t`,
      },
      {
        field: "delQty",
        headerName: "Delivered Quantity",
        minWidth: 150,
        width: 160,
        cellClass: "text-right",
        valueFormatter: (p) => `${Number(p.value || 0).toLocaleString()} t`,
      },
      {
        colId: "remainingQty",
        headerName: "Remaining Quantity",
        minWidth: 150,
        width: 160,
        cellClass: "text-right",
        valueGetter: (p) => Math.max(0, (p.data?.orderQty || 0) - (p.data?.delQty || 0)),
        valueFormatter: (p) =>
          Number(p.value || 0) === 0
            ? "0.00 t (Filled)"
            : `${Number(p.value || 0).toLocaleString()} t`,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        width: 120,
      },
      {
        colId: "actions",
        headerName: "Actions",
        minWidth: 110,
        width: 110,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<CustomerJob>) => (
          <button
            onClick={() =>
              alert(
                `Reviewing operational ledger dossier for supply contract reference ${params.data?.ref}`,
              )
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            <FileText className="h-3 w-3" />
            <span>Details</span>
          </button>
        ),
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
            rowData={customerJobs}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            theme={gridTheme}
            rowHeight={72}
            headerHeight={55}
            domLayout="autoHeight"
            suppressRowClickSelection
            overlayNoRowsTemplate="No jobs found for this customer."
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
