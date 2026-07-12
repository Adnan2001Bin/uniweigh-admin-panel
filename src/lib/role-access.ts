export type AppRole = "Administrator" | "Weighbridge Operator" | "Billing Auditor";

const ADMIN_VIEWS = "all" as const;

const OPERATOR_VIEWS = new Set([
  "dashboard",
  "operations-transactions",
  "operations-pending",
  "ticket-details"
]);

const AUDITOR_VIEWS = new Set([
  "dashboard",
  "operations-transactions",
  "operations-pending",
  "operations-approved",
  "operations-invoicing",
  "reports-transactions",
  "reports-products",
  "reports-customers",
  "reports-progress",
  "ticket-details"
]);

const OPERATOR_SECTIONS = new Set(["operations"]);
const AUDITOR_SECTIONS = new Set(["operations", "reports"]);

export function normalizeRole(role: string): AppRole {
  if (role === "Weighbridge Operator" || role === "Billing Auditor") return role;
  return "Administrator";
}

export function getDefaultViewForRole(role: string): string {
  return "dashboard";
}

export function canAccessView(role: string, viewId: string): boolean {
  const normalized = normalizeRole(role);
  if (normalized === "Administrator") return true;
  if (normalized === "Weighbridge Operator") return OPERATOR_VIEWS.has(viewId);
  return AUDITOR_VIEWS.has(viewId);
}

export function canAccessSidebarSection(role: string, sectionId: string): boolean {
  const normalized = normalizeRole(role);
  if (normalized === "Administrator") return true;
  if (normalized === "Weighbridge Operator") return OPERATOR_SECTIONS.has(sectionId);
  return AUDITOR_SECTIONS.has(sectionId);
}

export function canEnterClerkMode(role: string): boolean {
  const normalized = normalizeRole(role);
  return normalized === "Administrator" || normalized === "Weighbridge Operator";
}

export function getRoleDashboardCopy(role: string): { title: string; description: string } {
  const normalized = normalizeRole(role);
  if (normalized === "Weighbridge Operator") {
    return {
      title: "Weighbridge Operator Console",
      description: "Record weigh transactions, monitor scale activity, and review ticket logs."
    };
  }
  if (normalized === "Billing Auditor") {
    return {
      title: "Billing & Audit Console",
      description: "Review approved tickets, export reports, and manage invoicing queues."
    };
  }
  return {
    title: "Uniweigh Back-Office Operations",
    description: "Real-time weighbridge activities, sensor diagnostics, and financial audit flows."
  };
}
