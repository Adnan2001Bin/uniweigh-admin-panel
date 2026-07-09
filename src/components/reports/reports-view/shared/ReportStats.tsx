interface ReportStatsProps {
  countWeighs: number;
  totalLoadedNet: number;
  totalBilledVal: number;
}

export default function ReportStats({ countWeighs, totalLoadedNet, totalBilledVal }: ReportStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Sessions Audited</span>
        <span className="text-xl font-extrabold text-slate-900 mt-1 block">{countWeighs} weighbridge loads</span>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Accumulated Tonnage</span>
        <span className="text-xl font-extrabold text-blue-700 mt-1 block">{totalLoadedNet.toFixed(2)} Tonnes</span>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Subtotal Value Charged</span>
        <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
          ${totalBilledVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
