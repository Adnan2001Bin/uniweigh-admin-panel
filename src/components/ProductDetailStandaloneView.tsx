import React, { useState, useMemo } from "react";
import {
  Package,
  DollarSign,
  Building,
  CheckCircle,
  Calendar,
  Briefcase,
  Receipt,
  FileText,
  Download,
  ArrowLeft,
  AlertCircle,
  Plus,
  Search,
  Check,
  Tag,
  CircleAlert,
  Sliders,
  X,
  Upload,
  Trash2
} from "lucide-react";
import { Product, Job, Transaction } from "../types";
import { toast } from "sonner";
import { RadioBox } from "@/src/components/ui/radio-group";

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
  // Parse product_id from prop or query params
  const activeProductId = useMemo(() => {
    if (productId) return productId;
    const params = new URLSearchParams(window.location.search);
    return params.get("product_id") || products[0]?.id || "";
  }, [productId, products]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId);
  }, [products, activeProductId]);

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState<"lots" | "jobs" | "transactions" | "pricing" | "datasheets">("lots");

  // Tab Search queries
  const [lotsSearch, setLotsSearch] = useState("");
  const [jobsSearch, setJobsSearch] = useState("");
  const [txSearch, setTxSearch] = useState("");

  // Managing lots simple modal state
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [newLotNo, setNewLotNo] = useState("");
  const [newLotQty, setNewLotQty] = useState("");

  // Global consolidated export state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<"summary" | "lots" | "jobs" | "transactions" | "pricing" | "all">("summary");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  // If product is not found, show error state with back link
  if (!selectedProduct) {
    return (
      <div className="bg-card border border-border rounded-md p-12 text-center max-w-xl mx-auto my-12 shadow-sm space-y-4">
        <AlertCircle className="h-12 w-12 text-warning mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Product Specification Record Not Found</h3>
        <p className="text-xs text-muted-foreground leading-normal">The requested product ID could not be loaded or retrieved. It may have been archived or is restricted from current site permissions.</p>
        <button
          onClick={onBack}
          className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-xs font-bold tracking-wide inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product Catalog
        </button>
      </div>
    );
  }

  // Calculate stats / relations
  const productJobs = useMemo(() => {
    return jobs.filter((j) => j.productId === selectedProduct.id);
  }, [jobs, selectedProduct]);

  const productTransactions = useMemo(() => {
    return transactions.filter((t) => t.productId === selectedProduct.id);
  }, [transactions, selectedProduct]);

  const productLots = useMemo(() => {
    // Standardize product lots array
    const lots = selectedProduct.recentLots || [];
    return lots;
  }, [selectedProduct]);

  // Filter lots based on query
  const filteredLots = useMemo(() => {
    return productLots.filter((l) =>
      l.lotNumber.toLowerCase().includes(lotsSearch.toLowerCase())
    );
  }, [productLots, lotsSearch]);

  // Filter jobs based on query
  const filteredJobs = useMemo(() => {
    return productJobs.filter((j) =>
      j.id.toLowerCase().includes(jobsSearch.toLowerCase()) ||
      j.customerName.toLowerCase().includes(jobsSearch.toLowerCase()) ||
      j.customerOrderRef.toLowerCase().includes(jobsSearch.toLowerCase())
    );
  }, [productJobs, jobsSearch]);

  // Filter transactions based on query
  const filteredTxs = useMemo(() => {
    return productTransactions.filter((t) =>
      t.id.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.ticketNo.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.customerName.toLowerCase().includes(txSearch.toLowerCase())
    );
  }, [productTransactions, txSearch]);

  // Pricing analysis
  const defaultPrice = selectedProduct.defaultPrice ?? selectedProduct.basePrice ?? 0;
  const p1Price = selectedProduct.priceLevel1;
  const p2Price = selectedProduct.priceLevel2;
  const p3Price = selectedProduct.priceLevel3;

  const jobsByDefaultPrice = productJobs.filter(j => j.pricingType === "Default Product Price" || j.appliedRate === defaultPrice);
  const jobsByP1 = p1Price ? productJobs.filter(j => j.pricingType === "Product Tier 1" || j.appliedRate === p1Price) : [];
  const jobsByP2 = p2Price ? productJobs.filter(j => j.pricingType === "Product Tier 2" || j.appliedRate === p2Price) : [];
  const jobsByP3 = p3Price ? productJobs.filter(j => j.pricingType === "Product Tier 3" || j.appliedRate === p3Price) : [];
  const jobsByCustom = productJobs.filter(j => j.pricingType === "Custom Contract Price");

  // Datasheet form states
  const [datasheetType, setDatasheetType] = useState<"product" | "lot">("product");
  const [selectedLotNo, setSelectedLotNo] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Pre-load default mock datasheets for demo if none exist
  const productDatasheets = useMemo(() => {
    return selectedProduct.datasheets || [
      {
        name: `${selectedProduct.name.replace(/\s+/g, "_")}_Technical_Specification_v4.pdf`,
        size: "1.4 MB",
        uploadedAt: "2026-05-12 10:30"
      },
      {
        name: `Material_Safety_Data_Sheet_MSDS_Compliance.pdf`,
        size: "820 KB",
        uploadedAt: "2026-06-01 14:15"
      }
    ];
  }, [selectedProduct.datasheets, selectedProduct.name]);

  // Pre-load default mock lot datasheets
  const lotDatasheetsList = useMemo(() => {
    const list: { lotNumber: string; name: string; size: string; uploadedAt: string; }[] = [];
    productLots.forEach((l) => {
      if (l.datasheets && l.datasheets.length > 0) {
        l.datasheets.forEach((ds) => {
          list.push({
            lotNumber: l.lotNumber,
            ...ds
          });
        });
      } else {
        list.push({
          lotNumber: l.lotNumber,
          name: `SGS_Quality_Certificate_Lot_${l.lotNumber}.pdf`,
          size: "450 KB",
          uploadedAt: "2026-06-15 09:00"
        });
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
    const filtered = productDatasheets.filter(ds => ds.name !== fileName);
    onUpdateProduct({
      ...selectedProduct,
      datasheets: filtered
    });
  };

  const handleDeleteLotDatasheet = (lotNo: string, fileName: string) => {
    const updatedRecentLots = (selectedProduct.recentLots || []).map(l => {
      if (l.lotNumber === lotNo) {
        const currentList = l.datasheets || [
          {
            name: `SGS_Quality_Certificate_Lot_${l.lotNumber}.pdf`,
            size: "450 KB",
            uploadedAt: "2026-06-15 09:00"
          }
        ];
        const filtered = currentList.filter(ds => ds.name !== fileName);
        return {
          ...l,
          datasheets: filtered
        };
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
      toast.info("Please select a Product Lot for association.");
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const sizeStr = uploadFileSize || `${(Math.random() * 2 + 0.5).toFixed(1)} MB`;
      const nameStr = uploadFileName.trim() || `Uploaded_Doc_${Date.now().toString().slice(-4)}.pdf`;
      const dateStr = new Date().toISOString().replace("T", " ").slice(0, 16);

      const newFile = {
        name: nameStr.endsWith(".pdf") || nameStr.endsWith(".doc") || nameStr.endsWith(".docx") || nameStr.endsWith(".xlsx") || nameStr.endsWith(".csv") ? nameStr : `${nameStr}.pdf`,
        size: sizeStr,
        uploadedAt: dateStr
      };

      if (datasheetType === "product") {
        onUpdateProduct({
          ...selectedProduct,
          datasheets: [newFile, ...productDatasheets]
        });
      } else {
        const updatedRecentLots = (selectedProduct.recentLots || []).map(l => {
          if (l.lotNumber === selectedLotNo) {
            const currentList = l.datasheets || [
              {
                name: `SGS_Quality_Certificate_Lot_${l.lotNumber}.pdf`,
                size: "450 KB",
                uploadedAt: "2026-06-15 09:00"
              }
            ];
            return {
              ...l,
              datasheets: [newFile, ...currentList]
            };
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
      toast.success(`Document "${newFile.name}" has been uploaded and registered successfully.`);
    }, 600);
  };

  // Export action handler
  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExportOpen(false);

    let exportHeaders: string[] = [];
    let exportRows: any[][] = [];
    let filename = `uniweigh_${selectedProduct.id}_${exportTarget}_export_${Date.now()}`;

    if (exportTarget === "summary") {
      exportHeaders = ["Attribute", "Value"];
      exportRows = [
        ["Product ID", selectedProduct.id],
        ["Product Code", selectedProduct.productCode || selectedProduct.id],
        ["Product Name", selectedProduct.name],
        ["Operating Site", selectedProduct.site || "Melbourne Eastern Quarry"],
        ["Unit of Measure", selectedProduct.unitOfMeasure || "Tonnes"],
        ["Status", selectedProduct.status],
        ["Default Price ($)", defaultPrice.toFixed(2)],
        ["Price Level 1 ($)", p1Price !== undefined ? p1Price.toFixed(2) : "N/A"],
        ["Price Level 2 ($)", p2Price !== undefined ? p2Price.toFixed(2) : "N/A"],
        ["Price Level 3 ($)", p3Price !== undefined ? p3Price.toFixed(2) : "N/A"],
        ["Notes", selectedProduct.notes || "No notes registered."]
      ];
    } else if (exportTarget === "lots") {
      exportHeaders = ["Lot ID", "Lot Name", "Order Quantity", "Available Quantity", "Status"];
      exportRows = productLots.map(l => [
        l.lotNumber,
        `Lot ${l.lotNumber.replace(/[^0-9]/g, "") || l.lotNumber}`,
        l.orderQuantity,
        l.availableQuantity,
        l.status
      ]);
    } else if (exportTarget === "jobs") {
      exportHeaders = ["Job ID", "Customer", "Order Reference", "Order Quantity (t)", "Delivered Quantity (t)", "Remaining Quantity (t)", "Status", "Contract Price Type"];
      exportRows = productJobs.map(j => [
        j.id,
        j.customerName,
        j.customerOrderRef,
        j.orderQty,
        j.deliveredQty,
        j.orderQty - j.deliveredQty,
        j.status,
        j.pricingType
      ]);
    } else if (exportTarget === "transactions") {
      exportHeaders = ["Transaction ID", "Type", "Ticket Number", "Customer", "Job ID", "Product Lot", "Net Weight (t)", "Total Value ($)", "Status", "Created Date"];
      exportRows = productTransactions.map(t => [
        t.id,
        t.type,
        t.ticketNo,
        t.customerName,
        t.jobOrder || "N/A",
        t.lotNo || "N/A",
        t.netWeight,
        t.totalValue,
        t.status,
        t.firstWeighTime?.split(" ")[0] || "N/A"
      ]);
    } else if (exportTarget === "pricing") {
      exportHeaders = ["Price Tier", "Configured Rate ($)", "Associated Active Jobs"];
      exportRows = [
        ["Default Price", defaultPrice.toFixed(2), jobsByDefaultPrice.map(j => j.id).join("; ") || "None"],
        ["Price Level 1", p1Price !== undefined ? p1Price.toFixed(2) : "N/A", jobsByP1.map(j => j.id).join("; ") || "None"],
        ["Price Level 2", p2Price !== undefined ? p2Price.toFixed(2) : "N/A", jobsByP2.map(j => j.id).join("; ") || "None"],
        ["Price Level 3", p3Price !== undefined ? p3Price.toFixed(2) : "N/A", jobsByP3.map(j => j.id).join("; ") || "None"]
      ];
    } else {
      // Export all combined
      exportHeaders = ["Data Segment", "Item Attributes", "Status/Details"];
      exportRows = [
        ["Product Summary", `${selectedProduct.name} (Code: ${selectedProduct.productCode || selectedProduct.id})`, `Site: ${selectedProduct.site}`],
        ["Total Lots", `${productLots.length} registered lots`, ""],
        ["Total Jobs", `${productJobs.length} active jobs`, ""],
        ["Total Transactions", `${productTransactions.length} transaction tickets`, ""]
      ];
    }

    if (exportFormat === "CSV") {
      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        [exportHeaders.join(","), ...exportRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info(`Exporting ${exportTarget} in ${exportFormat} format. Your download will begin in a moment.`);
    }
  };

  // Add Lot handler
  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotNo.trim()) {
      toast.error("Lot ID is required.");
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
    toast.success(`Successfully registered new lot ${newLotItem.lotNumber} with available inventory.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-md border border-border hover:border-input bg-card hover:bg-muted p-1.5 transition text-muted-foreground hover:text-foreground"
              title="Return to Product Listing"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Package className="h-5 w-5 text-info" />
              {selectedProduct.name} Profile Page
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Product ID: <span className="font-mono text-foreground">{selectedProduct.id}</span> • Code: <span className="font-mono text-foreground">{selectedProduct.productCode || selectedProduct.id}</span>
            </p>
          </div>
        </div>

        {/* Global Export Action */}
        <button
          onClick={() => setIsExportOpen(true)}
          className="bg-card border border-border hover:bg-muted text-foreground rounded-md px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5 transition select-none"
        >
          <Download className="h-4 w-4 text-muted-foreground" />
          Export Product Report
        </button>
      </div>

      {/* Product Summary Card Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Core Product Details Summary block */}
        <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-muted border-b border-border flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Details</h3>
          </div>
          <div className="p-5 space-y-3.5 flex-1">
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Product ID</span>
                <span className="font-bold text-foreground font-mono text-sm">{selectedProduct.id}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Product Code</span>
                <span className="font-bold text-foreground font-mono text-sm">{selectedProduct.productCode || selectedProduct.id}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Product Name</span>
                <span className="font-bold text-foreground text-sm">{selectedProduct.name}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Weighbridge Site</span>
                <span className="font-semibold text-foreground text-sm">{selectedProduct.site || "Melbourne Eastern Quarry"}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Unit of Measure</span>
                <span className="font-bold text-foreground text-sm">{selectedProduct.unitOfMeasure || "Tonnes"}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Status</span>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border mt-1 ${
                  selectedProduct.status === "Active"
                    ? "bg-success/10 text-success border-success/25"
                    : "bg-destructive/10 text-destructive border-destructive/25"
                }`}>
                  {selectedProduct.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card Section */}
        <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-muted border-b border-border flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-info" />
            <h3 className="text-xs font-bold text-info uppercase tracking-widest">Central Pricing</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-info/10 border border-info/25 rounded-md p-2.5">
                <span className="text-xs font-bold text-info uppercase tracking-widest block">Default Price</span>
                <span className="text-base font-bold text-info font-mono">
                  ${defaultPrice.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">Per {selectedProduct.unitOfMeasure || "Tonne"}</span>
              </div>

              <div className="bg-muted border border-border rounded-md p-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Price Level 1</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {p1Price !== undefined ? `$${p1Price.toFixed(2)}` : "Not Set"}
                </span>
              </div>

              <div className="bg-muted border border-border rounded-md p-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Price Level 2</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {p2Price !== undefined ? `$${p2Price.toFixed(2)}` : "Not Set"}
                </span>
              </div>

              <div className="bg-muted border border-border rounded-md p-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Price Level 3</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {p3Price !== undefined ? `$${p3Price.toFixed(2)}` : "Not Set"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-tight">These tier properties are maintained globally within the Product profile. Individual Job modules link to their preferred level on dispatch.</p>
          </div>
        </div>

        {/* Product Notes Card Section */}
        <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-muted border-b border-border flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Notes</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="bg-warning/10 border border-warning/30 rounded-md p-3.5 text-xs text-warning leading-relaxed font-medium italic min-h-[100px]">
              {selectedProduct.notes || selectedProduct.description || "No specific guidelines or product specifications recorded for this material register."}
            </div>
            <span className="text-xs text-muted-foreground text-right block mt-2">Last updated by Admin Operator</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
        
        {/* TAB CONTROLS BAR */}
        <div className="flex border-b border-border bg-muted select-none">
          <button
            onClick={() => setActiveTab("lots")}
            className={`px-5 py-3.5 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition ${
              activeTab === "lots"
                ? "border-accent text-foreground bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Tag className="h-4 w-4" />
            Product Lots
            <span className="bg-secondary text-foreground font-mono text-xs px-1.5 py-0.5 rounded-md font-bold">
              {productLots.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-5 py-3.5 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition ${
              activeTab === "jobs"
                ? "border-accent text-foreground bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Active Jobs
            <span className="bg-secondary text-foreground font-mono text-xs px-1.5 py-0.5 rounded-md font-bold">
              {productJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-5 py-3.5 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition ${
              activeTab === "transactions"
                ? "border-accent text-foreground bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Transactions
            <span className="bg-secondary text-foreground font-mono text-xs px-1.5 py-0.5 rounded-md font-bold">
              {productTransactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-5 py-3.5 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition ${
              activeTab === "pricing"
                ? "border-accent text-foreground bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Pricing Matrix
          </button>

          <button
            onClick={() => setActiveTab("datasheets")}
            className={`px-5 py-3.5 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition ${
              activeTab === "datasheets"
                ? "border-accent text-foreground bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <FileText className="h-4 w-4" />
            Data Sheets & Certs
            <span className="bg-secondary text-foreground font-mono text-xs px-1.5 py-0.5 rounded-md font-bold">
              {((selectedProduct.datasheets || []).length || 2) + (productLots.reduce((acc, l) => acc + (l.datasheets?.length !== undefined ? l.datasheets.length : 1), 0))}
            </span>
          </button>
        </div>

        {/* TAB WORKSPACE */}
        <div className="p-5">
          
          {/* TAB 1: PRODUCT LOTS */}
          {activeTab === "lots" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted border border-border rounded-md p-3">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search product lots..."
                    value={lotsSearch}
                    onChange={(e) => setLotsSearch(e.target.value)}
                    className="w-full bg-card border border-border rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                  <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                
                <button
                  onClick={() => setIsAddLotOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-md px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition select-none"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                  Register Lot Batch
                </button>
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3">Lot ID</th>
                      <th className="px-5 py-3">Lot Name</th>
                      <th className="px-5 py-3 text-right">Available Quantity</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-muted-foreground font-medium">
                          No lot registers found belonging to this product.
                        </td>
                      </tr>
                    ) : (
                      filteredLots.map((l, idx) => (
                        <tr key={idx} className="hover:bg-muted transition">
                          <td className="px-5 py-3.5 font-bold font-mono text-foreground">{l.lotNumber}</td>
                          <td className="px-5 py-3.5 font-bold text-foreground">Lot {l.lotNumber.replace(/[^0-9]/g, "") || (idx + 1)}</td>
                          <td className="px-5 py-3.5 text-right font-bold font-mono text-info">{l.availableQuantity.toLocaleString()} tonnes</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${
                              l.status === "Active"
                                ? "bg-success/10 text-success border-success/25"
                                : l.status === "Pending"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => toast.info(`Viewing inventory logs for Lot batch: ${l.lotNumber}`)}
                              className="text-info hover:text-info font-bold text-xs"
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
          )}

          {/* TAB 2: ACTIVE JOBS */}
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted border border-border rounded-md p-3">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search active job requirements..."
                    value={jobsSearch}
                    onChange={(e) => setJobsSearch(e.target.value)}
                    className="w-full bg-card border border-border rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                  <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3">Job ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Order Reference</th>
                      <th className="px-5 py-3 text-right">Order Quantity</th>
                      <th className="px-5 py-3 text-right">Delivered Quantity</th>
                      <th className="px-5 py-3 text-right">Remaining Quantity</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-muted-foreground font-medium">
                          No jobs currently utilizing this product specification.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((j) => {
                        const rem = Math.max(0, j.orderQty - j.deliveredQty);
                        return (
                          <tr key={j.id} className="hover:bg-muted transition">
                            <td className="px-5 py-3.5 font-bold font-mono text-foreground">{j.id}</td>
                            <td className="px-5 py-3.5 font-bold text-foreground">{j.customerName}</td>
                            <td className="px-5 py-3.5 font-semibold text-muted-foreground">{j.customerOrderRef}</td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-foreground">{j.orderQty.toLocaleString()} t</td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-success">{j.deliveredQty.toLocaleString()} t</td>
                            <td className="px-5 py-3.5 text-right font-mono font-bold text-warning">{rem.toLocaleString()} t</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${
                                j.status === "Active"
                                  ? "bg-success/10 text-success border-success/25"
                                  : j.status === "Completed"
                                  ? "bg-info/10 text-info border-info/25"
                                  : "bg-warning/10 text-warning border-warning/30"
                              }`}>
                                {j.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => toast.info(`Relational View: Navigating to Job Profile: ${j.id}. Please access via Customer / Jobs module for full modifications.`)}
                                className="text-info hover:text-info font-bold text-xs"
                              >
                                View Job
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTIONS */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted border border-border rounded-md p-3">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search ticket transactions..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full bg-card border border-border rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                  <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Ticket Number</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Job ID</th>
                      <th className="px-4 py-3">Lot</th>
                      <th className="px-4 py-3 text-right">Net Weight</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Created Date</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTxs.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-10 text-center text-muted-foreground font-medium">
                          No weighbridge transactions recorded for this material type.
                        </td>
                      </tr>
                    ) : (
                      filteredTxs.map((t) => (
                        <tr key={t.id} className="hover:bg-muted transition">
                          <td className="px-4 py-3 font-bold font-mono text-foreground">{t.id}</td>
                          <td className="px-4 py-3 font-semibold text-muted-foreground">{t.type || "Account"}</td>
                          <td className="px-4 py-3 font-bold text-foreground font-mono">{t.ticketNo}</td>
                          <td className="px-4 py-3 font-bold text-foreground">{t.customerName}</td>
                          <td className="px-4 py-3 font-semibold font-mono text-muted-foreground">{t.jobOrder || "N/A"}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{t.lotNo || "N/A"}</td>
                          <td className="px-4 py-3 text-right font-bold font-mono">{t.netWeight.toFixed(2)} t</td>
                          <td className="px-4 py-3 text-right font-bold font-mono text-info">${t.totalValue.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold border ${
                              t.status === "Approved"
                                ? "bg-success/10 text-success border-success/25"
                                : t.status === "Pending"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-info/10 text-info border-info/25"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-muted-foreground text-xs whitespace-nowrap">
                            {t.firstWeighTime?.split(" ")[0] || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toast.info(`Consolidated ticket layout: #${t.ticketNo}. Access via Transactions panel for formal approvals.`)}
                              className="text-info hover:text-info font-bold text-xs"
                            >
                              Ticket
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING CONTRACT FLOWS */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              
              <div className="bg-info/10 border border-info/25 rounded-md p-4 flex items-start gap-3">
                <CircleAlert className="h-5 w-5 text-info shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-info uppercase tracking-wide">Pricing Ownership Rule</h4>
                  <p className="text-xs text-info leading-normal mt-1">
                    Products own the base and scale levels. Individual Jobs subscribe to a pricing strategy, which locks the contract price on delivery tickets. Lots never affect ticket valuation metrics. Editing these properties can only be performed via the Product List edit action.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-xs">
                
                {/* Default Price subscription */}
                <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <span className="font-bold text-foreground">Default Price</span>
                      <span className="font-mono font-bold text-info text-sm">${defaultPrice.toFixed(2)}</span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Jobs Subscribing ({jobsByDefaultPrice.length})</span>
                    {jobsByDefaultPrice.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No active contracts using Default Price.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {jobsByDefaultPrice.map(j => (
                          <div key={j.id} className="bg-muted p-2 rounded border border-border">
                            <span className="font-bold text-foreground block">{j.id}</span>
                            <span className="text-xs text-muted-foreground">{j.customerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Level 1 subscription */}
                <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <span className="font-bold text-foreground">Price Level 1</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {p1Price !== undefined ? `$${p1Price.toFixed(2)}` : "Not Config"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Jobs Subscribing ({jobsByP1.length})</span>
                    {p1Price === undefined ? (
                      <p className="text-xs text-muted-foreground italic">Level is not configured.</p>
                    ) : jobsByP1.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No active contracts using Price Level 1.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {jobsByP1.map(j => (
                          <div key={j.id} className="bg-muted p-2 rounded border border-border">
                            <span className="font-bold text-foreground block">{j.id}</span>
                            <span className="text-xs text-muted-foreground">{j.customerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Level 2 subscription */}
                <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <span className="font-bold text-foreground">Price Level 2</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {p2Price !== undefined ? `$${p2Price.toFixed(2)}` : "Not Config"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Jobs Subscribing ({jobsByP2.length})</span>
                    {p2Price === undefined ? (
                      <p className="text-xs text-muted-foreground italic">Level is not configured.</p>
                    ) : jobsByP2.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No active contracts using Price Level 2.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {jobsByP2.map(j => (
                          <div key={j.id} className="bg-muted p-2 rounded border border-border">
                            <span className="font-bold text-foreground block">{j.id}</span>
                            <span className="text-xs text-muted-foreground">{j.customerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Level 3 subscription */}
                <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <span className="font-bold text-foreground">Price Level 3</span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {p3Price !== undefined ? `$${p3Price.toFixed(2)}` : "Not Config"}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Jobs Subscribing ({jobsByP3.length})</span>
                    {p3Price === undefined ? (
                      <p className="text-xs text-muted-foreground italic">Level is not configured.</p>
                    ) : jobsByP3.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No active contracts using Price Level 3.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {jobsByP3.map(j => (
                          <div key={j.id} className="bg-muted p-2 rounded border border-border">
                            <span className="font-bold text-foreground block">{j.id}</span>
                            <span className="text-xs text-muted-foreground">{j.customerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Contract Price subscription */}
                <div className="bg-warning/10 border border-warning/30 rounded-md p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-warning/30 pb-2 mb-2">
                      <span className="font-bold text-warning">Custom Contract</span>
                      <span className="font-semibold text-warning">Variable</span>
                    </div>
                    <span className="text-xs font-bold text-warning uppercase tracking-widest block mb-2">Jobs Subscribing ({jobsByCustom.length})</span>
                    {jobsByCustom.length === 0 ? (
                      <p className="text-xs text-warning italic">No active custom-linked jobs.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {jobsByCustom.map(j => (
                          <div key={j.id} className="bg-warning/10 p-2 rounded border border-warning/30">
                            <span className="font-bold text-warning block">{j.id}</span>
                            <span className="text-xs text-warning block leading-tight">{j.customerName}</span>
                            <span className="text-xs font-mono font-bold text-warning block mt-1">Rate: ${(j.customProductRate ?? j.appliedRate ?? 0).toFixed(2)}/t</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: TECHNICAL DATA SHEETS & CERTIFICATES */}
          {activeTab === "datasheets" && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              <div className="bg-info/10 border border-info/25 rounded-md p-4 flex items-start gap-3">
                <FileText className="h-5 w-5 text-info shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-info uppercase tracking-wide">Product Data Sheets & Quality Certifications</h4>
                  <p className="text-xs text-info leading-normal mt-1">
                    Verified technical specifications, Material Safety Data Sheets (MSDS), and laboratory certification reports associated with the general product profile or specific active batch lots.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-md p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between border-b border-border pb-2.5">
                    <span>Active Specifications & Certifications</span>
                    <span className="bg-muted text-muted-foreground font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                      {productDatasheets.length + lotDatasheetsList.length} documents
                    </span>
                  </h3>
                </div>

                {/* SECTION 1: PRODUCT SPECIFICATIONS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block border-l-2 border-ring pl-2">
                    Product Level Specifications ({productDatasheets.length})
                  </h4>
                  
                  {productDatasheets.length === 0 ? (
                    <div className="bg-muted rounded-md p-4 text-center text-muted-foreground italic font-medium">
                      No product level data sheets registered.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productDatasheets.map((ds, idx) => (
                        <div key={idx} className="bg-card border border-border hover:border-info/25 rounded-md p-3.5 shadow-xs flex items-center justify-between gap-3 group transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-info/10 text-info p-2 rounded-md">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-foreground block truncate" title={ds.name}>
                                {ds.name}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                                {ds.size} • Uploaded {ds.uploadedAt}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(`Downloading ${ds.name}. In a production environment, this will serve the real file binary.`);
                              }}
                              className="p-1.5 text-muted-foreground hover:text-info hover:bg-info/10 rounded-md transition cursor-pointer"
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

                {/* SECTION 2: BATCH LOT CERTIFICATIONS */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block border-l-2 border-warning pl-2">
                    Batch Lot Quality Certificates ({lotDatasheetsList.length})
                  </h4>

                  {lotDatasheetsList.length === 0 ? (
                    <div className="bg-muted rounded-md p-4 text-center text-muted-foreground italic font-medium">
                      No lot batch certificates registered yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lotDatasheetsList.map((ds, idx) => (
                        <div key={idx} className="bg-card border border-border hover:border-warning/30 rounded-md p-3.5 shadow-xs flex items-center justify-between gap-3 group transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-warning/10 text-warning p-2 rounded-md flex flex-col items-center">
                              <Tag className="h-3 w-3" />
                              <span className="text-xs font-bold font-mono mt-0.5 uppercase">{ds.lotNumber.split("-").slice(-1)[0]}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-foreground block truncate" title={ds.name}>
                                {ds.name}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                                {ds.size} • Lot {ds.lotNumber} • {ds.uploadedAt}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                toast.info(`Downloading Certificate for ${ds.lotNumber}: ${ds.name}`);
                              }}
                              className="p-1.5 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded-md transition cursor-pointer"
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

            </div>
          )}

        </div>
      </div>

      {/* Polish REGISTER NEW LOT modal form */}
      {isAddLotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddLotOpen(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-xs"
          />
          <div className="relative bg-card rounded-md border border-border p-6 shadow-lg max-w-sm w-full space-y-4 z-10">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Register Product Lot Batch</h3>
              <button
                onClick={() => setIsAddLotOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground block">Lot Identifier ID</label>
                <input
                  type="text"
                  required
                  value={newLotNo}
                  onChange={(e) => setNewLotNo(e.target.value)}
                  className="w-full rounded-md border border-border p-2 text-xs font-mono font-bold"
                  placeholder="e.g. PL-123-003"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground block">Initial Quantity Allocation (Tonnes)</label>
                <input
                  type="number"
                  required
                  value={newLotQty}
                  onChange={(e) => setNewLotQty(e.target.value)}
                  className="w-full rounded-md border border-border p-2 text-xs font-bold"
                  placeholder="e.g. 1500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-md py-2 text-xs font-bold transition"
                >
                  Register Lot
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddLotOpen(false)}
                  className="bg-muted hover:bg-secondary text-foreground rounded-md px-4 py-2 text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Polish CONSOLIDATED REPORT EXPORT modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsExportOpen(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-xs"
          />
          <div className="relative bg-card rounded-md border border-border p-6 shadow-lg max-w-md w-full space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Export Product Data Matrix</h3>
              <button
                onClick={() => setIsExportOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExportSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">1. Select Data Segment to Export</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "summary", label: "Product Summary" },
                    { id: "lots", label: "Product Lots" },
                    { id: "jobs", label: "Jobs Using Product" },
                    { id: "transactions", label: "Product Transactions" },
                    { id: "pricing", label: "Product Pricing Flows" },
                    { id: "all", label: "All Combined Metrics" }
                  ].map((target) => (
                    <label
                      key={target.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer font-bold text-foreground transition ${
                        exportTarget === target.id
                          ? "bg-info/10 border-info/25 text-info"
                          : "bg-card border-border hover:bg-muted"
                      }`}
                    >
                      <RadioBox checked={exportTarget === target.id} onChange={() => setExportTarget(target.id as any)} />
                      {target.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">2. Select Export Document Format</label>
                <div className="flex gap-3">
                  {["CSV", "Excel", "PDF"].map((fmt) => (
                    <label
                      key={fmt}
                      className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-md border cursor-pointer font-bold text-foreground transition ${
                        exportFormat === fmt
                          ? "bg-info/10 border-info/25 text-info"
                          : "bg-card border-border hover:bg-muted"
                      }`}
                    >
                      <RadioBox checked={exportFormat === fmt} onChange={() => setExportFormat(fmt as any)} />
                      {fmt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-md py-2 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  Generate Download
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="bg-muted hover:bg-secondary text-foreground rounded-md px-4 py-2 text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


