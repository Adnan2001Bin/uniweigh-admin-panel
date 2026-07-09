import React from "react";
import { User, Plus } from "lucide-react";

interface DriversHeaderProps {
  onAddDriver: () => void;
}

export default function DriversHeader({ onAddDriver }: DriversHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-2xl flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600 animate-pulse" />
          Registered Logistics Drivers
        </h1>
        <p className="text-xs text-gray-400 font-bold">
          Administrative tracking, identity validations, licensing compliance,
          and logistical carriage specifications.
        </p>
      </div>

      <button
        onClick={onAddDriver}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-black transition flex items-center gap-2 self-start md:self-auto shadow-sm cursor-pointer select-none"
      >
        <Plus className="h-4 w-4" />
        Add New Driver
      </button>
    </div>
  );
}
