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
import { DestinationContact } from "../../../types";
import { StatusBadge } from "../../shared/Badges";

interface ContactsTableProps {
  filteredContacts: DestinationContact[];
  contacts: DestinationContact[];
  visibleColumns: Record<string, boolean>;
  selectedContactIds: string[];
  setSelectedContactIds: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void;
  onViewDetail: (contact: DestinationContact) => void;
  onEdit: (contact: DestinationContact) => void;
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

function ContactIdRenderer(params: ICellRendererParams<DestinationContact>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-950 whitespace-nowrap">
        {params.value}
      </div>
      <div className="font-mono text-[11px] text-gray-400 whitespace-nowrap">
        {params.data?.contactCode}
      </div>
    </div>
  );
}

function NameRenderer(params: ICellRendererParams<DestinationContact>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-900 truncate max-w-[160px]" title={params.value}>
        {params.value}
      </div>
      <div className="text-[11px] text-gray-450 truncate max-w-[160px]">
        {params.data?.role}
      </div>
    </div>
  );
}

function CustomerRenderer(params: ICellRendererParams<DestinationContact>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-semibold text-gray-800 truncate max-w-[180px]" title={params.value}>
        {params.value}
      </div>
      <div className="text-[11px] text-gray-400 whitespace-nowrap">
        ID: {params.data?.customerId}
      </div>
    </div>
  );
}

function PhoneRenderer(params: ICellRendererParams<DestinationContact>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-mono text-gray-700 whitespace-nowrap">
        {params.value || "N/A"}
      </div>
      <div className="text-[11px] text-gray-400 font-mono whitespace-nowrap">
        {params.data?.mobile}
      </div>
    </div>
  );
}

function EmailRenderer(params: ICellRendererParams<DestinationContact>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-mono text-gray-650 truncate max-w-[200px]">
        {params.value || "N/A"}
      </span>
    </div>
  );
}

function BooleanRenderer(params: ICellRendererParams<DestinationContact>) {
  const value = params.value as boolean;
  const label = params.colDef?.headerName || "";
  const isSafety = label.toLowerCase().includes("safety");
  const isSiteAccess = label.toLowerCase().includes("site");
  const colorClass = value
    ? isSafety
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
      : isSiteAccess
        ? "bg-blue-50 text-blue-700 border-blue-200/50"
        : "bg-rose-50 text-rose-700 border-rose-200/50"
    : "bg-gray-50 text-gray-400 border-gray-200/50";
  return (
    <div className="flex items-center justify-center h-full">
      <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[9px] font-bold border min-w-[44px] text-center whitespace-nowrap ${colorClass}`}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}

function StatusRenderer(params: ICellRendererParams<DestinationContact>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

interface ActionGridContext {
  onViewDetail: (contact: DestinationContact) => void;
  onEdit: (contact: DestinationContact) => void;
}

function ActionRenderer(
  params: ICellRendererParams<DestinationContact, unknown, ActionGridContext>,
) {
  const data = params.data;
  if (!data) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 h-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onViewDetail(data);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-blue-600 transition"
        title="View contact details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onEdit(data);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-emerald-600 transition"
        title="Edit contact"
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

export default function ContactsTable({
  filteredContacts,
  contacts,
  visibleColumns,
  selectedContactIds,
  setSelectedContactIds,
  onExport,
  onViewDetail,
  onEdit,
}: ContactsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi<DestinationContact> | null>(null);

  useEffect(() => {
    if (!gridApi) return;
    const currentIds = gridApi
      .getSelectedRows()
      .map((r) => r.id)
      .sort();
    const targetIds = [...selectedContactIds].sort();
    if (
      currentIds.length === targetIds.length &&
      currentIds.every((id, i) => id === targetIds[i])
    ) {
      return;
    }
    gridApi.forEachNode((node) => {
      node.setSelected(selectedContactIds.includes(node.data?.id ?? ""));
    });
  }, [gridApi, selectedContactIds]);

  const columnDefs = useMemo<ColDef<DestinationContact>[]>(() => {
    const cols: ColDef<DestinationContact>[] = [];

    if (visibleColumns.id) {
      cols.push({
        field: "id",
        headerName: "Contact ID",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: ContactIdRenderer,
      });
    }
    if (visibleColumns.name) {
      cols.push({
        field: "name",
        headerName: "Contact Name",
        width: 170,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: NameRenderer,
      });
    }
    if (visibleColumns.customer) {
      cols.push({
        field: "customerName",
        headerName: "Associated Company / Customer",
        width: 200,
        minWidth: 180,
        headerComponent: HeaderWithMenu,
        cellRenderer: CustomerRenderer,
      });
    }
    if (visibleColumns.phone) {
      cols.push({
        field: "phone",
        headerName: "Phone",
        width: 140,
        minWidth: 130,
        headerComponent: HeaderWithMenu,
        cellRenderer: PhoneRenderer,
      });
    }
    if (visibleColumns.email) {
      cols.push({
        field: "email",
        headerName: "Email",
        width: 200,
        minWidth: 160,
        headerComponent: HeaderWithMenu,
        cellRenderer: EmailRenderer,
      });
    }
    if (visibleColumns.safety) {
      cols.push({
        field: "isSafetyContact",
        headerName: "Safety Contact",
        width: 120,
        minWidth: 110,
        headerComponent: HeaderWithMenu,
        cellRenderer: BooleanRenderer,
      });
    }
    if (visibleColumns.siteAccess) {
      cols.push({
        field: "isSiteAccessContact",
        headerName: "Site Access Contact",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: BooleanRenderer,
      });
    }
    if (visibleColumns.emergency) {
      cols.push({
        field: "isEmergencyContact",
        headerName: "Emergency Contact",
        width: 130,
        minWidth: 120,
        headerComponent: HeaderWithMenu,
        cellRenderer: BooleanRenderer,
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
        {selectedContactIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-xs">
                {selectedContactIds.length}
              </span>
              <span className="text-xs font-bold text-gray-800">
                Contact(s) selected
              </span>
            </div>
            <button
              onClick={() => setSelectedContactIds([])}
              className="text-xs font-bold text-gray-450 hover:text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Showing {filteredContacts.length} of {contacts.length} records found
            </span>
            <button
              onClick={onExport}
              className="rounded-lg border border-gray-220 bg-white text-xs font-bold text-gray-700 px-4 py-2 hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4 text-indigo-600" />
              <span>Export Reports</span>
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
            rowData={filteredContacts}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            selectionColumnDef={selectionColumnDef}
            theme={gridTheme}
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            getRowId={(params) => params.data.id}
            rowHeight={80}
            headerHeight={60}
            context={gridContext}
            overlayNoRowsTemplate="No destination contacts matched the given filters or search inputs."
            onCellClicked={(event) => {
              if (event.colDef.colId === "ag-Grid-SelectionColumn") return;
              if (event.colDef.colId === "action") return;
              if (event.data) onViewDetail(event.data);
            }}
            onSelectionChanged={(event) =>
              setSelectedContactIds(event.api.getSelectedRows().map((r) => r.id))
            }
            onGridReady={(event: GridReadyEvent<DestinationContact>) =>
              setGridApi(event.api)
            }
          />
        </div>
      </AgGridProvider>

      <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredContacts.length} of {contacts.length} records
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
