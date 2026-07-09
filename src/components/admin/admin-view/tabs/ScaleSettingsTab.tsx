import React, { useState } from "react";
import { Scale, Wrench, RefreshCw, Info } from "lucide-react";

export default function ScaleSettingsTab() {
  const [scalesState, setScalesState] = useState([
    { id: "Scale-A1", name: "Quarry scale A1 (Inbound)", status: "Active", calibrating: false },
    { id: "Scale-A2", name: "Quarry scale A2 (Inbound)", status: "Active", calibrating: false },
    { id: "Scale-B1", name: "Quarry scale B1 (Outbound)", status: "Active", calibrating: false },
    { id: "Scale-C1", name: "Coastal scale C1 (Combined)", status: "Active", calibrating: false },
    { id: "Scale-W1", name: "Recycle scale W1 (Combined)", status: "Maintenance", calibrating: false }
  ]);

  const calibrateScale = (id: string) => {
    setScalesState(sc => sc.map(s => s.id === id ? { ...s, calibrating: true } : s));
    setTimeout(() => {
      setScalesState(sc => sc.map(s => s.id === id ? { ...s, calibrating: false, status: "Active" } : s));
      alert(`Scale bed ${id} calibration certified successfully! Calibration stamps renewed raw.`);
    }, 1500);
  };

  const toggleStatus = (id: string) => {
    setScalesState(sc => sc.map(s => s.id === id ? {
      ...s,
      status: s.status === "Active" ? "Maintenance" : "Active"
    } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Physical Weighbridge Configuration</h3>
          <p className="text-xs text-gray-500">Recalibrate, lock, or place physical scale loadbeds in maintenance mode.</p>
        </div>
      </div>

      <div className="divide-y divide-gray-150">
        {scalesState.map((scale) => (
          <div key={scale.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Scale className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{scale.name}</div>
                <div className="font-mono text-xs text-gray-400">UUID ID: {scale.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end">
              <span className={`inline-flex rounded-sm px-2.5 py-0.5 text-xs font-bold leading-normal border uppercase tracking-wider ${
                scale.status === "Active" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-yellow-50 text-yellow-800 border-yellow-10 border-amber-200"
              }`}>
                {scale.status}
              </span>

              <button
                onClick={() => toggleStatus(scale.id)}
                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 transition select-none ${
                  scale.status === "Active"
                    ? "border border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {scale.status === "Active" ? "Toggle Maintenance" : "Bridge to Active"}
              </button>

              <button
                onClick={() => calibrateScale(scale.id)}
                disabled={scale.calibrating}
                className="rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-xs font-bold px-3 py-1.5 flex items-center gap-1 cursor-pointer disabled:bg-gray-200"
              >
                {scale.calibrating ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>taring...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="h-3 w-3" />
                    <span>Tar Zero</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50/25 border border-blue-100/50 p-4 font-normal flex gap-2 text-xs">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-blue-900 leading-normal space-y-1">
          <span className="font-bold">Scale digital calibration protocol:</span>
          <p>
            Weighbridges are regulated by legal weight licensing standards. Off-line maintenance blocks tickets submissions on that specific Scale ID automatically to protect operator audit history.
          </p>
        </div>
      </div>
    </div>
  );
}
