import { Customer } from "../../../../types";

export function getExportReportName(
  scope: "current" | "selected" | "filtered" | "profile" | "txSummary" | "jobsReport",
  activeCustomer: Customer | null,
  selectedCount: number,
  filteredCount: number
): string {
  switch (scope) {
    case "profile":
      return `Customer Profile - ${activeCustomer?.name || "Customer"}`;
    case "txSummary":
      return `Transactions ledger for ${activeCustomer?.name || "Customer"}`;
    case "jobsReport":
      return `Jobs list for ${activeCustomer?.name || "Customer"}`;
    case "current":
      return "Current Customer List";
    case "selected":
      return `${selectedCount} Selected Customer(s)`;
    case "filtered":
      return `${filteredCount} Filtered Customer(s)`;
    default:
      return "Registered Job/Contracts Audit Report";
  }
}
