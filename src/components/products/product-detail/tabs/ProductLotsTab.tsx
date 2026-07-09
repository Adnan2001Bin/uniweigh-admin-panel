import React from "react";
import { Search, Plus, Tag } from "lucide-react";

interface ProductLotItem {
  lotNumber: string;
  orderQuantity: number;
  availableQuantity: number;
  status: "Active" | "Completed" | "Pending";
}

interface ProductLotsTabProps {
  lots: ProductLotItem[];
  search: string;
  setSearch: (value: string) => void;
  onAddLot: () => void;
}

export default function ProductLotsTab({ lots, search, setSearch, onAddLot }: ProductLotsTabProps) {
  const filteredLots = lots.filter((l) =>
    l.lotNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 border border-slate-100 rounded-lg p-3">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search product lots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none"
          />
          <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>

        <button
          onClick={onAddLot}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-black flex items-center gap-1.5 transition select-none"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3px]" />
          Register Lot Batch
        </button>
      </div>

      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-150 bg-slate-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">Lot ID</th>
              <th className="px-5 py-3">Lot Name</th>
              <th className="px-5 py-3 text-right">Available Quantity</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLots.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 font-medium">
                  No lot registers found belonging to this product.
                </td>
              </tr>
            ) : (
              filteredLots.map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-gray-900">{l.lotNumber}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-700">
                    Lot {l.lotNumber.replace(/[^0-9]/g, "") || idx + 1}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold font-mono text-blue-700">
                    {l.availableQuantity.toLocaleString()} tonnes
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black border ${
                        l.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : l.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-gray-50 text-gray-600 border-gray-150"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => alert(`Viewing inventory logs for Lot batch: ${l.lotNumber}`)}
                      className="text-blue-600 hover:text-blue-800 font-black text-xs"
                    >
                      Manage Inventory
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
