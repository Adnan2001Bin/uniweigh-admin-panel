import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Eye,
  Edit,
  X,
  Filter,
  Plus,
  RefreshCw,
  Sliders,
  Download,
  Check,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Calendar,
  Tag,
  Info,
  AlertTriangle,
  Upload,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { ProductLot, Product, Transaction, TransactionStatus } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS,
  FORM_PAGE_ACTION_CLASS,
} from "@/src/components/shared/FormPage";
import {
  type LotCertificate,
  readPdfCertificate,
  downloadLotCertificate,
} from "@/src/lib/lot-certificate";

interface ProductLotsViewProps {
  productLots: ProductLot[];
  products: Product[];
  transactions: Transaction[];
  onAddProductLot: (newLot: ProductLot) => void;
  onUpdateProductLot: (updatedLot: ProductLot) => void;
  onViewProductLotDetails: (lotId: string) => void;
  searchQuery: string;
}

export default function ProductLotsView({
  productLots,
  products,
  transactions,
  onAddProductLot,
  onUpdateProductLot,
  onViewProductLotDetails,
  searchQuery: globalSearchQuery
}: ProductLotsViewProps) {
  // Local toolbar and state controls
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [filterProduct, setFilterProduct] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRemainingQty, setFilterRemainingQty] = useState("All"); // All, Fully Used, Has Remaining, Overfilled
  const [filterCreatedDate, setFilterCreatedDate] = useState(""); // YYYY-MM-DD
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    product: true,
    orderQuantity: true,
    usedQuantity: true,
    remainingQuantity: true,
    status: true,
    actions: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Selection states
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);

  // Export dropdown + format modal (matches Transactions / Destinations)
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | "selected" | null>(null);
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  // Add/Edit Product Lot form state
  const [currentMode, setCurrentMode] = useState<"list" | "add" | "edit">("list");
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formOrderQuantity, setFormOrderQuantity] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Completed" | "Pending">("Active");
  const [formNotes, setFormNotes] = useState("");
  const [formCertificates, setFormCertificates] = useState<LotCertificate[]>([]);
  const [isCertificateUploading, setIsCertificateUploading] = useState(false);

  // Helpers for calculations
  const getUsedQuantity = (lotId: string) => {
    const lotTxs = transactions.filter(
      (t) =>
        t.lotNo === lotId &&
        (t.status === TransactionStatus.APPROVED ||
          t.status === TransactionStatus.INVOICED ||
          t.status === TransactionStatus.COMMITTED)
    );
    const sum = lotTxs.reduce((acc, t) => acc + (t.netWeight || 0), 0);
    return Number(sum.toFixed(2));
  };

  // Build the list of product lots with calculated fields computed dynamically
  const computedLots = useMemo(() => {
    return productLots.map((lot) => {
      const usedQty = getUsedQuantity(lot.id);
      const remainingQty = Number((lot.orderQuantity - usedQty).toFixed(2));
      
      // Auto-calculated logic: "If Remaining Quantity reaches zero, the Product Lot should be marked as completed or fully used."
      let effectiveStatus = lot.status;
      if (remainingQty <= 0 && lot.status === "Active") {
        effectiveStatus = "Completed";
      }

      return {
        ...lot,
        usedQuantity: usedQty,
        remainingQuantity: remainingQty,
        status: effectiveStatus
      };
    });
  }, [productLots, transactions]);

  // Distinct products list for filter dropdown
  const distinctProducts = useMemo(() => {
    const ids = Array.from(new Set(productLots.map((l) => l.productId)));
    return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  }, [productLots, products]);

  // Active search query (global + local)
  const activeSearchQuery = localSearchQuery || globalSearchQuery;

  // Filtered Product Lots
  const filteredLots = useMemo(() => {
    return computedLots.filter((lot) => {
      // Search matches
      const q = activeSearchQuery.toLowerCase();
      const parentProd = products.find((p) => p.id === lot.productId);
      const prodName = parentProd ? parentProd.name.toLowerCase() : "";
      const matchesSearch =
        lot.id.toLowerCase().includes(q) ||
        lot.name.toLowerCase().includes(q) ||
        prodName.includes(q);

      // Product filter
      const matchesProduct = filterProduct === "All" || lot.productId === filterProduct;

      // Status filter
      const matchesStatus = filterStatus === "All" || lot.status === filterStatus;

      // Remaining Qty filter
      let matchesRemaining = true;
      if (filterRemainingQty === "Fully Used") {
        matchesRemaining = lot.remainingQuantity <= 0;
      } else if (filterRemainingQty === "Has Remaining") {
        matchesRemaining = lot.remainingQuantity > 0;
      } else if (filterRemainingQty === "Overfilled") {
        matchesRemaining = lot.remainingQuantity < 0;
      }

      // Created Date filter
      let matchesDate = true;
      if (filterCreatedDate) {
        matchesDate = lot.createdDate === filterCreatedDate;
      }

      return matchesSearch && matchesProduct && matchesStatus && matchesRemaining && matchesDate;
    });
  }, [computedLots, activeSearchQuery, filterProduct, filterStatus, filterRemainingQty, filterCreatedDate, products, refreshKey]);

  // Refresh datasets action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  // Checkbox row toggling
  const toggleSelectLot = (id: string) => {
    setSelectedLotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLotIds.length === filteredLots.length) {
      setSelectedLotIds([]);
    } else {
      setSelectedLotIds(filteredLots.map((l) => l.id));
    }
  };

  // Open Add/Edit form Modal
  const openAddEditModal = (lot: typeof computedLots[0] | null = null) => {
    if (lot) {
      setEditingLot(lot);
      setFormName(lot.name);
      setFormProductId(lot.productId);
      setFormOrderQuantity(lot.orderQuantity.toString());
      setFormStatus(lot.status as any);
      setFormNotes(lot.notes || "");
      setFormCertificates(lot.datasheets ? [...lot.datasheets] : []);
    } else {
      setEditingLot(null);
      setFormName("");
      // Default to first product if available
      setFormProductId(products[0]?.id || "");
      setFormOrderQuantity("");
      setFormStatus("Active");
      setFormNotes("");
      setFormCertificates([]);
    }
    setCurrentMode(lot ? "edit" : "add");
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsCertificateUploading(true);
    try {
      const certificate = await readPdfCertificate(file);
      setFormCertificates((prev) => [certificate, ...prev]);
      toast.success(`Certificate "${certificate.name}" attached.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload certificate.";
      toast.error(message);
    } finally {
      setIsCertificateUploading(false);
    }
  };

  const handleRemoveCertificate = (index: number) => {
    setFormCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle saving product lot from form
  const handleSave = (e?: React.FormEvent, addAnother = false) => {
    if (e) e.preventDefault();

    if (!formName.trim()) {
      toast.error("Product Lot Name is required.");
      return;
    }
    if (!formProductId) {
      toast.info("Please select a Product.");
      return;
    }
    const orderQty = parseFloat(formOrderQuantity);
    if (isNaN(orderQty) || orderQty <= 0) {
      toast.error("Please enter a valid Order Quantity in Tonnes.");
      return;
    }

    const certificatePayload =
      formCertificates.length > 0 ? formCertificates : undefined;

    if (editingLot) {
      const updated: ProductLot = {
        id: editingLot.id,
        name: formName.trim(),
        productId: formProductId,
        orderQuantity: orderQty,
        status: formStatus,
        notes: formNotes.trim(),
        createdDate: editingLot.createdDate || new Date().toISOString().split("T")[0],
        datasheets: certificatePayload,
      };
      onUpdateProductLot(updated);
    } else {
      // Auto-generate a Product Lot ID in format PL-[ProdID]-[Random]
      const randSuffix = Math.floor(100 + Math.random() * 900);
      const prodCode = products.find((p) => p.id === formProductId)?.productCode || formProductId;
      const newId = `LOT-${prodCode}-${randSuffix}`;

      const newLot: ProductLot = {
        id: newId,
        name: formName.trim(),
        productId: formProductId,
        orderQuantity: orderQty,
        status: formStatus,
        notes: formNotes.trim(),
        createdDate: new Date().toISOString().split("T")[0],
        datasheets: certificatePayload,
      };
      onAddProductLot(newLot);
    }

    if (addAnother && !editingLot) {
      // Clear fields for adding another
      setFormName("");
      setFormOrderQuantity("");
      setFormNotes("");
      setFormCertificates([]);
      toast.success("Product Lot saved successfully. Feel free to add another!");
    } else {
      setCurrentMode("list");
    }
  };

  // Export formats (CSV, Excel, PDF)
  const handleExport = (format: "CSV" | "Excel" | "PDF", scope: "all" | "filtered" | "selected") => {
    setIsExportDropdownOpen(false);
    setExportScope(null);

    let listToExport = computedLots;
    if (scope === "filtered") {
      listToExport = filteredLots;
    } else if (scope === "selected") {
      listToExport = computedLots.filter((l) => selectedLotIds.includes(l.id));
      if (listToExport.length === 0) {
        toast.error("No lots selected. Please select checkboxes on the left of table rows to export.");
        return;
      }
    }

    if (listToExport.length === 0) {
      toast.info("No data available to export.");
      return;
    }

    const headers = [
      "Product Lot ID",
      "Product Lot Name",
      "Product ID",
      "Product Name",
      "Order Quantity (t)",
      "Used Quantity (t)",
      "Remaining Quantity (t)",
      "Status",
      "Notes",
      "Created Date"
    ];

    const rows = listToExport.map((l) => {
      const p = products.find((prod) => prod.id === l.productId);
      return [
        l.id,
        l.name,
        l.productId,
        p ? p.name : "Unknown",
        l.orderQuantity.toFixed(2),
        l.usedQuantity.toFixed(2),
        l.remainingQuantity.toFixed(2),
        l.status,
        (l.notes || "").replace(/,/g, ";"),
        l.createdDate || "N/A"
      ];
    });

    const fileTitle = `Product_Lots_Export_${scope}_${new Date().toISOString().split("T")[0]}`;

    if (format === "CSV" || format === "Excel") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileTitle}.${format === "CSV" ? "csv" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "PDF") {
      // PDF Mock format printable summary report window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to view/print reports.");
        return;
      }

      const htmlRows = rows
        .map(
          (r) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
          <td style="padding: 6px; font-family: monospace; font-weight: bold;">${r[0]}</td>
          <td style="padding: 6px; font-weight: bold;">${r[1]}</td>
          <td style="padding: 6px;">${r[3]}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">${r[4]} t</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">${r[5]} t</td>
          <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: ${
            parseFloat(r[6]) < 0 ? "red" : parseFloat(r[6]) === 0 ? "gray" : "blue"
          }">${r[6]} t</td>
          <td style="padding: 6px; text-align: center;">
            <span style="font-size: 9px; font-weight: bold; background: #f0f0f0; border: 1px solid #ccc; padding: 1px 4px; border-radius: 4px;">
              ${r[7]}
            </span>
          </td>
        </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
        <head>
          <title>Uniweigh Admin Panel - Product Lots Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 5px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f5f5f5; border-bottom: 2px solid #ccc; padding: 8px 6px; font-size: 11px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Uniweigh Admin Panel - Product Lots Report (${scope.toUpperCase()})</h1>
          <div class="meta">
            Generated on: ${new Date().toLocaleString()}<br />
            Total Lot Records: ${listToExport.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Lot ID</th>
                <th>Lot Name</th>
                <th>Product</th>
                <th style="text-align: right;">Order Qty</th>
                <th style="text-align: right;">Used Qty</th>
                <th style="text-align: right;">Remaining Qty</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Lots"
        icon={Package}
        breadcrumbs={[
          { label: "Products" },
          { label: "Product Lots" },
        ]}
        actions={
          currentMode === "list" ? (
            <button
              type="button"
              onClick={() => openAddEditModal(null)}
              className={PAGE_HEADER_ADD_BUTTON_CLASS}
            >
              <Plus className="h-4 w-4" />
              Add New Product Lot
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentMode("list")}
              className={`${FORM_PAGE_ACTION_CLASS} gap-2 border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to Listing
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {currentMode === "list" && (
          <motion.div
            key="product-lots-list-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* PatternFly 6 Enterprise Toolbar */}
      <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Controls: Search, Filters toggle, Column Visibility, Refresh */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search Product Lots..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full bg-muted border border-border hover:border-input focus:bg-card rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`rounded-md border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 select-none ${
                isFilterExpanded || filterProduct !== "All" || filterStatus !== "All" || filterRemainingQty !== "All" || filterCreatedDate
                  ? "bg-info/10 border-info/25 text-info hover:bg-info/10"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {(filterProduct !== "All" || filterStatus !== "All" || filterRemainingQty !== "All" || filterCreatedDate) && (
                <span className="bg-primary text-white font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {[filterProduct !== "All", filterStatus !== "All", filterRemainingQty !== "All", !!filterCreatedDate].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Column Visibility */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsColumnDropdownOpen(!isColumnDropdownOpen);
                  setIsExportDropdownOpen(false);
                }}
                className="rounded-md border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
              >
                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                Columns
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {isColumnDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-card border border-border rounded-md shadow-lg py-1.5 z-20 text-xs">
                  <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                    Toggle Columns
                  </div>
                  {Object.keys(visibleColumns).map((col) => (
                    <label
                      key={col}
                      className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-muted cursor-pointer font-bold text-foreground"
                    >
                      <Checkbox checked={visibleColumns[col as keyof typeof visibleColumns]} onCheckedChange={(checked) => ((() =>
                          setVisibleColumns({
                            ...visibleColumns,
                            [col]: !visibleColumns[col as keyof typeof visibleColumns]
                          })
                        ) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring" />
                      {col === "id" && "Product Lot ID"}
                      {col === "name" && "Product Lot Name"}
                      {col === "product" && "Product"}
                      {col === "orderQuantity" && "Order Qty"}
                      {col === "usedQuantity" && "Used Qty"}
                      {col === "remainingQuantity" && "Remaining Qty"}
                      {col === "status" && "Status"}
                      {col === "actions" && "Actions"}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="rounded-md border border-border bg-card hover:bg-muted p-1.5 text-xs font-bold text-foreground transition flex items-center justify-center select-none"
              title="Refresh dataset"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin text-info" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel Drawer */}
        {(isFilterExpanded || filterProduct !== "All" || filterStatus !== "All" || filterRemainingQty !== "All" || filterCreatedDate) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Product Match</label>
              <SelectBox
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Products</option>
                {distinctProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.productCode || p.id}] {p.name}
                  </option>
                ))}
              </SelectBox>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Lot Status</label>
              <SelectBox
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </SelectBox>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Remaining Quantity</label>
              <SelectBox
                value={filterRemainingQty}
                onChange={(e) => setFilterRemainingQty(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Quantities</option>
                <option value="Fully Used">Fully Used (0 or Less Remaining)</option>
                <option value="Has Remaining">Has Remaining ( &gt; 0 )</option>
                <option value="Overfilled">Overallocated ( &lt; 0 )</option>
              </SelectBox>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Created Date</label>
              <input
                type="date"
                value={filterCreatedDate}
                onChange={(e) => setFilterCreatedDate(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setFilterProduct("All");
                  setFilterStatus("All");
                  setFilterRemainingQty("All");
                  setFilterCreatedDate("");
                  setLocalSearchQuery("");
                }}
                className="text-muted-foreground hover:text-foreground font-bold px-2 py-1 text-xs"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Enterprise Listing Table */}
      <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden">
        {/* Table summary / selection bar — matches Transactions & Destinations */}
        <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted min-h-[56px]">
          {selectedLotIds.length > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2.5 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                  {selectedLotIds.length}
                </span>
                <span className="text-xs font-bold text-foreground">
                  Product lot(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(!isExportDropdownOpen);
                      setIsColumnDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-foreground bg-card border border-border hover:bg-muted cursor-pointer shadow-xs transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {isExportDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                      <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Export Scope
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("selected");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted font-semibold"
                      >
                        Export Selected ({selectedLotIds.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("filtered");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted"
                      >
                        Export Filtered Results ({filteredLots.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("all");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted"
                      >
                        Export All Records ({productLots.length})
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLotIds([])}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground px-2.5 py-1.5 border border-border rounded-md hover:bg-card cursor-pointer transition"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Showing {filteredLots.length} of {productLots.length} records found
                {(filterProduct !== "All" ||
                  filterStatus !== "All" ||
                  filterRemainingQty !== "All" ||
                  !!filterCreatedDate ||
                  !!localSearchQuery.trim()) && (
                  <span className="ml-1.5 text-foreground font-bold">· Filtered view</span>
                )}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsExportDropdownOpen(!isExportDropdownOpen);
                    setIsColumnDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Records</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                    <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Export Scope
                    </div>
                    <button
                      type="button"
                      disabled={selectedLotIds.length === 0}
                      onClick={() => {
                        if (selectedLotIds.length === 0) return;
                        setIsExportDropdownOpen(false);
                        setExportScope("selected");
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-muted ${
                        selectedLotIds.length === 0 ? "opacity-40 cursor-not-allowed" : "font-semibold"
                      }`}
                    >
                      Export Selected ({selectedLotIds.length})
                      {selectedLotIds.length === 0 && (
                        <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                          Check rows in the table first
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setExportScope("filtered");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                    >
                      Export Filtered Results ({filteredLots.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setExportScope("all");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                    >
                      Export All Records ({productLots.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                <th className="px-6 py-3 w-10 text-center">
                  <Checkbox checked={filteredLots.length > 0 && selectedLotIds.length === filteredLots.length} onCheckedChange={(checked) => ((toggleSelectAll) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                </th>
                {visibleColumns.id && <th className="px-6 py-3">Product Lot ID</th>}
                {visibleColumns.name && <th className="px-6 py-3">Product Lot Name</th>}
                {visibleColumns.product && <th className="px-6 py-3">Product</th>}
                {visibleColumns.orderQuantity && <th className="px-6 py-3 text-right">Order Qty</th>}
                {visibleColumns.usedQuantity && <th className="px-6 py-3 text-right">Used Qty</th>}
                {visibleColumns.remainingQuantity && <th className="px-6 py-3 text-right">Remaining Qty</th>}
                {visibleColumns.status && <th className="px-6 py-3 text-center">Status</th>}
                {visibleColumns.actions && <th className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground font-medium">
                    No product lot records found matching current query or filters.
                  </td>
                </tr>
              ) : (
                filteredLots.map((lot) => {
                  const parentProd = products.find((p) => p.id === lot.productId);
                  const isSelected = selectedLotIds.includes(lot.id);

                  return (
                    <tr
                      key={lot.id}
                      className={`hover:bg-muted transition duration-150 group ${
                        isSelected ? "bg-info/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        <Checkbox checked={isSelected} onCheckedChange={(checked) => ((() => toggleSelectLot(lot.id)) as any)({ target: { checked } })} className="rounded text-info focus:ring-ring cursor-pointer" />
                      </td>
                      {visibleColumns.id && (
                        <td className="px-6 py-4 font-bold text-foreground font-mono">
                          {lot.id}
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-4 font-bold text-foreground group-hover:text-info transition">
                          {lot.name}
                        </td>
                      )}
                      {visibleColumns.product && (
                        <td className="px-6 py-4 font-medium text-muted-foreground">
                          {parentProd ? (
                            <span className="flex flex-col">
                              <span className="font-bold text-foreground">{parentProd.name}</span>
                              <span className="text-xs text-muted-foreground font-mono font-bold">
                                Code: {parentProd.productCode || parentProd.id}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.orderQuantity && (
                        <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                          {lot.orderQuantity.toFixed(2)} t
                        </td>
                      )}
                      {visibleColumns.usedQuantity && (
                        <td className="px-6 py-4 text-right font-mono text-success font-bold">
                          {lot.usedQuantity.toFixed(2)} t
                        </td>
                      )}
                      {visibleColumns.remainingQuantity && (
                        <td
                          className={`px-6 py-4 text-right font-mono font-bold ${
                            lot.remainingQuantity < 0
                              ? "text-destructive"
                              : lot.remainingQuantity === 0
                              ? "text-muted-foreground"
                              : "text-info"
                          }`}
                        >
                          {lot.remainingQuantity.toFixed(2)} t
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border uppercase tracking-wide ${
                              lot.status === "Completed"
                                ? "bg-muted text-foreground border-border"
                                : lot.status === "Active"
                                ? "bg-success/10 text-success border-success/25"
                                : "bg-warning/10 text-warning border-warning/30"
                            }`}
                          >
                            {lot.status === "Completed" ? "Fully Used" : lot.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onViewProductLotDetails(lot.id)}
                              className={TABLE_ACTION_ICON_BUTTON_CLASS}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openAddEditModal(lot)}
                              className={TABLE_ACTION_ICON_BUTTON_CLASS}
                              title="Edit product lot"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Info */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted">
          <span className="text-xs font-semibold text-muted-foreground">
            Showing <strong className="text-foreground">{filteredLots.length}</strong> of{" "}
            <strong className="text-foreground">{productLots.length}</strong> product lot definitions
          </span>
          <div className="flex gap-1">
            <button className="rounded border border-border bg-card p-1 px-2 hover:bg-muted font-bold">◀</button>
            <button className="rounded border border-ring bg-info/10 p-1 px-2 text-xs font-bold text-info">1</button>
            <button className="rounded border border-border bg-card p-1 px-2 hover:bg-muted font-bold">▶</button>
          </div>
        </div>
      </div>

          </motion.div>
        )}

        {(currentMode === "add" || currentMode === "edit") && (
          <React.Fragment key="product-lots-form-mode">
            <FormPage
              icon={Package}
              title={editingLot ? `Edit Product Lot - ${editingLot.id}` : "Add New Product Lot"}
              subtitle={editingLot ? "Update specific lot details" : "Configure a new material lot partition"}
              modeBadge={editingLot ? "Modifying Live Record" : "Draft Mode"}
              onCancel={() => setCurrentMode("list")}
              onSubmit={(e) => handleSave(e, false)}
              saveLabel="Save Product Lot"
              onSaveAndAddAnother={editingLot ? undefined : () => handleSave(undefined, true)}
              saveAndAddAnotherLabel="Save & Add Another"
            >
            <div className="p-6 space-y-6">
              {/* Lot Details Section */}
              <div className="space-y-4">
                <h4 className={FORM_PAGE_SECTION_CLASS}>
                  <Tag className="h-4 w-4 text-info" />
                  <span>Lot Details</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Lot Name */}
                  <div className="md:col-span-2">
                    <label className={FORM_PAGE_LABEL_CLASS}>
                      Product Lot Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Lot A-42 or PL-123-001"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={FORM_PAGE_INPUT_CLASS}
                    />
                  </div>

                  {/* Parent Product Selector */}
                  <div className="md:col-span-2">
                    <label className={FORM_PAGE_LABEL_CLASS}>
                      Product <span className="text-destructive">*</span>
                    </label>
                    <SelectBox
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      required
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      <option value="" disabled>-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.productCode || p.id}] {p.name}
                        </option>
                      ))}
                    </SelectBox>
                  </div>

                  {/* Order Quantity */}
                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>
                      Order Quantity (Tonnes) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="e.g. 1500.00"
                      value={formOrderQuantity}
                      onChange={(e) => setFormOrderQuantity(e.target.value)}
                      className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                    />
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>Status</label>
                    <SelectBox
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className={FORM_PAGE_SELECT_CLASS}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed / Fully Used</option>
                      <option value="Pending">Pending</option>
                    </SelectBox>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className={FORM_PAGE_LABEL_CLASS}>Notes / Comments</label>
                    <Textarea
                      rows={3}
                      placeholder="Describe batch allocation, customer priority, or tracking terms..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className={FORM_PAGE_TEXTAREA_CLASS}
                    />
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div className="space-y-4">
                <h4 className={FORM_PAGE_SECTION_CLASS}>
                  <FileText className="h-4 w-4 text-warning" />
                  <span>PDF Certificates</span>
                </h4>

                <p className="text-xs text-muted-foreground">
                  Attach quality or lab certificates for this lot. PDF only, up to 5 MB each.
                </p>

                {formCertificates.length > 0 && (
                  <div className="space-y-2">
                    {formCertificates.map((certificate, index) => (
                      <div
                        key={`${certificate.name}-${certificate.uploadedAt}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="rounded-md bg-warning/10 p-1.5 text-warning shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-foreground" title={certificate.name}>
                              {certificate.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {certificate.size} • Uploaded {certificate.uploadedAt}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {certificate.url && (
                            <button
                              type="button"
                              onClick={() => downloadLotCertificate(certificate)}
                              className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-info hover:border-info/25 transition cursor-pointer"
                              title="Preview download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCertificate(index)}
                            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/25 transition cursor-pointer"
                            title="Remove certificate"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted px-3 py-3 text-xs font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition">
                  <Upload className="h-4 w-4" />
                  <span>{isCertificateUploading ? "Uploading PDF..." : "Upload PDF certificate"}</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleCertificateUpload}
                    disabled={isCertificateUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* System Calculated Fields (Display only when editing) */}
              {editingLot && (
                <div className="bg-muted border border-border rounded-md p-3.5 space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    System Calculated Values
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block">Used Quantity</span>
                      <span className="font-mono font-bold text-success text-sm">
                        {editingLot.usedQuantity.toFixed(2)} t
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block">Remaining Quantity</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          editingLot.remainingQuantity < 0
                            ? "text-destructive"
                            : editingLot.remainingQuantity === 0
                            ? "text-muted-foreground"
                            : "text-info"
                        }`}
                      >
                        {editingLot.remainingQuantity.toFixed(2)} t
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </FormPage>
          </React.Fragment>
        )}
      </AnimatePresence>

      {exportScope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card rounded-md border border-border shadow-lg p-6 relative animate-zoom-in">
            <button
              type="button"
              onClick={() => setExportScope(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-muted-foreground transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
              Export Configuration
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Exporting product lots based on selected scope:{" "}
              <span className="font-bold text-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                {exportScope === "selected" && "Manually Checked Rows"}
                {exportScope === "filtered" && "Filtered Results"}
                {exportScope === "all" && "All Registry Data"}
              </span>
            </p>

            <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {(["CSV", "Excel", "PDF"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-md border-2 text-xs font-semibold cursor-pointer transition ${
                    exportFormat === fmt
                      ? "border-primary bg-info/10 text-info"
                      : "border-border bg-card text-muted-foreground hover:border-border"
                  }`}
                >
                  {fmt === "CSV" && <FileText className="h-5 w-5 text-muted-foreground" />}
                  {fmt === "Excel" && <FileSpreadsheet className="h-5 w-5 text-success" />}
                  {fmt === "PDF" && <FileCheck className="h-5 w-5 text-destructive" />}
                  <span>{fmt}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setExportScope(null)}
                className="px-4 py-2 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExport(exportFormat, exportScope)}
                className="px-4 py-2 rounded-md bg-primary text-xs font-semibold text-white hover:bg-primary/90 transition"
              >
                Generate & Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
