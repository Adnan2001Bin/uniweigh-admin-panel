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
  Trash2,
  FileText,
  DollarSign
} from "lucide-react";
import { Product } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";

interface ProductsViewProps {
  products: Product[];
  onUpdateProduct: (updatedProduct: Product, oldId?: string) => void;
  searchQuery: string;
  onViewProductDetails: (id: string) => void;
}

export default function ProductsView({
  products,
  onUpdateProduct,
  searchQuery: globalSearchQuery,
  onViewProductDetails
}: ProductsViewProps) {
  // Local states
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [filterSite, setFilterSite] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProduct, setFilterProduct] = useState("All");
  const [filterProductCode, setFilterProductCode] = useState("All");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    productCode: true,
    name: true,
    site: true,
    defaultPrice: true,
    status: true,
    actions: true
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Export dropdown state
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Add/Edit Product modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formProductCode, setFormProductCode] = useState("");
  const [formSite, setFormSite] = useState("");
  const [formUnit, setFormUnit] = useState("Tonnes");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formNotes, setFormNotes] = useState("");

  // Pricing Form levels
  const [formDefaultPrice, setFormDefaultPrice] = useState<string>("");
  const [formPriceLevel1, setFormPriceLevel1] = useState<string>("");
  const [formPriceLevel2, setFormPriceLevel2] = useState<string>("");
  const [formPriceLevel3, setFormPriceLevel3] = useState<string>("");
  const [formCustomPrice, setFormCustomPrice] = useState<string>("");

  // Get distinct list values for toolbar drop-downs
  const distinctSites = useMemo(() => {
    const sites = products.map((p) => p.site || "Unknown").filter(Boolean);
    return Array.from(new Set(sites));
  }, [products]);

  const activeFilterSite = filterSite ?? distinctSites[0] ?? "";

  const distinctNames = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.name)));
  }, [products]);

  const distinctCodes = useMemo(() => {
    const codes = products.map((p) => p.productCode || p.id).filter(Boolean);
    return Array.from(new Set(codes));
  }, [products]);

  // Combine global search from header with toolbar search
  const activeSearchQuery = localSearchQuery || globalSearchQuery;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = activeSearchQuery.toLowerCase();
      const codeToMatch = (p.productCode || p.id || "").toLowerCase();
      const matchesSearch =
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        codeToMatch.includes(q) ||
        (p.site || "").toLowerCase().includes(q);

      const matchesSite = (p.site || "Unknown") === activeFilterSite;
      const matchesStatus = filterStatus === "All" || p.status === filterStatus;
      const matchesProduct = filterProduct === "All" || p.name === filterProduct;
      const matchesProductCode = filterProductCode === "All" || (p.productCode || p.id) === filterProductCode;

      return matchesSearch && matchesSite && matchesStatus && matchesProduct && matchesProductCode;
    });
  }, [products, activeSearchQuery, activeFilterSite, filterStatus, filterProduct, filterProductCode, refreshKey]);

  // Refresh trigger
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  // Open Add/Edit Modal
  const openAddEditModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormProductCode(product.productCode || product.id);
      setFormSite(product.site || "Melbourne Eastern Quarry");
      setFormUnit(product.unitOfMeasure || product.unit || "Tonnes");
      setFormStatus(product.status);
      setFormNotes(product.notes || product.description || "");
      setFormDefaultPrice(product.defaultPrice?.toString() || product.basePrice?.toString() || "0");
      setFormPriceLevel1(product.priceLevel1?.toString() || "");
      setFormPriceLevel2(product.priceLevel2?.toString() || "");
      setFormPriceLevel3(product.priceLevel3?.toString() || "");
      setFormCustomPrice(product.customPrice?.toString() || "");
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormProductCode("");
      setFormSite("Melbourne Eastern Quarry");
      setFormUnit("Tonnes");
      setFormStatus("Active");
      setFormNotes("");
      setFormDefaultPrice("");
      setFormPriceLevel1("");
      setFormPriceLevel2("");
      setFormPriceLevel3("");
      setFormCustomPrice("");
    }
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Product Name is required.");
      return;
    }
    if (!formProductCode.trim()) {
      toast.error("Product Code is required.");
      return;
    }

    const dPrice = parseFloat(formDefaultPrice) || 0;
    const p1Price = formPriceLevel1 ? parseFloat(formPriceLevel1) : undefined;
    const p2Price = formPriceLevel2 ? parseFloat(formPriceLevel2) : undefined;
    const p3Price = formPriceLevel3 ? parseFloat(formPriceLevel3) : undefined;
    const cPrice = formCustomPrice ? parseFloat(formCustomPrice) : undefined;

    const savedProduct: Product = {
      id: editingProduct ? editingProduct.id : `P-${Math.floor(130 + Math.random() * 100)}`,
      name: formName.trim(),
      category: editingProduct?.category || "Aggregates",
      subcategory: editingProduct?.subcategory || "General Supplies",
      basePrice: dPrice,
      unit: formUnit,
      vendor: editingProduct?.vendor || "Local Quarry Corp",
      warrantyDays: editingProduct?.warrantyDays || 0,
      status: formStatus,
      description: formNotes,
      createdDate: editingProduct?.createdDate || new Date().toISOString().split("T")[0],
      createdBy: editingProduct?.createdBy || "Admin Operator",
      pricingTiers: editingProduct?.pricingTiers || [],
      recentLots: editingProduct?.recentLots || [],
      
      // Uniweigh fields
      productCode: formProductCode.trim(),
      site: formSite,
      unitOfMeasure: formUnit,
      notes: formNotes,
      defaultPrice: dPrice,
      priceLevel1: p1Price,
      priceLevel2: p2Price,
      priceLevel3: p3Price,
      customPrice: cPrice
    };

    onUpdateProduct(savedProduct, editingProduct?.id);
    setIsModalOpen(false);
    toast.success(`Successfully ${editingProduct ? "updated" : "created"} product ${savedProduct.name}.`);
  };

  // Export functions
  const triggerExport = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportDropdownOpen(false);
    
    if (filteredProducts.length === 0) {
      toast.info("No product records available to export.");
      return;
    }

    const headers = ["Product ID", "Product Code", "Product Name", "Site", "Default Price", "Status", "Notes"];
    const rows = filteredProducts.map((p) => [
      p.id,
      p.productCode || p.id,
      p.name,
      p.site || "N/A",
      `$${(p.defaultPrice ?? p.basePrice ?? 0).toFixed(2)}`,
      p.status,
      (p.notes ?? p.description ?? "").replace(/,/g, ";")
    ]);

    if (format === "CSV") {
      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `uniweigh_products_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Trigger a styled mock download alert representing Excel or PDF files
      toast.info(`Preparing ${format} document of the Product Listing (${filteredProducts.length} items). Download will begin in a moment.`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">Products Module</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage product specifications, site associations, and standard contract price levels.</p>
        </div>
        <button
          onClick={() => openAddEditModal(null)}
          className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto select-none"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add New Product
        </button>
      </div>

      {/* PatternFly Enterprise Toolbar */}
      <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search, Filters toggle, Column visibility */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search products..."
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
                isFilterExpanded || filterStatus !== "All" || filterProduct !== "All" || filterProductCode !== "All"
                  ? "bg-info/10 border-info/25 text-info hover:bg-info/10"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {(filterStatus !== "All" || filterProduct !== "All" || filterProductCode !== "All") && (
                <span className="bg-primary text-white font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {[filterStatus !== "All", filterProduct !== "All", filterProductCode !== "All"].filter(Boolean).length}
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
                <div className="absolute left-0 mt-1.5 w-48 bg-card border border-border rounded-md shadow-lg py-1.5 z-25 text-xs">
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
                      {col === "id" && "Product ID"}
                      {col === "productCode" && "Product Code"}
                      {col === "name" && "Product Name"}
                      {col === "site" && "Site"}
                      {col === "defaultPrice" && "Default Price"}
                      {col === "status" && "Status"}
                      {col === "actions" && "Actions"}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="rounded-md border border-border bg-card hover:bg-muted p-1.5 text-xs font-bold text-foreground transition flex items-center justify-center select-none"
              title="Refresh dataset"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin text-info" : ""}`} />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsExportDropdownOpen(!isExportDropdownOpen);
                setIsColumnDropdownOpen(false);
              }}
              className="rounded-md border border-border bg-card hover:bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition flex items-center gap-1.5 select-none"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              Export
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-card border border-border rounded-md shadow-lg py-1 z-25 text-xs">
                <div className="px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest border-b border-border mb-1">
                  Download Formats
                </div>
                <button
                  onClick={() => triggerExport("CSV")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5 text-success" />
                  Export as CSV
                </button>
                <button
                  onClick={() => triggerExport("Excel")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5 text-info" />
                  Export as Excel
                </button>
                <button
                  onClick={() => triggerExport("PDF")}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted font-semibold text-foreground flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5 text-destructive" />
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {(isFilterExpanded || filterStatus !== "All" || filterProduct !== "All" || filterProductCode !== "All") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Weighbridge Site</label>
              <SelectBox
                value={activeFilterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1 text-xs font-semibold focus:outline-none"
              >
                {distinctSites.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </SelectBox>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Status</label>
              <SelectBox
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </SelectBox>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Product Name</label>
              <SelectBox
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Products</option>
                {distinctNames.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </SelectBox>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Product Code</label>
              <SelectBox
                value={filterProductCode}
                onChange={(e) => setFilterProductCode(e.target.value)}
                className="w-full rounded-md border border-border bg-card p-1 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Codes</option>
                {distinctCodes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </SelectBox>
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setFilterSite(null);
                  setFilterStatus("All");
                  setFilterProduct("All");
                  setFilterProductCode("All");
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
                {visibleColumns.id && <th className="px-6 py-3">Product ID</th>}
                {visibleColumns.productCode && <th className="px-6 py-3">Product Code</th>}
                {visibleColumns.name && <th className="px-6 py-3">Product Name</th>}
                {visibleColumns.site && <th className="px-6 py-3">Site</th>}
                {visibleColumns.defaultPrice && <th className="px-6 py-3 text-right">Default Price</th>}
                {visibleColumns.status && <th className="px-6 py-3 text-center">Status</th>}
                {visibleColumns.actions && <th className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground font-medium">
                    No material records found matching current query or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const defaultPriceVal = p.defaultPrice ?? p.basePrice ?? 0;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted transition duration-150 group"
                    >
                      {visibleColumns.id && (
                        <td className="px-6 py-4 font-bold text-foreground font-mono">
                          {p.id}
                        </td>
                      )}
                      {visibleColumns.productCode && (
                        <td className="px-6 py-4 font-bold text-muted-foreground font-mono">
                          {p.productCode || p.id}
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-4 font-bold text-foreground group-hover:text-info transition">
                          {p.name}
                        </td>
                      )}
                      {visibleColumns.site && (
                        <td className="px-6 py-4 font-medium text-muted-foreground">
                          {p.site || "Melbourne Eastern Quarry"}
                        </td>
                      )}
                      {visibleColumns.defaultPrice && (
                        <td className="px-6 py-4 text-right font-mono font-bold text-info">
                          ${defaultPriceVal.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${
                              p.status === "Active"
                                ? "bg-success/10 text-success border-success/25"
                                : "bg-destructive/10 text-destructive border-destructive/25"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewProductDetails(p.id)}
                              className="rounded-md border border-border hover:border-info/25 bg-card text-foreground hover:text-info p-1 px-2.5 text-xs font-bold transition flex items-center gap-1"
                              title="View details"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => openAddEditModal(p)}
                              className="rounded-md border border-border hover:border-warning/30 bg-card text-foreground hover:text-warning p-1 px-2.5 text-xs font-bold transition flex items-center gap-1"
                              title="Edit product specs"
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

        {/* Enterprise Bottom Pagination */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted">
          <span className="text-xs font-semibold text-muted-foreground">
            Showing <strong className="text-foreground">{filteredProducts.length}</strong> of{" "}
            <strong className="text-foreground">{products.length}</strong> active product definitions
          </span>
          <div className="flex gap-1">
            <button className="rounded border border-border bg-card p-1 px-2 hover:bg-muted font-bold">◀</button>
            <button className="rounded border border-ring bg-info/10 p-1 px-2 text-xs font-bold text-info">1</button>
            <button className="rounded border border-border bg-card p-1 px-2 hover:bg-muted font-bold">▶</button>
          </div>
        </div>
      </div>

      {/* Polish Add / Edit Product Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-xs"
          />
          <div className="relative bg-card rounded-md border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 animate-fade-in flex flex-col">
            <div className="sticky top-0 bg-muted border-b border-border px-6 py-4 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-info" />
                <h3 className="font-bold text-sm text-foreground">
                  {editingProduct ? "Edit Product Specifications" : "Register New Product"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 overflow-y-auto">
              
              {/* SECTION A: Product Details */}
              <div className="space-y-4">
                <div className="border-b border-border pb-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">1. Product Core Specifications</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="e.g. Concrete Crusher Sand"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Product Code</label>
                    <input
                      type="text"
                      required
                      value={formProductCode}
                      onChange={(e) => setFormProductCode(e.target.value)}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="e.g. P-123"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Operating Site</label>
                    <SelectBox
                      value={formSite}
                      onChange={(e) => setFormSite(e.target.value)}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Melbourne Eastern Quarry">Melbourne Eastern Quarry</option>
                      <option value="Bayside Coastal Sands">Bayside Coastal Sands</option>
                      <option value="Western Eco-Recycling Depot">Western Eco-Recycling Depot</option>
                    </SelectBox>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Unit of Measure</label>
                    <input
                      type="text"
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Default: Tonnes"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Status</label>
                    <SelectBox
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </SelectBox>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Product Notes / Specifications</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-3 text-xs font-semibold text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Enter any material grades, origin descriptions, or compliance notes..."
                  />
                </div>
              </div>

              {/* SECTION B: Pricing Levels */}
              <div className="space-y-4">
                <div className="border-b border-border pb-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">2. Product Pricing & Scale Levels</h4>
                </div>

                <div className="bg-muted rounded-md p-4 border border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-info flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-info" />
                        Default Price ($ / {formUnit}) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formDefaultPrice}
                        onChange={(e) => setFormDefaultPrice(e.target.value)}
                        className="w-full rounded-md border border-info/25 bg-card px-3 py-2 text-xs font-mono font-bold text-info focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">Must be maintained for generic transactions.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Price Level 1 (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formPriceLevel1}
                        onChange={(e) => setFormPriceLevel1(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                        placeholder="None"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Price Level 2 (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formPriceLevel2}
                        onChange={(e) => setFormPriceLevel2(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                        placeholder="None"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Price Level 3 (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formPriceLevel3}
                        onChange={(e) => setFormPriceLevel3(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                        placeholder="None"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground block">Custom Contract Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formCustomPrice}
                        onChange={(e) => setFormCustomPrice(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                        placeholder="Managed inside Job"
                      />
                      <p className="text-xs text-muted-foreground leading-normal">Used only when specifically selected within an active Job configuration.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="sticky bottom-0 bg-card pt-4 border-t border-border flex gap-2 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-bold text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary hover:bg-primary/90 text-white px-5 py-2 text-xs font-bold shadow-sm transition flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Save Product specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
