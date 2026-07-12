import React from "react";
import { Scale, FileCheck2, DollarSign, ArrowUpRight, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Transaction, Product, Customer } from "../types";
import { chartColor, CHART_AXIS, CHART_GRID, CHART_TOOLTIP_STYLE } from "@/src/lib/chart-theme";
import StatCard from "@/src/components/shared/StatCard";
import ChartCard from "@/src/components/shared/ChartCard";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { Badge } from "@/src/components/ui/badge";
import PageHeader from "@/src/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";

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
  onViewChange
}: DashboardViewProps) {
  // Aggregate real system statistics
  const totalWeight = transactions.reduce((acc, t) => acc + t.netWeight, 0);
  const pendingCount = transactions.filter(t => t.status === "Pending").length;
  const onHoldCount = transactions.filter(t => t.status === "On Hold").length;
  const approvedCount = transactions.filter(t => t.status === "Approved").length;
  const totalCost = transactions.reduce((acc, t) => acc + t.totalValue, 0);

  // Chart 1 data: Throughput over Last 5 Days
  const throughputData = [
    { date: "18 Jun", "Melbourne Eastern": 142.5, "Bayside Coastal": 88.0, "Western Eco-Recycle": 110.2 },
    { date: "19 Jun", "Melbourne Eastern": 168.0, "Bayside Coastal": 92.5, "Western Eco-Recycle": 124.8 },
    { date: "20 Jun", "Melbourne Eastern": 155.2, "Bayside Coastal": 104.0, "Western Eco-Recycle": 95.0 },
    { date: "21 Jun", "Melbourne Eastern": 182.4, "Bayside Coastal": 76.5, "Western Eco-Recycle": 133.0 },
    { date: "22 Jun", "Melbourne Eastern": 210.6, "Bayside Coastal": 115.3, "Western Eco-Recycle": 142.1 }
  ];

  // Chart 2 data: Material distribution by Category
  const materialDist = [
    { name: "Aggregates", value: 345.8, color: chartColor(1) },
    { name: "Sand", value: 184.2, color: chartColor(2) },
    { name: "Recycled", value: 98.4, color: chartColor(3) },
    { name: "Soil", value: 72.1, color: chartColor(5) }
  ];

  // Active scales status log
  const activeScales = [
    { name: "Scale-A1 (Inbound)", site: "Melbourne Eastern Quarry", capacity: "80,000kg", status: "Active", loadState: "Idle" },
    { name: "Scale-A2 (Inbound)", site: "Melbourne Eastern Quarry", capacity: "80,000kg", status: "Active", loadState: "Loading (42,800kg)" },
    { name: "Scale-B1 (Outbound)", site: "Melbourne Eastern Quarry", capacity: "80,000kg", status: "Active", loadState: "Idle" },
    { name: "Scale-C1 (In-Out Combined)", site: "Bayside Coastal Sands", capacity: "60,000kg", status: "Active", loadState: "Idle" },
    { name: "Scale-W1 (Single Deck Combined)", site: "Western Eco-Recycling Depot", capacity: "100,000kg", status: "Maintenance", loadState: "Off-line" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <PageHeader
        title="Uniweigh Back-Office Operations"
        description="Real-time weighbridge activities, sensor diagnostics, and financial audit flows."
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => onViewChange("operations-weighbridge")} className="cursor-pointer">
          <StatCard
            label="Weight Processed Today"
            value={`${totalWeight.toFixed(1)} t`}
            delta={{ value: "+14.2%", direction: "up" }}
            icon={Scale}
            tone="accent"
            hint="Net material across all scale beds"
          />
        </div>
        <div onClick={() => onViewChange("operations-pending")} className="cursor-pointer">
          <StatCard
            label="Pending Audits"
            value={pendingCount}
            icon={AlertTriangle}
            tone="warning"
            hint={onHoldCount > 0 ? `${onHoldCount} held` : "Awaiting billing approval"}
          />
        </div>
        <div onClick={() => onViewChange("operations-approved")} className="cursor-pointer">
          <StatCard
            label="Approved Queue"
            value={approvedCount}
            icon={FileCheck2}
            tone="success"
            hint="Ready for billing"
          />
        </div>
        <div onClick={() => onViewChange("operations-invoicing")} className="cursor-pointer">
          <StatCard
            label="Est. Value (Today)"
            value={`$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            tone="info"
            hint="Sum of material base price weights"
          />
        </div>
      </div>

      {/* Main Charts double-grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Column 1 & 2: Workload Breakdown */}
        <ChartCard
          title="Active Scale Throughput"
          description="Net tonnes processed per site location over the last 5 operational days"
          className="lg:col-span-2"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="date" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} unit="t" />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "var(--muted)" }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Melbourne Eastern" fill={chartColor(1)} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Bayside Coastal" fill={chartColor(2)} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Western Eco-Recycle" fill={chartColor(3)} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Column 3: Category mix */}
        <ChartCard
          title="Material Dispatch Mix"
          description="Cumulative tonnage distribution by material type"
        >
          <div className="relative flex h-64 items-center justify-center">
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
                <Tooltip formatter={(v) => `${v} Tonnes`} contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Heavy</span>
              <span className="font-mono text-xl font-bold tabular-nums text-foreground">700.5 t</span>
            </div>
          </div>
          {/* Custom legend */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {materialDist.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name} ({((entry.value / 700.5) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Ticker / Scale Diagnoses section */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weighbridge Bed Health */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scale Sensors &amp; Load Cells</CardTitle>
            <CardDescription>Active digital scale readings registered with the server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {activeScales.map((scale, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md ${
                        scale.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}
                    >
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{scale.name}</div>
                      <div className="text-xs text-muted-foreground">{scale.site} • Cap: {scale.capacity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={scale.status} />
                    <div className="text-xs text-muted-foreground mt-1 font-mono tabular-nums">{scale.loadState}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back-office Quick Actions Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm uppercase tracking-widest">
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
              Quick Shortcuts
            </CardTitle>
            <CardDescription>Weighbridge auditing shortcuts to boost review frequency.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button
                onClick={() => onViewChange("operations-pending")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-left hover:border-accent transition-colors group focus:outline-none cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">Audit {pendingCount} Pending Tickets</div>
                  <div className="text-xs text-muted-foreground">Review weights and unlock to invoicing</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              </button>

              <button
                onClick={() => onViewChange("operations-invoicing")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-left hover:border-success transition-colors group focus:outline-none cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">Dispatch Invoices</div>
                  <div className="text-xs text-muted-foreground">Run invoice batch routines for approved entries</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-success transition-colors" />
              </button>

              <button
                onClick={() => onViewChange("products-list")}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-left hover:border-accent transition-colors group focus:outline-none cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">Manage Material Catalog</div>
                  <div className="text-xs text-muted-foreground">Review aggregates, unit costs, and pricing tiers</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
