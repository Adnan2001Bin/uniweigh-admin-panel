import React from "react";
import {
  X,
  Filter,
  RefreshCw,
  ChevronDown,
  Check,
} from "lucide-react";

const COLUMN_LABELS: Record<string, string> = {
  id: "Product ID",
  productCode: "Product Code",
  name: "Product Name",
  site: "Site",
  defaultPrice: "Default Price",
  status: "Status",
  actions: "Actions",
};

type VisibleColumns = {
  id: boolean;
  productCode: boolean;
  name: boolean;
  site: boolean;
  defaultPrice: boolean;
  status: boolean;
  actions: boolean;
};

interface ProductsToolbarProps {
  localSearchQuery: string;
  setLocalSearchQuery: (value: string) => void;

  isFilterExpanded: boolean;
  setIsFilterExpanded: (value: boolean) => void;
  filterSite: string;
  setFilterSite: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterProduct: string;
  setFilterProduct: (value: string) => void;
  filterProductCode: string;
  setFilterProductCode: (value: string) => void;

  visibleColumns: VisibleColumns;
  setVisibleColumns: React.Dispatch<React.SetStateAction<VisibleColumns>>;
  isColumnDropdownOpen: boolean;
  setIsColumnDropdownOpen: (value: boolean) => void;

  isRefreshing: boolean;
  onRefresh: () => void;

  distinctSites: string[];
  distinctNames: string[];
  distinctCodes: string[];
}

export default function ProductsToolbar({
  localSearchQuery,
  setLocalSearchQuery,
  isFilterExpanded,
  setIsFilterExpanded,
  filterSite,
  setFilterSite,
  filterStatus,
  setFilterStatus,
  filterProduct,
  setFilterProduct,
  filterProductCode,
  setFilterProductCode,
  visibleColumns,
  setVisibleColumns,
  isColumnDropdownOpen,
  setIsColumnDropdownOpen,
  isRefreshing,
  onRefresh,
  distinctSites,
  distinctNames,
  distinctCodes,
}: ProductsToolbarProps) {
  const activeFilterCount = [
    filterSite !== "All",
    filterStatus !== "All",
    filterProduct !== "All",
    filterProductCode !== "All",
  ].filter(Boolean).length;

  const filtersActive = isFilterExpanded || activeFilterCount > 0;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            {localSearchQuery && (
              <button
                onClick={() => setLocalSearchQuery("")}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 select-none ${
              filtersActive
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                : "bg-white border-gray-220 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setIsColumnDropdownOpen(!isColumnDropdownOpen);
              }}
              className="rounded-lg border border-gray-220 bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 select-none"
            >
              <span>Column Visibility</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-25 text-xs">
                <div className="px-3 py-1 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 mb-1">
                  Toggle Columns
                </div>
                {Object.keys(visibleColumns).map((col) => (
                  <button
                    key={col}
                    onClick={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col as keyof VisibleColumns],
                      }))
                    }
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>{COLUMN_LABELS[col] || col}</span>
                    {visibleColumns[col as keyof VisibleColumns] && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="rounded-lg border border-gray-220 bg-white hover:bg-gray-50 p-1.5 text-xs font-bold text-gray-700 transition flex items-center justify-center select-none"
            title="Refresh dataset"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>

      </div>

      {(isFilterExpanded || activeFilterCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Weighbridge Site
            </label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Sites</option>
              {distinctSites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Product Name
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Products</option>
              {distinctNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Product Code
            </label>
            <select
              value={filterProductCode}
              onChange={(e) => setFilterProductCode(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Codes</option>
              {distinctCodes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-slate-200/50">
            <button
              onClick={() => {
                setFilterSite("All");
                setFilterStatus("All");
                setFilterProduct("All");
                setFilterProductCode("All");
                setLocalSearchQuery("");
              }}
              className="text-gray-500 hover:text-gray-800 font-bold px-2 py-1 text-[11px]"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
