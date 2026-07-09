import React from "react";
import {
  Scale,
  Users2,
  FileCheck2,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Play,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Transaction, Product, Customer } from "../../types";

interface DashboardViewProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  onViewChange: (viewId: string) => void;
}

export default function DashboardView({
  transactions,
  products,
  customers,
  onViewChange,
}: DashboardViewProps) {
  // Aggregate real system statistics
  const totalWeight = transactions.reduce((acc, t) => acc + t.netWeight, 0);
  const pendingCount = transactions.filter(
    (t) => t.status === "Pending",
  ).length;
  const onHoldCount = transactions.filter((t) => t.status === "On Hold").length;
  const approvedCount = transactions.filter(
    (t) => t.status === "Approved",
  ).length;
  const totalCost = transactions.reduce((acc, t) => acc + t.totalValue, 0);

  // Chart 1 data: Throughput over Last 5 Days
  const throughputData = [
    {
      date: "18 Jun",
      "Melbourne Eastern": 142.5,
      "Bayside Coastal": 88.0,
      "Western Eco-Recycle": 110.2,
    },
    {
      date: "19 Jun",
      "Melbourne Eastern": 168.0,
      "Bayside Coastal": 92.5,
      "Western Eco-Recycle": 124.8,
    },
    {
      date: "20 Jun",
      "Melbourne Eastern": 155.2,
      "Bayside Coastal": 104.0,
      "Western Eco-Recycle": 95.0,
    },
    {
      date: "21 Jun",
      "Melbourne Eastern": 182.4,
      "Bayside Coastal": 76.5,
      "Western Eco-Recycle": 133.0,
    },
    {
      date: "22 Jun",
      "Melbourne Eastern": 210.6,
      "Bayside Coastal": 115.3,
      "Western Eco-Recycle": 142.1,
    },
  ];

  // Chart 2 data: Material distribution by Category
  const materialDist = [
    { name: "Aggregates", value: 345.8, color: "#1d4ed8" }, // blue-700
    { name: "Sand", value: 184.2, color: "#0369a1" }, // sky-700
    { name: "Recycled", value: 98.4, color: "#047857" }, // emerald-700
    { name: "Soil", value: 72.1, color: "#b45309" }, // amber-700
  ];

  // Active scales status log
  const activeScales = [
    {
      name: "Scale-A1 (Inbound)",
      site: "Melbourne Eastern Quarry",
      capacity: "80,000kg",
      status: "Active",
      loadState: "Idle",
    },
    {
      name: "Scale-A2 (Inbound)",
      site: "Melbourne Eastern Quarry",
      capacity: "80,000kg",
      status: "Active",
      loadState: "Loading (42,800kg)",
    },
    {
      name: "Scale-B1 (Outbound)",
      site: "Melbourne Eastern Quarry",
      capacity: "80,000kg",
      status: "Active",
      loadState: "Idle",
    },
    {
      name: "Scale-C1 (In-Out Combined)",
      site: "Bayside Coastal Sands",
      capacity: "60,000kg",
      status: "Active",
      loadState: "Idle",
    },
    {
      name: "Scale-W1 (Single Deck Combined)",
      site: "Western Eco-Recycling Depot",
      capacity: "100,000kg",
      status: "Maintenance",
      loadState: "Off-line",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Uniweigh Back-Office Operations
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Real-time weighbridge activities, sensor diagnostics, and financial
          audit flows.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div
          onClick={() => onViewChange("operations-weighbridge")}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Weight Processed Today
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950">
              {totalWeight.toFixed(1)} t
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="mr-0.5 h-3 w-3" />
              +14.2%
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Total net material loaded across all site scale beds
          </p>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onViewChange("operations-pending")}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-yellow-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pending Audits
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950">
              {pendingCount}
            </span>
            {onHoldCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {onHoldCount} held
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Transactions awaiting back-office billing approval
          </p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onViewChange("operations-approved")}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-green-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Approved Queue
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950">
              {approvedCount}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Ready for billing
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Validated weigh tickets staged for invoicing
          </p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onViewChange("operations-invoicing")}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Est. Value (Today)
            </span>
            <div className="rounded-lg bg-emerald-50/50 p-2 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950">
              $
              {totalCost.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Calculated sum based on material base price weights
          </p>
        </div>
      </div>

      {/* Main Charts double-grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1 & 2: Workload Breakdown */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-950">
                Active Scale Throughput
              </h2>
              <p className="text-xs text-gray-500">
                Net tonnes processed per site location over the last 5
                operational days
              </p>
            </div>
          </div>
          <div className="mt-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={throughputData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  unit="t"
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="Melbourne Eastern"
                  fill="#1d4ed8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Bayside Coastal"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Western Eco-Recycle"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 3: Category mix */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-semibold text-gray-950">
              Material Dispatch Mix
            </h2>
            <p className="text-xs text-gray-500">
              Cumulative tonnage distribution by material type
            </p>
          </div>
          <div className="relative mt-4 flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {materialDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v} Tonnes`}
                  contentStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Total Heavy
              </span>
              <span className="text-xl font-bold text-gray-900">700.5 t</span>
            </div>
          </div>
          {/* Custom legend */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            {materialDist.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate">
                  {entry.name} ({((entry.value / 700.5) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticker / Scale Diagnoses section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weighbridge Bed Health */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-950">
            Scale Sensors & Load Cells
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Active digital scale readings registered with the server
          </p>
          <div className="divide-y divide-gray-100">
            {activeScales.map((scale, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg ${
                      scale.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {scale.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {scale.site} • Cap: {scale.capacity}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold ${
                      scale.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {scale.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    {scale.loadState}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back-office Quick Actions Dashboard */}
        <div className="rounded-xl border border-gray-100 bg-amber-50/15 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Quick Shortcuts
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Weighbridge auditing shortcuts to boost review frequency.
          </p>
          <div className="grid gap-2">
            <button
              onClick={() => onViewChange("operations-pending")}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-blue-500 transition-colors group focus:outline-hidden"
            >
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                  Audit {pendingCount} Pending Tickets
                </div>
                <div className="text-xs text-gray-400">
                  Review weights and unlock to invoicing
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </button>

            <button
              onClick={() => onViewChange("operations-invoicing")}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-emerald-500 transition-colors group focus:outline-hidden"
            >
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">
                  Dispatch Invoices
                </div>
                <div className="text-xs text-gray-400">
                  Run invoice batch routines for approved entries
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={() => onViewChange("products-list")}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-blue-500 transition-colors group focus:outline-hidden"
            >
              <div>
                <div className="text-xs font-bold text-gray-900">
                  Manage Material Catalog
                </div>
                <div className="text-xs text-gray-400">
                  Review aggregates, unit costs, and pricing tiers
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
