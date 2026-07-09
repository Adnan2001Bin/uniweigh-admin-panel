import React from "react";
import { Check, Printer, Play } from "lucide-react";
import { Transaction } from "../../../../types";

interface SuccessScreenProps {
  transaction: Transaction;
  totalAmount: number;
  onPrint: () => void;
  onNext: () => void;
}

export default function SuccessScreen({ transaction, totalAmount, onPrint, onNext }: SuccessScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-xl mx-auto w-full text-center">
      <div className="bg-emerald-50 rounded-full p-6 text-emerald-600 border border-emerald-200 mb-6">
        <Check className="h-12 w-12" />
      </div>

      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transaction Created Successfully!</h2>
      <p className="text-slate-500 text-sm mt-2">
        Weighbridge transaction ticket registered in database and synced to Admin Panel.
      </p>

      {/* Quick summary receipt box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md w-full mt-8 text-left space-y-4">
        <div className="flex justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs text-slate-400 uppercase font-black">Docket Details</span>
          <span className="text-xs font-black text-slate-800">{transaction.ticketNo}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Customer:</span>
            <p className="font-extrabold text-slate-800">{transaction.customerName}</p>
          </div>
          <div>
            <span className="text-slate-500">Vehicle Plate:</span>
            <p className="font-extrabold text-slate-800">{transaction.vehicleReg}</p>
          </div>
          <div>
            <span className="text-slate-500">Product Load:</span>
            <p className="font-extrabold text-slate-800">{transaction.productName}</p>
          </div>
          <div>
            <span className="text-slate-500">Net Weight:</span>
            <p className="font-extrabold text-slate-800">{transaction.netWeight.toFixed(2)} t</p>
          </div>
          <div>
            <span className="text-slate-500">Lot Number:</span>
            <p className="font-mono font-bold text-slate-800">{transaction.lotNo || "N/A"}</p>
          </div>
          {transaction.type !== "Account" ? (
            <div>
              <span className="text-slate-500">Invoice Amount:</span>
              <p className="font-mono font-black text-blue-600 text-sm">${totalAmount.toFixed(2)}</p>
            </div>
          ) : (
            <div>
              <span className="text-slate-500">Invoice Status:</span>
              <p className="font-semibold text-blue-700">Billed Later</p>
            </div>
          )}
          <div>
            <span className="text-slate-500">Operator:</span>
            <p className="font-semibold text-slate-800">{transaction.operatorId}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full mt-10">
        <button
          onClick={onPrint}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold h-12 rounded-xl text-sm transition select-none cursor-pointer shadow-md"
        >
          <Printer className="h-5 w-5" />
          <span>Print Paper Docket</span>
        </button>

        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold h-12 rounded-xl text-sm transition select-none cursor-pointer shadow-md"
        >
          <Play className="h-5 w-5" />
          <span>Next Vehicle</span>
        </button>
      </div>
    </div>
  );
}
