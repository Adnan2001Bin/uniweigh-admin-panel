import { useState } from "react";
import { Users2, Filter, ChevronDown, Check, Plus, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomersToolbarProps {
  activeChip: string;
  setActiveChip: (chip: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onAddCustomer: () => void;
  activeAdvancedFilterCount: number;
  resetFilters: () => void;
  localSearch: string;
  setLocalSearch: (v: string) => void;
  topSearchQuery: string;
  filterPricingTier: string;
  setFilterPricingTier: (v: string) => void;
  filterActiveContracts: string;
  setFilterActiveContracts: (v: string) => void;
  filterAccountBalance: string;
  setFilterAccountBalance: (v: string) => void;
  filterState: string;
  setFilterState: (v: string) => void;
  filterCreatedDate: string;
  setFilterCreatedDate: (v: string) => void;
  filterLastTxDate: string;
  setFilterLastTxDate: (v: string) => void;
}

const columnLabels: Record<string, string> = {
  customerId: "Customer ID",
  name: "Customer Name",
  contact: "Primary Contact",
  phone: "Phone Number",
  email: "Email Address",
  status: "Status",
  action: "Actions",
};

export default function CustomersToolbar(props: CustomersToolbarProps) {
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const {
    activeChip,
    setActiveChip,
    showFilters,
    setShowFilters,
    visibleColumns,
    setVisibleColumns,
    onAddCustomer,
    activeAdvancedFilterCount,
    resetFilters,
    localSearch,
    setLocalSearch,
    topSearchQuery,
  } = props;

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl flex items-center gap-2">
            <Users2 className="h-6 w-6 text-blue-600" />
            <span>Customers</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Weighbridge client debtors, jobs, and delivery locations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto relative flex-wrap">
          <button
            id="btn-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition ${showFilters
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Advanced Filters</span>
            {activeAdvancedFilterCount > 0 && (
              <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              id="btn-toggle-columns"
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition select-none"
            >
              <span>Column Visibility</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {showColumnsMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 text-xs">
                <div className="px-3.5 py-1 text-gray-400 font-black text-[9px] uppercase tracking-widest border-b border-gray-100 mb-1.5">
                  Toggle Columns
                </div>
                {Object.keys(visibleColumns).map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col],
                      }));
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span className="capitalize">{columnLabels[col] || col}</span>
                    {visibleColumns[col] && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onAddCustomer}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white px-4 py-2 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3">
        <div className="relative w-full sm:max-w-xs shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-220 bg-white pl-9.5 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {(localSearch || topSearchQuery) && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1 select-none">
          Category Filters:
        </span>
        {["All", "Active", "Suspended"].map((chip) => {
          const isActive = activeChip === chip;
          return (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer select-none min-w-[88px] text-center whitespace-nowrap ${isActive
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-gray-500" />
                  Advanced Multi-Criteria Filtering Engine
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Pricing Tier
                  </label>
                  <select
                    value={props.filterPricingTier}
                    onChange={(e) => props.setFilterPricingTier(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Tiers</option>
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                    <option value="Tier 4">Tier 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Active Contracts
                  </label>
                  <select
                    value={props.filterActiveContracts}
                    onChange={(e) => props.setFilterActiveContracts(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Customers</option>
                    <option value="Has Contracts">Has Contracts</option>
                    <option value="No Contracts">No Contracts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Account Balance
                  </label>
                  <select
                    value={props.filterAccountBalance}
                    onChange={(e) => props.setFilterAccountBalance(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Balances</option>
                    <option value="Debit Balance">Debit Balance</option>
                    <option value="Credit Balance">Credit Balance</option>
                    <option value="Zero Balance">Zero Balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    State
                  </label>
                  <select
                    value={props.filterState}
                    onChange={(e) => props.setFilterState(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All States</option>
                    <option value="VIC">VIC</option>
                    <option value="NSW">NSW</option>
                    <option value="QLD">QLD</option>
                    <option value="SA">SA</option>
                    <option value="WA">WA</option>
                    <option value="TAS">TAS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Created On
                  </label>
                  <input
                    type="date"
                    value={props.filterCreatedDate}
                    onChange={(e) => props.setFilterCreatedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Last Transaction Date
                  </label>
                  <input
                    type="date"
                    value={props.filterLastTxDate}
                    onChange={(e) => props.setFilterLastTxDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
