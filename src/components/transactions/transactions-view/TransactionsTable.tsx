import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  X,
  Eye,
  Calendar,
  Truck,
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
import { Transaction, TransactionStatus } from "../../../types";
import { StatusBadge, TypeBadge } from "../../shared/Badges";

interface TransactionsTableProps {
  processedTransactions: Transaction[];
  transactions: Transaction[];
  visibleColumns: Record<string, boolean>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  showExportMenu: boolean;
  setShowExportMenu: (show: boolean) => void;
  onExportScope: (scope: string) => void;
  onViewTicketDetails: (ticketId: string) => void;
  onUpdateTransaction: (updatedTx: Transaction) => void;
  onBulkComment: () => void;
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

function TicketCodeRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-bold text-gray-950 whitespace-nowrap">
        {params.value}
      </div>
      <div className="font-mono text-[11px] text-gray-400 whitespace-nowrap">
        {params.data?.id}
      </div>
    </div>
  );
}

function DateRenderer(params: ICellRendererParams<Transaction>) {
  const value = params.value as string;
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 whitespace-nowrap">
        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span>{value?.substring(0, 10)}</span>
      </div>
      <div className="text-[11px] text-gray-450 pl-5 whitespace-nowrap">
        {value?.substring(11)}
      </div>
    </div>
  );
}

function VehicleRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 whitespace-nowrap">
        <Truck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span>{params.value}</span>
      </div>
      <div className="text-[11px] text-gray-500 pl-5 truncate max-w-[160px]">
        {params.data?.driverName}
      </div>
    </div>
  );
}

function CustomerRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div
        className="text-xs font-bold text-gray-900 truncate max-w-[180px]"
        title={params.value}
      >
        {params.value}
      </div>
      <div className="text-[11px] text-gray-450 whitespace-nowrap">
        ID: {params.data?.customerId}
      </div>
    </div>
  );
}

function MaterialRenderer(params: ICellRendererParams<Transaction>) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">
        {params.value}
      </div>
      <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
        {params.data?.siteName}
      </div>
    </div>
  );
}

function NetWeightRenderer(params: ICellRendererParams<Transaction>) {
  const value = params.value as number;
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-black font-mono text-gray-900">
        {value?.toFixed(2)}
      </span>
      <span className="text-[11px] text-gray-400 ml-0.5">t</span>
    </div>
  );
}

function TypeRenderer(params: ICellRendererParams<Transaction>) {
  const type = params.value as string;
  return <TypeBadge type={type} />;
}

function StatusRenderer(params: ICellRendererParams<Transaction>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

interface ActionGridContext {
  onViewTicketDetails: (ticketId: string) => void;
}

function ActionRenderer(
  params: ICellRendererParams<Transaction, unknown, ActionGridContext>,
) {
  const id = params.data?.id ?? "";
  return (
    <div className="flex items-center justify-center h-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onViewTicketDetails(id);
        }}
        className="rounded-lg p-2 text-slate-400 hover:bg-gray-100 hover:text-blue-600 transition"
        title="Review weight ticket details"
      >
        <Eye className="h-5 w-5" />
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

export default function TransactionsTable({
  processedTransactions,
  transactions,
  visibleColumns,
  selectedIds,
  setSelectedIds,
  showExportMenu,
  setShowExportMenu,
  onExportScope,
  onViewTicketDetails,
  onUpdateTransaction,
  onBulkComment,
}: TransactionsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi<Transaction> | null>(null);

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    const pendingAndHold = transactions.filter(
      (tx) =>
        selectedIds.includes(tx.id) &&
        (tx.status === TransactionStatus.PENDING ||
          tx.status === TransactionStatus.ON_HOLD),
    );
    if (pendingAndHold.length === 0) {
      alert(
        "None of the selected tickets are in a state that can be approved (must be Pending or On Hold).",
      );
      return;
    }
    const confirmApprove = confirm(
      `Are you sure you want to bulk APPROVE the ${pendingAndHold.length} eligible selected transaction(s)?`,
    );
    if (!confirmApprove) return;

    pendingAndHold.forEach((tx) => {
      onUpdateTransaction({
        ...tx,
        status: TransactionStatus.APPROVED,
        auditHistory: [
          ...tx.auditHistory,
          {
            timestamp: new Date().toLocaleString(),
            action: "Bulk Approved",
            user: "Admin User",
            details: `Approved via bulk actions toolbar. Selected in batch of ${selectedIds.length} items.`,
          },
        ],
      });
    });
    alert(`Successfully approved ${pendingAndHold.length} transaction(s).`);
    setSelectedIds([]);
  };

  const handleBulkCancel = () => {
    if (selectedIds.length === 0) return;
    const cancelable = transactions.filter(
      (tx) =>
        selectedIds.includes(tx.id) &&
        tx.status !== TransactionStatus.CANCELLED,
    );
    if (cancelable.length === 0) {
      alert(
        "None of the selected tickets can be cancelled (already Cancelled).",
      );
      return;
    }
    const confirmCancel = confirm(
      `Are you sure you want to bulk CANCEL the ${cancelable.length} selected transaction(s)? This action is permanent.`,
    );
    if (!confirmCancel) return;

    cancelable.forEach((tx) => {
      onUpdateTransaction({
        ...tx,
        status: TransactionStatus.CANCELLED,
        auditHistory: [
          ...tx.auditHistory,
          {
            timestamp: new Date().toLocaleString(),
            action: "Bulk Cancelled",
            user: "Admin User",
            details: `Cancelled via bulk actions toolbar. Selected in batch of ${selectedIds.length} items.`,
          },
        ],
      });
    });
    alert(`Successfully cancelled ${cancelable.length} transaction(s).`);
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

  const columnDefs = useMemo<ColDef<Transaction>[]>(() => {
    const cols: ColDef<Transaction>[] = [];

    if (visibleColumns.ticketCode) {
      cols.push({
        field: "ticketNo",
        headerName: "Ticket / Code",
        width: 150,
        minWidth: 140,
        headerComponent: HeaderWithMenu,
        cellRenderer: TicketCodeRenderer,
      });
    }
    if (visibleColumns.date) {
      cols.push({
        field: "firstWeighTime",
        headerName: "Transaction Date",
        width: 160,
        minWidth: 150,
        headerComponent: HeaderWithMenu,
        cellRenderer: DateRenderer,
      });
    }
    if (visibleColumns.vehicleDriver) {
      cols.push({
        field: "vehicleReg",
        headerName: "Vehicle & Driver",
        width: 170,
        minWidth: 160,
        headerComponent: HeaderWithMenu,
        cellRenderer: VehicleRenderer,
      });
    }
    if (visibleColumns.customer) {
      cols.push({
        field: "customerName",
        headerName: "Invoiced To",
        width: 190,
        minWidth: 180,
        headerComponent: HeaderWithMenu,
        cellRenderer: CustomerRenderer,
      });
    }
    if (visibleColumns.material) {
      cols.push({
        field: "productName",
        headerName: "Material",
        width: 190,
        minWidth: 180,
        headerComponent: HeaderWithMenu,
        cellRenderer: MaterialRenderer,
      });
    }
    if (visibleColumns.netWeight) {
      cols.push({
        field: "netWeight",
        headerName: "Net Wt (t)",
        width: 110,
        minWidth: 100,
        headerComponent: HeaderWithMenu,
        cellRenderer: NetWeightRenderer,
      });
    }
    if (visibleColumns.type) {
      cols.push({
        field: "type",
        headerName: "Type",
        width: 100,
        minWidth: 90,
        headerComponent: HeaderWithMenu,
        cellRenderer: TypeRenderer,
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
        headerName: "Action",
        width: 80,
        minWidth: 80,
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

  const gridContext = useMemo(
    () => ({ onViewTicketDetails }),
    [onViewTicketDetails],
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
                Weighbridge ticket(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-sm transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve Selected
              </button>
              <button
                onClick={onBulkComment}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer shadow-xs transition"
              >
                <FileText className="h-3.5 w-3.5" />
                Comment Selected
              </button>
              <button
                onClick={handleBulkCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-150 cursor-pointer shadow-xs transition"
              >
                <X className="h-3.5 w-3.5" />
                Cancel Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold text-gray-450 hover:text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Showing {processedTransactions.length} of {transactions.length}{" "}
              records found
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
                    onClick={() => onExportScope("current")}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Export Current View ({processedTransactions.length} items)</span>
                  </button>
                  <button
                    disabled={selectedIds.length === 0}
                    onClick={() => onExportScope("selected")}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between ${selectedIds.length === 0
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                      }`}
                  >
                    <span>Export Selected Rows ({selectedIds.length} items)</span>
                  </button>
                  <button
                    onClick={() => onExportScope("filtered")}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Export Filtered Results ({processedTransactions.length} items)</span>
                  </button>
                  <button
                    onClick={() => onExportScope("all")}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Export All Transactions ({transactions.length} items)</span>
                  </button>
                  <button
                    onClick={() => onExportScope("invoicing")}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between text-blue-700 hover:text-blue-800 font-semibold"
                  >
                    <span>Export for Invoicing</span>
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
          style={{ height: "calc(100vh - 320px)", minHeight: 420 }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={processedTransactions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            selectionColumnDef={selectionColumnDef}
            theme={gridTheme}
            rowSelection={{ mode: "multiRow", enableClickSelection: false }}
            getRowId={(params) => params.data.id}
            rowHeight={75}
            headerHeight={55}
            context={gridContext}
            overlayNoRowsTemplate="No matching back-office weigh tickets found."
            onCellClicked={(event) => {
              if (event.colDef.colId === "ag-Grid-SelectionColumn") return;
              if (event.colDef.colId === "action") return;
              onViewTicketDetails(event.data?.id ?? "");
            }}
            onSelectionChanged={(event) =>
              setSelectedIds(event.api.getSelectedRows().map((r) => r.id))
            }
            onGridReady={(event: GridReadyEvent<Transaction>) =>
              setGridApi(event.api)
            }
          />
        </div>
      </AgGridProvider>

      <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-medium">
          Showing {processedTransactions.length} of {transactions.length}{" "}
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
