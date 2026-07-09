import { useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { Transaction, Product, Customer } from "../../../types";
import ReportStats from "./shared/ReportStats";
import TransactionsReportTab from "./tabs/TransactionsReportTab";
import ProductsReportTab from "./tabs/ProductsReportTab";
import CustomersReportTab from "./tabs/CustomersReportTab";
import ProgressReportTab from "./tabs/ProgressReportTab";

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

  const siteFilteredTxs = transactions.filter(
    (t) => selectedSite === "All" || t.siteName === selectedSite
  );

  const totalLoadedNet = siteFilteredTxs.reduce((acc, t) => acc + t.netWeight, 0);
  const totalBilledVal = siteFilteredTxs.reduce((acc, t) => acc + t.totalValue, 0);
  const countWeighs = siteFilteredTxs.length;

  const reportTitles: Record<string, { title: string; subtitle: string }> = {
    transactions: { title: "Transaction Reports", subtitle: "Weigh ticket registers & audit summaries" },
    products: { title: "Product Reports", subtitle: "Product tonnage volumes & material ledgers" },
    customers: { title: "Customer Reports", subtitle: "Client debtor billables & invoice breakdowns" },
    progress: { title: "Job Progress Reports", subtitle: "Operational progress & fulfilment tracking" },
  };
  const { title: pageTitle, subtitle: pageSubtitle } = reportTitles[subView] || reportTitles.transactions;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">{pageTitle}</h1>
        <p className="text-xs text-gray-500">{pageSubtitle}</p>
      </div>

      <div className="rounded-xl bg-white p-3 shadow-sm grid gap-3 md:grid-cols-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Audit Report Template</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-md border-0 bg-slate-50 px-3 py-1.5 text-xs text-gray-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium"
          >
            <option value="transactions">Transaction Registers Summary</option>
            <option value="products">Product Tonnage Volumes</option>
            <option value="customers">Client Debtor Billables</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Site Scale Station</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full rounded-md border-0 bg-slate-50 px-3 py-1.5 text-xs text-gray-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Weighbridges Combined</option>
            <option value="Melbourne Eastern Quarry">Melbourne Eastern Quarry</option>
            <option value="Bayside Coastal Sands">Bayside Coastal Sands</option>
            <option value="Western Eco-Recycling Depot">Western Eco-Recycling Depot</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Audit Date Range</label>
          <select
            value={daysRange}
            onChange={(e) => setDaysRange(parseInt(e.target.value))}
            className="w-full rounded-md border-0 bg-slate-50 px-3 py-1.5 text-xs text-gray-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={7}>Prior 7 Days</option>
            <option value={30}>Prior 30 Days (Current Period)</option>
            <option value={90}>Prior Quarter (90 Days)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={runGeneration}
            disabled={generating}
            className="w-full rounded-lg bg-blue-600 font-bold text-xs text-white h-10 hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-200"
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
        <div className="py-20 text-center text-sm text-gray-400 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="font-bold text-gray-600 animate-pulse">Scanning digital scale databases...</p>
        </div>
      )}

      {reportGenerated && !generating && (
        <div className="space-y-6">
          <ReportStats
            countWeighs={countWeighs}
            totalLoadedNet={totalLoadedNet}
            totalBilledVal={totalBilledVal}
          />

          {reportType === "transactions" && (
            <TransactionsReportTab
              siteFilteredTxs={siteFilteredTxs}
              selectedSite={selectedSite}
              daysRange={daysRange}
              onViewTicketDetails={onViewTicketDetails}
            />
          )}
          {reportType === "products" && (
            <ProductsReportTab
              siteFilteredTxs={siteFilteredTxs}
              products={products}
              selectedSite={selectedSite}
              daysRange={daysRange}
            />
          )}
          {reportType === "customers" && (
            <CustomersReportTab
              siteFilteredTxs={siteFilteredTxs}
              customers={customers}
              selectedSite={selectedSite}
              daysRange={daysRange}
            />
          )}
          {reportType === "progress" && <ProgressReportTab />}
        </div>
      )}
    </div>
  );
}
