import React, { useState, useMemo } from "react";
import { AlertCircle, ArrowLeft, Tag, Briefcase, Receipt, DollarSign, FileText } from "lucide-react";
import { Product, Job, Transaction } from "../../types";
import ProductHeader from "./product-detail/ProductHeader";
import ProductSummaryCards from "./product-detail/ProductSummaryCards";
import ProductLotsTab from "./product-detail/tabs/ProductLotsTab";
import JobsTab from "./product-detail/tabs/JobsTab";
import TransactionsTab from "./product-detail/tabs/TransactionsTab";
import PricingTab from "./product-detail/tabs/PricingTab";
import DatasheetsTab from "./product-detail/tabs/DatasheetsTab";
import AddLotModal from "./product-detail/modals/AddLotModal";
import ExportProductModal from "./product-detail/modals/ExportProductModal";
import { buildProductExportData, downloadProductExport, ExportTarget } from "./product-detail/utils/exportHelpers";
import { getDefaultProductDatasheets, getDefaultLotDatasheet } from "./product-detail/utils/certificateHelpers";

interface ProductDetailStandaloneViewProps {
  products: Product[];
  onUpdateProduct: (updatedProduct: Product, oldId?: string) => void;
  productId?: string;
  onBack?: () => void;
  jobs?: Job[];
  transactions?: Transaction[];
}

export default function ProductDetailStandaloneView({
  products,
  onUpdateProduct,
  productId,
  onBack,
  jobs = [],
  transactions = []
}: ProductDetailStandaloneViewProps) {
  const activeProductId = useMemo(() => {
    if (productId) return productId;
    const params = new URLSearchParams(window.location.search);
    return params.get("product_id") || products[0]?.id || "";
  }, [productId, products]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId);
  }, [products, activeProductId]);

  const [activeTab, setActiveTab] = useState<"lots" | "jobs" | "transactions" | "pricing" | "datasheets">("lots");

  const [lotsSearch, setLotsSearch] = useState("");
  const [jobsSearch, setJobsSearch] = useState("");
  const [txSearch, setTxSearch] = useState("");

  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [newLotNo, setNewLotNo] = useState("");
  const [newLotQty, setNewLotQty] = useState("");

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<ExportTarget>("summary");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  const [datasheetType, setDatasheetType] = useState<"product" | "lot">("product");
  const [selectedLotNo, setSelectedLotNo] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!selectedProduct) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 shadow-sm space-y-4">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-extrabold text-gray-900">Product Specification Record Not Found</h3>
        <p className="text-xs text-gray-500 leading-normal">
          The requested product ID could not be loaded or retrieved. It may have been archived or is restricted from current site permissions.
        </p>
        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-black tracking-wide inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product Catalog
        </button>
      </div>
    );
  }

  const productJobs = useMemo(() => {
    return jobs.filter((j) => j.productId === selectedProduct.id);
  }, [jobs, selectedProduct]);

  const productTransactions = useMemo(() => {
    return transactions.filter((t) => t.productId === selectedProduct.id);
  }, [transactions, selectedProduct]);

  const productLots = useMemo(() => {
    return selectedProduct.recentLots || [];
  }, [selectedProduct]);

  const defaultPrice = selectedProduct.defaultPrice ?? selectedProduct.basePrice ?? 0;
  const p1Price = selectedProduct.priceLevel1;
  const p2Price = selectedProduct.priceLevel2;
  const p3Price = selectedProduct.priceLevel3;

  const productDatasheets = useMemo(() => {
    return selectedProduct.datasheets || getDefaultProductDatasheets(selectedProduct.name);
  }, [selectedProduct.datasheets, selectedProduct.name]);

  const lotDatasheetsList = useMemo(() => {
    const list: { lotNumber: string; name: string; size: string; uploadedAt: string }[] = [];
    productLots.forEach((l) => {
      if (l.datasheets && l.datasheets.length > 0) {
        l.datasheets.forEach((ds) => {
          list.push({ lotNumber: l.lotNumber, ...ds });
        });
      } else {
        list.push({ lotNumber: l.lotNumber, ...getDefaultLotDatasheet(l.lotNumber) });
      }
    });
    return list;
  }, [productLots]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const sizeInMb = file.size / (1024 * 1024);
      if (sizeInMb < 0.1) {
        setUploadFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      } else {
        setUploadFileSize(`${sizeInMb.toFixed(1)} MB`);
      }
    }
  };

  const handleDeleteProductDatasheet = (fileName: string) => {
    const filtered = productDatasheets.filter((ds) => ds.name !== fileName);
    onUpdateProduct({
      ...selectedProduct,
      datasheets: filtered
    });
  };

  const handleDeleteLotDatasheet = (lotNo: string, fileName: string) => {
    const updatedRecentLots = (selectedProduct.recentLots || []).map((l) => {
      if (l.lotNumber === lotNo) {
        const currentList = l.datasheets || [getDefaultLotDatasheet(l.lotNumber)];
        const filtered = currentList.filter((ds) => ds.name !== fileName);
        return { ...l, datasheets: filtered };
      }
      return l;
    });

    onUpdateProduct({
      ...selectedProduct,
      recentLots: updatedRecentLots
    });
  };

  const handleUploadDatasheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (datasheetType === "lot" && !selectedLotNo) {
      alert("Please select a Product Lot for association.");
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const sizeStr = uploadFileSize || `${(Math.random() * 2 + 0.5).toFixed(1)} MB`;
      const nameStr = uploadFileName.trim() || `Uploaded_Doc_${Date.now().toString().slice(-4)}.pdf`;
      const dateStr = new Date().toISOString().replace("T", " ").slice(0, 16);

      const newFile = {
        name:
          nameStr.endsWith(".pdf") ||
          nameStr.endsWith(".doc") ||
          nameStr.endsWith(".docx") ||
          nameStr.endsWith(".xlsx") ||
          nameStr.endsWith(".csv")
            ? nameStr
            : `${nameStr}.pdf`,
        size: sizeStr,
        uploadedAt: dateStr
      };

      if (datasheetType === "product") {
        onUpdateProduct({
          ...selectedProduct,
          datasheets: [newFile, ...productDatasheets]
        });
      } else {
        const updatedRecentLots = (selectedProduct.recentLots || []).map((l) => {
          if (l.lotNumber === selectedLotNo) {
            const currentList = l.datasheets || [getDefaultLotDatasheet(l.lotNumber)];
            return { ...l, datasheets: [newFile, ...currentList] };
          }
          return l;
        });
        onUpdateProduct({
          ...selectedProduct,
          recentLots: updatedRecentLots
        });
      }

      setIsUploading(false);
      setUploadFileName("");
      setUploadFileSize("");
      alert(`Document "${newFile.name}" has been uploaded and registered successfully.`);
    }, 600);
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExportOpen(false);
    const exportData = buildProductExportData(
      selectedProduct,
      exportTarget,
      productLots,
      productJobs,
      productTransactions,
      defaultPrice,
      p1Price,
      p2Price,
      p3Price
    );
    downloadProductExport(exportData, exportFormat);
  };

  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotNo.trim()) {
      alert("Lot ID is required.");
      return;
    }
    const qty = parseFloat(newLotQty) || 1000;

    const newLotItem = {
      lotNumber: newLotNo.trim(),
      orderQuantity: qty,
      availableQuantity: qty,
      status: "Active" as const
    };

    const updatedProduct = {
      ...selectedProduct,
      recentLots: [newLotItem, ...(selectedProduct.recentLots || [])]
    };

    onUpdateProduct(updatedProduct);
    setIsAddLotOpen(false);
    setNewLotNo("");
    setNewLotQty("");
    alert(`Successfully registered new lot ${newLotItem.lotNumber} with available inventory.`);
  };

  const tabButtonClass = (tab: typeof activeTab) =>
    `px-5 py-3.5 text-xs font-black tracking-wide border-b-2 flex items-center gap-2 transition ${
      activeTab === tab
        ? "border-blue-600 text-blue-700 bg-white"
        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-slate-100/40"
    }`;

  return (
    <div className="space-y-6">
      <ProductHeader selectedProduct={selectedProduct} onBack={onBack} onExport={() => setIsExportOpen(true)} />

      <ProductSummaryCards
        selectedProduct={selectedProduct}
        defaultPrice={defaultPrice}
        p1Price={p1Price}
        p2Price={p2Price}
        p3Price={p3Price}
      />

      <div className="bg-white border border-gray-150 rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-gray-150 bg-slate-50/50 select-none">
          <button onClick={() => setActiveTab("lots")} className={tabButtonClass("lots")}>
            <Tag className="h-4 w-4" />
            Product Lots
            <span className="bg-gray-200 text-gray-700 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              {productLots.length}
            </span>
          </button>

          <button onClick={() => setActiveTab("jobs")} className={tabButtonClass("jobs")}>
            <Briefcase className="h-4 w-4" />
            Active Jobs
            <span className="bg-gray-200 text-gray-700 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              {productJobs.length}
            </span>
          </button>

          <button onClick={() => setActiveTab("transactions")} className={tabButtonClass("transactions")}>
            <Receipt className="h-4 w-4" />
            Transactions
            <span className="bg-gray-200 text-gray-700 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              {productTransactions.length}
            </span>
          </button>

          <button onClick={() => setActiveTab("pricing")} className={tabButtonClass("pricing")}>
            <DollarSign className="h-4 w-4" />
            Pricing Matrix
          </button>

          <button onClick={() => setActiveTab("datasheets")} className={tabButtonClass("datasheets")}>
            <FileText className="h-4 w-4" />
            Data Sheets & Certs
            <span className="bg-gray-200 text-gray-700 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">
              {(selectedProduct.datasheets || []).length +
                productLots.reduce((acc, l) => acc + (l.datasheets?.length !== undefined ? l.datasheets.length : 1), 0)}
            </span>
          </button>
        </div>

        <div className="p-5">
          {activeTab === "lots" && (
            <ProductLotsTab
              lots={productLots}
              search={lotsSearch}
              setSearch={setLotsSearch}
              onAddLot={() => setIsAddLotOpen(true)}
            />
          )}

          {activeTab === "jobs" && (
            <JobsTab jobs={productJobs} search={jobsSearch} setSearch={setJobsSearch} />
          )}

          {activeTab === "transactions" && (
            <TransactionsTab transactions={productTransactions} search={txSearch} setSearch={setTxSearch} />
          )}

          {activeTab === "pricing" && (
            <PricingTab
              defaultPrice={defaultPrice}
              p1Price={p1Price}
              p2Price={p2Price}
              p3Price={p3Price}
              productJobs={productJobs}
            />
          )}

          {activeTab === "datasheets" && (
            <DatasheetsTab
              selectedProduct={selectedProduct}
              productDatasheets={productDatasheets}
              lotDatasheetsList={lotDatasheetsList}
              productLots={productLots}
              datasheetType={datasheetType}
              setDatasheetType={setDatasheetType}
              selectedLotNo={selectedLotNo}
              setSelectedLotNo={setSelectedLotNo}
              uploadFileName={uploadFileName}
              setUploadFileName={setUploadFileName}
              uploadFileSize={uploadFileSize}
              setUploadFileSize={setUploadFileSize}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onFileChange={handleFileChange}
              onDeleteProductDatasheet={handleDeleteProductDatasheet}
              onDeleteLotDatasheet={handleDeleteLotDatasheet}
              onUploadSubmit={handleUploadDatasheetSubmit}
            />
          )}
        </div>
      </div>

      <AddLotModal
        isOpen={isAddLotOpen}
        lotNo={newLotNo}
        setLotNo={setNewLotNo}
        quantity={newLotQty}
        setQuantity={setNewLotQty}
        onClose={() => setIsAddLotOpen(false)}
        onSubmit={handleAddLot}
      />

      <ExportProductModal
        isOpen={isExportOpen}
        exportTarget={exportTarget}
        setExportTarget={setExportTarget}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        onClose={() => setIsExportOpen(false)}
        onSubmit={handleExportSubmit}
      />
    </div>
  );
}
