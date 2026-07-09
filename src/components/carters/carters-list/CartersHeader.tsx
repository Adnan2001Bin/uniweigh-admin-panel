import React from "react";
import { Truck, Plus } from "lucide-react";

interface CartersHeaderProps {
  onAddCarter: () => void;
}

export default function CartersHeader({ onAddCarter }: CartersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-600" />
          Registered Transport Carters
        </h1>
        <p className="text-xs text-gray-400 font-bold">
          Administrative registry of freight, fleet cartage carriers, and
          transport logistics.
        </p>
      </div>

      <button
        onClick={onAddCarter}
        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg px-4 py-2 text-xs font-black transition flex items-center gap-2 self-start md:self-auto shadow-sm select-none cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add New Carter
      </button>
    </div>
  );
}
