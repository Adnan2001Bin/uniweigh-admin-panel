/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TransactionStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  ON_HOLD = "On Hold",
  INVOICED = "Invoiced",
  CANCELLED = "Cancelled",
  COMMITTED = "Committed"
}

export interface Transaction {
  id: string; // e.g. TX-40912
  ticketNo: string; // e.g. WB-991244
  vehicleReg: string; // e.g. XY-99-ZZ
  driverName: string; // e.g. James Peterson
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  carrierName: string; // Transport company
  grossWeight: number; // in Tonnes
  tareWeight: number; // in Tonnes
  netWeight: number; // in Tonnes (Gross - Tare)
  firstWeighTime: string; // ISO / DateTime
  secondWeighTime: string; // ISO / DateTime
  siteName: string; // Site loaded
  status: TransactionStatus;
  basePrice: number; // Base price per Tonne
  totalValue: number; // Net Weight * Base Price
  comments: string;
  scaleIdInbound: string;
  scaleIdOutbound: string;
  operatorId: string;
  auditHistory: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
  type: "Account" | "Cash";
  jobOrder: string;
  lotNo: string;
  transactionCode: string;
  accountBalance: number;
}

export interface Product {
  id: string; // e.g. P-123
  name: string;
  category: string; // Aggregates, Sand, Recycled, Soil, etc.
  subcategory: string;
  basePrice: number; // Per Tonne
  unit: string; // e.g. Tonne
  vendor: string;
  warrantyDays: number;
  status: "Active" | "Inactive";
  description: string;
  createdDate: string;
  createdBy: string;
  pricingTiers: {
    tier: string;
    pricePerTonne: number;
    minQuantity: number;
  }[];
  recentLots: {
    lotNumber: string;
    orderQuantity: number;
    availableQuantity: number;
    status: "Active" | "Completed" | "Pending";
    datasheets?: {
      name: string;
      size: string;
      uploadedAt: string;
      url?: string;
    }[];
  }[];

  // Uniweigh Products module extensions
  productCode?: string;
  site?: string;
  unitOfMeasure?: string;
  notes?: string;
  defaultPrice?: number;
  priceLevel1?: number;
  priceLevel2?: number;
  priceLevel3?: number;
  customPrice?: number;
  datasheets?: {
    name: string;
    size: string;
    uploadedAt: string;
    url?: string;
  }[];
}

export interface Customer {
  id: string; // e.g. C-401
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: "Active" | "Suspended";
  billingAddress: string;
  paymentTerms: string; // e.g. 30 Days Net, Immediate
  creditLimit: number;
  activeContracts: number;
  recentActivityDate: string;

  // New administrative fields:
  customerCode?: string;
  mobileNo?: string;
  fax?: string;
  addressLine1?: string;
  addressLine2?: string;
  suburbName?: string;
  stateCode?: string;
  postCodeVal?: string;
  pricingTier?: string; // Product Rule / Pricing Tier
  accountBalance?: number;
  lastTransactionDate?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  notes?: string;
  clientSince?: string;
}

export interface Carrier {
  id: string;
  name: string;
  contactNo: string;
  email: string;
  status: "Active" | "Inactive";
  vehicleCount: number;
  address?: string;
  transportRate?: number;
  notes?: string;
  createdDate?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  carrierId: string;
  carrierName: string;
  status: "Active" | "Inactive";
  lastWeighedDate: string;
  phoneNumber?: string;
  notes?: string;
}

export interface AxleSet {
  axleSetNumber: number;
  tareWeight: number;
  weightMax: number;
  variance: number;
}

export interface Vehicle {
  plateNumber: string;
  vehicleType: string; // Truck, Prime Mover, Trailer, A Trailer, B Trailer
  carrierName: string;
  tareWeight: number; // Tonnes
  lastTareDate: string;
  status: "Active" | "Inactive";
  id?: string;
  name?: string;
  weightMax?: number;
  type?: string; // Type of vehicle detail, e.g., Standard, Heavy
  makeModel?: string; // Make and model
  variance?: number; // Variance weight
  notes?: string; // Notes
  category?: "Standard" | "Multiaxel";
  weighedAs?: string;
  enableCombinedTare?: boolean;
  axleSets?: AxleSet[];
}

export interface AdminUser {
  id: string;
  name: string;
  role: string;
  email: string;
  lastActive: string;
  avatarUrl?: string;
  sites: string[];
}

export interface Site {
  id: string;
  name: string;
  status: "Active" | "Locked" | "Maintenance" | "PendingApproval" | "Inactive";
  scaleCount: number;
  operatorName: string;
}

export interface DestinationContact {
  id: string;
  contactCode: string;
  photoUrl?: string;
  name: string;
  customerId: string;
  customerName: string;
  phone: string;
  mobile: string;
  email: string;
  role: string;
  isSafetyContact: boolean;
  isSiteAccessContact: boolean;
  isEmergencyContact: boolean;
  status: "Active" | "Inactive";
  lastUsedDate?: string;
  createdOn: string;
  createdBy: string;
  modifiedOn?: string;
  modifiedBy?: string;
  safetyInstructions?: string;
  siteAccessNotes?: string;
  ppeRequirements?: string;
  inductionRequired: boolean;
  inductionExpiryDate?: string;
  notes?: string;
}

export interface JobAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  category: "General" | "Pricing";
  field: string;
  previousValue: string;
  newValue: string;
}

export interface Job {
  id: string; // e.g. JOB-2026-01
  customerOrderRef: string; // e.g. PO-2024-991
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  orderQty: number; // Order quantity in Tonnes
  deliveredQty: number; // Calculated dynamically from completed/approved transactions
  notes: string;
  status: "Active" | "Completed" | "Suspended";
  pricingType: "Default Product Price" | "Product Tier 1" | "Product Tier 2" | "Product Tier 3" | "Custom Contract Price";
  customProductRate?: number; // Custom Contract Price rate per Tonne
  appliedRate: number; // The final rate stored on Job creation/edit
  pricingNotes?: string;
  effectiveFrom?: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  auditLog?: JobAuditEntry[];
}

export interface Destination {
  id: string;
  name: string;
  jobId: string;
  jobRef: string;
  customerId: string;
  customerName: string;
  phone: string;
  status: "Active" | "Inactive";
  addressLine1: string;
  addressLine2?: string;
  suburb: string;
  state: string;
  postcode: string;
  notes?: string;
}

export interface ProductLot {
  id: string;
  name: string;
  productId: string;
  orderQuantity: number;
  status: "Active" | "Completed" | "Pending";
  notes?: string;
  createdDate?: string;
  datasheets?: {
    name: string;
    size: string;
    uploadedAt: string;
    url?: string;
  }[];
}

export interface DocketConfig {
  businessName: string;
  poBox: string;
  contact: string;
  fax: string;
  email: string;
  abn: string;
  eftAccountName: string;
  eftBsb: string;
  eftAccountNo: string;
  logoColor: string;
  themeColor: string;
  weighbridgeLocation: string;
  showLogo: boolean;
  logoUrl?: string;
  invoiceTitle?: string;
  cashInvoiceNotes?: string;
  accountInvoiceNotes?: string;
}





