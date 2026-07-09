import { Customer, Product } from "../../../../types";

export interface ProductRates {
  tier1: number;
  tier2: number;
  tier3: number;
  basePrice: number;
}

export function getProductTiers(products: Product[], prodId: string): ProductRates {
  const prod = products.find((p) => p.id === prodId);
  if (!prod) return { tier1: 0, tier2: 0, tier3: 0, basePrice: 0 };
  const t1 = prod.pricingTiers?.find((t) => t.tier === "Tier 1")?.pricePerTonne ?? prod.basePrice;
  const t2 =
    prod.pricingTiers?.find((t) => t.tier === "Tier 2")?.pricePerTonne ??
    Number((prod.basePrice * 0.93).toFixed(2));
  const t3 =
    prod.pricingTiers?.find((t) => t.tier === "Tier 3")?.pricePerTonne ??
    Number((prod.basePrice * 0.86).toFixed(2));
  return {
    tier1: t1,
    tier2: t2,
    tier3: t3,
    basePrice: prod.basePrice
  };
}

export function getCustomerTierLevel(cust: Customer | undefined): number {
  if (!cust) return 1;
  const tierStr = cust.pricingTier || "";
  if (tierStr.includes("Tier 2")) return 2;
  if (tierStr.includes("Tier 3")) return 3;
  return 1;
}

export interface CustomerTierInfo {
  level: number;
  label: string;
  rate: number;
}

export function getCustomerTierRate(
  customers: Customer[],
  custId: string,
  products: Product[],
  prodId: string
): CustomerTierInfo {
  const cust = customers.find((c) => c.id === custId);
  const tiers = getProductTiers(products, prodId);
  const level = getCustomerTierLevel(cust);
  if (level === 2) return { level: 2, label: "Tier 2 - Volume Pricing", rate: tiers.tier2 };
  if (level === 3) return { level: 3, label: "Tier 3 - Premium Corporate", rate: tiers.tier3 };
  return { level: 1, label: "Tier 1 - Standard Rate", rate: tiers.tier1 };
}
