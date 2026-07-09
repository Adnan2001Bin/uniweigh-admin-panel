import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  ProductLot,
  Product,
  Transaction,
  TransactionStatus,
} from "../../types";
import ProductLotsToolbar from "./product-lots/ProductLotsToolbar";
import ProductLotsTable from "./product-lots/ProductLotsTable";
import ProductLotFormModal from "./product-lots/ProductLotFormModal";
import {
  exportProductLots,
  ComputedProductLot,
} from "./product-lots/utils/exportHelpers";

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
  searchQuery: globalSearchQuery,
}: ProductLotsViewProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterProduct, setFilterProduct] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRemainingQty, setFilterRemainingQty] = useState("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    product: true,
    orderQuantity: true,
    usedQuantity: true,
    remainingQuantity: true,
    status: true,
    actions: true,
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);

  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ComputedProductLot | null>(null);

  const [formName, setFormName] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formOrderQuantity, setFormOrderQuantity] = useState("");
  const [formStatus, setFormStatus] = useState<
    "Active" | "Completed" | "Pending"
  >("Active");
  const [formNotes, setFormNotes] = useState("");

  const getUsedQuantity = (lotId: string) => {
    const lotTxs = transactions.filter(
      (t) =>
        t.lotNo === lotId &&
        (t.status === TransactionStatus.APPROVED ||
          t.status === TransactionStatus.INVOICED ||
          t.status === TransactionStatus.COMMITTED),
    );
    const sum = lotTxs.reduce((acc, t) => acc + (t.netWeight || 0), 0);
    return Number(sum.toFixed(2));
  };

  const computedLots: ComputedProductLot[] = useMemo(() => {
    return productLots.map((lot) => {
      const usedQty = getUsedQuantity(lot.id);
      const remainingQty = Number((lot.orderQuantity - usedQty).toFixed(2));
      let effectiveStatus = lot.status;
      if (remainingQty <= 0 && lot.status === "Active") {
        effectiveStatus = "Completed";
      }

      return {
        ...lot,
        usedQuantity: usedQty,
        remainingQuantity: remainingQty,
        status: effectiveStatus,
      };
    });
  }, [productLots, transactions]);

  const distinctProducts = useMemo(() => {
    const ids = Array.from(new Set(productLots.map((l) => l.productId)));
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [productLots, products]);

  const activeSearchQuery = localSearchQuery || globalSearchQuery;

  const filteredLots = useMemo(() => {
    return computedLots.filter((lot) => {
      const q = activeSearchQuery.toLowerCase();
      const parentProd = products.find((p) => p.id === lot.productId);
      const prodName = parentProd ? parentProd.name.toLowerCase() : "";
      const matchesSearch =
        lot.id.toLowerCase().includes(q) ||
        lot.name.toLowerCase().includes(q) ||
        prodName.includes(q);

      const matchesProduct =
        filterProduct === "All" || lot.productId === filterProduct;
      const matchesStatus =
        filterStatus === "All" || lot.status === filterStatus;

      let matchesRemaining = true;
      if (filterRemainingQty === "Fully Used") {
        matchesRemaining = lot.remainingQuantity <= 0;
      } else if (filterRemainingQty === "Has Remaining") {
        matchesRemaining = lot.remainingQuantity > 0;
      } else if (filterRemainingQty === "Overfilled") {
        matchesRemaining = lot.remainingQuantity < 0;
      }

      let matchesDate = true;
      if (filterCreatedDate) {
        matchesDate = lot.createdDate === filterCreatedDate;
      }

      return (
        matchesSearch &&
        matchesProduct &&
        matchesStatus &&
        matchesRemaining &&
        matchesDate
      );
    });
  }, [
    computedLots,
    activeSearchQuery,
    filterProduct,
    filterStatus,
    filterRemainingQty,
    filterCreatedDate,
    products,
    refreshKey,
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  const openAddEditModal = (lot: ComputedProductLot | null = null) => {
    if (lot) {
      setEditingLot(lot);
      setFormName(lot.name);
      setFormProductId(lot.productId);
      setFormOrderQuantity(lot.orderQuantity.toString());
      setFormStatus(lot.status as "Active" | "Completed" | "Pending");
      setFormNotes(lot.notes || "");
    } else {
      setEditingLot(null);
      setFormName("");
      setFormProductId(products[0]?.id || "");
      setFormOrderQuantity("");
      setFormStatus("Active");
      setFormNotes("");
    }
    setIsModalOpen(true);
  };

  const handleSave = (e?: React.FormEvent, addAnother = false) => {
    if (e) e.preventDefault();

    if (!formName.trim()) {
      alert("Product Lot Name is required.");
      return;
    }
    if (!formProductId) {
      alert("Please select a Product.");
      return;
    }
    const orderQty = parseFloat(formOrderQuantity);
    if (isNaN(orderQty) || orderQty <= 0) {
      alert("Please enter a valid Order Quantity in Tonnes.");
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
        createdDate:
          editingLot.createdDate || new Date().toISOString().split("T")[0],
      };
      onUpdateProductLot(updated);
    } else {
      const randSuffix = Math.floor(100 + Math.random() * 900);
      const prodCode =
        products.find((p) => p.id === formProductId)?.productCode ||
        formProductId;
      const newId = `LOT-${prodCode}-${randSuffix}`;

      const newLot: ProductLot = {
        id: newId,
        name: formName.trim(),
        productId: formProductId,
        orderQuantity: orderQty,
        status: formStatus,
        notes: formNotes.trim(),
        createdDate: new Date().toISOString().split("T")[0],
      };
      onAddProductLot(newLot);
    }

    if (addAnother && !editingLot) {
      setFormName("");
      setFormOrderQuantity("");
      setFormNotes("");
      alert("Product Lot saved successfully. Feel free to add another!");
    } else {
      setIsModalOpen(false);
    }
  };

  const handleExport = (
    format: "CSV" | "Excel" | "PDF",
    scope: "all" | "filtered" | "selected",
  ) => {
    setIsExportDropdownOpen(false);

    let listToExport = computedLots;
    if (scope === "filtered") {
      listToExport = filteredLots;
    } else if (scope === "selected") {
      listToExport = computedLots.filter((l) => selectedLotIds.includes(l.id));
      if (listToExport.length === 0) {
        alert(
          "No lots selected. Please select checkboxes on the left of table rows to export.",
        );
        return;
      }
    }

    exportProductLots(listToExport, products, format);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 id="product-lots-title" className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
            Product Lots
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Batch track materials, monitor quantities, allocate movements, and
            review transaction logs.
          </p>
        </div>
        <button
          onClick={() => openAddEditModal(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-black tracking-wide shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto select-none"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add New Product Lot
        </button>
      </div>

      <ProductLotsToolbar
        localSearchQuery={localSearchQuery}
        setLocalSearchQuery={setLocalSearchQuery}
        isFilterExpanded={isFilterExpanded}
        setIsFilterExpanded={setIsFilterExpanded}
        filterProduct={filterProduct}
        setFilterProduct={setFilterProduct}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterRemainingQty={filterRemainingQty}
        setFilterRemainingQty={setFilterRemainingQty}
        filterCreatedDate={filterCreatedDate}
        setFilterCreatedDate={setFilterCreatedDate}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        isColumnDropdownOpen={isColumnDropdownOpen}
        setIsColumnDropdownOpen={setIsColumnDropdownOpen}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        selectedLotIdsCount={selectedLotIds.length}
        distinctProducts={distinctProducts}
      />

      <ProductLotsTable
        lots={filteredLots}
        allLotsCount={productLots.length}
        products={products}
        visibleColumns={visibleColumns}
        selectedLotIds={selectedLotIds}
        setSelectedLotIds={setSelectedLotIds}
        isExportDropdownOpen={isExportDropdownOpen}
        setIsExportDropdownOpen={setIsExportDropdownOpen}
        onExport={handleExport}
        onViewDetails={onViewProductLotDetails}
        onEdit={openAddEditModal}
      />

      <ProductLotFormModal
        isOpen={isModalOpen}
        editingLot={editingLot}
        products={products}
        formName={formName}
        setFormName={setFormName}
        formProductId={formProductId}
        setFormProductId={setFormProductId}
        formOrderQuantity={formOrderQuantity}
        setFormOrderQuantity={setFormOrderQuantity}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
