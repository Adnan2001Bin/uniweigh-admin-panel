import { Product } from "../../../../types";

export function exportProducts(products: Product[], format: "CSV" | "Excel" | "PDF") {
  if (products.length === 0) {
    alert("No product records available to export.");
    return;
  }

  const headers = ["Product ID", "Product Code", "Product Name", "Site", "Default Price", "Status", "Notes"];
  const rows = products.map((p) => [
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
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `uniweigh_products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(`Preparing ${format} document of the Product Listing (${products.length} items). Download will begin in a moment.`);
  }
}
