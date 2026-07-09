import React from "react";
import {
  X,
  Filter,
  RefreshCw,
  ChevronDown,
  Check,
} from "lucide-react";
import { Product } from "../../../types";

const COLUMN_LABELS: Record<string, string> = {
  id: "Product Lot ID",
  name: "Product Lot Name",
  product: "Product",
  orderQuantity: "Order Qty",
  usedQuantity: "Used Qty",
  remainingQuantity: "Remaining Qty",
  status: "Status",
  actions: "Actions",
};

type VisibleColumns = {
  id: boolean;
  name: boolean;
  product: boolean;
  orderQuantity: boolean;
  usedQuantity: boolean;
  remainingQuantity: boolean;
  status: boolean;
  actions: boolean;
};

interface ProductLotsToolbarProps {
  localSearchQuery: string;
  setLocalSearchQuery: (value: string) => void;

  isFilterExpanded: boolean;
  setIsFilterExpanded: (value: boolean) => void;
  filterProduct: string;
  setFilterProduct: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterRemainingQty: string;
  setFilterRemainingQty: (value: string) => void;
  filterCreatedDate: string;
  setFilterCreatedDate: (value: string) => void;

  visibleColumns: VisibleColumns;
  setVisibleColumns: React.Dispatch<React.SetStateAction<VisibleColumns>>;
  isColumnDropdownOpen: boolean;
  setIsColumnDropdownOpen: (value: boolean) => void;

  isRefreshing: boolean;
  onRefresh: () => void;

  selectedLotIdsCount: number;
  distinctProducts: Product[];
}

export default function ProductLotsToolbar({
  localSearchQuery,
  setLocalSearchQuery,
  isFilterExpanded,
  setIsFilterExpanded,
  filterProduct,
  setFilterProduct,
  filterStatus,
  setFilterStatus,
  filterRemainingQty,
  setFilterRemainingQty,
  filterCreatedDate,
  setFilterCreatedDate,
  visibleColumns,
  setVisibleColumns,
  isColumnDropdownOpen,
  setIsColumnDropdownOpen,
  isRefreshing,
  onRefresh,
  selectedLotIdsCount,
  distinctProducts,
}: ProductLotsToolbarProps) {
  const activeFilterCount = [
    filterProduct !== "All",
    filterStatus !== "All",
    filterRemainingQty !== "All",
    !!filterCreatedDate,
  ].filter(Boolean).length;

  const filtersActive = isFilterExpanded || activeFilterCount > 0;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search Product Lots..."
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
              <div className="absolute left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-20 text-xs">
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
              Product Match
            </label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Products</option>
              {distinctProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.productCode || p.id}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Lot Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Remaining Quantity
            </label>
            <select
              value={filterRemainingQty}
              onChange={(e) => setFilterRemainingQty(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Quantities</option>
              <option value="Fully Used">
                Fully Used (0 or Less Remaining)
              </option>
              <option value="Has Remaining">Has Remaining ( &gt; 0 )</option>
              <option value="Overfilled">Overallocated ( &lt; 0 )</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Created Date
            </label>
            <input
              type="date"
              value={filterCreatedDate}
              onChange={(e) => setFilterCreatedDate(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white p-1.5 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-slate-200/50">
            <button
              onClick={() => {
                setFilterProduct("All");
                setFilterStatus("All");
                setFilterRemainingQty("All");
                setFilterCreatedDate("");
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
