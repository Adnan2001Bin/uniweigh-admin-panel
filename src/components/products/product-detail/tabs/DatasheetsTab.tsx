import React from "react";
import { FileText, Download, Tag, Upload, Check, X } from "lucide-react";
import { Product } from "../../../../types";
import { DatasheetFile } from "../utils/certificateHelpers";

interface LotDatasheet extends DatasheetFile {
  lotNumber: string;
}

interface ProductLotRef {
  lotNumber: string;
}

interface DatasheetsTabProps {
  selectedProduct: Product;
  productDatasheets: DatasheetFile[];
  lotDatasheetsList: LotDatasheet[];
  productLots: ProductLotRef[];

  datasheetType: "product" | "lot";
  setDatasheetType: (value: "product" | "lot") => void;
  selectedLotNo: string;
  setSelectedLotNo: (value: string) => void;
  uploadFileName: string;
  setUploadFileName: (value: string) => void;
  uploadFileSize: string;
  setUploadFileSize: (value: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;

  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteProductDatasheet: (fileName: string) => void;
  onDeleteLotDatasheet: (lotNo: string, fileName: string) => void;
  onUploadSubmit: (e: React.FormEvent) => void;
}

export default function DatasheetsTab({
  selectedProduct,
  productDatasheets,
  lotDatasheetsList,
  productLots,
  datasheetType,
  setDatasheetType,
  selectedLotNo,
  setSelectedLotNo,
  uploadFileName,
  setUploadFileName,
  uploadFileSize,
  setUploadFileSize,
  isUploading,
  setIsUploading,
  onFileChange,
  onDeleteProductDatasheet,
  onDeleteLotDatasheet,
  onUploadSubmit
}: DatasheetsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-3xs space-y-6">
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 pb-2.5">
            <span>Active Specifications & Certifications</span>
            <span className="bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              {productDatasheets.length + lotDatasheetsList.length} documents
            </span>
          </h3>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-l-2 border-blue-500 pl-2">
            Product Level Specifications ({productDatasheets.length})
          </h4>

          {productDatasheets.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-4 text-center text-gray-400 italic font-medium">
              No product level data sheets registered.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productDatasheets.map((ds, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 hover:border-blue-200 rounded-lg p-3.5 shadow-3xs flex items-center justify-between gap-3 group transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 block truncate" title={ds.name}>
                        {ds.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                        {ds.size} • Uploaded {ds.uploadedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteProductDatasheet(ds.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Spec File"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Downloading ${ds.name}. In a production environment, this will serve the real file binary.`);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Download Spec File"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-gray-100">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-l-2 border-amber-500 pl-2">
            Batch Lot Quality Certificates ({lotDatasheetsList.length})
          </h4>

          {lotDatasheetsList.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-4 text-center text-gray-400 italic font-medium">
              No lot batch certificates registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lotDatasheetsList.map((ds, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 hover:border-amber-200 rounded-lg p-3.5 shadow-3xs flex items-center justify-between gap-3 group transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-amber-50 text-amber-700 p-2 rounded-lg flex flex-col items-center">
                      <Tag className="h-3 w-3" />
                      <span className="text-[7px] font-black font-mono mt-0.5 uppercase">
                        {ds.lotNumber.split("-").slice(-1)[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 block truncate" title={ds.name}>
                        {ds.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                        {ds.size} • Lot {ds.lotNumber} • {ds.uploadedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteLotDatasheet(ds.lotNumber, ds.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Lot Certificate"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Downloading Certificate for ${ds.lotNumber}: ${ds.name}`);
                      }}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      title="Download Quality Certificate"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-3xs space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-600" />
            Register New Specification / Certificate
          </h3>
          <p className="text-[10px] text-gray-400 font-bold mt-1">
            Attach a new data sheet to the product profile or to a specific active lot batch.
          </p>
        </div>

        <form onSubmit={onUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Association Level</label>
              <div className="flex gap-2">
                <label
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer font-bold text-[11px] transition ${
                    datasheetType === "product"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="datasheetType"
                    checked={datasheetType === "product"}
                    onChange={() => setDatasheetType("product")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Product
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer font-bold text-[11px] transition ${
                    datasheetType === "lot"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="datasheetType"
                    checked={datasheetType === "lot"}
                    onChange={() => setDatasheetType("lot")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Lot
                </label>
              </div>
            </div>

            {datasheetType === "lot" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Select Lot</label>
                <select
                  value={selectedLotNo}
                  onChange={(e) => setSelectedLotNo(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Lot --</option>
                  {productLots.map((l) => (
                    <option key={l.lotNumber} value={l.lotNumber}>
                      {l.lotNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Document File</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-slate-50 border border-gray-200 hover:bg-slate-100 rounded-lg px-4 py-2 text-xs font-bold text-gray-700 transition flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Choose File
                <input type="file" className="hidden" onChange={onFileChange} accept=".pdf,.doc,.docx,.xlsx,.csv" />
              </label>
              {uploadFileName && (
                <span className="text-xs font-semibold text-gray-600 truncate max-w-xs">
                  {uploadFileName} ({uploadFileSize || "Unknown size"})
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg px-4 py-2 text-xs font-black flex items-center gap-1.5 transition select-none"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Upload & Register Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
