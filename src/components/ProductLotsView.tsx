import React, { useState, useMemo } from "react";
import {
  Package,
  Eye,
  Edit2,
  X,
  Filter,
  Plus,
  RefreshCw,
  Sliders,
  Download,
  Check,
  ChevronDown,
  FileText,
  Calendar,
  Tag,
  Info,
  AlertTriangle
} from "lucide-react";
import { ProductLot, Product, Transaction, TransactionStatus } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";

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

  // Export dropdown state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Add/Edit Product Lot modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formOrderQuantity, setFormOrderQuantity] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Completed" | "Pending">("Active");
  const [formNotes, setFormNotes] = useState("");

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
    } else {
      setEditingLot(null);
      setFormName("");
      // Default to first product if available
      setFormProductId(products[0]?.id || "");
      setFormOrderQuantity("");
      setFormStatus("Active");
      setFormNotes("");
    }
    setIsModalOpen(true);
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
      toast.success("Please enter a valid Order Quantity in Tonnes.");
      return;
    }

    if (editingLot) {
      const updated: ProductLot = {
        id: editingLot.id,
        name: formName.trim(),
        productId: formProductId,
        orderQuantity: orderQty,
        status: formStatus,
        notes: formNotes.trim(),
        createdDate: editingLot.createdDate || new Date().toISOString().split("T")[0]
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
        createdDate: new Date().toISOString().split("T")[0]
      };
      onAddProductLot(newLot);
    }

    if (addAnother && !editingLot) {
      // Clear fields for adding another
      setFormName("");
      setFormOrderQuantity("");
      setFormNotes("");
      toast.success("Product Lot saved successfully. Feel free to add another!");
    } else {
      setIsModalOpen(false);
    }
  };

  // Export formats (CSV, Excel, PDF)
  const handleExport = (format: "CSV" | "Excel" | "PDF", scope: "all" | "filtered" | "selected") => {
    setIsExportDropdownOpen(false);

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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 id="product-lots-title" className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">Product Lots</h1>
          <p className="text-xs text-muted-foreground font-medium">Batch track materials, monitor quantities, allocate movements, and review transaction logs.</p>
        </div>
        <button
          onClick={() => openAddEditModal(null)}
          className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto select-none"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add New Product Lot
        </button>
      </div>

      {/* PatternFly 6 Enterprise Toolbar */}
      <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          {/* Action: Export Options dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsExportDropdownOpen(!isExportDropdownOpen);
                setIsColumnDropdownOpen(false);
              }}
              className="rounded-md border border-border bg-card hover:bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              Export Lots
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border rounded-md shadow-lg py-1.5 z-20 text-xs">
                <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                  Export Selected Formats
                </div>
                {/* CSV Exports */}
                <div className="px-3 py-1 font-bold text-muted-foreground text-xs bg-muted">CSV Formats</div>
                <button
                  onClick={() => handleExport("CSV", "all")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-success" />
                  All Product Lots (CSV)
                </button>
                <button
                  onClick={() => handleExport("CSV", "filtered")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-success" />
                  Filtered Product Lots (CSV)
                </button>
                <button
                  onClick={() => handleExport("CSV", "selected")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-success" />
                  Selected Lots (${selectedLotIds.length}) (CSV)
                </button>

                {/* Excel Exports */}
                <div className="px-3 py-1 font-bold text-muted-foreground text-xs bg-muted border-t border-border">Excel Formats</div>
                <button
                  onClick={() => handleExport("Excel", "all")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-info" />
                  All Product Lots (Excel)
                </button>
                <button
                  onClick={() => handleExport("Excel", "selected")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-info" />
                  Selected Lots (${selectedLotIds.length}) (Excel)
                </button>

                {/* PDF Report Prints */}
                <div className="px-3 py-1 font-bold text-muted-foreground text-xs bg-muted border-t border-border">PDF Print Reports</div>
                <button
                  onClick={() => handleExport("PDF", "all")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-destructive" />
                  Print All Product Lots
                </button>
                <button
                  onClick={() => handleExport("PDF", "filtered")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2 text-xs"
                >
                  <FileText className="h-3 w-3 text-destructive" />
                  Print Filtered Product Lots
                </button>
              </div>
            )}
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
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewProductLotDetails(lot.id)}
                              className="rounded-md border border-border hover:border-info/25 bg-card text-foreground hover:text-info p-1 px-2.5 text-xs font-bold transition flex items-center gap-1"
                              title="View details"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => openAddEditModal(lot)}
                              className="rounded-md border border-border hover:border-warning/30 bg-card text-foreground hover:text-warning p-1 px-2.5 text-xs font-bold transition flex items-center gap-1"
                              title="Edit product lot"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
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
            {selectedLotIds.length > 0 && (
              <span className="ml-2 bg-info/10 text-info rounded px-1.5 py-0.5 font-bold font-mono">
                {selectedLotIds.length} Selected
              </span>
            )}
          </span>
          <div className="flex gap-1">
            <button className="rounded border border-border bg-card p-1 px-2 hover:bg-muted font-bold">◀</button>
            <button className="rounded border border-ring bg-info/10 p-1 px-2 text-xs font-bold text-info">1</button>
            <button className="rounded border border-border bg-card p-1 px-2 hover:bg-muted font-bold">▶</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Lot Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card rounded-md shadow-lg border border-border w-full max-w-lg overflow-hidden my-8">
            <div className="bg-muted border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  {editingLot ? `Edit Product Lot - ${editingLot.id}` : "Add New Product Lot"}
                </h3>
                <p className="text-xs text-muted-foreground font-bold">
                  {editingLot ? "Update specific lot details" : "Configure a new material lot partition"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-muted-foreground rounded-md p-1 hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(e) => handleSave(e, false)} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4">
                {/* Product Lot Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
                    Product Lot Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lot A-42 or PL-123-001"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-muted border border-border focus:bg-card rounded-md px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Parent Product Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
                    Product <span className="text-destructive">*</span>
                  </label>
                  <SelectBox
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    required
                    className="w-full bg-muted border border-border focus:bg-card rounded-md px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
                    Order Quantity (Tonnes) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 1500.00"
                    value={formOrderQuantity}
                    onChange={(e) => setFormOrderQuantity(e.target.value)}
                    className="w-full bg-muted border border-border focus:bg-card rounded-md px-3 py-2 font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
                    Status
                  </label>
                  <SelectBox
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-muted border border-border focus:bg-card rounded-md px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed / Fully Used</option>
                    <option value="Pending">Pending</option>
                  </SelectBox>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
                    Notes / Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe batch allocation, customer priority, or tracking terms..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-muted border border-border focus:bg-card rounded-md px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* System Calculated Fields (Display only when editing) */}
                {editingLot && (
                  <div className="mt-2 bg-muted border border-border rounded-md p-3.5 space-y-2">
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-border hover:bg-muted text-foreground px-4 py-2 font-bold select-none transition"
                >
                  Cancel
                </button>
                
                {/* Only show "Save & Add Another" when creating a new lot */}
                {!editingLot && (
                  <button
                    type="button"
                    onClick={() => handleSave(undefined, true)}
                    className="rounded-md border border-info/25 bg-info/10 hover:bg-info/10 text-info px-4 py-2 font-bold select-none transition"
                  >
                    Save & Add Another
                  </button>
                )}

                <button
                  type="submit"
                  className="rounded-md bg-primary hover:bg-primary/90 text-white px-4 py-2 font-bold tracking-wide shadow-sm select-none transition"
                >
                  Save Product Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
