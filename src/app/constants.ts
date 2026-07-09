import { Site } from "../types";

export const STORAGE_KEYS = {
  sites: "uniweigh_sites",
  siteLimit: "uniweigh_site_limit",
  transactions: "uniweigh_txs",
  products: "uniweigh_prods",
  customers: "uniweigh_custs",
  jobs: "uniweigh_jobs",
  productLots: "uniweigh_product_lots",
  carriers: "uniweigh_carriers",
  drivers: "uniweigh_drivers",
  vehicles: "uniweigh_vehicles",
  docketConfig: "uniweigh_docket_config",
} as const;

export const DEFAULT_SITES: Site[] = [
  {
    id: "site-1",
    name: "Melbourne Eastern Quarry",
    status: "Active",
    scaleCount: 2,
    operatorName: "John Davis",
  },
  {
    id: "site-2",
    name: "Bayside Coastal Sands",
    status: "Active",
    scaleCount: 1,
    operatorName: "Sarah JenkinsK",
  },
  {
    id: "site-3",
    name: "Western Eco-Recycling Depot",
    status: "Active",
    scaleCount: 1,
    operatorName: "Steve G",
  },
];
