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
import { Destination } from "../../../types";
import { StatusBadge } from "../../shared/Badges";

interface DestinationsTableProps {
  filteredDestinations: Destination[];
  destinations: Destination[];
  visibleColumns: Record<string, boolean>;
  checkedDestIds: string[];
  setCheckedDestIds: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void;
  onViewDetail: (id: string) => void;
  onEdit: (dest: Destination) => void;
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

function DestinationIdRenderer(params: ICellRendererParams<Destination>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-blue-700 whitespace-nowrap">
        {params.value}
      </div>
    </div>
  );
}

function NameRenderer(params: ICellRendererParams<Destination>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-900 truncate max-w-[180px]" title={params.value}>
        {params.value}
      </div>
    </div>
  );
}

function JobRenderer(params: ICellRendererParams<Destination>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-mono font-semibold text-slate-700 whitespace-nowrap">
        {params.value}
      </div>
      <div className="text-[11px] text-gray-400 whitespace-nowrap">
        Ref: {params.data?.jobRef}
      </div>
    </div>
  );
}

function CustomerRenderer(params: ICellRendererParams<Destination>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-semibold text-gray-800 truncate max-w-[160px]" title={params.value}>
        {params.value}
      </div>
      <div className="text-[11px] text-gray-400 whitespace-nowrap">
        ID: {params.data?.customerId}
      </div>
    </div>
  );
}

function AddressRenderer(params: ICellRendererParams<Destination>) {
  const d = params.data;
  const formatted = d
    ? `${d.addressLine1}${d.addressLine2 ? ", " + d.addressLine2 : ""}, ${d.suburb} ${d.state} ${d.postcode}`
    : "";
  return (
    <div className="flex items-center h-full">
      <span className="text-xs text-gray-600 truncate max-w-[220px]" title={formatted}>
        {formatted}
      </span>
    </div>
  );
}

function PhoneRenderer(params: ICellRendererParams<Destination>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-mono text-gray-700 whitespace-nowrap">
        {params.value || <span className="text-gray-300">N/A</span>}
      </span>
    </div>
  );
}

function StatusRenderer(params: ICellRendererParams<Destination>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

interface ActionGridContext {
  onViewDetail: (id: string) => void;
  onEdit: (dest: Destination) => void;
}

function ActionRenderer(
  params: ICellRendererParams<Destination, unknown, ActionGridContext>,
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
        title="View destination details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onEdit(data);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-emerald-600 transition"
        title="Edit destination"
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

export default function DestinationsTable({
  filteredDestinations,
  destinations,
  visibleColumns,
  checkedDestIds,
  setCheckedDestIds,
  onExport,
  onViewDetail,
  onEdit,
}: DestinationsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi<Destination> | null>(null);

  useEffect(() => {
    if (!gridApi) return;
    const currentIds = gridApi
      .getSelectedRows()
      .map((r) => r.id)
      .sort();
    const targetIds = [...checkedDestIds].sort();
    if (
      currentIds.length === targetIds.length &&
      currentIds.every((id, i) => id === targetIds[i])
    ) {
      return;
    }
    gridApi.forEachNode((node) => {
      node.setSelected(checkedDestIds.includes(node.data?.id ?? ""));
    });
  }, [gridApi, checkedDestIds]);

  const columnDefs = useMemo<ColDef<Destination>[]>(() => {
    const cols: ColDef<Destination>[] = [];

    if (visibleColumns.id) {
      cols.push({
        field: "id",
        headerName: "Destination ID",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: DestinationIdRenderer,
      });
    }
    if (visibleColumns.name) {
      cols.push({
        field: "name",
        headerName: "Destination Name",
        width: 190,
        minWidth: 160,
        headerComponent: HeaderWithMenu,
        cellRenderer: NameRenderer,
      });
    }
    if (visibleColumns.job) {
      cols.push({
        field: "jobId",
        headerName: "Job",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: JobRenderer,
      });
    }
    if (visibleColumns.customer) {
      cols.push({
        field: "customerName",
        headerName: "Customer",
        width: 180,
        minWidth: 160,
        headerComponent: HeaderWithMenu,
        cellRenderer: CustomerRenderer,
      });
    }
    if (visibleColumns.address) {
      cols.push({
        colId: "address",
        headerName: "Address",
        width: 240,
        minWidth: 200,
        headerComponent: HeaderWithMenu,
        cellRenderer: AddressRenderer,
      });
    }
    if (visibleColumns.phone) {
      cols.push({
        field: "phone",
        headerName: "Phone",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: PhoneRenderer,
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
    () => ({ onViewDetail, onEdit }),
    [onViewDetail, onEdit],
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden w-full">
      <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/80 min-h-[56px]">
        {checkedDestIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-xs">
                {checkedDestIds.length}
              </span>
              <span className="text-xs font-bold text-gray-800">
                Destination(s) selected
              </span>
            </div>
            <button
              onClick={() => setCheckedDestIds([])}
              className="text-xs font-bold text-gray-450 hover:text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Showing {filteredDestinations.length} of {destinations.length} records found
            </span>
            <button
              onClick={onExport}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="Export destinations list"
              id="btn-export-destinations"
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
            rowData={filteredDestinations}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            selectionColumnDef={selectionColumnDef}
            theme={gridTheme}
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            getRowId={(params) => params.data.id}
            rowHeight={72}
            headerHeight={55}
            context={gridContext}
            overlayNoRowsTemplate="No destinations matched the given filters or search inputs."
            onCellClicked={(event) => {
              if (event.colDef.colId === "ag-Grid-SelectionColumn") return;
              if (event.colDef.colId === "action") return;
              if (event.data) onViewDetail(event.data.id);
            }}
            onSelectionChanged={(event) =>
              setCheckedDestIds(event.api.getSelectedRows().map((r) => r.id))
            }
            onGridReady={(event: GridReadyEvent<Destination>) =>
              setGridApi(event.api)
            }
          />
        </div>
      </AgGridProvider>

      <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredDestinations.length} of {destinations.length} records
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
