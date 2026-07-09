import { useEffect, useMemo, useRef, useState } from "react";
import { Edit, Eye, MoreVertical, Download, ChevronDown, FileText } from "lucide-react";
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
import { Driver } from "../../../types";
import { StatusBadge } from "../../shared/Badges";

interface DriversTableProps {
  filteredDrivers: Driver[];
  visibleColumns: Record<string, boolean>;
  selectedDriverIds: string[];
  setSelectedDriverIds: React.Dispatch<React.SetStateAction<string[]>>;
  exportDropdownOpen: boolean;
  setExportDropdownOpen: (value: boolean) => void;
  onExport: (
    source: "all" | "selected" | "filtered",
    format: "CSV" | "Excel" | "PDF",
  ) => void;
  onViewDriverDetails: (driverId: string) => void;
  onEditDriver: (driver: Driver) => void;
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

function IdRenderer(params: ICellRendererParams<Driver>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-950 whitespace-nowrap">
        {params.value}
      </div>
    </div>
  );
}

function NameRenderer(params: ICellRendererParams<Driver>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-900 truncate max-w-[180px]" title={params.value}>
        {params.value}
      </div>
    </div>
  );
}

function LicenceRenderer(params: ICellRendererParams<Driver>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-bold font-mono text-gray-700 whitespace-nowrap">
        {params.value}
      </span>
    </div>
  );
}

function PhoneRenderer(params: ICellRendererParams<Driver>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
        {params.value || "0400 000 000"}
      </span>
    </div>
  );
}

function CarterRenderer(params: ICellRendererParams<Driver>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-semibold text-gray-900 truncate max-w-[180px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function StatusRenderer(params: ICellRendererParams<Driver>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

interface ActionGridContext {
  onViewDriverDetails: (id: string) => void;
  onEditDriver: (driver: Driver) => void;
}

function ActionRenderer(
  params: ICellRendererParams<Driver, unknown, ActionGridContext>,
) {
  const data = params.data;
  if (!data) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 h-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onViewDriverDetails(data.id);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-blue-600 transition"
        title="View detailed summary and transactions log"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onEditDriver(data);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-emerald-600 transition"
        title="Modify driver details"
      >
        <Edit className="h-4 w-4" />
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

export default function DriversTable({
  filteredDrivers,
  visibleColumns,
  selectedDriverIds,
  setSelectedDriverIds,
  exportDropdownOpen,
  setExportDropdownOpen,
  onExport,
  onViewDriverDetails,
  onEditDriver,
}: DriversTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi<Driver> | null>(null);

  useEffect(() => {
    if (!gridApi) return;
    const currentIds = gridApi
      .getSelectedRows()
      .map((r) => r.id)
      .sort();
    const targetIds = [...selectedDriverIds].sort();
    if (
      currentIds.length === targetIds.length &&
      currentIds.every((id, i) => id === targetIds[i])
    ) {
      return;
    }
    gridApi.forEachNode((node) => {
      node.setSelected(selectedDriverIds.includes(node.data?.id ?? ""));
    });
  }, [gridApi, selectedDriverIds]);

  const columnDefs = useMemo<ColDef<Driver>[]>(() => {
    const cols: ColDef<Driver>[] = [];

    if (visibleColumns.id) {
      cols.push({
        field: "id",
        headerName: "Driver ID",
        width: 110,
        minWidth: 100,
        headerComponent: HeaderWithMenu,
        cellRenderer: IdRenderer,
      });
    }
    if (visibleColumns.name) {
      cols.push({
        field: "name",
        headerName: "Driver Name",
        width: 180,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: NameRenderer,
      });
    }
    if (visibleColumns.licence) {
      cols.push({
        field: "licenseNumber",
        headerName: "Licence Number",
        width: 150,
        minWidth: 130,
        headerComponent: HeaderWithMenu,
        cellRenderer: LicenceRenderer,
      });
    }
    if (visibleColumns.phone) {
      cols.push({
        field: "phoneNumber",
        headerName: "Phone Number",
        width: 140,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: PhoneRenderer,
      });
    }
    if (visibleColumns.carter) {
      cols.push({
        field: "carrierName",
        headerName: "Carter",
        width: 180,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: CarterRenderer,
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
    () => ({ onViewDriverDetails, onEditDriver }),
    [onViewDriverDetails, onEditDriver],
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden w-full">
      <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/80 min-h-[56px]">
        {selectedDriverIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-xs">
                {selectedDriverIds.length}
              </span>
              <span className="text-xs font-bold text-gray-800">
                Driver(s) selected
              </span>
            </div>
            <button
              onClick={() => setSelectedDriverIds([])}
              className="text-xs font-bold text-gray-450 hover:text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Showing {filteredDrivers.length} registered logistics drivers
            </span>
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="rounded-lg border border-gray-220 bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 select-none"
              >
                <Download className="h-3.5 w-3.5 text-gray-500" />
                Export Data
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 text-xs">
                  <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-gray-100 mb-1">Export Full Driver List</div>
                  <button onClick={() => onExport("all", "CSV")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"><FileText className="h-3 w-3 text-emerald-600" />Export Full List (CSV)</button>
                  <button onClick={() => onExport("all", "Excel")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"><FileText className="h-3 w-3 text-blue-600" />Export Full List (Excel)</button>
                  <button onClick={() => onExport("all", "PDF")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"><FileText className="h-3 w-3 text-red-600" />Print Full List (PDF)</button>
                  <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-t border-gray-100 my-1">Export Selected Rows ({selectedDriverIds.length})</div>
                  <button onClick={() => onExport("selected", "CSV")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px] disabled:opacity-50" disabled={selectedDriverIds.length === 0}><FileText className="h-3 w-3 text-emerald-600" />Export Selected (CSV)</button>
                  <button onClick={() => onExport("selected", "PDF")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px] disabled:opacity-50" disabled={selectedDriverIds.length === 0}><FileText className="h-3 w-3 text-red-600" />Print Selected PDF (PDF)</button>
                  <div className="px-3 py-1 font-black text-gray-400 text-[9px] uppercase tracking-widest border-b border-t border-gray-100 my-1">Export Filtered Results ({filteredDrivers.length})</div>
                  <button onClick={() => onExport("filtered", "CSV")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"><FileText className="h-3 w-3 text-emerald-600" />Export Filtered (CSV)</button>
                  <button onClick={() => onExport("filtered", "PDF")} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-semibold text-gray-700 flex items-center gap-2 text-[11px]"><FileText className="h-3 w-3 text-red-600" />Print Filtered PDF (PDF)</button>
                </div>
              )}
            </div>
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
            rowData={filteredDrivers}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            selectionColumnDef={selectionColumnDef}
            theme={gridTheme}
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            getRowId={(params) => params.data.id}
            rowHeight={72}
            headerHeight={60}
            context={gridContext}
            overlayNoRowsTemplate="No Drivers found matching your search criteria or active filters."
            onCellClicked={(event) => {
              if (event.colDef.colId === "ag-Grid-SelectionColumn") return;
              if (event.colDef.colId === "action") return;
              if (event.data) onViewDriverDetails(event.data.id);
            }}
            onSelectionChanged={(event) =>
              setSelectedDriverIds(event.api.getSelectedRows().map((r) => r.id))
            }
            onGridReady={(event: GridReadyEvent<Driver>) =>
              setGridApi(event.api)
            }
          />
        </div>
      </AgGridProvider>

      <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredDrivers.length} records
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
