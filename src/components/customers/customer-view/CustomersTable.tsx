import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle as XCircleIcon,
  X,
  Eye,
  Edit,
  Phone,
  Mail,
  MoreVertical,
  Download,
  ChevronDown,
} from "lucide-react";
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
import { Customer } from "../../../types";
import { StatusBadge } from "../../shared/Badges";

interface CustomersTableProps {
  processedCustomers: Customer[];
  customers: Customer[];
  visibleColumns: Record<string, boolean>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onExportClick: (scope: "current" | "filtered" | "selected") => void;
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer, e: React.MouseEvent) => void;
  onUpdateCustomer: (updatedCustomer: Customer) => void;
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

function CustomerIdRenderer(params: ICellRendererParams<Customer>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="font-mono text-xs font-bold text-gray-500 whitespace-nowrap">
        {params.value}
      </div>
      {params.data?.customerCode && (
        <div className="text-[11px] text-gray-400 whitespace-nowrap">
          {params.data.customerCode}
        </div>
      )}
    </div>
  );
}

function NameRenderer(params: ICellRendererParams<Customer>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-950 group-hover:text-blue-700 group-hover:underline truncate max-w-[200px] transition-colors">
        {params.value}
      </div>
      <div className="text-[11px] text-gray-450 truncate max-w-[200px]">
        {params.data?.pricingTier || params.data?.billingAddress || ""}
      </div>
    </div>
  );
}

function ContactRenderer(params: ICellRendererParams<Customer>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-semibold text-gray-700 truncate max-w-[160px]">
        {params.value}
      </span>
    </div>
  );
}

function PhoneRenderer(params: ICellRendererParams<Customer>) {
  return (
    <div className="flex items-center h-full">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 whitespace-nowrap">
        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span>{params.value || "N/A"}</span>
      </div>
    </div>
  );
}

function EmailRenderer(params: ICellRendererParams<Customer>) {
  return (
    <div className="flex items-center h-full">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 truncate max-w-[200px] select-all">
        <Mail className="h-3.5 w-3.5 text-gray-350 shrink-0" />
        <span className="truncate">{params.value || "N/A"}</span>
      </div>
    </div>
  );
}

function StatusRenderer(params: ICellRendererParams<Customer>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

interface ActionGridContext {
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer, e: React.MouseEvent) => void;
}

function ActionRenderer(
  params: ICellRendererParams<Customer, unknown, ActionGridContext>,
) {
  const data = params.data as Customer;
  return (
    <div className="flex items-center justify-end h-full gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onSelectCustomer(data);
        }}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
        title="View Customer Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onEditCustomer(data, e);
        }}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
        title="Edit Customer Details"
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
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center justify-between ${!pinned ? "bg-slate-50/50" : ""
              }`}
          >
            No Pin {pinned === null && <span className="text-blue-600">✓</span>}
          </button>
          <button
            onClick={applyPin("left")}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center justify-between ${pinned === "left" ? "bg-slate-50/50" : ""
              }`}
          >
            Pin Left {pinned === "left" && <span className="text-blue-600">✓</span>}
          </button>
          <button
            onClick={applyPin("right")}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 flex items-center justify-between ${pinned === "right" ? "bg-slate-50/50" : ""
              }`}
          >
            Pin Right {pinned === "right" && <span className="text-blue-600">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CustomersTable({
  processedCustomers,
  customers,
  visibleColumns,
  selectedIds,
  setSelectedIds,
  onExportClick,
  onSelectCustomer,
  onEditCustomer,
  onUpdateCustomer,
}: CustomersTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi<Customer> | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleBulkActivate = () => {
    if (selectedIds.length === 0) return;
    const suspended = customers.filter(
      (c) => selectedIds.includes(c.id) && c.status !== "Active",
    );
    if (suspended.length === 0) {
      alert("All of the selected customers are already Active.");
      return;
    }
    const confirmActivate = confirm(
      `Are you sure you want to bulk ACTIVATE the ${suspended.length} eligible selected customer(s)?`,
    );
    if (!confirmActivate) return;

    suspended.forEach((c) => {
      onUpdateCustomer({ ...c, status: "Active" });
    });
    alert(`Successfully activated ${suspended.length} customer(s).`);
    setSelectedIds([]);
  };

  const handleBulkSuspend = () => {
    if (selectedIds.length === 0) return;
    const active = customers.filter(
      (c) => selectedIds.includes(c.id) && c.status !== "Suspended",
    );
    if (active.length === 0) {
      alert("All of the selected customers are already Suspended.");
      return;
    }
    const confirmSuspend = confirm(
      `Are you sure you want to bulk SUSPEND the ${active.length} selected customer(s)?`,
    );
    if (!confirmSuspend) return;

    active.forEach((c) => {
      onUpdateCustomer({ ...c, status: "Suspended" });
    });
    alert(`Successfully suspended ${active.length} customer(s).`);
    setSelectedIds([]);
  };

  // Keep AG Grid selection in sync with externally-controlled selectedIds.
  useEffect(() => {
    if (!gridApi) return;
    const currentIds = gridApi
      .getSelectedRows()
      .map((r) => r.id)
      .sort();
    const targetIds = [...selectedIds].sort();
    if (
      currentIds.length === targetIds.length &&
      currentIds.every((id, i) => id === targetIds[i])
    ) {
      return;
    }
    gridApi.forEachNode((node) => {
      node.setSelected(selectedIds.includes(node.data?.id ?? ""));
    });
  }, [gridApi, selectedIds]);

  const columnDefs = useMemo<ColDef<Customer>[]>(() => {
    const cols: ColDef<Customer>[] = [];

    if (visibleColumns.customerId) {
      cols.push({
        field: "id",
        headerName: "Customer ID",
        width: 140,
        minWidth: 130,
        headerComponent: HeaderWithMenu,
        cellRenderer: CustomerIdRenderer,
      });
    }
    if (visibleColumns.name) {
      cols.push({
        field: "name",
        headerName: "Customer Name",
        width: 220,
        minWidth: 200,
        flex: 1,
        headerComponent: HeaderWithMenu,
        cellRenderer: NameRenderer,
      });
    }
    if (visibleColumns.contact) {
      cols.push({
        field: "contactPerson",
        headerName: "Primary Contact",
        width: 170,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: ContactRenderer,
      });
    }
    if (visibleColumns.phone) {
      cols.push({
        field: "phone",
        headerName: "Phone Number",
        width: 160,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: PhoneRenderer,
      });
    }
    if (visibleColumns.email) {
      cols.push({
        field: "email",
        headerName: "Email Address",
        width: 210,
        minWidth: 190,
        headerComponent: HeaderWithMenu,
        cellRenderer: EmailRenderer,
      });
    }
    if (visibleColumns.status) {
      cols.push({
        field: "status",
        headerName: "Status",
        width: 120,
        minWidth: 110,
        headerComponent: HeaderWithMenu,
        cellRenderer: StatusRenderer,
      });
    }
    if (visibleColumns.action) {
      cols.push({
        colId: "action",
        headerName: "Actions",
        width: 100,
        minWidth: 100,
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
      width: 44,
      maxWidth: 44,
      pinned: "left" as const,
      sortable: false,
      resizable: false,
    }),
    [],
  );

  const gridContext = useMemo<ActionGridContext>(
    () => ({ onSelectCustomer, onEditCustomer }),
    [onSelectCustomer, onEditCustomer],
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden w-full">
      <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/80 min-h-[56px] transition-colors duration-200">
        {selectedIds.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-gray-800">
                customer record(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkActivate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-sm transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Activate Selected
              </button>
              <button
                onClick={handleBulkSuspend}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-150 cursor-pointer shadow-xs transition"
              >
                <XCircleIcon className="h-3.5 w-3.5" />
                Suspend Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold text-gray-450 hover:text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition"
              >
                <span className="inline-flex items-center gap-1">
                  <X className="h-3.5 w-3.5" />
                  Clear
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Showing {processedCustomers.length} of {customers.length} customer
              records
            </span>
            <div className="relative">
              <button
                id="btn-export-dropdown"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Records</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-xl border border-gray-100 bg-white py-2 shadow-lg ring-1 ring-black/5 animate-fade-in text-xs text-gray-700">
                  <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-450">
                    Select Export Scope
                  </div>
                  <button
                    onClick={() => {
                      onExportClick("current");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Export Current View ({customers.length} items)</span>
                  </button>
                  <button
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                      onExportClick("selected");
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between ${selectedIds.length === 0 ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                  >
                    <span>Export Selected Rows ({selectedIds.length} items)</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportClick("filtered");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Export Filtered Results ({processedCustomers.length} items)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AgGridProvider modules={[AllCommunityModule]}>
        <div
          className="w-full"
          style={{ height: "calc(100vh - 360px)", minHeight: 380 }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={processedCustomers}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            selectionColumnDef={selectionColumnDef}
            theme={gridTheme}
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            getRowId={(params) => params.data.id}
            rowHeight={75}
            headerHeight={55}
            context={gridContext}
            overlayNoRowsTemplate="No customer records matching search criteria."
            onCellClicked={(event) => {
              if (event.colDef.colId === "ag-Grid-SelectionColumn") return;
              if (event.colDef.colId === "action") return;
              if (event.data) onSelectCustomer(event.data);
            }}
            onSelectionChanged={(event) =>
              setSelectedIds(event.api.getSelectedRows().map((r) => r.id))
            }
            onGridReady={(event: GridReadyEvent<Customer>) =>
              setGridApi(event.api)
            }
          />
        </div>
      </AgGridProvider>

      <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {processedCustomers.length} of {customers.length} customer
          records
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
