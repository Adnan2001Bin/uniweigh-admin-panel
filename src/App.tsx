import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import TransactionsView from "./components/TransactionsView";
import ProductsView from "./components/ProductsView";
import CustomersView from "./components/CustomersView";
import DestinationContactsView from "./components/DestinationContactsView";
import DestinationsView from "./components/DestinationsView";
import ReportsView from "./components/ReportsView";
import AdminView from "./components/AdminView";
import TicketDetailView from "./components/TicketDetailView";
import JobsView from "./components/JobsView";
import ProductDetailStandaloneView from "./components/ProductDetailStandaloneView";
import ProductLotsView from "./components/ProductLotsView";
import ProductLotDetailView from "./components/ProductLotDetailView";
import CartersView from "./components/CartersView";
import CarterDetailView from "./components/CarterDetailView";
import VehiclesView from "./components/VehiclesView";
import VehicleDetailView from "./components/VehicleDetailView";
import DriversView from "./components/DriversView";
import DriverDetailView from "./components/DriverDetailView";
import ClerkView from "./components/ClerkView";
import { Toaster } from "./components/ui/sonner";
import { DialogHost } from "./components/shared/dialog-service";

import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_CARRIERS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_TRANSACTIONS,
  MOCK_ADMIN_USER,
  DEFAULT_DOCKET_CONFIG
} from "./data";
import { INITIAL_JOBS } from "./data_jobs";
import { Transaction, Product, Customer, Site, Job, ProductLot, Carrier, Driver, Vehicle, DocketConfig } from "./types";


export default function App() {
  // Sidebar expanded / collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Clerk operator mode switcher state
  const [isClerkMode, setIsClerkMode] = useState<boolean>(false);

  // Active view router state
  const [activeView, setActiveView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("product_id")) {
      return "product-details-standalone";
    }
    return "dashboard";
  });

  // Cross-tab Synchronization Listener for Live Database Updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "uniweigh_prods") {
        try {
          const updatedProds = JSON.parse(e.newValue || "[]");
          setProducts(updatedProds);
        } catch (err) {
          console.error("Storage synchronization error:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Ticket details view state tracking
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [prevViewBeforeDetails, setPrevViewBeforeDetails] = useState<string>("dashboard");

  // Global search queried from header
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Site filtered state - can be "All Sites" or specific stations
  const [selectedSite, setSelectedSite] = useState<string>("All Sites");

  // Dynamic Sites list and Developer system access limit
  const [sites, setSites] = useState<Site[]>(() => {
    const saved = localStorage.getItem("uniweigh_sites");
    if (saved) return JSON.parse(saved);
    return [
      { id: "site-1", name: "Melbourne Eastern Quarry", status: "Active", scaleCount: 2, operatorName: "John Davis" },
      { id: "site-2", name: "Bayside Coastal Sands", status: "Active", scaleCount: 1, operatorName: "Sarah JenkinsK" },
      { id: "site-3", name: "Western Eco-Recycling Depot", status: "Active", scaleCount: 1, operatorName: "Steve G" }
    ];
  });

  const [siteLimit, setSiteLimit] = useState<number>(() => {
    const saved = localStorage.getItem("uniweigh_site_limit");
    return saved ? Number(saved) : 99;
  });

  // System States with local storage sync capability
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("uniweigh_txs");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("uniweigh_prods");
    const parsed = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    return parsed.map((p: any) => ({
      ...p,
      productCode: p.productCode || p.id,
      site: p.site || (p.category === "Sand" ? "Bayside Coastal Sands" : p.category === "Soil" ? "Western Eco-Recycling Depot" : "Melbourne Eastern Quarry"),
      unitOfMeasure: p.unitOfMeasure || p.unit || "Tonnes",
      notes: p.notes || `Standard catalog specification for ${p.name}.`,
      defaultPrice: p.defaultPrice !== undefined ? p.defaultPrice : p.basePrice,
      priceLevel1: p.priceLevel1 !== undefined ? p.priceLevel1 : Number((p.basePrice * 0.95).toFixed(2)),
      priceLevel2: p.priceLevel2 !== undefined ? p.priceLevel2 : Number((p.basePrice * 0.90).toFixed(2)),
      priceLevel3: p.priceLevel3 !== undefined ? p.priceLevel3 : Number((p.basePrice * 0.85).toFixed(2)),
    }));
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("uniweigh_custs");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem("uniweigh_jobs");
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [productLots, setProductLots] = useState<ProductLot[]>(() => {
    const saved = localStorage.getItem("uniweigh_product_lots");
    if (saved) return JSON.parse(saved);
    
    const initialLots: ProductLot[] = [];
    
    INITIAL_PRODUCTS.forEach(p => {
      if (p.recentLots) {
        p.recentLots.forEach((l: any) => {
          initialLots.push({
            id: l.lotNumber,
            name: `Lot ${l.lotNumber.replace(/[^0-9]/g, "") || l.lotNumber}`,
            productId: p.id,
            orderQuantity: l.orderQuantity,
            status: l.status,
            notes: `Initial lot allocation for product ${p.name}.`,
            createdDate: "2026-06-20"
          });
        });
      }
    });

    const txnLots = [
      { id: "LOT-A-42", name: "Lot A-42", productId: "P-123", orderQty: 1500, status: "Active" as const },
      { id: "LOT-B-11", name: "Lot B-11", productId: "P-124", orderQty: 1000, status: "Active" as const },
      { id: "LOT-C-05", name: "Lot C-05", productId: "P-125", orderQty: 2500, status: "Active" as const },
      { id: "LOT-D-99", name: "Lot D-99", productId: "P-126", orderQty: 1200, status: "Active" as const },
      { id: "LOT-E-03", name: "Lot E-03", productId: "P-127", orderQty: 800, status: "Active" as const },
      { id: "LOT-F-12", name: "Lot F-12", productId: "P-129", orderQty: 1600, status: "Active" as const }
    ];

    txnLots.forEach(tl => {
      if (!initialLots.some(l => l.id === tl.id)) {
        initialLots.push({
          id: tl.id,
          name: tl.name,
          productId: tl.productId,
          orderQuantity: tl.orderQty,
          status: tl.status,
          notes: "Auto-generated from transaction logs.",
          createdDate: "2026-06-22"
        });
      }
    });

    return initialLots;
  });

  const [selectedProductLotId, setSelectedProductLotId] = useState<string | null>(null);

  // Transport details (persistent & stateful datasets)
  const [carriers, setCarriers] = useState<Carrier[]>(() => {
    const saved = localStorage.getItem("uniweigh_carriers");
    if (saved) return JSON.parse(saved);
    return INITIAL_CARRIERS.map(c => ({
      ...c,
      address: c.id === "CR-01" ? "12 Industrial Parkway, Somerton VIC 3062" :
               c.id === "CR-02" ? "88 Logistics Boulevard, Truganina VIC 3029" :
               c.id === "CR-03" ? "45 Sand Ridge Rd, Langwarrin VIC 3910" :
               "77 Independent Way, Laverton VIC 3028",
      transportRate: c.id === "CR-01" ? 12.50 :
                     c.id === "CR-02" ? 15.00 :
                     c.id === "CR-03" ? 10.50 :
                     14.00,
      notes: "Primary bulk haulage carrier.",
      createdDate: "2024-03-12"
    }));
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem("uniweigh_drivers");
    const parsed = saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    return parsed.map((d: any, i: number) => ({
      ...d,
      phoneNumber: d.phoneNumber || `0412 990 ${String(100 + i)}`,
      notes: d.notes || (i % 2 === 0 ? "Standard commercial logistics driver. Certified for heavy bulk carrier vehicle operations with up to 9-axis setup. Inducted at Melbourne Depot & Geelong Quarries." : "Regional sand/gravel hauling driver. Fully certified for multi-combination (MC) vehicles. Completed OH&S site induction for both B-double and single carriage operations.")
    }));
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("uniweigh_vehicles");
    if (saved) return JSON.parse(saved);
    return INITIAL_VEHICLES.map((v, i) => {
      const isMultiaxel = v.plateNumber === "IC-88-TT" || v.plateNumber === "WB-40-EE";
      return {
        ...v,
        id: v.id || `VH-${String(i + 1).padStart(3, "0")}`,
        name: v.name || `${v.vehicleType} #${i + 1}`,
        category: isMultiaxel ? "Multiaxel" : "Standard",
        weighedAs: isMultiaxel ? "3 Axle Sets" : undefined,
        enableCombinedTare: isMultiaxel ? true : undefined,
        axleSets: isMultiaxel ? [
          { axleSetNumber: 1, tareWeight: Number((v.tareWeight / 3).toFixed(2)), weightMax: 15.00, variance: 0.15 },
          { axleSetNumber: 2, tareWeight: Number((v.tareWeight / 3).toFixed(2)), weightMax: 15.00, variance: 0.15 },
          { axleSetNumber: 3, tareWeight: Number((v.tareWeight / 3).toFixed(2)), weightMax: 15.00, variance: 0.15 }
        ] : undefined,
        tareWeight: v.tareWeight,
        weightMax: isMultiaxel ? 45.00 : v.weightMax || Number((v.tareWeight * 2.5).toFixed(2)),
        variance: v.variance || 0.50
      };
    });
  });

  const [selectedCarterId, setSelectedCarterId] = useState<string | null>(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [docketConfig, setDocketConfig] = useState<DocketConfig>(() => {
    const saved = localStorage.getItem("uniweigh_docket_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing docket config", e);
      }
    }
    return DEFAULT_DOCKET_CONFIG;
  });

  // Save docketConfig modifications to localStorage
  useEffect(() => {
    localStorage.setItem("uniweigh_docket_config", JSON.stringify(docketConfig));
  }, [docketConfig]);


  // Save states modifications to localStorage
  useEffect(() => {
    localStorage.setItem("uniweigh_carriers", JSON.stringify(carriers));
  }, [carriers]);

  useEffect(() => {
    localStorage.setItem("uniweigh_drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem("uniweigh_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);
  useEffect(() => {
    localStorage.setItem("uniweigh_txs", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("uniweigh_prods", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("uniweigh_custs", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("uniweigh_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("uniweigh_product_lots", JSON.stringify(productLots));
  }, [productLots]);


  // Persist sites lists and access locks configuration
  useEffect(() => {
    localStorage.setItem("uniweigh_sites", JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem("uniweigh_site_limit", String(siteLimit));
  }, [siteLimit]);

  // Handle site selection fallback when active developer lock constraints or site lock states change
  useEffect(() => {
    if (selectedSite === "All Sites") {
      // If siteLimit is limiting accessible sites, "All Sites" view is disabled/locked in the Header selector.
      // We force a fallback to the first operational site under the limit.
      if (siteLimit < sites.length) {
        const firstActive = sites.find((s, idx) => idx < siteLimit && s.status === "Active");
        if (firstActive) {
          setSelectedSite(firstActive.name);
        }
      }
      return;
    }

    const currentIdx = sites.findIndex((s) => s.name === selectedSite);
    const currentObj = sites[currentIdx];
    const isRestrictedByLimit = currentIdx >= siteLimit;
    const isLockedOrMaint = currentObj && currentObj.status !== "Active";

    if (currentIdx === -1 || isRestrictedByLimit || isLockedOrMaint) {
      // Find the first operational site under the current limit to act as fallback
      const fallbackSite = sites.find((s, idx) => idx < siteLimit && s.status === "Active");
      if (fallbackSite) {
        setSelectedSite(fallbackSite.name);
      } else {
        // If literally nothing is operational or allowed, revert to first site
        setSelectedSite(sites[0]?.name || "All Sites");
      }
    }
  }, [sites, siteLimit, selectedSite]);

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  };

  const handleUpdateProduct = (updatedProduct: Product, oldId?: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        const matchId = oldId || updatedProduct.id;
        return p.id === matchId ? updatedProduct : p;
      })
    );
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === updatedCustomer.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c));
      } else {
        return [...prev, updatedCustomer];
      }
    });
  };

  const handleAddJob = (newJob: Job) => {
    setJobs((prev) => [...prev, newJob]);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
    );

    // Synchronize transactions linked to this Job with the job's applied pricing rate!
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.jobOrder === updatedJob.id) {
          return {
            ...t,
            basePrice: updatedJob.appliedRate,
            totalValue: Number((t.netWeight * updatedJob.appliedRate).toFixed(2))
          };
        }
        return t;
      })
    );
  };


  const handleViewTicketDetails = (ticketId: string) => {
    if (activeView !== "ticket-details") {
      setPrevViewBeforeDetails(activeView);
    }
    setSelectedTicketId(ticketId);
    setActiveView("ticket-details");
  };

  // Filter Transactions and entities by Selected Site globally before sending to views (if desired)
  const getFilteredTransactions = () => {
    if (selectedSite === "All Sites") return transactions;
    return transactions.filter((t) => t.siteName === selectedSite);
  };

  // Route switch viewport render
  const renderContentView = () => {
    const siteFilteredTxs = getFilteredTransactions();

    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView
            transactions={siteFilteredTxs}
            products={products}
            customers={customers}
            onViewChange={setActiveView}
          />
        );

      // Operations View
      case "operations-transactions":
        return (
          <TransactionsView
            transactions={siteFilteredTxs}
            onUpdateTransaction={handleUpdateTransaction}
            subView="all"
            searchQuery={searchQuery}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "operations-pending":
        return (
          <TransactionsView
            transactions={siteFilteredTxs}
            onUpdateTransaction={handleUpdateTransaction}
            subView="pending"
            searchQuery={searchQuery}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "operations-approved":
        return (
          <TransactionsView
            transactions={siteFilteredTxs}
            onUpdateTransaction={handleUpdateTransaction}
            subView="approved"
            searchQuery={searchQuery}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "operations-invoicing":
        return (
          <TransactionsView
            transactions={siteFilteredTxs}
            onUpdateTransaction={handleUpdateTransaction}
            subView="invoicing"
            searchQuery={searchQuery}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "operations-weighbridge":
        return (
          <TransactionsView
            transactions={siteFilteredTxs}
            onUpdateTransaction={handleUpdateTransaction}
            subView="weighbridge"
            searchQuery={searchQuery}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );

      // Customer view
      case "customers-list":
        return (
          <CustomersView
            customers={customers}
            onUpdateCustomer={handleUpdateCustomer}
            searchQuery={searchQuery}
            transactions={transactions}
          />
        );
      case "customers-contacts":
        return (
          <DestinationContactsView
            customers={customers}
            searchQuery={searchQuery}
            transactions={transactions}
          />
        );
      case "customers-jobs":
        return (
          <JobsView
            jobs={jobs}
            customers={customers}
            products={products}
            transactions={transactions}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onViewTicketDetails={handleViewTicketDetails}
            searchQuery={searchQuery}
          />
        );
      case "customers-destinations":
        return (
          <DestinationsView
            customers={customers}
            jobs={jobs}
            transactions={transactions}
            onViewTicketDetails={handleViewTicketDetails}
            searchQuery={searchQuery}
          />
        );


      // Products views
      case "products-list":
        return (
          <ProductsView
            products={products}
            onUpdateProduct={handleUpdateProduct}
            searchQuery={searchQuery}
            onViewProductDetails={(id) => {
              setSelectedProductId(id);
              setActiveView("product-details");
            }}
          />
        );

      case "products-lots":
        return (
          <ProductLotsView
            productLots={productLots}
            products={products}
            transactions={transactions}
            onAddProductLot={(newLot) => {
              setProductLots((prev) => [newLot, ...prev]);
            }}
            onUpdateProductLot={(updatedLot) => {
              setProductLots((prev) =>
                prev.map((l) => (l.id === updatedLot.id ? updatedLot : l))
              );
            }}
            onViewProductLotDetails={(lotId) => {
              setSelectedProductLotId(lotId);
              setActiveView("product-lot-detail");
            }}
            searchQuery={searchQuery}
          />
        );

      case "product-lot-detail":
        return (
          <ProductLotDetailView
            lotId={selectedProductLotId || ""}
            productLots={productLots}
            products={products}
            transactions={transactions}
            onBack={() => {
              setActiveView("products-lots");
            }}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );

      case "product-details":
        return (
          <ProductDetailStandaloneView
            products={products}
            onUpdateProduct={handleUpdateProduct}
            productId={selectedProductId || undefined}
            jobs={jobs}
            transactions={transactions}
            onBack={() => {
              setActiveView("products-list");
            }}
          />
        );

      // Transport Carrier sections
      case "transport-carters":
        return (
          <CartersView
            carriers={carriers}
            onAddCarter={(newC) => setCarriers(prev => [...prev, newC])}
            onUpdateCarter={(updC) => setCarriers(prev => prev.map(c => c.id === updC.id ? updC : c))}
            onViewCarterDetails={(id) => {
              setSelectedCarterId(id);
              setActiveView("carter-detail");
            }}
            searchQuery={searchQuery}
          />
        );

      case "carter-detail":
        return (
          <CarterDetailView
            carterId={selectedCarterId || ""}
            carriers={carriers}
            drivers={drivers}
            vehicles={vehicles}
            transactions={transactions}
            onBack={() => {
              setActiveView("transport-carters");
            }}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "transport-drivers":
        return (
          <DriversView
            drivers={drivers}
            carriers={carriers}
            onAddDriver={(newDriver) => setDrivers((prev) => [...prev, newDriver])}
            onUpdateDriver={(updatedDriver) =>
              setDrivers((prev) =>
                prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d))
              )
            }
            onViewDriverDetails={(driverId) => {
              setSelectedDriverId(driverId);
              setActiveView("driver-detail");
            }}
            searchQuery={searchQuery}
          />
        );

      case "driver-detail":
        return (
          <DriverDetailView
            driverId={selectedDriverId || ""}
            drivers={drivers}
            carriers={carriers}
            transactions={transactions}
            onBack={() => {
              setActiveView("transport-drivers");
            }}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "transport-vehicles":
        return (
          <VehiclesView
            vehicles={vehicles}
            carriers={carriers}
            onAddVehicle={(newVehicle) => setVehicles((prev) => [...prev, newVehicle])}
            onUpdateVehicle={(updatedVehicle) =>
              setVehicles((prev) =>
                prev.map((v) => (v.plateNumber === updatedVehicle.plateNumber ? updatedVehicle : v))
              )
            }
            onViewVehicleDetails={(plateNumber) => {
              setSelectedVehiclePlate(plateNumber);
              setActiveView("vehicle-detail");
            }}
            searchQuery={searchQuery}
          />
        );

      case "vehicle-detail":
        return (
          <VehicleDetailView
            plateNumber={selectedVehiclePlate || ""}
            vehicles={vehicles}
            carriers={carriers}
            transactions={transactions}
            onBack={() => {
              setActiveView("transport-vehicles");
            }}
            onViewTicketDetails={handleViewTicketDetails}
          />
        );


      // Reports views
      case "reports-transactions":
        return (
          <ReportsView
            transactions={siteFilteredTxs}
            products={products}
            customers={customers}
            subView="transactions"
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "reports-products":
        return (
          <ReportsView
            transactions={siteFilteredTxs}
            products={products}
            customers={customers}
            subView="products"
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "reports-customers":
        return (
          <ReportsView
            transactions={siteFilteredTxs}
            products={products}
            customers={customers}
            subView="customers"
            onViewTicketDetails={handleViewTicketDetails}
          />
        );
      case "reports-progress":
        return (
          <ReportsView
            transactions={siteFilteredTxs}
            products={products}
            customers={customers}
            subView="progress"
            onViewTicketDetails={handleViewTicketDetails}
          />
        );

      // Ticket Details Overview full-page route
      case "ticket-details": {
        const ticket = transactions.find((t) => t.id === selectedTicketId);
        if (!ticket) {
          return (
            <div className="py-20 text-center text-muted-foreground">
              Weigh Ticket ID not detected. Return and select a record.
            </div>
          );
        }
        return (
          <TicketDetailView
            transaction={ticket}
            onUpdateTransaction={handleUpdateTransaction}
            docketConfig={docketConfig}
            jobs={jobs}
            transactions={transactions}
            onBack={() => {
              setActiveView(prevViewBeforeDetails);
            }}
          />
        );
      }

      // Administration views
      case "admin-users":
        return (
          <AdminView
            adminUser={MOCK_ADMIN_USER}
            subView="users"
            sites={sites}
            onUpdateSites={setSites}
            siteLimit={siteLimit}
            onUpdateSiteLimit={setSiteLimit}
            docketConfig={docketConfig}
            onUpdateDocketConfig={setDocketConfig}
          />
        );
      case "admin-roles":
        return (
          <AdminView
            adminUser={MOCK_ADMIN_USER}
            subView="roles"
            sites={sites}
            onUpdateSites={setSites}
            siteLimit={siteLimit}
            onUpdateSiteLimit={setSiteLimit}
            docketConfig={docketConfig}
            onUpdateDocketConfig={setDocketConfig}
          />
        );
      case "admin-preferences":
        return (
          <AdminView
            adminUser={MOCK_ADMIN_USER}
            subView="preferences"
            sites={sites}
            onUpdateSites={setSites}
            siteLimit={siteLimit}
            onUpdateSiteLimit={setSiteLimit}
            docketConfig={docketConfig}
            onUpdateDocketConfig={setDocketConfig}
          />
        );
      case "admin-sites":
        return (
          <AdminView
            adminUser={MOCK_ADMIN_USER}
            subView="sites"
            sites={sites}
            onUpdateSites={setSites}
            siteLimit={siteLimit}
            onUpdateSiteLimit={setSiteLimit}
            docketConfig={docketConfig}
            onUpdateDocketConfig={setDocketConfig}
          />
        );
      case "admin-docket":
        return (
          <AdminView
            adminUser={MOCK_ADMIN_USER}
            subView="docket"
            sites={sites}
            onUpdateSites={setSites}
            siteLimit={siteLimit}
            onUpdateSiteLimit={setSiteLimit}
            docketConfig={docketConfig}
            onUpdateDocketConfig={setDocketConfig}
          />
        );

      default:
        return (
          <div className="py-20 text-center text-muted-foreground">
            View template under development.
          </div>
        );
    }
  };

  if (isClerkMode) {
    return (
      <>
        <Toaster />
        <DialogHost />
        <ClerkView
        adminUser={MOCK_ADMIN_USER}
        customers={customers}
        onUpdateCustomer={handleUpdateCustomer}
        jobs={jobs}
        onAddJob={handleAddJob}
        onUpdateJob={handleUpdateJob}
        products={products}
        onUpdateProduct={handleUpdateProduct}
        productLots={productLots}
        onAddProductLot={(newLot) => setProductLots((prev) => [newLot, ...prev])}
        carriers={carriers}
        onAddCarter={(newC) => setCarriers((prev) => [...prev, newC])}
        drivers={drivers}
        onAddDriver={(newD) => setDrivers((prev) => [...prev, newD])}
        vehicles={vehicles}
        onAddVehicle={(newV) => setVehicles((prev) => [...prev, newV])}
        onAddTransaction={(newTx) => setTransactions((prev) => [newTx, ...prev])}
        onExit={() => setIsClerkMode(false)}
          transactions={transactions}
          docketConfig={docketConfig}
        />
      </>
    );
  }

  if (activeView === "product-details-standalone") {
    return (
      <>
        <Toaster />
        <DialogHost />
        <ProductDetailStandaloneView
          products={products}
          onUpdateProduct={handleUpdateProduct}
          jobs={jobs}
          transactions={transactions}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased font-sans">
      <Toaster />
      <DialogHost />
      {/* Lateral navigation Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={(viewId) => {
          setActiveView(viewId);
          // Auto clear search results when changing view context
          setSearchQuery("");
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onEnterClerkMode={() => setIsClerkMode(true)}
      />

      {/* Main Workspace Frame container */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top Header bar with search & location profiles */}
        <Header
          adminUser={MOCK_ADMIN_USER}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sites={sites}
          siteLimit={siteLimit}
          onEnterClerkMode={() => setIsClerkMode(true)}
        />

        {/* Scrollable primary content canvas */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="w-full pb-10">
            {renderContentView()}
          </div>
        </main>
      </div>
    </div>
  );
}
