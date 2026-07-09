import React from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  RefreshCw,
  X,
} from "lucide-react";

interface CartersToolbarProps {
  localSearch: string;
  setLocalSearch: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  isFiltersActive: boolean;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterRateRange: string;
  setFilterRateRange: (value: string) => void;
  filterCreatedDate: string;
  setFilterCreatedDate: (value: string) => void;
  onResetFilters: () => void;
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (colKey: string) => void;
  showColumnsMenu: boolean;
  setShowColumnsMenu: (value: boolean) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function CartersToolbar({
  localSearch,
  setLocalSearch,
  showFilters,
  setShowFilters,
  isFiltersActive,
  filterStatus,
  setFilterStatus,
  filterRateRange,
  setFilterRateRange,
  filterCreatedDate,
  setFilterCreatedDate,
  onResetFilters,
  visibleColumns,
  onToggleColumn,
  showColumnsMenu,
  setShowColumnsMenu,
  isRefreshing,
  onRefresh,
}: CartersToolbarProps) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Leftside inputs (Search & filters toggler) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search carters by name, ID, phone..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-lg pl-9 pr-8 py-1.5 text-xs font-semibold placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-2 hover:text-red-600 text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 select-none ${
              showFilters || isFiltersActive
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-220 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {isFiltersActive && (
              <span className="bg-blue-600 text-white rounded-full h-4 min-w-4 px-1 text-[8px] font-black flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Rightside controls (Column Visibility, Refresh, Export dropdowns) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column visibility dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="rounded-lg border border-gray-220 bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 select-none"
            >
              Column Visibility
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {showColumnsMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-20 text-xs">
                <div className="px-3 py-1 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 mb-1">
                  Toggle Columns
                </div>
                {Object.keys(visibleColumns).map((col) => (
                  <button
                    key={col}
                    onClick={() => onToggleColumn(col)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center justify-between"
                  >
                    <span className="capitalize">
                      {col === "phone"
                        ? "Phone Number"
                        : col === "rate"
                          ? "Transport Rate"
                          : col}
                    </span>
                    {visibleColumns[col] && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="rounded-lg border border-gray-220 bg-white hover:bg-gray-50 p-1.5 text-xs font-bold text-gray-700 transition flex items-center justify-center select-none"
            title="Refresh ledger dataset"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expandable filters box */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Filter 1: Status */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-500 block">
              Carter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md p-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* Filter 2: Transport Rate */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-500 block">
              Transport Rate Range
            </label>
            <select
              value={filterRateRange}
              onChange={(e) => setFilterRateRange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md p-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="All">All Rates</option>
              <option value="Low">Low Rates (&lt; $12.00/t)</option>
              <option value="Medium">Medium Rates ($12.00 - $15.00/t)</option>
              <option value="High">High Rates (&gt; $15.00/t)</option>
            </select>
          </div>

          {/* Filter 3: Created Date */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-500 block">
              Registration Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filterCreatedDate}
                onChange={(e) => setFilterCreatedDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md p-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-[11px]"
              />
              {filterCreatedDate && (
                <button
                  onClick={() => setFilterCreatedDate("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Reset button block */}
          <div className="flex items-end">
            <button
              onClick={onResetFilters}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-2 rounded-md transition select-none text-[11px]"
            >
              Reset Filter Fields
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
