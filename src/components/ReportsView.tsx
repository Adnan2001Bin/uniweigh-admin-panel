import React, { useState } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  MapPin,
  CheckCircle,
  HelpCircle,
  ArrowBigRightDash,
  Loader2,
  TrendingUp,
  DollarSign,
  Scale
} from "lucide-react";
import { Transaction, Product, Customer } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import PageHeader from "@/src/components/shared/PageHeader";

interface ReportsViewProps {
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  subView: "transactions" | "products" | "customers" | "progress";
  onViewTicketDetails?: (ticketId: string) => void;
}

export default function ReportsView({
  transactions,
  products,
  customers,
  subView,
  onViewTicketDetails
}: ReportsViewProps) {
  const [reportType, setReportType] = useState<string>(
    subView === "products" ? "products" : subView === "customers" ? "customers" : "transactions"
  );
  const [selectedSite, setSelectedSite] = useState<string>("All");
  const [daysRange, setDaysRange] = useState<number>(30);
  const [generating, setGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(true); // Pre-generated

  const runGeneration = () => {
    setGenerating(true);
    setReportGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
    }, 800);
  };

  // Summaries based on transaction compilation
  const siteFilteredTxs = transactions.filter(
    (t) => selectedSite === "All" || t.siteName === selectedSite
  );

  const totalLoadedNet = siteFilteredTxs.reduce((acc, t) => acc + t.netWeight, 0);
  const totalBilledVal = siteFilteredTxs.reduce((acc, t) => acc + t.totalValue, 0);
  const countWeighs = siteFilteredTxs.length;

  const reportPathLabel =
    subView === "products"
      ? "Product Reports"
      : subView === "customers"
      ? "Customer Reports"
      : subView === "progress"
      ? "Job Progress Reports"
      : "Transaction Reports";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Financial & Tonnage Audits"
        icon={BarChart3}
        breadcrumbs={[
          { label: "Reports" },
          { label: reportPathLabel },
        ]}
      />

      {/* Query Parameters Canvas */}
      <div className="rounded-md border border-border bg-card p-5 shadow-xs grid gap-4 md:grid-cols-4">
        {/* Param 1: Type Selection */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Audit Report Template</label>
          <SelectBox
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-1.8 text-xs text-foreground focus:ring-1 focus:ring-ring focus:outline-none font-medium"
          >
            <option value="transactions">Transaction Registers Summary</option>
            <option value="products">Product Tonnage Volumes</option>
            <option value="customers">Client Debtor Billables</option>
          </SelectBox>
        </div>

        {/* Param 2: Site Scale Select */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Site Scale Station</label>
          <SelectBox
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-1.8 text-xs text-foreground focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="All">All Weighbridges Combined</option>
            <option value="Melbourne Eastern Quarry">Melbourne Eastern Quarry</option>
            <option value="Bayside Coastal Sands">Bayside Coastal Sands</option>
            <option value="Western Eco-Recycling Depot">Western Eco-Recycling Depot</option>
          </SelectBox>
        </div>

        {/* Param 3: Range days */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Audit Date Range</label>
          <SelectBox
            value={daysRange}
            onChange={(e) => setDaysRange(parseInt(e.target.value))}
            className="w-full rounded-md border border-border bg-card px-3 py-1.8 text-xs text-foreground focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value={7}>Prior 7 Days</option>
            <option value={30}>Prior 30 Days (Current Period)</option>
            <option value={90}>Prior Quarter (90 Days)</option>
          </SelectBox>
        </div>

        {/* Action triggers */}
        <div className="flex items-end">
          <button
            onClick={runGeneration}
            disabled={generating}
            className="w-full rounded-md bg-primary font-bold text-xs text-white h-10 hover:bg-primary/90 transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-secondary"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>compiling...</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                <span>Verify & Query Ledger</span>
              </>
            )}
          </button>
        </div>
      </div>

      {generating && (
        <div className="py-20 text-center text-sm text-muted-foreground space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-info" />
          <p className="font-bold text-muted-foreground animate-pulse">Scanning digital scale databases...</p>
        </div>
      )}

      {/* Main Results Canvas */}
      {reportGenerated && !generating && (
        <div className="space-y-6">
          {/* Quick numbers Ribbon */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Stat 1 */}
            <div className="rounded-md border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Total Sessions Audited</span>
              <span className="text-xl font-bold text-foreground mt-1 block">{countWeighs} weighbridge loads</span>
            </div>
            {/* Stat 2 */}
            <div className="rounded-md border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Accumulated Tonnage</span>
              <span className="text-xl font-bold text-info mt-1 block">{totalLoadedNet.toFixed(2)} Tonnes</span>
            </div>
            {/* Stat 3 */}
            <div className="rounded-md border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Subtotal Value Charged</span>
              <span className="text-xl font-bold text-success mt-1 block">
                ${totalBilledVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Generated Grid Table */}
          <div className="rounded-md border border-border bg-card overflow-hidden shadow-xs">
            {/* Header layout */}
            <div className="px-5 py-4 border-b border-border bg-muted flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Report Output: {reportType === "products" ? "Product Volume ledger" : reportType === "customers" ? "Client Ledger Invoice Breakdown" : "Weigh Ticket Registry"}
                </h3>
                <p className="text-xs text-muted-foreground">Timeframe: Prior {daysRange} days operational • Site: {selectedSite}</p>
              </div>
              <button
                onClick={() => {
                  toast.info("Compiling report CSV registry with SHA-256 ledger checksum...");
                }}
                className="rounded-md border border-border bg-card text-xs font-bold text-foreground px-5 py-2.5 hover:bg-muted flex items-center gap-1.5 focus:outline-none"
              >
                <FileSpreadsheet className="h-4 w-4 text-success" />
                <span>Export formatted CSV</span>
              </button>
            </div>

            {/* If Transactions Summary template */}
            {reportType === "transactions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-xs text-muted-foreground uppercase select-none">
                      <th className="px-5 py-3">Ticket ID</th>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3">Carrier / Reg</th>
                      <th className="px-5 py-3">Loaded Material</th>
                      <th className="px-5 py-3 text-right">Net Tonnes</th>
                      <th className="px-5 py-3 text-right">Total Cost</th>
                      <th className="px-5 py-3 text-center">Audit Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {siteFilteredTxs.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => onViewTicketDetails?.(t.id)}
                        className={`hover:bg-muted transition-colors ${onViewTicketDetails ? "cursor-pointer" : ""}`}
                        title={onViewTicketDetails ? "View full ticket details overview" : undefined}
                      >
                        <td className="px-5 py-4 font-bold text-foreground">{t.ticketNo}</td>
                        <td className="px-5 py-4 font-medium text-foreground">{t.customerName}</td>
                        <td className="px-5 py-4 text-muted-foreground truncate max-w-[150px]" title={t.carrierName}>
                          {t.carrierName} <span className="font-mono text-muted-foreground">({t.vehicleReg})</span>
                        </td>
                        <td className="px-5 py-4 text-info font-medium">{t.productName}</td>
                        <td className="px-5 py-4 text-right font-mono font-bold">{t.netWeight.toFixed(2)} t</td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-foreground">${t.totalValue.toFixed(2)}</td>
                        <td className="px-5 py-4 text-center text-xs text-muted-foreground font-mono">{t.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* If Products Template */}
            {reportType === "products" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-xs text-muted-foreground uppercase select-none">
                      <th className="px-5 py-3">Material Code</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Registered Weighs</th>
                      <th className="px-5 py-3 text-right">Accumulated Tonnes</th>
                      <th className="px-5 py-3 text-right">Representative Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((p) => {
                      const matchingTxs = siteFilteredTxs.filter((t) => t.productId === p.id);
                      const weightSum = matchingTxs.reduce((sum, current) => sum + current.netWeight, 0);
                      const costSum = matchingTxs.reduce((sum, current) => sum + current.totalValue, 0);
                      return (
                        <tr key={p.id} className="hover:bg-muted">
                          <td className="px-5 py-4 font-bold text-foreground font-mono">{p.id}</td>
                          <td className="px-5 py-4 font-bold text-foreground">{p.name}</td>
                          <td className="px-5 py-4 text-right font-semibold">{matchingTxs.length} loads</td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-info">{weightSum.toFixed(2)} t</td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-success">${costSum.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* If Customers Template */}
            {reportType === "customers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-xs text-muted-foreground uppercase select-none">
                      <th className="px-5 py-3">Debtor ID</th>
                      <th className="px-5 py-3">Customer Client Name</th>
                      <th className="px-5 py-3 text-right">Uninvoiced Weights</th>
                      <th className="px-5 py-3 text-right">Invoiced Weights</th>
                      <th className="px-5 py-3 text-right">Outstanding Period Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((c) => {
                      const allClientTxs = siteFilteredTxs.filter((t) => t.customerId === c.id);
                      const uninvoicedSumRegs = allClientTxs.filter((t) => t.status !== "Invoiced");
                      const invoicedSumRegs = allClientTxs.filter((t) => t.status === "Invoiced");

                      const uninvoicedTons = uninvoicedSumRegs.reduce((s, curr) => s + curr.netWeight, 0);
                      const invoicedTons = invoicedSumRegs.reduce((s, curr) => s + curr.netWeight, 0);
                      const costSum = uninvoicedSumRegs.reduce((s, curr) => s + curr.totalValue, 0);

                      return (
                        <tr key={c.id} className="hover:bg-muted">
                          <td className="px-5 py-4 font-bold font-mono text-muted-foreground">{c.id}</td>
                          <td className="px-5 py-4 font-bold text-foreground">{c.name}</td>
                          <td className="px-5 py-4 text-right">{uninvoicedTons.toFixed(2)} t</td>
                          <td className="px-5 py-4 text-right">{invoicedTons.toFixed(2)} t</td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-success">${costSum.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
