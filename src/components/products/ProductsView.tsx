import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Product } from "../../types";
import ProductsToolbar from "./products-view/ProductsToolbar";
import ProductsTable from "./products-view/ProductsTable";
import ProductFormModal from "./products-view/ProductFormModal";
import { exportProducts } from "./products-view/utils/exportHelpers";

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
  onViewProductDetails,
}: ProductsViewProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterSite, setFilterSite] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProduct, setFilterProduct] = useState("All");
  const [filterProductCode, setFilterProductCode] = useState("All");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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

  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [formName, setFormName] = useState("");
  const [formProductCode, setFormProductCode] = useState("");
  const [formSite, setFormSite] = useState("");
  const [formUnit, setFormUnit] = useState("Tonnes");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formNotes, setFormNotes] = useState("");

  const [formDefaultPrice, setFormDefaultPrice] = useState<string>("");
  const [formPriceLevel1, setFormPriceLevel1] = useState<string>("");
  const [formPriceLevel2, setFormPriceLevel2] = useState<string>("");
  const [formPriceLevel3, setFormPriceLevel3] = useState<string>("");
  const [formCustomPrice, setFormCustomPrice] = useState<string>("");

  const distinctSites = useMemo(() => {
    const sites = products.map((p) => p.site || "Unknown").filter(Boolean);
    return Array.from(new Set(sites));
  }, [products]);

  const distinctNames = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.name)));
  }, [products]);

  const distinctCodes = useMemo(() => {
    const codes = products.map((p) => p.productCode || p.id).filter(Boolean);
    return Array.from(new Set(codes));
  }, [products]);

  const activeSearchQuery = localSearchQuery || globalSearchQuery;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = activeSearchQuery.toLowerCase();
      const codeToMatch = (p.productCode || p.id || "").toLowerCase();
      const matchesSearch =
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        codeToMatch.includes(q) ||
        (p.site || "").toLowerCase().includes(q);

      const matchesSite =
        filterSite === "All" || (p.site || "Unknown") === filterSite;
      const matchesStatus = filterStatus === "All" || p.status === filterStatus;
      const matchesProduct =
        filterProduct === "All" || p.name === filterProduct;
      const matchesProductCode =
        filterProductCode === "All" ||
        (p.productCode || p.id) === filterProductCode;

      return (
        matchesSearch &&
        matchesSite &&
        matchesStatus &&
        matchesProduct &&
        matchesProductCode
      );
    });
  }, [
    products,
    activeSearchQuery,
    filterSite,
    filterStatus,
    filterProduct,
    filterProductCode,
    refreshKey,
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  const openAddEditModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormProductCode(product.productCode || product.id);
      setFormSite(product.site || "Melbourne Eastern Quarry");
      setFormUnit(product.unitOfMeasure || product.unit || "Tonnes");
      setFormStatus(product.status);
      setFormNotes(product.notes || product.description || "");
      setFormDefaultPrice(
        product.defaultPrice?.toString() ||
          product.basePrice?.toString() ||
          "0",
      );
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

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Product Name is required.");
      return;
    }
    if (!formProductCode.trim()) {
      alert("Product Code is required.");
      return;
    }

    const dPrice = parseFloat(formDefaultPrice) || 0;
    const p1Price = formPriceLevel1 ? parseFloat(formPriceLevel1) : undefined;
    const p2Price = formPriceLevel2 ? parseFloat(formPriceLevel2) : undefined;
    const p3Price = formPriceLevel3 ? parseFloat(formPriceLevel3) : undefined;
    const cPrice = formCustomPrice ? parseFloat(formCustomPrice) : undefined;

    const savedProduct: Product = {
      id: editingProduct
        ? editingProduct.id
        : `P-${Math.floor(130 + Math.random() * 100)}`,
      name: formName.trim(),
      category: editingProduct?.category || "Aggregates",
      subcategory: editingProduct?.subcategory || "General Supplies",
      basePrice: dPrice,
      unit: formUnit,
      vendor: editingProduct?.vendor || "Local Quarry Corp",
      warrantyDays: editingProduct?.warrantyDays || 0,
      status: formStatus,
      description: formNotes,
      createdDate:
        editingProduct?.createdDate || new Date().toISOString().split("T")[0],
      createdBy: editingProduct?.createdBy || "Admin Operator",
      pricingTiers: editingProduct?.pricingTiers || [],
      recentLots: editingProduct?.recentLots || [],
      productCode: formProductCode.trim(),
      site: formSite,
      unitOfMeasure: formUnit,
      notes: formNotes,
      defaultPrice: dPrice,
      priceLevel1: p1Price,
      priceLevel2: p2Price,
      priceLevel3: p3Price,
      customPrice: cPrice,
    };

    onUpdateProduct(savedProduct, editingProduct?.id);
    setIsModalOpen(false);
    alert(
      `Successfully ${editingProduct ? "updated" : "created"} product ${savedProduct.name}.`,
    );
  };

  const handleExport = (format: "CSV" | "Excel" | "PDF") => {
    setIsExportDropdownOpen(false);
    exportProducts(filteredProducts, format);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">Products Module</h1>
          <p className="text-xs text-gray-500 font-medium">Manage product specifications, site associations, and standard contract price levels.</p>
        </div>
        <button
          onClick={() => openAddEditModal(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-black tracking-wide shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto select-none"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add New Product
        </button>
      </div>

      <ProductsToolbar
        localSearchQuery={localSearchQuery}
        setLocalSearchQuery={setLocalSearchQuery}
        isFilterExpanded={isFilterExpanded}
        setIsFilterExpanded={setIsFilterExpanded}
        filterSite={filterSite}
        setFilterSite={setFilterSite}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterProduct={filterProduct}
        setFilterProduct={setFilterProduct}
        filterProductCode={filterProductCode}
        setFilterProductCode={setFilterProductCode}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        isColumnDropdownOpen={isColumnDropdownOpen}
        setIsColumnDropdownOpen={setIsColumnDropdownOpen}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        distinctSites={distinctSites}
        distinctNames={distinctNames}
        distinctCodes={distinctCodes}
      />

      <ProductsTable
        products={filteredProducts}
        allProductsCount={products.length}
        visibleColumns={visibleColumns}
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
        isExportDropdownOpen={isExportDropdownOpen}
        setIsExportDropdownOpen={setIsExportDropdownOpen}
        onExport={handleExport}
        onViewDetails={onViewProductDetails}
        onEdit={openAddEditModal}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        formName={formName}
        setFormName={setFormName}
        formProductCode={formProductCode}
        setFormProductCode={setFormProductCode}
        formSite={formSite}
        setFormSite={setFormSite}
        formUnit={formUnit}
        setFormUnit={setFormUnit}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
        formDefaultPrice={formDefaultPrice}
        setFormDefaultPrice={setFormDefaultPrice}
        formPriceLevel1={formPriceLevel1}
        setFormPriceLevel1={setFormPriceLevel1}
        formPriceLevel2={formPriceLevel2}
        setFormPriceLevel2={setFormPriceLevel2}
        formPriceLevel3={formPriceLevel3}
        setFormPriceLevel3={setFormPriceLevel3}
        formCustomPrice={formCustomPrice}
        setFormCustomPrice={setFormCustomPrice}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
      />
    </div>
  );
}
