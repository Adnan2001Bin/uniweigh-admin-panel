import { useEffect, useState } from "react";
import {
  DEFAULT_DOCKET_CONFIG,
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  MOCK_ADMIN_USER,
} from "../../data";
import { INITIAL_JOBS } from "../../data_jobs";
import {
  Carrier,
  Customer,
  DocketConfig,
  Driver,
  Job,
  Product,
  ProductLot,
  Site,
  Transaction,
  Vehicle,
} from "../../types";
import { DEFAULT_SITES, STORAGE_KEYS } from "../constants";
import { usePersistentState } from "./usePersistentState";
import {
  buildInitialCarriers,
  buildInitialDrivers,
  buildInitialProductLots,
  buildInitialProducts,
  buildInitialVehicles,
} from "../utils/initializers";

export function useAppState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClerkMode, setIsClerkMode] = useState(false);
  const [activeView, setActiveView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("product_id") ? "product-details-standalone" : "dashboard";
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductLotId, setSelectedProductLotId] = useState<string | null>(null);
  const [selectedCarterId, setSelectedCarterId] = useState<string | null>(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [prevViewBeforeDetails, setPrevViewBeforeDetails] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState("All Sites");

  const [sites, setSites] = usePersistentState<Site[]>(STORAGE_KEYS.sites, () => {
    const saved = localStorage.getItem(STORAGE_KEYS.sites);
    return saved ? JSON.parse(saved) : DEFAULT_SITES;
  });
  const [siteLimit, setSiteLimit] = usePersistentState<number>(
    STORAGE_KEYS.siteLimit,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.siteLimit);
      return saved ? Number(saved) : 99;
    },
  );
  const [transactions, setTransactions] = usePersistentState<Transaction[]>(
    STORAGE_KEYS.transactions,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.transactions);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    },
  );
  const [products, setProducts] = usePersistentState<Product[]>(
    STORAGE_KEYS.products,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.products);
      return buildInitialProducts(saved ? JSON.parse(saved) : null);
    },
  );
  const [customers, setCustomers] = usePersistentState<Customer[]>(
    STORAGE_KEYS.customers,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.customers);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    },
  );
  const [jobs, setJobs] = usePersistentState<Job[]>(STORAGE_KEYS.jobs, () => {
    const saved = localStorage.getItem(STORAGE_KEYS.jobs);
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });
  const [productLots, setProductLots] = usePersistentState<ProductLot[]>(
    STORAGE_KEYS.productLots,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.productLots);
      return buildInitialProductLots(saved ? JSON.parse(saved) : null);
    },
  );
  const [carriers, setCarriers] = usePersistentState<Carrier[]>(
    STORAGE_KEYS.carriers,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.carriers);
      return buildInitialCarriers(saved ? JSON.parse(saved) : null);
    },
  );
  const [drivers, setDrivers] = usePersistentState<Driver[]>(
    STORAGE_KEYS.drivers,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.drivers);
      return buildInitialDrivers(saved ? JSON.parse(saved) : null);
    },
  );
  const [vehicles, setVehicles] = usePersistentState<Vehicle[]>(
    STORAGE_KEYS.vehicles,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.vehicles);
      return buildInitialVehicles(saved ? JSON.parse(saved) : null);
    },
  );
  const [docketConfig, setDocketConfig] = usePersistentState<DocketConfig>(
    STORAGE_KEYS.docketConfig,
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.docketConfig);
      if (!saved) {
        return DEFAULT_DOCKET_CONFIG;
      }

      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Error parsing docket config", error);
        return DEFAULT_DOCKET_CONFIG;
      }
    },
  );

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEYS.products) {
        return;
      }

      try {
        const updatedProducts = JSON.parse(event.newValue || "[]");
        setProducts(buildInitialProducts(updatedProducts));
      } catch (error) {
        console.error("Storage synchronization error:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setProducts]);

  useEffect(() => {
    if (selectedSite === "All Sites") {
      if (siteLimit < sites.length) {
        const firstActive = sites.find(
          (site, index) => index < siteLimit && site.status === "Active",
        );

        if (firstActive) {
          setSelectedSite(firstActive.name);
        }
      }
      return;
    }

    const currentIndex = sites.findIndex((site) => site.name === selectedSite);
    const currentSite = sites[currentIndex];
    const isRestrictedByLimit = currentIndex >= siteLimit;
    const isLockedOrMaintenance = currentSite && currentSite.status !== "Active";

    if (currentIndex === -1 || isRestrictedByLimit || isLockedOrMaintenance) {
      const fallbackSite = sites.find(
        (site, index) => index < siteLimit && site.status === "Active",
      );

      if (fallbackSite) {
        setSelectedSite(fallbackSite.name);
      } else {
        setSelectedSite(sites[0]?.name || "All Sites");
      }
    }
  }, [selectedSite, siteLimit, sites]);

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
      ),
    );
  };

  const handleUpdateProduct = (updatedProduct: Product, oldId?: string) => {
    setProducts((previous) =>
      previous.map((product) => {
        const matchId = oldId || updatedProduct.id;
        return product.id === matchId ? updatedProduct : product;
      }),
    );
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers((previous) => {
      const exists = previous.some((customer) => customer.id === updatedCustomer.id);
      return exists
        ? previous.map((customer) =>
            customer.id === updatedCustomer.id ? updatedCustomer : customer,
          )
        : [...previous, updatedCustomer];
    });
  };

  const handleAddJob = (newJob: Job) => {
    setJobs((previous) => [...previous, newJob]);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((previous) =>
      previous.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
    );

    setTransactions((previous) =>
      previous.map((transaction) => {
        if (transaction.jobOrder !== updatedJob.id) {
          return transaction;
        }

        return {
          ...transaction,
          basePrice: updatedJob.appliedRate,
          totalValue: Number((transaction.netWeight * updatedJob.appliedRate).toFixed(2)),
        };
      }),
    );
  };

  const handleViewTicketDetails = (ticketId: string) => {
    if (activeView !== "ticket-details") {
      setPrevViewBeforeDetails(activeView);
    }

    setSelectedTicketId(ticketId);
    setActiveView("ticket-details");
  };

  const getFilteredTransactions = () => {
    if (selectedSite === "All Sites") {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.siteName === selectedSite);
  };

  return {
    adminUser: MOCK_ADMIN_USER,
    sidebarCollapsed,
    setSidebarCollapsed,
    isClerkMode,
    setIsClerkMode,
    activeView,
    setActiveView,
    selectedTicketId,
    selectedProductId,
    setSelectedProductId,
    selectedProductLotId,
    setSelectedProductLotId,
    selectedCarterId,
    setSelectedCarterId,
    selectedVehiclePlate,
    setSelectedVehiclePlate,
    selectedDriverId,
    setSelectedDriverId,
    prevViewBeforeDetails,
    searchQuery,
    setSearchQuery,
    selectedSite,
    setSelectedSite,
    sites,
    setSites,
    siteLimit,
    setSiteLimit,
    transactions,
    setTransactions,
    products,
    setProducts,
    customers,
    setCustomers,
    jobs,
    setJobs,
    productLots,
    setProductLots,
    carriers,
    setCarriers,
    drivers,
    setDrivers,
    vehicles,
    setVehicles,
    docketConfig,
    setDocketConfig,
    handleUpdateTransaction,
    handleUpdateProduct,
    handleUpdateCustomer,
    handleAddJob,
    handleUpdateJob,
    handleViewTicketDetails,
    getFilteredTransactions,
  };
}
