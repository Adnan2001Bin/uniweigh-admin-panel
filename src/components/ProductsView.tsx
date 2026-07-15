import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  ArrowLeft,
  ChevronDown,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileCheck,
  DollarSign,
  Upload,
} from "lucide-react";
import { Product } from "../types";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Textarea } from "@/src/components/ui/textarea";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS,
} from "@/src/components/shared/FormPage";
import {
  downloadLotCertificate,
  LotCertificate,
  readPdfCertificate,
} from "@/src/lib/lot-certificate";

interface ProductsViewProps {
  products: Product[];
  onUpdateProduct: (updatedProduct: Product, oldId?: string) => void;
  searchQuery: string;
  onViewProductDetails: (id: string) => void;
  /** Header Site Scale Operations — keeps local site filter in sync. */
  selectedSite?: string;
}

export default function ProductsView({
  products,
  onUpdateProduct,
  searchQuery: globalSearchQuery,
  onViewProductDetails,
  selectedSite,
}: ProductsViewProps) {
  // Local states
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [filterSite, setFilterSite] = useState<string | null>(selectedSite ?? null);
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
    actions: true,
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Export — Filtered / All (no row selection on this page)
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered" | null>(null);
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

  // Add/Edit Product form state
  const [isFormOpen, setIsFormOpen] = useState(false);
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
  const [formCertificates, setFormCertificates] = useState<LotCertificate[]>([]);
  const [isCertificateUploading, setIsCertificateUploading] = useState(false);

  useEffect(() => {
    if (selectedSite) setFilterSite(selectedSite);
  }, [selectedSite]);

  // Get distinct list values for toolbar drop-downs
  const distinctSites = useMemo(() => {
    const sites = products.map((p) => p.site || "Unknown").filter(Boolean);
    // Always include the header site so the filter can stay aligned even if the catalog is empty for it
    if (selectedSite && !sites.includes(selectedSite)) sites.push(selectedSite);
    return Array.from(new Set(sites));
  }, [products, selectedSite]);

  const activeFilterSite = filterSite ?? selectedSite ?? distinctSites[0] ?? "";

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

  // Open Add/Edit form
  const openProductForm = (product: Product | null = null) => {
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
      setFormCertificates(product.datasheets ? [...product.datasheets] : []);
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormProductCode("");
      setFormSite(selectedSite || "Melbourne Eastern Quarry");
      setFormUnit("Tonnes");
      setFormStatus("Active");
      setFormNotes("");
      setFormDefaultPrice("");
      setFormPriceLevel1("");
      setFormPriceLevel2("");
      setFormPriceLevel3("");
      setFormCustomPrice("");
      setFormCertificates([]);
    }
    setIsFormOpen(true);
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
    const certificatePayload = formCertificates.length > 0 ? formCertificates : undefined;

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
      customPrice: cPrice,
      datasheets: certificatePayload,
    };

    onUpdateProduct(savedProduct, editingProduct?.id);
    setIsFormOpen(false);
    setEditingProduct(null);
    toast.success(`Successfully ${editingProduct ? "updated" : "created"} product ${savedProduct.name}.`);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Export functions — Filtered / All
  const handleExport = (format: "CSV" | "Excel" | "PDF", scope: "all" | "filtered") => {
    setIsExportDropdownOpen(false);
    setExportScope(null);

    const listToExport = scope === "filtered" ? filteredProducts : products;

    if (listToExport.length === 0) {
      toast.info("No product records available to export.");
      return;
    }

    const headers = ["Product ID", "Product Code", "Product Name", "Site", "Default Price", "Status", "Notes"];
    const rows = listToExport.map((p) => [
      p.id,
      p.productCode || p.id,
      p.name,
      p.site || "N/A",
      `$${(p.defaultPrice ?? p.basePrice ?? 0).toFixed(2)}`,
      p.status,
      (p.notes ?? p.description ?? "").replace(/,/g, ";"),
    ]);

    const fileTitle = `Uniweigh_Products_${scope}_${new Date().toISOString().split("T")[0]}`;

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
      toast.success(`Exported ${listToExport.length} product(s) as ${format}.`);
    } else {
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
          <td style="padding: 6px; font-family: monospace;">${r[1]}</td>
          <td style="padding: 6px; font-weight: bold;">${r[2]}</td>
          <td style="padding: 6px;">${r[3]}</td>
          <td style="padding: 6px; text-align: right; font-family: monospace;">${r[4]}</td>
          <td style="padding: 6px; text-align: center;">${r[5]}</td>
        </tr>`
        )
        .join("");
      printWindow.document.write(`
        <html><head><title>${fileTitle}</title></head>
        <body style="font-family: system-ui, sans-serif; padding: 24px;">
          <h1 style="font-size: 18px; margin-bottom: 4px;">UniWeigh Product Catalog</h1>
          <p style="font-size: 12px; color: #666; margin-bottom: 16px;">
            Scope: ${scope} · ${listToExport.length} record(s) · ${new Date().toLocaleString()}
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6; text-align: left; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px;">Product ID</th>
                <th style="padding: 8px;">Code</th>
                <th style="padding: 8px;">Name</th>
                <th style="padding: 8px;">Site</th>
                <th style="padding: 8px; text-align: right;">Default Price</th>
                <th style="padding: 8px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        icon={Package}
        breadcrumbs={[
          { label: "Products" },
          { label: "Product Catalog" },
        ]}
        actions={
          isFormOpen ? (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to Listing
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openProductForm(null)}
              className={PAGE_HEADER_ADD_BUTTON_CLASS}
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
          )
        }
      />

      <AnimatePresence mode="wait">
        {isFormOpen ? (
          <motion.div
            key="product-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <FormPage
              icon={Package}
              title={editingProduct ? "Edit Product Specifications" : "Register New Product"}
              subtitle="Configure product core specifications, certificates, and pricing levels."
              modeBadge={editingProduct ? "Modifying Live Record" : "Draft Mode"}
              onCancel={handleCancel}
              onSubmit={handleSaveProduct}
              saveLabel="Save Product Specifications"
            >
            {/* SECTION A: Product Details */}
            <div className="p-6 space-y-4">
              <h4 className={FORM_PAGE_SECTION_CLASS}>
                <Package className="h-4 w-4 text-info" />
                <span>1. Product Core Specifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`${FORM_PAGE_INPUT_CLASS} font-bold`}
                    placeholder="e.g. Concrete Crusher Sand"
                  />
                </div>

                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>
                    Product Code <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={formProductCode}
                    onChange={(e) => setFormProductCode(e.target.value)}
                    className={`${FORM_PAGE_INPUT_CLASS} font-mono font-bold`}
                    placeholder="e.g. P-123"
                  />
                </div>

                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>Operating Site</label>
                  <SelectBox
                    value={formSite}
                    onChange={(e) => setFormSite(e.target.value)}
                    className={FORM_PAGE_SELECT_CLASS}
                  >
                    <option value="Melbourne Eastern Quarry">Melbourne Eastern Quarry</option>
                    <option value="Bayside Coastal Sands">Bayside Coastal Sands</option>
                    <option value="Western Eco-Recycling Depot">Western Eco-Recycling Depot</option>
                  </SelectBox>
                </div>

                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>Unit of Measure</label>
                  <Input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className={`${FORM_PAGE_INPUT_CLASS} font-semibold`}
                    placeholder="Default: Tonnes"
                  />
                </div>

                <div>
                  <label className={FORM_PAGE_LABEL_CLASS}>Status</label>
                  <SelectBox
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Active" | "Inactive")}
                    className={FORM_PAGE_SELECT_CLASS}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </SelectBox>
                </div>
              </div>

              <div>
                <label className={FORM_PAGE_LABEL_CLASS}>Product Notes / Specifications</label>
                <Textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className={FORM_PAGE_TEXTAREA_CLASS}
                  placeholder="Enter any material grades, origin descriptions, or compliance notes..."
                />
              </div>

              <div className="space-y-1.5">
                <label className={FORM_PAGE_LABEL_CLASS}>PDF Certificates</label>
                <p className="text-xs text-muted-foreground">
                  Attach quality or lab certificates for this product. PDF only, up to 5 MB each.
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
            </div>

            {/* SECTION B: Pricing Levels */}
            <div className="p-6 space-y-4 bg-muted border-t border-border">
              <h4 className={FORM_PAGE_SECTION_CLASS}>
                <DollarSign className="h-4 w-4 text-info" />
                <span>2. Product Pricing & Scale Levels</span>
              </h4>

              <div className="bg-card rounded-md p-4 border border-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`${FORM_PAGE_LABEL_CLASS} text-info flex items-center gap-1`}>
                      <DollarSign className="h-3 w-3 text-info" />
                      Default Price ($ / {formUnit}) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formDefaultPrice}
                      onChange={(e) => setFormDefaultPrice(e.target.value)}
                      className={`${FORM_PAGE_INPUT_CLASS} border-info/25 font-mono font-bold text-info`}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Must be maintained for generic transactions.</p>
                  </div>

                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>Price Level 1 (Optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formPriceLevel1}
                      onChange={(e) => setFormPriceLevel1(e.target.value)}
                      className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      placeholder="None"
                    />
                  </div>

                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>Price Level 2 (Optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formPriceLevel2}
                      onChange={(e) => setFormPriceLevel2(e.target.value)}
                      className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      placeholder="None"
                    />
                  </div>

                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>Price Level 3 (Optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formPriceLevel3}
                      onChange={(e) => setFormPriceLevel3(e.target.value)}
                      className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      placeholder="None"
                    />
                  </div>

                  <div>
                    <label className={FORM_PAGE_LABEL_CLASS}>Custom Contract Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formCustomPrice}
                      onChange={(e) => setFormCustomPrice(e.target.value)}
                      disabled
                      className={`${FORM_PAGE_INPUT_CLASS} cursor-not-allowed bg-muted font-mono text-muted-foreground opacity-60`}
                      placeholder="Managed inside Job"
                    />
                    <p className="text-xs text-muted-foreground mt-1 leading-normal">
                      Used only when specifically selected within an active Job configuration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </FormPage>
          </motion.div>
        ) : (
          <motion.div
            key="products-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Toolbar: Search + Filters + Columns + Refresh | Export */}
            <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
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
                            <Checkbox
                              checked={visibleColumns[col as keyof typeof visibleColumns]}
                              onCheckedChange={(checked) =>
                                ((() =>
                                  setVisibleColumns({
                                    ...visibleColumns,
                                    [col]: !visibleColumns[col as keyof typeof visibleColumns],
                                  })) as any)({ target: { checked } })
                              }
                              className="rounded text-info focus:ring-ring"
                            />
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

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(!isExportDropdownOpen);
                      setIsColumnDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer transition select-none"
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
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("filtered");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted font-semibold"
                      >
                        Export Filtered Results ({filteredProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportDropdownOpen(false);
                          setExportScope("all");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted"
                      >
                        Export All Records ({products.length})
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
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                      {visibleColumns.id && <th className="px-4 py-3.5">Product ID</th>}
                      {visibleColumns.productCode && <th className="px-4 py-3.5">Product Code</th>}
                      {visibleColumns.name && <th className="px-4 py-3.5">Product Name</th>}
                      {visibleColumns.site && <th className="px-4 py-3.5">Site</th>}
                      {visibleColumns.defaultPrice && <th className="px-4 py-3.5 text-right">Default Price</th>}
                      {visibleColumns.status && <th className="px-4 py-3.5 text-center">Status</th>}
                      {visibleColumns.actions && <th className="px-4 py-3.5 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-xs text-muted-foreground">
                          No material records found matching current query or filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const defaultPriceVal = p.defaultPrice ?? p.basePrice ?? 0;
                        return (
                          <tr
                            key={p.id}
                            className="group cursor-pointer select-none transition-colors hover:bg-muted"
                          >
                            {visibleColumns.id && (
                              <td className="px-4 py-4">
                                <span className="font-mono text-sm font-bold text-foreground">{p.id}</span>
                              </td>
                            )}
                            {visibleColumns.productCode && (
                              <td className="px-4 py-4">
                                <span className="font-mono text-sm font-bold text-muted-foreground">
                                  {p.productCode || p.id}
                                </span>
                              </td>
                            )}
                            {visibleColumns.name && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-bold text-foreground group-hover:text-info transition-colors">
                                  {p.name}
                                </span>
                              </td>
                            )}
                            {visibleColumns.site && (
                              <td className="px-4 py-4">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {p.site || "Melbourne Eastern Quarry"}
                                </span>
                              </td>
                            )}
                            {visibleColumns.defaultPrice && (
                              <td className="px-4 py-4 text-right">
                                <span className="text-sm font-bold font-mono text-info">
                                  ${defaultPriceVal.toFixed(2)}
                                </span>
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="px-4 py-4 text-center">
                                <StatusBadge status={p.status} />
                              </td>
                            )}
                            {visibleColumns.actions && (
                              <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onViewProductDetails(p.id)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openProductForm(p)}
                                    className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                    title="Edit product specs"
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

              {/* Enterprise Bottom Pagination */}
              <div className="border-t border-border px-5 py-3.5 flex items-center justify-between bg-muted">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {filteredProducts.length} of {products.length} active product definitions
                </span>
                <div className="flex gap-1">
                  <button disabled className="rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground cursor-not-allowed">
                    Previous
                  </button>
                  <button disabled className="rounded border border-primary bg-info/10 px-2.5 py-1 text-xs text-info font-bold">
                    1
                  </button>
                  <button disabled className="rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
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
              Exporting products based on selected scope:{" "}
              <span className="font-bold text-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
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
