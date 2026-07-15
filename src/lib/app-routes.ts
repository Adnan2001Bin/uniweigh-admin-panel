/**
 * Lightweight path ↔ view sync (no React Router).
 * Keeps the address bar in sync with App `activeView` + detail IDs.
 *
 * Pattern: /{section}/{resource} and /{section}/{resource}/:id
 */

/** Clerk terminal nested screens under `/clerk` */
export type ClerkScreen = "home" | "account" | "cash" | "success";

export type AppRouteState = {
  view: string;
  ticketId: string | null;
  productId: string | null;
  productLotId: string | null;
  carterId: string | null;
  driverId: string | null;
  vehiclePlate: string | null;
  customerId: string | null;
  contactId: string | null;
  jobId: string | null;
  destinationId: string | null;
  /** Auth shell modes reflected in the URL */
  mode: "app" | "login" | "clerk";
  /** Nested clerk screen when mode === "clerk" */
  clerkScreen: ClerkScreen;
  /** Ticket on success screen deep-link */
  clerkTicketId: string | null;
};

const LIST_VIEW_TO_PATH: Record<string, string> = {
  dashboard: "/dashboard",
  "operations-transactions": "/operations/transactions",
  "operations-pending": "/operations/pending",
  "operations-approved": "/operations/approved",
  "operations-invoicing": "/operations/invoicing",
  "operations-weighbridge": "/operations/weighbridge",
  "customers-list": "/customers-sales/customers",
  "customers-contacts": "/customers-sales/contacts",
  "customers-jobs": "/customers-sales/jobs",
  "customers-destinations": "/customers-sales/destinations",
  "products-list": "/products/catalog",
  "products-lots": "/products/lots",
  "transport-carters": "/transport/carters",
  "transport-drivers": "/transport/drivers",
  "transport-vehicles": "/transport/vehicles",
  "reports-transactions": "/reports/transactions",
  "reports-products": "/reports/products",
  "reports-customers": "/reports/customers",
  "reports-progress": "/reports/progress",
  "admin-users": "/admin/users",
  "admin-roles": "/admin/roles",
  "admin-sites": "/admin/sites",
  "admin-docket": "/admin/docket",
};

/** Older short paths still resolve to the same views */
const LEGACY_LIST_PATHS: Record<string, string> = {
  "/customers": "customers-list",
  "/customers/contacts": "customers-contacts",
  "/customers/jobs": "customers-jobs",
  "/customers/destinations": "customers-destinations",
  "/products": "products-list",
};

const PATH_TO_LIST_VIEW: Record<string, string> = {
  ...Object.fromEntries(Object.entries(LIST_VIEW_TO_PATH).map(([view, path]) => [path, view])),
  ...LEGACY_LIST_PATHS,
};

export function emptyRouteState(overrides: Partial<AppRouteState> = {}): AppRouteState {
  return {
    view: "dashboard",
    ticketId: null,
    productId: null,
    productLotId: null,
    carterId: null,
    driverId: null,
    vehiclePlate: null,
    customerId: null,
    contactId: null,
    jobId: null,
    destinationId: null,
    mode: "app",
    clerkScreen: "home",
    clerkTicketId: null,
    ...overrides,
  };
}

/** Build pathname for the current route state. */
export function pathFromRouteState(state: AppRouteState): string {
  if (state.mode === "login") return "/login";
  if (state.mode === "clerk") {
    switch (state.clerkScreen) {
      case "account":
        return "/clerk/account";
      case "cash":
        return "/clerk/cash";
      case "success":
        return state.clerkTicketId
          ? `/clerk/success/${encodeURIComponent(state.clerkTicketId)}`
          : "/clerk/success";
      default:
        return "/clerk";
    }
  }

  switch (state.view) {
    case "ticket-details":
      return state.ticketId
        ? `/operations/transactions/${encodeURIComponent(state.ticketId)}`
        : "/operations/transactions";
    case "product-details":
    case "product-details-standalone":
      return state.productId
        ? `/products/catalog/${encodeURIComponent(state.productId)}`
        : "/products/catalog";
    case "product-lot-detail":
      return state.productLotId
        ? `/products/lots/${encodeURIComponent(state.productLotId)}`
        : "/products/lots";
    case "carter-detail":
      return state.carterId
        ? `/transport/carters/${encodeURIComponent(state.carterId)}`
        : "/transport/carters";
    case "driver-detail":
      return state.driverId
        ? `/transport/drivers/${encodeURIComponent(state.driverId)}`
        : "/transport/drivers";
    case "vehicle-detail":
      return state.vehiclePlate
        ? `/transport/vehicles/${encodeURIComponent(state.vehiclePlate)}`
        : "/transport/vehicles";
    case "customers-list":
      return state.customerId
        ? `/customers-sales/customers/${encodeURIComponent(state.customerId)}`
        : "/customers-sales/customers";
    case "customers-contacts":
      return state.contactId
        ? `/customers-sales/contacts/${encodeURIComponent(state.contactId)}`
        : "/customers-sales/contacts";
    case "customers-jobs":
      return state.jobId
        ? `/customers-sales/jobs/${encodeURIComponent(state.jobId)}`
        : "/customers-sales/jobs";
    case "customers-destinations":
      return state.destinationId
        ? `/customers-sales/destinations/${encodeURIComponent(state.destinationId)}`
        : "/customers-sales/destinations";
    default:
      return LIST_VIEW_TO_PATH[state.view] || "/dashboard";
  }
}

/**
 * Parse browser location into App route state.
 * Supports legacy short paths and `?product_id=` deep links.
 */
export function routeStateFromLocation(pathname: string, search: string): AppRouteState {
  const raw = pathname.replace(/\/+$/, "") || "/";
  const path = raw.toLowerCase();
  const params = new URLSearchParams(search);

  const legacyProductId = params.get("product_id");
  if (legacyProductId) {
    return emptyRouteState({
      view: "product-details-standalone",
      productId: legacyProductId,
      mode: "app",
    });
  }

  if (path === "/login") return emptyRouteState({ mode: "login", view: "dashboard" });

  // ── Clerk terminal nested routes ─────────────────────────────────────────
  if (path === "/clerk" || path.startsWith("/clerk/")) {
    const successMatch = raw.match(/^\/clerk\/success(?:\/([^/]+))?$/i);
    if (successMatch) {
      return emptyRouteState({
        mode: "clerk",
        clerkScreen: "success",
        clerkTicketId: successMatch[1] ? decodeURIComponent(successMatch[1]) : null,
      });
    }
    if (path === "/clerk/account") {
      return emptyRouteState({ mode: "clerk", clerkScreen: "account" });
    }
    if (path === "/clerk/cash") {
      return emptyRouteState({ mode: "clerk", clerkScreen: "cash" });
    }
    return emptyRouteState({ mode: "clerk", clerkScreen: "home" });
  }

  if (path === "/" || path === "") return emptyRouteState({ view: "dashboard" });

  const segment = (match: RegExpMatchArray | null) =>
    match ? decodeURIComponent(match[1]) : null;

  // ── Detail routes (nested under list path) ──────────────────────────────
  const ticketMatch =
    raw.match(/^\/operations\/transactions\/([^/]+)$/i) ||
    raw.match(/^\/transactions\/([^/]+)$/i);
  if (ticketMatch) {
    return emptyRouteState({ view: "ticket-details", ticketId: segment(ticketMatch) });
  }

  const lotDetailMatch = raw.match(/^\/products\/lots\/([^/]+)$/i);
  if (lotDetailMatch) {
    return emptyRouteState({ view: "product-lot-detail", productLotId: segment(lotDetailMatch) });
  }

  const productDetailMatch =
    raw.match(/^\/products\/catalog\/([^/]+)$/i) ||
    raw.match(/^\/products\/([^/]+)$/i);
  if (
    productDetailMatch &&
    productDetailMatch[1].toLowerCase() !== "lots" &&
    productDetailMatch[1].toLowerCase() !== "catalog"
  ) {
    return emptyRouteState({ view: "product-details", productId: segment(productDetailMatch) });
  }

  const carterMatch = raw.match(/^\/transport\/carters\/([^/]+)$/i);
  if (carterMatch) {
    return emptyRouteState({ view: "carter-detail", carterId: segment(carterMatch) });
  }

  const driverMatch = raw.match(/^\/transport\/drivers\/([^/]+)$/i);
  if (driverMatch) {
    return emptyRouteState({ view: "driver-detail", driverId: segment(driverMatch) });
  }

  const vehicleMatch = raw.match(/^\/transport\/vehicles\/([^/]+)$/i);
  if (vehicleMatch) {
    return emptyRouteState({ view: "vehicle-detail", vehiclePlate: segment(vehicleMatch) });
  }

  const customerMatch =
    raw.match(/^\/customers-sales\/customers\/([^/]+)$/i) ||
    raw.match(/^\/customers\/([^/]+)$/i);
  if (
    customerMatch &&
    !["contacts", "jobs", "destinations"].includes(customerMatch[1].toLowerCase())
  ) {
    return emptyRouteState({ view: "customers-list", customerId: segment(customerMatch) });
  }

  const contactMatch =
    raw.match(/^\/customers-sales\/contacts\/([^/]+)$/i) ||
    raw.match(/^\/customers\/contacts\/([^/]+)$/i);
  if (contactMatch) {
    return emptyRouteState({ view: "customers-contacts", contactId: segment(contactMatch) });
  }

  const jobMatch =
    raw.match(/^\/customers-sales\/jobs\/([^/]+)$/i) ||
    raw.match(/^\/customers\/jobs\/([^/]+)$/i);
  if (jobMatch) {
    return emptyRouteState({ view: "customers-jobs", jobId: segment(jobMatch) });
  }

  const destinationMatch =
    raw.match(/^\/customers-sales\/destinations\/([^/]+)$/i) ||
    raw.match(/^\/customers\/destinations\/([^/]+)$/i);
  if (destinationMatch) {
    return emptyRouteState({
      view: "customers-destinations",
      destinationId: segment(destinationMatch),
    });
  }

  // ── List routes ─────────────────────────────────────────────────────────
  const listView = PATH_TO_LIST_VIEW[path];
  if (listView) return emptyRouteState({ view: listView });

  return emptyRouteState({ view: "dashboard" });
}

export function getCurrentBrowserPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}
