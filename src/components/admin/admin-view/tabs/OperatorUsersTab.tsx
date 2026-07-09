import { useMemo, useRef } from "react";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { StatusBadge } from "../../../shared/Badges";

interface OperatorUser {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  active: string;
}

const mockBackOfficeUsers: OperatorUser[] = [
  { id: "op-1", name: "John Davis", email: "john.davis@uniweigh.com", role: "Weighbridge Operator", station: "Melbourne Eastern Quarry", active: "Scale-A2 active" },
  { id: "op-2", name: "Sarah JenkinsK", email: "sarah.k@uniweigh.com", role: "Weighbridge Operator", station: "Bayside Coastal Sands", active: "Scale-C1 active" },
  { id: "op-3", name: "Steve G", email: "steve.g@uniweigh.com", role: "Weighbridge Operator", station: "Western Eco-Recycling Depot", active: "Idle" },
  { id: "op-4", name: "Admin User", email: "admin.user@uniweigh.com", role: "Administrator", station: "HQ Corporate Services", active: "System config active" },
];

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

function NameRenderer(params: ICellRendererParams<OperatorUser>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function EmailRenderer(params: ICellRendererParams<OperatorUser>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-mono text-gray-500 truncate max-w-[200px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function RoleRenderer(params: ICellRendererParams<OperatorUser>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
        {params.value}
      </span>
    </div>
  );
}

function StationRenderer(params: ICellRendererParams<OperatorUser>) {
  return (
    <div className="flex items-center h-full">
      <span className="text-xs text-blue-700 font-medium truncate max-w-[180px]" title={params.value}>
        {params.value}
      </span>
    </div>
  );
}

function StatusRenderer(params: ICellRendererParams<OperatorUser>) {
  const status = params.value as string;
  return <StatusBadge status={status} />;
}

export default function OperatorUsersTab() {
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs = useMemo<ColDef<OperatorUser>[]>(
    () => [
      {
        field: "name",
        headerName: "Operator Name",
        width: 170,
        minWidth: 140,
        cellRenderer: NameRenderer,
      },
      {
        field: "email",
        headerName: "Corporate Email",
        width: 220,
        minWidth: 180,
        cellRenderer: EmailRenderer,
      },
      {
        field: "role",
        headerName: "System Role",
        width: 160,
        minWidth: 140,
        cellRenderer: RoleRenderer,
      },
      {
        field: "station",
        headerName: "Operating Station",
        width: 200,
        minWidth: 160,
        cellRenderer: StationRenderer,
      },
      {
        field: "active",
        headerName: "Duty Status",
        width: 140,
        minWidth: 120,
        cellRenderer: StatusRenderer,
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
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Weighbridge Operators</h3>
        <p className="text-xs text-gray-500">Logged-in back-office representatives operating physical scales:</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-xs">
        <AgGridProvider modules={[AllCommunityModule]}>
          <div
            className="w-full"
            style={{ height: "calc(100vh - 420px)", minHeight: 280 }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={mockBackOfficeUsers}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              theme={gridTheme}
              getRowId={(params) => params.data.id}
              rowHeight={56}
              headerHeight={52}
              overlayNoRowsTemplate="No operators found."
            />
          </div>
        </AgGridProvider>
      </div>
    </div>
  );
}
