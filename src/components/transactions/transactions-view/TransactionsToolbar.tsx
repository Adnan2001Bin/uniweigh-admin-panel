import { useState } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TransactionsToolbarProps {
  activeChip: string;
  setActiveChip: (chip: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  activeAdvancedFilterCount: number;
  resetFilters: () => void;
  advType: string;
  setAdvType: (v: string) => void;
  advStatus: string;
  setAdvStatus: (v: string) => void;
  advCustomer: string;
  setAdvCustomer: (v: string) => void;
  advJobOrder: string;
  setAdvJobOrder: (v: string) => void;
  advProduct: string;
  setAdvProduct: (v: string) => void;
  advLot: string;
  setAdvLot: (v: string) => void;
  advCarter: string;
  setAdvCarter: (v: string) => void;
  advDriver: string;
  setAdvDriver: (v: string) => void;
  advVehicle: string;
  setAdvVehicle: (v: string) => void;
  advTicketNo: string;
  setAdvTicketNo: (v: string) => void;
  advTxCode: string;
  setAdvTxCode: (v: string) => void;
  advBalanceMin: string;
  setAdvBalanceMin: (v: string) => void;
  advBalanceMax: string;
  setAdvBalanceMax: (v: string) => void;
  advDateFrom: string;
  setAdvDateFrom: (v: string) => void;
  advDateTo: string;
  setAdvDateTo: (v: string) => void;
}

const columnLabels: Record<string, string> = {
  ticketCode: "Ticket / Code",
  date: "Transaction Date",
  vehicleDriver: "Vehicle & Driver",
  customer: "Invoiced To",
  material: "Material",
  netWeight: "Net Weight",
  type: "Type",
  status: "Status",
  action: "Action",
};

export default function TransactionsToolbar(props: TransactionsToolbarProps) {
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  const {
    activeChip,
    setActiveChip,
    showFilters,
    setShowFilters,
    visibleColumns,
    setVisibleColumns,
    activeAdvancedFilterCount,
    resetFilters,
    setAdvStatus,
  } = props;

  return (
    <div className=" p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">
            Weighbridge Transactions & Audit Log
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Operations / Transactions Control Hub
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto relative">
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
                    <span className="capitalize">
                      {columnLabels[col] || col}
                    </span>
                    {visibleColumns[col] && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1 select-none">
          Category Filters:
        </span>
        {[
          "All",
          "Account",
          "Cash",
          "Pending",
          "Approved",
          "Cancelled",
          "Committed",
          "Invoiced",
        ].map((chip) => {
          const isActive = activeChip === chip;
          return (
            <button
              key={chip}
              onClick={() => {
                setActiveChip(chip);
                if (chip !== "All" && chip !== "Account" && chip !== "Cash") {
                  setAdvStatus("All");
                }
              }}
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
                    Transaction Type
                  </label>
                  <select
                    value={props.advType}
                    onChange={(e) => props.setAdvType(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Types</option>
                    <option value="Account">Account</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Operational Status
                  </label>
                  <select
                    value={props.advStatus}
                    onChange={(e) => props.setAdvStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Committed">Committed</option>
                    <option value="Invoiced">Invoiced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Customer Name or ID
                  </label>
                  <input
                    type="text"
                    value={props.advCustomer}
                    onChange={(e) => props.setAdvCustomer(e.target.value)}
                    placeholder="e.g. Apex"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Job / Order Number
                  </label>
                  <input
                    type="text"
                    value={props.advJobOrder}
                    onChange={(e) => props.setAdvJobOrder(e.target.value)}
                    placeholder="e.g. JOB-2026-01"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Product / Material
                  </label>
                  <input
                    type="text"
                    value={props.advProduct}
                    onChange={(e) => props.setAdvProduct(e.target.value)}
                    placeholder="e.g. Crushed Rock"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    value={props.advLot}
                    onChange={(e) => props.setAdvLot(e.target.value)}
                    placeholder="e.g. LOT-A-42"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Carter (Carrier Name)
                  </label>
                  <input
                    type="text"
                    value={props.advCarter}
                    onChange={(e) => props.setAdvCarter(e.target.value)}
                    placeholder="e.g. Star Bulk"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={props.advDriver}
                    onChange={(e) => props.setAdvDriver(e.target.value)}
                    placeholder="e.g. Peterson"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Vehicle License Plate
                  </label>
                  <input
                    type="text"
                    value={props.advVehicle}
                    onChange={(e) => props.setAdvVehicle(e.target.value)}
                    placeholder="e.g. XY-99-ZZ"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Ticket Number
                  </label>
                  <input
                    type="text"
                    value={props.advTicketNo}
                    onChange={(e) => props.setAdvTicketNo(e.target.value)}
                    placeholder="e.g. WB-991244"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Transaction Code / ID
                  </label>
                  <input
                    type="text"
                    value={props.advTxCode}
                    onChange={(e) => props.setAdvTxCode(e.target.value)}
                    placeholder="e.g. TR-AC-912"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Account Balance Threshold
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={props.advBalanceMin}
                      onChange={(e) => props.setAdvBalanceMin(e.target.value)}
                      placeholder="Min $"
                      className="w-1/2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={props.advBalanceMax}
                      onChange={(e) => props.setAdvBalanceMax(e.target.value)}
                      placeholder="Max $"
                      className="w-1/2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Weigh Date Interval
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-1/2">
                      <input
                        type="date"
                        value={props.advDateFrom}
                        onChange={(e) => props.setAdvDateFrom(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">to</span>
                    <div className="relative w-1/2">
                      <input
                        type="date"
                        value={props.advDateTo}
                        onChange={(e) => props.setAdvDateTo(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
