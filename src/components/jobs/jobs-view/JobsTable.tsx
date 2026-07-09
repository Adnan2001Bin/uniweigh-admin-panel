import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Edit2, MoreVertical, Download } from "lucide-react";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  type ICellRendererParams,
  type IHeaderParams,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { Job } from "../../../types";
import { StatusBadge } from "../../shared/Badges";

interface JobsTableProps {
  filteredJobs: Job[];
  totalJobs: number;
  jobDeliveredQuantities: Record<string, number>;
  visibleColumns: Record<string, boolean>;
  checkedJobIds: string[];
  setCheckedJobIds: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void;
  onViewDetail: (jobId: string) => void;
  onEdit: (job: Job) => void;
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
  selectedRowBackgroundColor: "#eff6ff",
  accentColor: "#2563eb",
});

function JobIdRenderer(params: ICellRendererParams<Job>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-blue-700 whitespace-nowrap">
        {params.value}
      </div>
      <div className="font-mono text-[11px] text-gray-400 whitespace-nowrap">
        {params.data?.customerOrderRef}
      </div>
    </div>
  );
}

function CustomerRenderer(params: ICellRendererParams<Job>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-900 truncate max-w-[180px]" title={params.value}>
        {params.value}
      </div>
      <div className="text-[11px] text-gray-450 whitespace-nowrap">
        ID: {params.data?.customerId}
      </div>
    </div>
  );
}

function ProductRenderer(params: ICellRendererParams<Job>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">
        {params.value}
      </div>
      <div className="text-[11px] text-gray-400 whitespace-nowrap">
        {params.data?.productId}
      </div>
    </div>
  );
}

function QuantityRenderer(params: ICellRendererParams<Job>) {
  const delivered = params.data ? (params.context.jobDeliveredQuantities[params.data.id] || 0) : 0;
  const remaining = params.data ? Math.max(0, params.data.orderQty - delivered) : 0;
  const column = params.column.getColId();

  let value = 0;
  let colorClass = "text-gray-900";
  let label = "";

  if (column === "orderQty") {
    value = params.data?.orderQty || 0;
    colorClass = "text-gray-900";
    label = "Order";
  } else if (column === "deliveredQty") {
    value = delivered;
    colorClass = "text-emerald-700";
    label = "Delivered";
  } else {
    value = remaining;
    colorClass = "text-amber-700";
    label = "Remaining";
  }

  return (
    <div className="flex flex-col justify-center items-end h-full">
      <div className={`text-xs font-black font-mono ${colorClass} whitespace-nowrap`}>
        {value.toLocaleString()} <span className="text-[10px] font-semibold text-gray-400">t</span>
      </div>
      <div className="text-[10px] text-gray-400 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function StatusRenderer(params: ICellRendererParams<Job>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

interface ActionGridContext {
  onViewDetail: (jobId: string) => void;
  onEdit: (job: Job) => void;
  jobDeliveredQuantities: Record<string, number>;
}

function ActionRenderer(
  params: ICellRendererParams<Job, unknown, ActionGridContext>,
) {
  const data = params.data;
  if (!data) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 h-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onViewDetail(data.id);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-blue-600 transition"
        title="View job details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onEdit(data);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-emerald-600 transition"
        title="Edit job"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function HeaderWithMenu(params: IHeaderParams) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const colId = params.column.getColId();
  const pinned = params.column.getPinned();
  const sort = params.column.getSort();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(!open);
  };

  const applySort = (sortDir: "asc" | "desc" | null) => (e: React.MouseEvent) => {
    e.stopPropagation();
    params.api.applyColumnState({
      state: [{ colId, sort: sortDir }],
    });
    setOpen(false);
  };

  const applyPin = (pin: "left" | "right" | null) => (e: React.MouseEvent) => {
    e.stopPropagation();
    params.api.applyColumnState({
      state: [{ colId, pinned: pin }],
    });
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between h-full w-full relative pr-1">
      <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wider truncate pr-2">
        {params.displayName}
      </span>
      <div className="flex items-center gap-1">
        {sort && (
          <span className="text-gray-400 text-[10px]">
            {sort === "asc" ? "↑" : "↓"}
          </span>
        )}
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          title="Column options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {open && menuPos && (
        <div
          ref={menuRef}
          className="fixed w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-1 text-xs"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={applySort("asc")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2"
          >
            <span>↑</span> Sort Ascending
          </button>
          <button
            onClick={applySort("desc")}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center gap-2"
          >
            <span>↓</span> Sort Descending
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={applyPin(null)}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center justify-between ${!pinned ? "bg-slate-50/50" : ""}`}
          >
            No Pin {pinned === null && <span className="text-blue-600">✓</span>}
          </button>
          <button
            onClick={applyPin("left")}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center justify-between ${pinned === "left" ? "bg-slate-50/50" : ""}`}
          >
            Pin Left {pinned === "left" && <span className="text-blue-600">✓</span>}
          </button>
          <button
            onClick={applyPin("right")}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center justify-between ${pinned === "right" ? "bg-slate-50/50" : ""}`}
          >
            Pin Right {pinned === "right" && <span className="text-blue-600">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

export default function JobsTable({
  filteredJobs,
  totalJobs,
  jobDeliveredQuantities,
  visibleColumns,
  checkedJobIds,
  setCheckedJobIds,
  onExport,
  onViewDetail,
  onEdit,
}: JobsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi<Job> | null>(null);

  useEffect(() => {
    if (!gridApi) return;
    const currentIds = gridApi
      .getSelectedRows()
      .map((r) => r.id)
      .sort();
    const targetIds = [...checkedJobIds].sort();
    if (
      currentIds.length === targetIds.length &&
      currentIds.every((id, i) => id === targetIds[i])
    ) {
      return;
    }
    gridApi.forEachNode((node) => {
      node.setSelected(checkedJobIds.includes(node.data?.id ?? ""));
    });
  }, [gridApi, checkedJobIds]);

  const columnDefs = useMemo<ColDef<Job>[]>(() => {
    const cols: ColDef<Job>[] = [];

    if (visibleColumns.jobId) {
      cols.push({
        field: "id",
        headerName: "Job ID",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: JobIdRenderer,
      });
    }
    if (visibleColumns.customer) {
      cols.push({
        field: "customerName",
        headerName: "Customer",
        width: 190,
        minWidth: 170,
        headerComponent: HeaderWithMenu,
        cellRenderer: CustomerRenderer,
      });
    }
    if (visibleColumns.product) {
      cols.push({
        field: "productName",
        headerName: "Product",
        width: 170,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: ProductRenderer,
      });
    }
    if (visibleColumns.orderQty) {
      cols.push({
        field: "orderQty",
        headerName: "Order Quantity",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: QuantityRenderer,
      });
    }
    if (visibleColumns.deliveredQty) {
      cols.push({
        colId: "deliveredQty",
        headerName: "Delivered Quantity",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: QuantityRenderer,
      });
    }
    if (visibleColumns.remainingQty) {
      cols.push({
        colId: "remainingQty",
        headerName: "Remaining Quantity",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: QuantityRenderer,
      });
    }
    if (visibleColumns.status) {
      cols.push({
        field: "status",
        headerName: "Status",
        width: 110,
        minWidth: 100,
        headerComponent: HeaderWithMenu,
        cellRenderer: StatusRenderer,
      });
    }
    if (visibleColumns.actions) {
      cols.push({
        colId: "action",
        headerName: "Actions",
        width: 100,
        minWidth: 90,
        sortable: false,
        headerComponent: HeaderWithMenu,
        cellRenderer: ActionRenderer,
      });
    }

    return cols;
  }, [visibleColumns]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    [],
  );

  const selectionColumnDef = useMemo(
    () => ({
      width: 52,
      maxWidth: 52,
      pinned: "left" as const,
      sortable: false,
      resizable: false,
      headerClass: "ag-selection-header",
      cellClass: "ag-selection-cell",
    }),
    [],
  );

  const gridContext = useMemo(
    () => ({ onViewDetail, onEdit, jobDeliveredQuantities }),
    [onViewDetail, onEdit, jobDeliveredQuantities],
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden w-full">
      <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/80 min-h-[56px]">
        {checkedJobIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-xs">
                {checkedJobIds.length}
              </span>
              <span className="text-xs font-bold text-gray-800">
                Job contract(s) selected
              </span>
            </div>
            <button
              onClick={() => setCheckedJobIds([])}
              className="text-xs font-bold text-gray-450 hover:text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Showing {filteredJobs.length} of {totalJobs} records found
            </span>
            <button
              onClick={onExport}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="Export job ledger reports"
            >
              <Download className="h-3.5 w-3.5 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>

      <AgGridProvider modules={[AllCommunityModule]}>
        <div
          className="w-full"
          style={{ height: "calc(100vh - 360px)", minHeight: 360 }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={filteredJobs}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            selectionColumnDef={selectionColumnDef}
            theme={gridTheme}
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            getRowId={(params) => params.data.id}
            rowHeight={72}
            headerHeight={55}
            context={gridContext}
            overlayNoRowsTemplate="No jobs found matching the search criteria or selected filters."
            onCellClicked={(event) => {
              if (event.colDef.colId === "ag-Grid-SelectionColumn") return;
              if (event.colDef.colId === "action") return;
              if (event.data) onViewDetail(event.data.id);
            }}
            onSelectionChanged={(event) =>
              setCheckedJobIds(event.api.getSelectedRows().map((r) => r.id))
            }
            onGridReady={(event: GridReadyEvent<Job>) =>
              setGridApi(event.api)
            }
          />
        </div>
      </AgGridProvider>

      <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredJobs.length} of {totalJobs} records
        </span>
        <div className="flex gap-1.5">
          <button
            disabled
            className="rounded-md border border-gray-100 bg-gray-50/50 px-3 py-1.5 text-xs text-gray-400 cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 font-semibold shadow-xs"
          >
            1
          </button>
          <button
            disabled
            className="rounded-md border border-gray-100 bg-gray-50/50 px-3 py-1.5 text-xs text-gray-400 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
