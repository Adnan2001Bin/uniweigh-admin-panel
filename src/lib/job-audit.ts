import { Job, JobAuditEntry, Product } from "../types";

function auditTimestamp(): string {
  return new Date().toLocaleString("en-AU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function entryId(field: string): string {
  return `job-log-${Date.now()}-${field.replace(/\s+/g, "-").toLowerCase()}`;
}

export function formatJobCustomerLabel(job: Pick<Job, "customerId" | "customerName">): string {
  return `[${job.customerId}] ${job.customerName}`;
}

export function formatJobProductLabel(
  job: Pick<Job, "productId" | "productName">,
  products?: Product[]
): string {
  const product = products?.find((p) => p.id === job.productId);
  const basePrice = product?.basePrice;
  const baseSuffix = basePrice !== undefined ? ` (Base: $${basePrice.toFixed(2)}/t)` : "";
  return `[${job.productId}] ${job.productName}${baseSuffix}`;
}

export function formatJobOrderQty(qty: number): string {
  return `${qty.toLocaleString()} t`;
}

export function formatJobNotes(notes?: string): string {
  const trimmed = notes?.trim();
  return trimmed ? trimmed : "—";
}

export function formatJobPricingSummary(job: Job): string {
  const parts = [`${job.pricingType} @ $${job.appliedRate.toFixed(2)}/t`];
  if (job.customProductRate !== undefined) {
    parts.push(`Custom rate $${job.customProductRate.toFixed(2)}/t`);
  }
  if (job.pricingNotes?.trim()) {
    parts.push(job.pricingNotes.trim());
  }
  if (job.effectiveFrom || job.effectiveTo) {
    parts.push(`Effective ${job.effectiveFrom || "N/A"} to ${job.effectiveTo || "N/A"}`);
  }
  return parts.join(" • ");
}

function pricingFingerprint(job: Job): string {
  return [
    job.pricingType,
    job.appliedRate.toFixed(2),
    job.customProductRate?.toFixed(2) ?? "",
    job.pricingNotes?.trim() ?? "",
    job.effectiveFrom ?? "",
    job.effectiveTo ?? "",
  ].join("|");
}

function pushChange(
  entries: JobAuditEntry[],
  user: string,
  timestamp: string,
  category: JobAuditEntry["category"],
  field: string,
  previousValue: string,
  newValue: string
) {
  if (previousValue === newValue) return;
  entries.push({
    id: entryId(field),
    timestamp,
    user,
    category,
    field,
    previousValue,
    newValue,
  });
}

export function buildJobCreationAuditLog(job: Job, user: string, products?: Product[]): JobAuditEntry[] {
  const timestamp = auditTimestamp();
  const entries: JobAuditEntry[] = [];

  pushChange(entries, user, timestamp, "General", "Customer Order Reference", "—", job.customerOrderRef);
  pushChange(entries, user, timestamp, "General", "Job Status", "—", job.status);
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Associated Customer",
    "—",
    formatJobCustomerLabel(job)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Material Product",
    "—",
    formatJobProductLabel(job, products)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Order Quantity quota (Tonnes)",
    "—",
    formatJobOrderQty(job.orderQty)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Operational Quota Notes",
    "—",
    formatJobNotes(job.notes)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "Pricing",
    "Product & Contract Pricing",
    "—",
    formatJobPricingSummary(job)
  );

  return entries;
}

export function buildJobUpdateAuditLog(
  previous: Job,
  updated: Job,
  user: string,
  products?: Product[]
): JobAuditEntry[] {
  const timestamp = auditTimestamp();
  const entries: JobAuditEntry[] = [];

  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Customer Order Reference",
    previous.customerOrderRef,
    updated.customerOrderRef
  );
  pushChange(entries, user, timestamp, "General", "Job Status", previous.status, updated.status);
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Associated Customer",
    formatJobCustomerLabel(previous),
    formatJobCustomerLabel(updated)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Material Product",
    formatJobProductLabel(previous, products),
    formatJobProductLabel(updated, products)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Order Quantity quota (Tonnes)",
    formatJobOrderQty(previous.orderQty),
    formatJobOrderQty(updated.orderQty)
  );
  pushChange(
    entries,
    user,
    timestamp,
    "General",
    "Operational Quota Notes",
    formatJobNotes(previous.notes),
    formatJobNotes(updated.notes)
  );

  if (pricingFingerprint(previous) !== pricingFingerprint(updated)) {
    pushChange(
      entries,
      user,
      timestamp,
      "Pricing",
      "Product & Contract Pricing",
      formatJobPricingSummary(previous),
      formatJobPricingSummary(updated)
    );
  }

  return entries;
}

export function getJobAuditLog(job: Job, products?: Product[]): JobAuditEntry[] {
  if (job.auditLog && job.auditLog.length > 0) {
    return [...job.auditLog].reverse();
  }
  return [...buildJobCreationAuditLog(job, "System", products)].reverse();
}
