import {
  INITIAL_CARRIERS,
  INITIAL_DRIVERS,
  INITIAL_PRODUCTS,
  INITIAL_VEHICLES,
} from "../../data";
import { Carrier, Driver, Product, ProductLot, Vehicle } from "../../types";

export function buildInitialProducts(savedProducts: Product[] | null): Product[] {
  const parsed = savedProducts ?? INITIAL_PRODUCTS;

  return parsed.map((product: any) => ({
    ...product,
    productCode: product.productCode || product.id,
    site:
      product.site ||
      (product.category === "Sand"
        ? "Bayside Coastal Sands"
        : product.category === "Soil"
          ? "Western Eco-Recycling Depot"
          : "Melbourne Eastern Quarry"),
    unitOfMeasure: product.unitOfMeasure || product.unit || "Tonnes",
    notes: product.notes || `Standard catalog specification for ${product.name}.`,
    defaultPrice:
      product.defaultPrice !== undefined ? product.defaultPrice : product.basePrice,
    priceLevel1:
      product.priceLevel1 !== undefined
        ? product.priceLevel1
        : Number((product.basePrice * 0.95).toFixed(2)),
    priceLevel2:
      product.priceLevel2 !== undefined
        ? product.priceLevel2
        : Number((product.basePrice * 0.9).toFixed(2)),
    priceLevel3:
      product.priceLevel3 !== undefined
        ? product.priceLevel3
        : Number((product.basePrice * 0.85).toFixed(2)),
  }));
}

export function buildInitialProductLots(savedLots: ProductLot[] | null): ProductLot[] {
  if (savedLots) {
    return savedLots;
  }

  const initialLots: ProductLot[] = [];

  INITIAL_PRODUCTS.forEach((product) => {
    if (!product.recentLots) {
      return;
    }

    product.recentLots.forEach((lot: any) => {
      initialLots.push({
        id: lot.lotNumber,
        name: `Lot ${lot.lotNumber.replace(/[^0-9]/g, "") || lot.lotNumber}`,
        productId: product.id,
        orderQuantity: lot.orderQuantity,
        status: lot.status,
        notes: `Initial lot allocation for product ${product.name}.`,
        createdDate: "2026-06-20",
      });
    });
  });

  const transactionLots = [
    { id: "LOT-A-42", name: "Lot A-42", productId: "P-123", orderQty: 1500, status: "Active" as const },
    { id: "LOT-B-11", name: "Lot B-11", productId: "P-124", orderQty: 1000, status: "Active" as const },
    { id: "LOT-C-05", name: "Lot C-05", productId: "P-125", orderQty: 2500, status: "Active" as const },
    { id: "LOT-D-99", name: "Lot D-99", productId: "P-126", orderQty: 1200, status: "Active" as const },
    { id: "LOT-E-03", name: "Lot E-03", productId: "P-127", orderQty: 800, status: "Active" as const },
    { id: "LOT-F-12", name: "Lot F-12", productId: "P-129", orderQty: 1600, status: "Active" as const },
  ];

  transactionLots.forEach((transactionLot) => {
    if (!initialLots.some((lot) => lot.id === transactionLot.id)) {
      initialLots.push({
        id: transactionLot.id,
        name: transactionLot.name,
        productId: transactionLot.productId,
        orderQuantity: transactionLot.orderQty,
        status: transactionLot.status,
        notes: "Auto-generated from transaction logs.",
        createdDate: "2026-06-22",
      });
    }
  });

  return initialLots;
}

export function buildInitialCarriers(savedCarriers: Carrier[] | null): Carrier[] {
  if (savedCarriers) {
    return savedCarriers;
  }

  return INITIAL_CARRIERS.map((carrier) => ({
    ...carrier,
    address:
      carrier.id === "CR-01"
        ? "12 Industrial Parkway, Somerton VIC 3062"
        : carrier.id === "CR-02"
          ? "88 Logistics Boulevard, Truganina VIC 3029"
          : carrier.id === "CR-03"
            ? "45 Sand Ridge Rd, Langwarrin VIC 3910"
            : "77 Independent Way, Laverton VIC 3028",
    transportRate:
      carrier.id === "CR-01"
        ? 12.5
        : carrier.id === "CR-02"
          ? 15
          : carrier.id === "CR-03"
            ? 10.5
            : 14,
    notes: "Primary bulk haulage carrier.",
    createdDate: "2024-03-12",
  }));
}

export function buildInitialDrivers(savedDrivers: Driver[] | null): Driver[] {
  const parsed = savedDrivers ?? INITIAL_DRIVERS;

  return parsed.map((driver: any, index: number) => ({
    ...driver,
    phoneNumber: driver.phoneNumber || `0412 990 ${String(100 + index)}`,
    notes:
      driver.notes ||
      (index % 2 === 0
        ? "Standard commercial logistics driver. Certified for heavy bulk carrier vehicle operations with up to 9-axis setup. Inducted at Melbourne Depot & Geelong Quarries."
        : "Regional sand/gravel hauling driver. Fully certified for multi-combination (MC) vehicles. Completed OH&S site induction for both B-double and single carriage operations."),
  }));
}

export function buildInitialVehicles(savedVehicles: Vehicle[] | null): Vehicle[] {
  if (savedVehicles) {
    return savedVehicles;
  }

  return INITIAL_VEHICLES.map((vehicle, index) => {
    const isMultiaxel =
      vehicle.plateNumber === "IC-88-TT" || vehicle.plateNumber === "WB-40-EE";

    return {
      ...vehicle,
      id: vehicle.id || `VH-${String(index + 1).padStart(3, "0")}`,
      name: vehicle.name || `${vehicle.vehicleType} #${index + 1}`,
      category: isMultiaxel ? "Multiaxel" : "Standard",
      weighedAs: isMultiaxel ? "3 Axle Sets" : undefined,
      enableCombinedTare: isMultiaxel ? true : undefined,
      axleSets: isMultiaxel
        ? [
            {
              axleSetNumber: 1,
              tareWeight: Number((vehicle.tareWeight / 3).toFixed(2)),
              weightMax: 15,
              variance: 0.15,
            },
            {
              axleSetNumber: 2,
              tareWeight: Number((vehicle.tareWeight / 3).toFixed(2)),
              weightMax: 15,
              variance: 0.15,
            },
            {
              axleSetNumber: 3,
              tareWeight: Number((vehicle.tareWeight / 3).toFixed(2)),
              weightMax: 15,
              variance: 0.15,
            },
          ]
        : undefined,
      tareWeight: vehicle.tareWeight,
      weightMax: isMultiaxel
        ? 45
        : vehicle.weightMax || Number((vehicle.tareWeight * 2.5).toFixed(2)),
      variance: vehicle.variance || 0.5,
    };
  });
}
