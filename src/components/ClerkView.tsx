import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Users,
  Briefcase,
  MapPin,
  Package,
  Layers,
  Plus,
  Pencil,
  RefreshCw,
  Check,
  AlertCircle,
  X,
  Shield,
  ArrowLeft,
  ArrowRight,
  Printer,
  Save,
  Trash2,
  Coins,
  Calculator,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Play,
  ClipboardList,
  ChevronDown,
  Info
} from "lucide-react";
import {
  Transaction,
  TransactionStatus,
  Product,
  Customer,
  Job,
  ProductLot,
  Carrier,
  Driver,
  Vehicle,
  Destination,
  DestinationContact,
  DocketConfig
} from "../types";
import { INITIAL_DESTINATIONS } from "../data_destinations";
import { toast } from "sonner";
import { confirmDialog, promptDialog } from "@/src/components/shared/dialog-service";
import { SelectBox } from "@/src/components/ui/select";
import { RadioBox } from "@/src/components/ui/radio-group";
import { Slider } from "@/src/components/ui/slider";
import { openDeliveryDocketPrint } from "@/src/lib/delivery-docket";
import { isOperatorRole } from "@/src/lib/role-access";
import type { ClerkScreen } from "@/src/lib/app-routes";

interface ClerkViewProps {
  adminUser: { name: string; role: string; avatarUrl?: string };
  customers: Customer[];
  onUpdateCustomer: (cust: Customer) => void;
  jobs: Job[];
  onAddJob: (job: Job) => void;
  onUpdateJob: (job: Job) => void;
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  productLots: ProductLot[];
  onAddProductLot: (lot: ProductLot) => void;
  carriers: Carrier[];
  onAddCarter: (carter: Carrier) => void;
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddTransaction: (tx: Transaction) => void;
  onExit: () => void;
  transactions?: Transaction[];
  docketConfig?: DocketConfig;
  /** Nested URL screen from App (`/clerk`, `/clerk/account`, …) */
  routeScreen?: ClerkScreen;
  routeTicketId?: string | null;
  onRouteChange?: (screen: ClerkScreen, ticketId?: string | null) => void;
}

function screenModeFromRoute(screen: ClerkScreen): "home" | "transaction" | "success" {
  if (screen === "account" || screen === "cash") return "transaction";
  if (screen === "success") return "success";
  return "home";
}

function txTypeFromRoute(screen: ClerkScreen): "Account" | "Cash" {
  return screen === "cash" ? "Cash" : "Account";
}

export default function ClerkView({
  adminUser,
  customers,
  onUpdateCustomer,
  jobs,
  onAddJob,
  onUpdateJob,
  products,
  onUpdateProduct,
  productLots,
  onAddProductLot,
  carriers,
  onAddCarter,
  drivers,
  onAddDriver,
  vehicles,
  onAddVehicle,
  onAddTransaction,
  onExit,
  transactions = [],
  docketConfig,
  routeScreen = "home",
  routeTicketId = null,
  onRouteChange,
}: ClerkViewProps) {
  // --- View States ---
  // "home" (card selection) | "transaction" | "success"
  const [screenMode, setScreenMode] = useState<"home" | "transaction" | "success">(
    () => screenModeFromRoute(routeScreen)
  );
  const [selectedTxType, setSelectedTxType] = useState<"Account" | "Cash">(
    () => txTypeFromRoute(routeScreen)
  );

  const navigateClerk = (screen: ClerkScreen, ticketId: string | null = null) => {
    if (screen === "account" || screen === "cash") {
      setSelectedTxType(screen === "cash" ? "Cash" : "Account");
      setScreenMode("transaction");
    } else if (screen === "success") {
      setScreenMode("success");
    } else {
      setScreenMode("home");
    }
    onRouteChange?.(screen, ticketId);
  };

  // Browser back/forward: App updates routeScreen; mirror into local screens
  useEffect(() => {
    if (routeScreen === "account" || routeScreen === "cash") {
      setSelectedTxType(txTypeFromRoute(routeScreen));
      setScreenMode("transaction");
      return;
    }
    if (routeScreen === "success") {
      setScreenMode("success");
      return;
    }
    setScreenMode("home");
  }, [routeScreen]);

  // --- Searchable dropdown lists state ---
  const [localDestinations, setLocalDestinations] = useState<Destination[]>(() => {
    const saved = localStorage.getItem("uniweigh_destinations");
    return saved ? JSON.parse(saved) : INITIAL_DESTINATIONS;
  });

  const [localContacts, setLocalContacts] = useState<DestinationContact[]>(() => {
    const saved = localStorage.getItem("uniweigh_contacts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("uniweigh_destinations", JSON.stringify(localDestinations));
  }, [localDestinations]);

  useEffect(() => {
    localStorage.setItem("uniweigh_contacts", JSON.stringify(localContacts));
  }, [localContacts]);

  // --- Scale / Weighbridge Simulation States ---
  const [scaleConnected, setScaleConnected] = useState<boolean>(true);
  const [scaleStable, setScaleStable] = useState<boolean>(true);
  const [liveScaleWeight, setLiveScaleWeight] = useState<number>(32.45); // Live reading in tonnes
  const [manualOverrideAllowed, setManualOverrideAllowed] = useState<boolean>(true);

  // Individual Axle Weighing State for Multiaxel mode
  const [axleWeights, setAxleWeights] = useState<{ axleSetNumber: number; gross: string; tare: string; weightMax: number }[]>([]);

  // --- Current Transaction State ---
  const [customerId, setCustomerId] = useState<string>("");
  const [jobId, setJobId] = useState<string>("");
  const [destinationId, setDestinationId] = useState<string>("");
  const [contactId, setContactId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [lotId, setLotId] = useState<string>("");

  const [carterId, setCarterId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [vehiclePlate, setVehiclePlate] = useState<string>("");
  const [transportMode, setTransportMode] = useState<"Standard" | "Multiaxel">("Standard");

  // Weights
  const [grossWeightInput, setGrossWeightInput] = useState<string>("0.00");
  const [tareWeightInput, setTareWeightInput] = useState<string>("0.00");

  // Cash transaction properties
  const [paymentType, setPaymentType] = useState<"Cash" | "EFTPOS" | "Credit Card" | "Bank Transfer">("Cash");
  const [comments, setComments] = useState<string>("");

  // Quick Add Side Drawers state
  // null | "customer" | "job" | "destination" | "contact" | "lot" | "carter" | "driver" | "vehicle"
  const [activeQuickAdd, setActiveQuickAdd] = useState<string | null>(null);

  // Message toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Success screen saved transaction detail placeholder
  const [lastSavedTx, setLastSavedTx] = useState<Transaction | null>(() => {
    if (routeScreen !== "success" || !routeTicketId) return null;
    return transactions.find((tx) => tx.ticketNo === routeTicketId || tx.id === routeTicketId) ?? null;
  });

  // Deep-link / refresh on success: hydrate ticket from transactions list
  useEffect(() => {
    if (routeScreen !== "success") return;
    if (lastSavedTx) return;
    if (!routeTicketId) {
      onRouteChange?.("home", null);
      return;
    }
    const found = transactions.find((tx) => tx.ticketNo === routeTicketId || tx.id === routeTicketId);
    if (found) {
      setLastSavedTx(found);
    } else {
      onRouteChange?.("home", null);
    }
  }, [routeScreen, routeTicketId, transactions, lastSavedTx]);

  // --- Smart Workflow / Cascading Filter Logic ---
  // 1. Customer Selection
  const filteredJobs = useMemo(() => {
    if (!customerId) return [];
    return jobs.filter(j => j.customerId === customerId && j.status === "Active");
  }, [customerId, jobs]);

  // 2. Job Selection Cascade
  const selectedJobObj = useMemo(() => {
    return jobs.find(j => j.id === jobId);
  }, [jobId, jobs]);

  const selectedProductObj = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [productId, products]);

  useEffect(() => {
    if (selectedJobObj) {
      // Automatically load associated Product and Pricing
      setProductId(selectedJobObj.productId);
      setComments(`Contract Job pricing rule applied: ${selectedJobObj.pricingType}`);
    } else {
      setProductId("");
    }
  }, [selectedJobObj]);

  // Destination filter based on selected Job and Customer
  const filteredDestinations = useMemo(() => {
    if (!customerId) return [];
    // Filter by customer first
    let dests = localDestinations.filter(d => d.customerId === customerId && d.status === "Active");
    if (jobId) {
      // Also prioritize destinations associated with this Job ID if specified
      const jobDests = dests.filter(d => d.jobId === jobId);
      if (jobDests.length > 0) return jobDests;
    }
    return dests;
  }, [customerId, jobId, localDestinations]);

  // Destination Contacts based on customer
  const filteredContacts = useMemo(() => {
    if (!customerId) return [];
    return localContacts.filter(c => c.customerId === customerId && c.status === "Active");
  }, [customerId, localContacts]);

  // Product lots based on product
  const filteredLots = useMemo(() => {
    if (!productId) return [];
    return productLots.filter(lot => lot.productId === productId && lot.status === "Active");
  }, [productId, productLots]);

  // Carter selection filters drivers and vehicles
  const filteredDrivers = useMemo(() => {
    if (!carterId) return drivers;
    return drivers.filter(d => d.carrierId === carterId);
  }, [carterId, drivers]);

  const filteredVehicles = useMemo(() => {
    if (!carterId) return vehicles;
    return vehicles.filter(v => v.carrierName === carriers.find(c => c.id === carterId)?.name);
  }, [carterId, vehicles, carriers]);

  // Selected Vehicle Object
  const selectedVehicleObj = useMemo(() => {
    return vehicles.find(v => v.plateNumber === vehiclePlate);
  }, [vehiclePlate, vehicles]);

  // Set transport mode and populate tare weight on vehicle selection
  useEffect(() => {
    if (selectedVehicleObj) {
      setTransportMode(selectedVehicleObj.category === "Multiaxel" ? "Multiaxel" : "Standard");
      setTareWeightInput(selectedVehicleObj.tareWeight.toFixed(2));
    }
  }, [selectedVehicleObj]);

  // Handle initialization of individual axle weights for Multiaxel mode
  useEffect(() => {
    if (transportMode === "Multiaxel" && selectedVehicleObj) {
      if (selectedVehicleObj.axleSets && selectedVehicleObj.axleSets.length > 0) {
        setAxleWeights(
          selectedVehicleObj.axleSets.map((set) => ({
            axleSetNumber: set.axleSetNumber,
            gross: (set.tareWeight + 10.0).toFixed(2), // reasonable default gross
            tare: set.tareWeight.toFixed(2),
            weightMax: set.weightMax || 15.0
          }))
        );
      } else {
        // Fallback standard 3 axle sets
        const baseTare = Number((selectedVehicleObj.tareWeight / 3).toFixed(2));
        setAxleWeights([
          { axleSetNumber: 1, gross: (baseTare + 6.0).toFixed(2), tare: baseTare.toFixed(2), weightMax: 6.5 },
          { axleSetNumber: 2, gross: (baseTare + 12.0).toFixed(2), tare: baseTare.toFixed(2), weightMax: 17.0 },
          { axleSetNumber: 3, gross: (baseTare + 12.0).toFixed(2), tare: baseTare.toFixed(2), weightMax: 20.0 }
        ]);
      }
    } else {
      setAxleWeights([]);
    }
  }, [selectedVehicleObj, transportMode]);

  // Update main gross/tare weight input from axle weights when in Multiaxel mode
  useEffect(() => {
    if (transportMode === "Multiaxel" && axleWeights.length > 0) {
      const totalGross = axleWeights.reduce((sum, item) => sum + (parseFloat(item.gross) || 0), 0);
      const totalTare = axleWeights.reduce((sum, item) => sum + (parseFloat(item.tare) || 0), 0);
      setGrossWeightInput(totalGross.toFixed(2));
      setTareWeightInput(totalTare.toFixed(2));
    }
  }, [axleWeights, transportMode]);

  const handleUpdateAxleWeight = (axleSetNum: number, field: "gross" | "tare", val: string) => {
    setAxleWeights((prev) =>
      prev.map((ax) => (ax.axleSetNumber === axleSetNum ? { ...ax, [field]: val } : ax))
    );
  };

  const handleCaptureAxleWeight = (axleSetNum: number, field: "gross" | "tare") => {
    if (!scaleConnected) {
      showToast("Cannot read from scale: Weighbridge is offline", "error");
      return;
    }
    setAxleWeights((prev) =>
      prev.map((ax) =>
        ax.axleSetNumber === axleSetNum
          ? { ...ax, [field]: liveScaleWeight.toFixed(2) }
          : ax
      )
    );
    showToast(`Captured Axle Set #${axleSetNum} ${field === "gross" ? "Gross" : "Tare"} Weight: ${liveScaleWeight.toFixed(2)} t`);
  };

  // --- Calculations ---
  const grossW = parseFloat(grossWeightInput) || 0;
  const tareW = parseFloat(tareWeightInput) || 0;
  const netW = Math.max(0, parseFloat((grossW - tareW).toFixed(2)));

  const productPricePerTonne = useMemo(() => {
    if (selectedJobObj) return selectedJobObj.appliedRate;
    if (selectedProductObj) {
      return selectedProductObj.defaultPrice ?? selectedProductObj.basePrice ?? 0;
    }
    return 0;
  }, [selectedJobObj, selectedProductObj]);
  const productPriceTotal = parseFloat((netW * productPricePerTonne).toFixed(2));

  // Cartage calculation based on Carter rate
  const selectedCarterObj = useMemo(() => {
    return carriers.find(c => c.id === carterId);
  }, [carterId, carriers]);

  const cartageRate = selectedCarterObj?.transportRate || 0;
  const cartageTotal = parseFloat((netW * cartageRate).toFixed(2));

  const gst = parseFloat(((productPriceTotal + cartageTotal) * 0.10).toFixed(2));
  const totalAmount = parseFloat((productPriceTotal + cartageTotal + gst).toFixed(2));

  // Quantity Limits
  const jobRemainingQty = useMemo(() => {
    if (!selectedJobObj) return 0;
    return Math.max(0, parseFloat((selectedJobObj.orderQty - selectedJobObj.deliveredQty - netW).toFixed(2)));
  }, [selectedJobObj, netW]);

  const selectedLotObj = useMemo(() => {
    return productLots.find(lot => lot.id === lotId);
  }, [lotId, productLots]);

  // Generate a mock remaining quantity for product lots based on standard size
  const lotRemainingQty = useMemo(() => {
    if (!selectedLotObj) return 0;
    return Math.max(0, parseFloat((selectedLotObj.orderQuantity - netW).toFixed(2)));
  }, [selectedLotObj, netW]);

  const lastFiveTxs = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const timeA = a.firstWeighTime ? new Date(a.firstWeighTime).getTime() : 0;
        const timeB = b.firstWeighTime ? new Date(b.firstWeighTime).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.ticketNo || "").localeCompare(a.ticketNo || "");
      })
      .slice(0, 5);
  }, [transactions]);

  // --- Real-time Validation ---
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!customerId) errors.customer = "Customer is required";
    if (selectedTxType === "Account" && !jobId) errors.job = "Job/Order reference is required";
    if (!productId) errors.product = "Product selection is required";
    if (!lotId) errors.lot = "Product lot is required";
    if (!vehiclePlate) errors.vehicle = "Vehicle plate is required";
    if (!driverId) errors.driver = "Driver is required";
    if (!carterId) errors.carter = "Carter company is required";

    if (grossW <= 0) {
      errors.gross = "Gross weight must be greater than 0";
    }
    if (tareW <= 0) {
      errors.tare = "Tare weight must be greater than 0";
    }
    if (grossW <= tareW) {
      errors.net = "Gross weight must exceed Tare weight";
    }

    if (selectedVehicleObj && grossW > (selectedVehicleObj.weightMax || 45.00)) {
      errors.grossOver = `Warning: Weight (${grossW}t) exceeds vehicle capacity limit (${selectedVehicleObj.weightMax}t)`;
    }

    if (selectedJobObj && netW > (selectedJobObj.orderQty - selectedJobObj.deliveredQty)) {
      errors.jobQty = `Warning: Net weight (${netW}t) exceeds remaining Job Order allocation`;
    }

    return errors;
  }, [customerId, jobId, productId, lotId, vehiclePlate, driverId, carterId, grossW, tareW, netW, selectedVehicleObj, selectedJobObj, selectedTxType]);

  const isFormValid = Object.keys(validationErrors).filter(k => !k.endsWith("Over") && !k.endsWith("Qty")).length === 0;

  // --- Weighbridge Handlers ---
  const handleCaptureGross = () => {
    if (!scaleConnected) {
      showToast("Cannot read from scale: Weighbridge is disconnected", "error");
      return;
    }
    if (!scaleStable) {
      showToast("Warning: captured weight while scale reading was unstable", "info");
    }
    setGrossWeightInput(liveScaleWeight.toFixed(2));
    showToast(`Captured Gross Weight: ${liveScaleWeight.toFixed(2)} t from Scale B1`);
  };

  const handleCaptureTare = () => {
    if (!scaleConnected) {
      showToast("Cannot read from scale: Weighbridge is disconnected", "error");
      return;
    }
    setTareWeightInput(liveScaleWeight.toFixed(2));
    showToast(`Captured Tare Weight: ${liveScaleWeight.toFixed(2)} t from Scale B1`);
  };

  // --- Transaction Save Handlers ---
  const handleResetForm = () => {
    setCustomerId("");
    setJobId("");
    setDestinationId("");
    setContactId("");
    setProductId("");
    setLotId("");
    setCarterId("");
    setDriverId("");
    setVehiclePlate("");
    setGrossWeightInput("0.00");
    setTareWeightInput("0.00");
    setComments("");
    showToast("Form cleared", "info");
  };

  const handleCompleteTransaction = (statusToSave: TransactionStatus) => {
    if (!isFormValid && statusToSave === TransactionStatus.APPROVED) {
      showToast("Please fix validation errors before completing", "error");
      return;
    }

    const customerObj = customers.find(c => c.id === customerId);
    const productObj = products.find(p => p.id === productId);
    const carterObj = carriers.find(c => c.id === carterId);
    const driverObj = drivers.find(d => d.id === driverId);
    const destinationObj = localDestinations.find(d => d.id === destinationId);
    const contactObj = localContacts.find(c => c.id === contactId);

    const ticketNumber = `WB-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `TX-${Math.floor(40000 + Math.random() * 59999)}`;

    const newTx: Transaction = {
      id: txId,
      ticketNo: ticketNumber,
      vehicleReg: vehiclePlate,
      driverName: driverObj?.name || "Unknown Operator",
      customerId: customerId,
      customerName: customerObj?.name || "Unknown Account",
      productId: productId,
      productName: productObj?.name || "Industrial Materials",
      carrierName: carterObj?.name || "Independent Transit",
      grossWeight: grossW,
      tareWeight: tareW,
      netWeight: netW,
      firstWeighTime: new Date().toISOString().replace("T", " ").substring(0, 19),
      secondWeighTime: new Date().toISOString().replace("T", " ").substring(0, 19),
      siteName: "Melbourne Eastern Quarry",
      status: statusToSave,
      basePrice: productPricePerTonne,
      totalValue: productPriceTotal,
      comments: comments || "Operator standard weigh log.",
      scaleIdInbound: "Scale-B1",
      scaleIdOutbound: "Scale-B1",
      operatorId: adminUser.name,
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          action: `Created transaction as ${statusToSave}`,
          user: adminUser.name,
          details: `Processed weigh ticket ${ticketNumber} with Net weight of ${netW} tonnes.`
        }
      ],
      type: selectedTxType,
      jobOrder: jobId,
      lotNo: selectedLotObj?.name || lotId,
      transactionCode: `C-${Math.floor(2000 + Math.random() * 7999)}`,
      accountBalance: customerObj?.accountBalance || 0,
      destinationName: destinationObj?.name || "",
      purchaseOrder: selectedJobObj?.customerOrderRef || "",
      siteContactName: contactObj?.name || "",
    };

    // If completed/approved, we update the deliveredQty of the Job!
    if (selectedJobObj && statusToSave === TransactionStatus.APPROVED) {
      const updatedJobObj: Job = {
        ...selectedJobObj,
        deliveredQty: parseFloat((selectedJobObj.deliveredQty + netW).toFixed(2))
      };
      onUpdateJob(updatedJobObj);
    }

    onAddTransaction(newTx);
    setLastSavedTx(newTx);
    navigateClerk("success", newTx.ticketNo);
    showToast(`Transaction ${statusToSave} saved successfully! Ticket code: ${ticketNumber}`);
  };

  const handlePrintTransaction = (tx: Transaction) => {
    const printed = openDeliveryDocketPrint(tx, docketConfig);
    if (!printed) {
      showToast("Popup blocked! Print output sent to console.", "info");
      console.log("Mock printed docket:", tx);
    }
  };

  const handlePrintMock = () => {
    if (!lastSavedTx) return;
    handlePrintTransaction(lastSavedTx);
  };

  // --- Quick Add Form Entities States ---
  const [newCustName, setNewCustName] = useState("");
  const [newCustTerms, setNewCustTerms] = useState("30 Days Net");
  const [newJobRef, setNewJobRef] = useState("");
  const [newJobQty, setNewJobQty] = useState("500");
  const [newJobRate, setNewJobRate] = useState("45.00");
  const [newDestName, setNewDestName] = useState("");
  const [newDestAddress, setNewDestAddress] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newLotName, setNewLotName] = useState("");
  const [newLotQty, setNewLotQty] = useState("1000");
  const [newCarterName, setNewCarterName] = useState("");
  const [newCarterRate, setNewCarterRate] = useState("12.50");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverLicense, setNewDriverLicense] = useState("");
  const [newVehiclePlate, setNewVehiclePlate] = useState("");
  const [newVehicleTare, setNewVehicleTare] = useState("14.50");
  const [newVehicleMax, setNewVehicleMax] = useState("42.50");
  const [newVehicleCategory, setNewVehicleCategory] = useState<"Standard" | "Multiaxel">("Standard");

  const resetQuickAddFields = () => {
    setNewCustName("");
    setNewCustTerms("30 Days Net");
    setNewJobRef("");
    setNewJobQty("500");
    setNewJobRate("45.00");
    setNewDestName("");
    setNewDestAddress("");
    setNewContactName("");
    setNewContactPhone("");
    setNewLotName("");
    setNewLotQty("1000");
    setNewCarterName("");
    setNewCarterRate("12.50");
    setNewDriverName("");
    setNewDriverLicense("");
    setNewVehiclePlate("");
    setNewVehicleTare("14.50");
    setNewVehicleMax("42.50");
    setNewVehicleCategory("Standard");
    setActiveQuickAdd(null);
  };

  const handleSaveQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeQuickAdd === "customer") {
      if (!newCustName) return;
      const id = `C-${Math.floor(500 + Math.random() * 499)}`;
      const newCust: Customer = {
        id,
        name: newCustName,
        contactPerson: "Site Dispatch",
        email: "dispatch@quickadded.com.au",
        phone: "+61 411 000 111",
        status: "Active",
        billingAddress: "Quick Added Address",
        paymentTerms: newCustTerms,
        creditLimit: 50000,
        activeContracts: 1,
        recentActivityDate: new Date().toISOString().substring(0, 10),
        customerCode: `CC-${Math.floor(1000 + Math.random() * 8999)}`,
        accountBalance: 0
      };
      onUpdateCustomer(newCust);
      setCustomerId(id);
      showToast(`Added and selected new Customer: ${newCustName}`);
    }

    else if (activeQuickAdd === "job") {
      if (!newJobRef || !customerId) {
        showToast("Select a customer and specify job reference first!", "error");
        return;
      }
      const prodId = productId || products[0]?.id || "P-123";
      const selectedProd = products.find(p => p.id === prodId);
      const id = `JOB-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 89)}`;
      const newJob: Job = {
        id,
        customerOrderRef: newJobRef,
        customerId,
        customerName: customers.find(c => c.id === customerId)?.name || "Associated Cust",
        productId: prodId,
        productName: selectedProd?.name || "Aggregates",
        orderQty: parseFloat(newJobQty) || 500,
        deliveredQty: 0,
        notes: "Created via Clerk Operator Quick-Add Panel.",
        status: "Active",
        pricingType: "Custom Contract Price",
        customProductRate: parseFloat(newJobRate) || 45.00,
        appliedRate: parseFloat(newJobRate) || 45.00
      };
      onAddJob(newJob);
      setJobId(id);
      showToast(`Added and selected new Job contract: ${newJobRef}`);
    }

    else if (activeQuickAdd === "destination") {
      if (!newDestName || !customerId) {
        showToast("Select a customer first!", "error");
        return;
      }
      const id = `DEST-ADD-${Math.floor(1000 + Math.random() * 8999)}`;
      const newDest: Destination = {
        id,
        name: newDestName,
        jobId: jobId || "JOB-N/A",
        jobRef: selectedJobObj?.customerOrderRef || "Ref",
        customerId,
        customerName: customers.find(c => c.id === customerId)?.name || "Cust",
        phone: "+61 Site Phone",
        status: "Active",
        addressLine1: newDestAddress || "Standard Delivery Lane",
        suburb: "Melbourne",
        state: "VIC",
        postcode: "3000"
      };
      setLocalDestinations(prev => [newDest, ...prev]);
      setDestinationId(id);
      showToast(`Added and selected Destination: ${newDestName}`);
    }

    else if (activeQuickAdd === "contact") {
      if (!newContactName || !customerId) {
        showToast("Select a customer first!", "error");
        return;
      }
      const id = `CON-ADD-${Math.floor(1000 + Math.random() * 8999)}`;
      const newCont: DestinationContact = {
        id,
        contactCode: `CON-C-${Math.floor(100 + Math.random() * 899)}`,
        name: newContactName,
        customerId,
        customerName: customers.find(c => c.id === customerId)?.name || "Cust",
        phone: newContactPhone || "N/A",
        mobile: newContactPhone || "N/A",
        email: "sitecontact@uniweigh.com",
        role: "Delivery Supervisor",
        isSafetyContact: true,
        isSiteAccessContact: true,
        isEmergencyContact: false,
        status: "Active",
        createdOn: new Date().toISOString().substring(0, 10),
        createdBy: adminUser.name,
        inductionRequired: false
      };
      setLocalContacts(prev => [newCont, ...prev]);
      setContactId(id);
      showToast(`Added and selected Contact: ${newContactName}`);
    }

    else if (activeQuickAdd === "lot") {
      if (!newLotName || !productId) {
        showToast("Select a Product first!", "error");
        return;
      }
      const id = `LOT-ADD-${Math.floor(100 + Math.random() * 899)}`;
      const newLot: ProductLot = {
        id,
        name: newLotName,
        productId,
        orderQuantity: parseFloat(newLotQty) || 1000,
        status: "Active",
        notes: "Quick added from Weighbridge terminal screen.",
        createdDate: new Date().toISOString().substring(0, 10)
      };
      onAddProductLot(newLot);
      setLotId(id);
      showToast(`Added and selected Product Lot: ${newLotName}`);
    }

    else if (activeQuickAdd === "carter") {
      if (!newCarterName) return;
      const id = `CR-ADD-${Math.floor(10 + Math.random() * 89)}`;
      const newCarter: Carrier = {
        id,
        name: newCarterName,
        contactNo: "+61 412 Dispatch",
        email: "transit@carteradded.com",
        status: "Active",
        vehicleCount: 1,
        transportRate: parseFloat(newCarterRate) || 12.50,
        notes: "Heavy haulage carter added from clerk terminal.",
        createdDate: new Date().toISOString().substring(0, 10)
      };
      onAddCarter(newCarter);
      setCarterId(id);
      showToast(`Added and selected Carter: ${newCarterName}`);
    }

    else if (activeQuickAdd === "driver") {
      if (!newDriverName || !carterId) {
        showToast("Select a Carter company first!", "error");
        return;
      }
      const id = `DR-ADD-${Math.floor(100 + Math.random() * 899)}`;
      const selectedCarter = carriers.find(c => c.id === carterId);
      const newDriver: Driver = {
        id,
        name: newDriverName,
        licenseNumber: newDriverLicense || "LIC-99882",
        carrierId: carterId,
        carrierName: selectedCarter?.name || "Independent",
        status: "Active",
        lastWeighedDate: new Date().toISOString().substring(0, 10),
        phoneNumber: "+61 499 111 222",
        notes: "Quick induction completed."
      };
      onAddDriver(newDriver);
      setDriverId(id);
      showToast(`Added and selected Driver: ${newDriverName}`);
    }

    else if (activeQuickAdd === "vehicle") {
      if (!newVehiclePlate || !carterId) {
        showToast("Select a Carter company and specify Plate Number!", "error");
        return;
      }
      const selectedCarter = carriers.find(c => c.id === carterId);
      const newV: Vehicle = {
        id: `VH-ADD-${Math.floor(100 + Math.random() * 899)}`,
        plateNumber: newVehiclePlate.toUpperCase(),
        vehicleType: "Semi-Trailer Heavy Dump",
        carrierName: selectedCarter?.name || "Independent Hauler",
        tareWeight: parseFloat(newVehicleTare) || 14.50,
        lastTareDate: new Date().toISOString().substring(0, 10),
        status: "Active",
        weightMax: parseFloat(newVehicleMax) || 42.50,
        category: newVehicleCategory,
        weighedAs: newVehicleCategory === "Multiaxel" ? "3 Axle Sets" : undefined,
        enableCombinedTare: newVehicleCategory === "Multiaxel" ? true : undefined,
        axleSets: newVehicleCategory === "Multiaxel" ? [
          { axleSetNumber: 1, tareWeight: Number(((parseFloat(newVehicleTare) || 14.50) / 3).toFixed(2)), weightMax: 15.00, variance: 0.15 },
          { axleSetNumber: 2, tareWeight: Number(((parseFloat(newVehicleTare) || 14.50) / 3).toFixed(2)), weightMax: 15.00, variance: 0.15 },
          { axleSetNumber: 3, tareWeight: Number(((parseFloat(newVehicleTare) || 14.50) / 3).toFixed(2)), weightMax: 15.00, variance: 0.15 }
        ] : undefined
      };
      onAddVehicle(newV);
      setVehiclePlate(newV.plateNumber);
      showToast(`Added and selected Vehicle: ${newV.plateNumber}`);
    }

    resetQuickAddFields();
  };

  return (
    <div className="min-h-screen w-full bg-muted text-foreground font-sans antialiased flex flex-col relative">
      {/* Top Professional Operator Header */}
      <header className="bg-sidebar text-white h-16 px-6 shrink-0 flex items-center justify-between border-b border-sidebar-border z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white font-bold text-2xl shadow-inner">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Uniweigh Clerk Terminal <span className="bg-primary text-sidebar-primary text-xs font-bold py-0.5 px-2 rounded-full border border-ring">Weighbridge Ops v6</span>
            </h1>
            <p className="text-xs text-sidebar-foreground/70 font-medium">Site Station: Melbourne Eastern Quarry • Active Scale B1</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-sidebar-accent border border-sidebar-border rounded-md py-1 px-3 text-xs">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            <span className="font-semibold text-sidebar-accent-foreground">Scale Connection: Online</span>
          </div>

          <div className="flex items-center gap-3 border-l border-sidebar-border pl-4 text-xs">
            <div className="text-right">
              <p className="font-bold text-white">{adminUser.name}</p>
              <p className="text-xs text-sidebar-foreground/70 uppercase tracking-widest font-bold">{adminUser.role}</p>
            </div>
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 bg-destructive hover:bg-destructive/90 text-white font-bold px-3 py-1.5 rounded-md text-xs cursor-pointer transition select-none shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isOperatorRole(adminUser.role) ? "Sign Out" : "Back to Admin Panel"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Toast Notifications */}
        {toast && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-md shadow-lg font-bold text-sm border flex items-center gap-2.5 transition-all animate-bounce ${
            toast.type === "success" ? "bg-success/10 text-success border-success/25" :
            toast.type === "error" ? "bg-destructive/10 text-destructive border-destructive/25" :
            "bg-info/10 text-info border-info/25"
          }`}>
            <Info className="h-4.5 w-4.5" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* SCREEN 1: Home Action Card Selection */}
        {screenMode === "home" && (
          <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Select Transaction Workflow</h2>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-md mx-auto">
                Select the appropriate billing and invoicing stream for the oncoming vehicle currently on the weighbridge scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Account Card */}
              <button
                onClick={() => {
                  navigateClerk("account");
                }}
                className="group relative flex flex-col items-start p-8 bg-card border-2 border-border rounded-lg hover:border-primary hover:shadow-lg text-left transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="bg-info/10 group-hover:bg-primary rounded-lg p-4 transition-colors mb-6">
                  <ClipboardList className="h-8 w-8 text-info group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-info transition-colors">Account Transaction</h3>
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  Process loading with an established bulk commercial customer. Pricing rules, logistics contracts, and credit checks will inherit automatically from the active customer Job profile.
                </p>
                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-info uppercase tracking-wider">
                  <span>Start Entry</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>

              {/* Cash Card */}
              <button
                onClick={() => {
                  navigateClerk("cash");
                }}
                className="group relative flex flex-col items-start p-8 bg-card border-2 border-border rounded-lg hover:border-warning hover:shadow-lg text-left transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="bg-warning/10 group-hover:bg-warning rounded-lg p-4 transition-colors mb-6">
                  <Coins className="h-8 w-8 text-warning group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-warning transition-colors">Cash / Walk-in Transaction</h3>
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  Record weigh operations for single, non-account operators or immediate payment delivery trucks. Process credit card, EFTPOS, cash, or bank transfers on-the-spot prior to departure.
                </p>
                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-warning uppercase tracking-wider">
                  <span>Start Entry</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </div>

            {/* Recent Clerk Transactions (Operator Journal) */}
            <div className="w-full mt-12 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground animate-pulse" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Recent Clerk Transactions (Last 5 Tickets)
                  </h4>
                </div>
                <span className="text-xs bg-info/10 text-info border border-info/25 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Operator Journal
                </span>
              </div>

              {lastFiveTxs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                  No transactions recorded yet. Completed tickets will appear here for quick printing.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <th className="px-6 py-3">Ticket / Time</th>
                        <th className="px-6 py-3">Customer & Vehicle</th>
                        <th className="px-6 py-3">Product / Lot</th>
                        <th className="px-6 py-3 text-right">Net Weight</th>
                        <th className="px-6 py-3 text-right">Type / Value</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lastFiveTxs.map((tx) => (
                        <tr key={tx.id || tx.ticketNo} className="hover:bg-muted transition-colors text-xs">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-foreground block">{tx.ticketNo}</span>
                            <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                              {tx.firstWeighTime}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-foreground block truncate max-w-[280px]" title={tx.customerName}>
                              {tx.customerName}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded inline-block mt-1">
                              {tx.vehicleReg}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-foreground block">{tx.productName}</span>
                            {tx.lotNo && (
                              <span className="text-xs text-info bg-info/10 border border-info/25 px-1.5 py-0.5 rounded inline-block mt-1 font-bold">
                                Lot: {tx.lotNo}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-bold text-foreground text-sm">{tx.netWeight.toFixed(2)} t</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {tx.type === "Account" ? (
                              <span className="text-xs bg-info/10 text-info border border-info/25 font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                                Account
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="font-mono font-bold text-success block">${tx.totalValue.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground uppercase font-bold block">Cash Sale</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handlePrintTransaction(tx)}
                              className="inline-flex items-center gap-2 text-xs font-bold text-info hover:text-info hover:bg-info/10 bg-muted border border-border hover:border-info/40 px-3.5 py-2 rounded-md transition-all cursor-pointer"
                              title="Print copy of this docket"
                            >
                              <Printer className="h-5 w-5 shrink-0" />
                              <span>Reprint Docket</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-12 text-muted-foreground text-xs flex items-center gap-2 border-t border-border pt-6 w-full justify-center">
              <Lock className="h-3.5 w-3.5" />
              <span>Weighbridge terminal locks state securely to local depot scale sensor feed.</span>
            </div>
          </div>
        )}

        {/* SCREEN 2: Progressive Transaction Workspace */}
        {screenMode === "transaction" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-36 bg-muted w-full">
            <div className="w-full space-y-10">
                
                {/* Upper Breadcrumb Navigation bar */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <button
                    onClick={async () => {
                      if (await confirmDialog("Are you sure you want to cancel this entry? All unsaved inputs will be lost.")) {
                        handleResetForm();
                        navigateClerk("home");
                      }
                    }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Selection</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Current Stream:</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      selectedTxType === "Account" 
                        ? "bg-info/10 text-info border-info/25" 
                        : "bg-warning/10 text-warning border-warning/30"
                    }`}>
                      {selectedTxType === "Account" ? <ClipboardList className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
                      {selectedTxType} Billing
                    </span>
                  </div>
                </div>

                {/* Section 1: Job Information */}
                <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-muted px-5 py-3 border-b border-border flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Section 1 – Job & Order Specifications
                    </h4>
                    <span className="text-xs text-muted-foreground font-bold">Progressive Match Enabled</span>
                  </div>
                  
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Dropdown */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Customer <span className="text-destructive">*</span></label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveQuickAdd("customer")}
                            className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                            title="Quick Add Customer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <SelectBox
                        searchable
                        value={customerId}
                        onChange={(e) => {
                          setCustomerId(e.target.value);
                          setJobId(""); // Reset children cascades
                          setDestinationId("");
                          setContactId("");
                        }}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- Select Site Customer Account --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id}) {c.status === "Suspended" ? "⚠️ SUSPENDED" : ""}
                          </option>
                        ))}
                      </SelectBox>
                      {validationErrors.customer && (
                        <p className="text-xs text-destructive font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.customer}
                        </p>
                      )}
                    </div>

                    {/* Job / Order Reference */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          Job Contract / Order Ref {selectedTxType === "Account" && <span className="text-destructive">*</span>}
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!customerId) {
                                showToast("Please select a customer first", "error");
                                return;
                              }
                              setActiveQuickAdd("job");
                            }}
                            className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                            title="Quick Add Job"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <SelectBox
                        searchable
                        value={jobId}
                        disabled={!customerId}
                        onChange={(e) => {
                          setJobId(e.target.value);
                          setDestinationId("");
                        }}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:opacity-50 hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- {customerId ? "Select Active Job Contract" : "Select Customer Account First" } --</option>
                        {filteredJobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.customerOrderRef} • {j.productName} ({j.pricingType})
                          </option>
                        ))}
                      </SelectBox>
                      {validationErrors.job && (
                        <p className="text-xs text-destructive font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.job}
                        </p>
                      )}
                    </div>

                    {/* Destination Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Destination Site</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!customerId) {
                                showToast("Please select a customer first", "error");
                                return;
                              }
                              setActiveQuickAdd("destination");
                            }}
                            className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                            title="Quick Add Destination"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <SelectBox
                        searchable
                        value={destinationId}
                        disabled={!customerId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:opacity-50 hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- Select Project Site Destination --</option>
                        {filteredDestinations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.suburb})
                          </option>
                        ))}
                      </SelectBox>
                    </div>

                    {/* Destination Contact */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Site Contact</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!customerId) {
                                showToast("Please select a customer first", "error");
                                return;
                              }
                              setActiveQuickAdd("contact");
                            }}
                            className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                            title="Quick Add Contact"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <SelectBox
                        searchable
                        value={contactId}
                        disabled={!customerId}
                        onChange={(e) => setContactId(e.target.value)}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:opacity-50 hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- Select Inducted Supervisor --</option>
                        {filteredContacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.role})
                          </option>
                        ))}
                      </SelectBox>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Product / Material Loaded <span className="text-destructive">*</span></label>
                      <SelectBox
                        searchable
                        value={productId}
                        disabled={!!jobId} // Product inherits automatically once Job is selected
                        onChange={(e) => {
                          setProductId(e.target.value);
                          setLotId("");
                        }}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:bg-muted disabled:opacity-85 font-semibold"
                      >
                        <option value="">-- Inherits from selected Job --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </SelectBox>
                      {productId && (
                        <p className="text-xs text-info font-bold flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" /> Inherited Contract Product. Operator cannot manually override.
                        </p>
                      )}
                    </div>

                    {/* Product Lot */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Product Allocation Lot <span className="text-destructive">*</span></label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!productId) {
                                showToast("Please select a product/job first", "error");
                                return;
                              }
                              setActiveQuickAdd("lot");
                            }}
                            className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                            title="Quick Add Product Lot"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <SelectBox
                        searchable
                        value={lotId}
                        disabled={!productId}
                        onChange={(e) => setLotId(e.target.value)}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:opacity-50 hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- {productId ? "Select Certified Product Lot" : "Select Product First" } --</option>
                        {filteredLots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.name} (Max Order: {lot.orderQuantity}t)
                          </option>
                        ))}
                      </SelectBox>
                      {validationErrors.lot && (
                        <p className="text-xs text-destructive font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.lot}
                        </p>
                      )}
                    </div>

                  </div>
                </div>

                {/* Section 2: Transport Information */}
                <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-muted px-5 py-3 border-b border-border">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      Section 2 – Transit & Transport Carrier Configuration
                    </h4>
                  </div>
                  
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Carter Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Transit Carter Company <span className="text-destructive">*</span></label>
                        <button
                          type="button"
                          onClick={() => setActiveQuickAdd("carter")}
                          className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                          title="Quick Add Carter"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <SelectBox
                        searchable
                        value={carterId}
                        onChange={(e) => {
                          setCarterId(e.target.value);
                          setDriverId(""); // Reset dependent states
                          setVehiclePlate("");
                        }}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- Select Registered Hauler --</option>
                        {carriers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </SelectBox>
                      {validationErrors.carter && (
                        <p className="text-xs text-destructive font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.carter}
                        </p>
                      )}
                    </div>

                    {/* Driver Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Driver Operator <span className="text-destructive">*</span></label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!carterId) {
                              showToast("Please select a Carter company first", "error");
                              return;
                            }
                            setActiveQuickAdd("driver");
                          }}
                          className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                          title="Quick Add Driver"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <SelectBox
                        searchable
                        value={driverId}
                        disabled={!carterId}
                        onChange={(e) => setDriverId(e.target.value)}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:opacity-50 hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- {carterId ? "Select Inducted Driver" : "Select Carter Company First"} --</option>
                        {filteredDrivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} (Lic: {d.licenseNumber})
                          </option>
                        ))}
                      </SelectBox>
                      {validationErrors.driver && (
                        <p className="text-xs text-destructive font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.driver}
                        </p>
                      )}
                    </div>

                    {/* Vehicle Plate Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Vehicle registration plate <span className="text-destructive">*</span></label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!carterId) {
                              showToast("Please select a Carter company first", "error");
                              return;
                            }
                            setActiveQuickAdd("vehicle");
                          }}
                          className="p-1 text-muted-foreground hover:text-info hover:bg-muted rounded"
                          title="Quick Add Vehicle"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <SelectBox
                        searchable
                        value={vehiclePlate}
                        disabled={!carterId}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        className="w-full h-11 border border-border rounded-md px-3 py-2 text-sm bg-muted disabled:opacity-50 hover:bg-card focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all font-semibold"
                      >
                        <option value="">-- {carterId ? "Select Approved Plate" : "Select Carter Company First"} --</option>
                        {filteredVehicles.map((v) => (
                          <option key={v.plateNumber} value={v.plateNumber}>
                            {v.plateNumber} ({v.vehicleType} • Tare: {v.tareWeight}t)
                          </option>
                        ))}
                      </SelectBox>
                      {validationErrors.vehicle && (
                        <p className="text-xs text-destructive font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" /> {validationErrors.vehicle}
                        </p>
                      )}
                    </div>

                    {/* Mode of Transport Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Transit Mode (Standard vs Multiaxel)</label>
                      <div className="flex gap-4 pt-1.5">
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-foreground select-none cursor-pointer">
                          <RadioBox checked={transportMode === "Standard"} onChange={() => setTransportMode("Standard")} />
                          <span>Standard Carriage</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-foreground select-none cursor-pointer">
                          <RadioBox checked={transportMode === "Multiaxel"} onChange={() => setTransportMode("Multiaxel")} />
                          <span>Multiaxel Heavy setup</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Multiaxel Axle Configuration loadout & Interactive inputs */}
                  {transportMode === "Multiaxel" && axleWeights && axleWeights.length > 0 && (
                    <div className="mx-5 mb-5 p-5 bg-muted rounded-lg border border-border space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                        <div>
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-info animate-pulse" />
                            Multi-Axle Individual Weight Terminal
                          </span>
                          <p className="text-xs text-muted-foreground font-semibold mt-0.5">Weigh each axle group individually. The total Gross and Tare weights will sum automatically.</p>
                        </div>
                        <span className="text-xs bg-info/10 text-info font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-info/25">
                          Axle Balance: Active
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {axleWeights.map((set, idx) => {
                          const axleGross = parseFloat(set.gross) || 0;
                          const axleTare = parseFloat(set.tare) || 0;
                          const axleNet = Math.max(0, parseFloat((axleGross - axleTare).toFixed(2)));
                          const isOverloaded = axleGross > set.weightMax;
                          const safetyPercent = Math.min(100, Math.round((axleGross / set.weightMax) * 100));

                          return (
                            <div key={set.axleSetNumber} className={`bg-card border rounded-lg p-4 space-y-3 transition-all duration-300 shadow-xs ${
                              isOverloaded ? 'border-destructive/40 ring-1 ring-destructive shadow-sm-500/5' : 'border-border hover:border-input'
                            }`}>
                              <div className="flex items-center justify-between border-b border-border pb-1.5">
                                <span className="text-xs font-bold text-foreground uppercase">
                                  {idx === 0 ? "Steer Axle" : idx === 1 ? "Drive Axle" : `Trailer Axle Set #${set.axleSetNumber - 2}`}
                                </span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                  isOverloaded ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                                }`}>
                                  Max: {set.weightMax}t
                                </span>
                              </div>

                              {/* Interactive Individual Axle Inputs */}
                              <div className="space-y-2">
                                {/* Gross Input */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-muted-foreground uppercase">Gross Weight:</span>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={set.gross}
                                      onChange={(e) => handleUpdateAxleWeight(set.axleSetNumber, "gross", e.target.value)}
                                      className="w-full h-9 bg-muted border border-border rounded-md pl-2.5 pr-6 font-mono font-bold text-xs text-foreground focus:bg-card focus:outline-none focus:border-ring transition-all"
                                    />
                                    <span className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-xs font-bold text-muted-foreground">t</span>
                                  </div>
                                </div>

                                {/* Tare Input */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-muted-foreground uppercase">Tare Weight:</span>
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={set.tare}
                                      onChange={(e) => handleUpdateAxleWeight(set.axleSetNumber, "tare", e.target.value)}
                                      className="w-full h-9 bg-muted border border-border rounded-md pl-2.5 pr-6 font-mono font-bold text-xs text-foreground focus:bg-card focus:outline-none focus:border-ring transition-all"
                                    />
                                    <span className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-xs font-bold text-muted-foreground">t</span>
                                  </div>
                                </div>
                              </div>

                              {/* Calculated Net & Capacity Meter */}
                              <div className="border-t border-border pt-2 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-muted-foreground">Calculated Net:</span>
                                  <span className="font-mono font-bold text-foreground">{axleNet.toFixed(2)} t</span>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-muted-foreground text-xs">Axle Stress</span>
                                    <span className={isOverloaded ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
                                      {safetyPercent}% Capacity
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-destructive animate-pulse' : safetyPercent > 85 ? 'bg-warning' : 'bg-primary'}`}
                                      style={{ width: `${safetyPercent}%` }}
                                    />
                                  </div>
                                </div>

                                {isOverloaded && (
                                  <div className="flex items-center gap-0.5 text-xs font-bold text-destructive bg-destructive/10 p-1 rounded border border-destructive/25 mt-1">
                                    <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                                    <span>WARNING: EXCEEDS LEGAL LIMIT!</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Weighbridge Terminal */}
                <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
                  <div className="bg-muted px-5 py-3 border-b border-border flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Section 3 – Live Weighbridge Telemetry Panel
                    </h4>
                    
                    {/* Authorization Manual Switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manual override:</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const pass = await promptDialog("Enter Operator Manager PIN for manual write authorization:");
                          if (pass === "1234" || pass === "0000" || pass === "") {
                            setManualOverrideAllowed(!manualOverrideAllowed);
                            showToast(manualOverrideAllowed ? "Manual write disabled" : "Manual override authorized!", "info");
                          } else {
                            showToast("Incorrect override credential!", "error");
                          }
                        }}
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-widest border transition ${
                          manualOverrideAllowed 
                            ? "bg-warning/10 text-warning border-warning/40"
                            : "bg-secondary text-muted-foreground border-input"
                        }`}
                      >
                        {manualOverrideAllowed ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {manualOverrideAllowed ? "Authorized" : "Locked"}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-6">
                    {/* Simulated Scale Device controls */}
                    {!manualOverrideAllowed && (
                      <div className="bg-sidebar text-sidebar-accent-foreground rounded-lg p-4 border-2 border-sidebar-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
                      
                      {/* Left: Device Telemetry Status */}
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className={`p-2 rounded-md ${scaleConnected ? 'bg-sidebar-accent/60' : 'bg-destructive/20'}`}>
                          {scaleConnected ? (
                            <Wifi className="h-6 w-6 text-sidebar-primary animate-pulse" />
                          ) : (
                            <WifiOff className="h-6 w-6 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-white">Scale Unit B1</span>
                            <span className={`inline-flex items-center rounded-sm px-1.5 py-0.2 text-xs font-bold uppercase tracking-widest ${
                              scaleStable ? "bg-success/20 text-success border border-success/30" : "bg-warning/20 text-warning border border-warning/30"
                            }`}>
                              {scaleStable ? "STABLE" : "UNSTABLE"}
                            </span>
                          </div>
                          <p className="text-xs text-sidebar-foreground/70 mt-0.5">Hardware: Rinstrum R420 Series • 0.00t Calibrated</p>
                        </div>
                      </div>

                      {/* Center: Interactive simulated scale display */}
                      <div className="bg-foreground font-mono text-center rounded-md border border-sidebar-border px-6 py-2.5 min-w-[180px] shadow-lg">
                        <div className="text-3xl font-bold tracking-widest text-sidebar-primary glow-accent select-none">
                          {scaleConnected ? liveScaleWeight.toFixed(2) : "-------"} <span className="text-sm font-semibold">t</span>
                        </div>
                        <div className="text-xs text-sidebar-foreground/60 uppercase tracking-widest font-bold pt-1">
                          Live Active Sensor Reading
                        </div>
                      </div>

                      {/* Right: Controller to modify simulated weight */}
                      <div className="flex flex-col gap-1.5 w-full md:w-auto">
                        <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wider font-bold">Weighbridge Simulator Controls:</span>
                        <div className="flex items-center gap-2">
                          <Slider
                            min={5}
                            max={60}
                            step={0.05}
                            value={[liveScaleWeight]}
                            onValueChange={([v]) => setLiveScaleWeight(v)}
                            className="w-24 md:w-32"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={liveScaleWeight}
                            onChange={(e) => setLiveScaleWeight(parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 bg-sidebar-accent border border-sidebar-border text-white rounded text-center text-xs font-mono font-bold focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setScaleStable(!scaleStable)}
                            className={`flex-1 text-xs font-bold rounded uppercase py-1 px-1.5 border transition ${
                              scaleStable ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border' : 'bg-warning text-white border-warning'
                            }`}
                          >
                            Toggle Stability
                          </button>
                          <button
                            type="button"
                            onClick={() => setScaleConnected(!scaleConnected)}
                            className={`flex-1 text-xs font-bold rounded uppercase py-1 px-1.5 border transition ${
                              scaleConnected ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border' : 'bg-destructive text-white border-destructive'
                            }`}
                          >
                            Toggle Offline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                    {/* Weight Inputs Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Gross Weight Field */}
                      <div className="bg-muted border border-border rounded-lg p-5 space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Gross Weight (Entering)</label>
                          <span className="text-xs text-sidebar-foreground/70 font-bold">Manual Entry Default</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={grossWeightInput}
                              disabled={false}
                              onChange={(e) => setGrossWeightInput(e.target.value)}
                              className="w-full h-12 bg-card border border-border rounded-md pl-4 pr-10 font-mono font-bold text-lg text-foreground focus:outline-none"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-bold text-muted-foreground">t</span>
                          </div>
                        </div>
                        
                        {validationErrors.gross && (
                          <p className="text-xs text-destructive font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {validationErrors.gross}
                          </p>
                        )}
                        {validationErrors.grossOver && (
                          <p className="text-xs text-warning font-bold flex items-center gap-1 bg-warning/10 border border-warning/30 p-1 rounded">
                            <AlertCircle className="h-3 w-3 shrink-0" /> {validationErrors.grossOver}
                          </p>
                        )}
                      </div>

                      {/* Tare Weight Field */}
                      <div className="bg-muted border border-border rounded-lg p-5 space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Tare Weight (Empty Vehicle)</label>
                          <span className="text-xs text-muted-foreground font-bold">Manual Entry Default</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={tareWeightInput}
                              disabled={false}
                              onChange={(e) => setTareWeightInput(e.target.value)}
                              className="w-full h-12 bg-card border border-border rounded-md pl-4 pr-10 font-mono font-bold text-lg text-foreground focus:outline-none"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-bold text-muted-foreground">t</span>
                          </div>
                        </div>

                        {validationErrors.tare && (
                          <p className="text-xs text-destructive font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {validationErrors.tare}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Operational comments / dispatch messages */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Weighbridge Dispatch Comments & Operator Remarks</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add site safety notes, custom billing comments, or delivery instructions..."
                        className="w-full min-h-[70px] border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
                      />
                    </div>

                  </div>
                </div>

              {/* Section 4: Live Transaction Summary, Checkout & Limits (Wide bottom panel) */}
              <div className="bg-sidebar text-white border border-sidebar-border rounded-lg shadow-lg overflow-hidden mt-10">
                <div className="bg-sidebar px-6 py-4 border-b border-sidebar-border flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sidebar-accent-foreground uppercase tracking-widest flex items-center gap-2.5">
                    <Calculator className="h-5 w-5 text-sidebar-primary" />
                    Section 4 – Live Transaction Summary, Checkout & Limits
                  </h4>
                  <span className="text-xs text-sidebar-foreground/70 font-bold uppercase tracking-widest">Calculated Live • GST (10%) Aligned</span>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Column 1: Digital Weight Indicators */}
                  <div className="bg-sidebar-accent/40 rounded-lg p-6 border border-sidebar-border flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-xs font-bold text-sidebar-foreground/70 uppercase tracking-widest block border-b border-sidebar-border pb-2">
                        Digital Weight Summary
                      </span>
                      
                      <div className="space-y-3 pt-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-sidebar-foreground/70 font-medium">Gross Weight:</span>
                          <span className="font-mono font-bold text-sidebar-accent-foreground">{grossW.toFixed(2)} t</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-sidebar-foreground/70 font-medium">Tare Weight:</span>
                          <span className="font-mono text-sidebar-foreground/60">-{tareW.toFixed(2)} t</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-sidebar-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-sidebar-accent-foreground">Calculated Net:</span>
                        <span className="font-mono font-bold text-sidebar-primary text-2xl glow-accent">{netW.toFixed(2)} t</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Invoice Pricing Details */}
                  {selectedTxType === "Account" ? (
                    <div className="bg-sidebar-accent/40 rounded-lg p-6 border border-sidebar-border flex flex-col justify-between space-y-4 animate-fade-in">
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-sidebar-primary uppercase tracking-widest block border-b border-sidebar-border pb-2">
                          Digital Paid Summary
                        </span>

                        <div className="bg-sidebar-accent/60 rounded-lg p-3 border border-sidebar-border text-sidebar-primary space-y-1.5">
                          <p className="font-bold text-xs text-sidebar-primary uppercase tracking-wider">Digital Ledger Settlement</p>
                          <p className="text-xs text-sidebar-accent-foreground leading-normal font-medium">
                            This docket is billed directly to the customer's commercial credit ledger account. Site clearance authorized without physical cash or card payment.
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs pt-1">
                          <div className="flex justify-between">
                            <span className="text-sidebar-foreground/70">Account Status:</span>
                            <span className="font-bold text-success uppercase text-xs">Verified Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sidebar-foreground/70">Ledger Route:</span>
                            <span className="font-bold text-sidebar-primary uppercase text-xs">Commercial Credit</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sidebar-foreground/70">Billing Mode:</span>
                            <span className="font-bold text-sidebar-accent-foreground uppercase text-xs">Digital Ledger</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-sidebar-border pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white uppercase">Checkout Mode:</span>
                          <span className="font-mono font-bold text-sidebar-primary text-sm uppercase">Digital Ledger</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-sidebar-accent/40 rounded-lg p-6 border border-sidebar-border flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-sidebar-foreground/70 uppercase tracking-widest block border-b border-sidebar-border pb-2">
                          Costing Breakdown
                        </span>

                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-sidebar-foreground/70">Material Price:</span>
                          <span className="font-mono font-bold text-sidebar-accent-foreground">
                            {productPricePerTonne > 0 ? `$${productPricePerTonne.toFixed(2)}/t` : "No Pricing"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-sidebar-foreground/70">Material Subtotal:</span>
                          <span className="font-mono text-sidebar-accent-foreground">${productPriceTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-sidebar-foreground/70">Cartage Freight:</span>
                          <span className="font-mono text-sidebar-accent-foreground">
                            ${cartageTotal.toFixed(2)} {selectedCarterObj ? `($${cartageRate.toFixed(2)}/t)` : ""}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-sidebar-foreground/70">GST (10%):</span>
                          <span className="font-mono text-sidebar-accent-foreground">${gst.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="border-t border-sidebar-border pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white uppercase">Total Invoice:</span>
                          <span className="font-mono font-bold text-success text-xl">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Column 3: Checkout Controls & Quantity Limits */}
                  <div className="bg-sidebar-accent/40 rounded-lg p-6 border border-sidebar-border flex flex-col justify-between space-y-4">
                    {/* Cash Checkout Mode or Account Balance check */}
                    <div className="space-y-3">
                      {selectedTxType === "Cash" ? (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-sidebar-primary uppercase tracking-widest block border-b border-sidebar-border pb-2">
                            Required Cash Checkout
                          </span>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-sidebar-accent-foreground uppercase">Payment Method</label>
                            <SelectBox
                              value={paymentType}
                              onChange={(e: any) => setPaymentType(e.target.value)}
                              className="w-full h-11 border border-sidebar-border rounded-md px-3 text-xs bg-sidebar text-sidebar-accent-foreground focus:outline-none focus:border-warning font-bold"
                            >
                              <option value="Cash">Cash Currency</option>
                              <option value="EFTPOS">EFTPOS Card swipe</option>
                              <option value="Credit Card">Credit Card terminal</option>
                              <option value="Bank Transfer">Bank Transfer (EFT)</option>
                            </SelectBox>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 animate-fade-in">
                          <span className="text-xs font-bold text-sidebar-primary uppercase tracking-widest block border-b border-sidebar-border pb-2">
                            Account Contract Verification
                          </span>
                          <div className="flex justify-between text-xs pt-1">
                            <span className="text-sidebar-foreground/70">Contract Code:</span>
                            <span className="font-mono font-bold text-sidebar-accent-foreground">{selectedJobObj ? selectedJobObj.id : "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-sidebar-foreground/70">Pricing Mode:</span>
                            <span className="font-bold text-sidebar-primary text-xs uppercase">
                              Contract Rate
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-sidebar-foreground/70">Ledger Status:</span>
                            <span className="font-bold text-success text-xs uppercase">
                              Pre-Approved
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Depot Allocation Tracking */}
                    <div className="border-t border-sidebar-border pt-3 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-sidebar-foreground/70">Job Order Allocation Remaining:</span>
                          <span className="font-mono font-bold text-sidebar-accent-foreground">{selectedJobObj ? `${jobRemainingQty} t` : "N/A"}</span>
                        </div>
                      </div>

                      {validationErrors.jobQty && (
                        <div className="text-xs text-destructive font-bold bg-destructive/20 p-1.5 rounded border border-destructive/40 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>Over Order limit</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and summary notes */}
              <div className="border-t border-border pt-8 text-xs text-sidebar-foreground/70 space-y-1 text-center mt-8">
                <p>Weighbridge scale status verified active.</p>
                <p>Calculations align with GST tax schedules (ATO standard 10%).</p>
              </div>

            </div>
          </div>
        )}

        {/* SCREEN 3: Success and Docket Printout screen */}
        {screenMode === "success" && lastSavedTx && (
          <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-xl mx-auto w-full text-center">
            <div className="bg-success/10 rounded-full p-6 text-success border border-success/25 mb-6">
              <Check className="h-12 w-12" />
            </div>

            <h2 className="text-3xl font-bold text-foreground tracking-tight">Transaction Created Successfully!</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Weighbridge transaction ticket registered in database and synced to Admin Panel.
            </p>

            {/* Quick summary receipt box */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm w-full mt-8 text-left space-y-4">
              <div className="flex justify-between border-b border-border pb-2.5">
                <span className="text-xs text-muted-foreground uppercase font-bold">Docket Details</span>
                <span className="text-xs font-bold text-foreground">{lastSavedTx.ticketNo}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-bold text-foreground">{lastSavedTx.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vehicle Plate:</span>
                  <p className="font-bold text-foreground">{lastSavedTx.vehicleReg}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Product Load:</span>
                  <p className="font-bold text-foreground">{lastSavedTx.productName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Weight:</span>
                  <p className="font-bold text-foreground">{lastSavedTx.netWeight.toFixed(2)} t</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Lot Number:</span>
                  <p className="font-mono font-bold text-foreground">{lastSavedTx.lotNo || "N/A"}</p>
                </div>
                {lastSavedTx.type !== "Account" ? (
                  <div>
                    <span className="text-muted-foreground">Invoice Amount:</span>
                    <p className="font-mono font-bold text-info text-sm">${totalAmount.toFixed(2)}</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-muted-foreground">Invoice Status:</span>
                    <p className="font-semibold text-info">Billed Later</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Operator:</span>
                  <p className="font-semibold text-foreground">{lastSavedTx.operatorId}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-10">
              <button
                onClick={handlePrintMock}
                className="flex-1 flex items-center justify-center gap-2 bg-sidebar hover:bg-sidebar-accent text-white font-bold h-12 rounded-lg text-sm transition select-none cursor-pointer shadow-sm"
              >
                <Printer className="h-5 w-5" />
                <span>Print Paper Docket</span>
              </button>

              <button
                onClick={() => {
                  handleResetForm();
                  setLastSavedTx(null);
                  navigateClerk("home");
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg text-sm transition select-none cursor-pointer shadow-sm"
              >
                <Play className="h-5 w-5" />
                <span>Next Vehicle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTION BAR (STICKY) */}
      {screenMode === "transaction" && (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-sidebar border-t border-sidebar-border px-6 flex items-center justify-between z-30 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (await confirmDialog("Reset current weigh transaction entries? All changes will be wiped.")) {
                  handleResetForm();
                }
              }}
              className="flex items-center gap-1.5 border border-sidebar-border hover:border-border text-sidebar-accent-foreground font-bold px-4 h-11 rounded-md text-xs uppercase tracking-wider transition cursor-pointer select-none"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset Fields</span>
            </button>

            <button
              onClick={async () => {
                if (await confirmDialog("Are you sure you want to cancel?")) {
                  handleResetForm();
                  navigateClerk("home");
                }
              }}
              className="flex items-center gap-1.5 border border-sidebar-border hover:border-border text-sidebar-accent-foreground font-bold px-4 h-11 rounded-md text-xs uppercase tracking-wider transition cursor-pointer select-none"
            >
              <X className="h-4 w-4" />
              <span>Cancel Entry</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Draft */}
            <button
              onClick={() => handleCompleteTransaction(TransactionStatus.PENDING)}
              className="flex items-center gap-1.5 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border border-sidebar-border font-bold px-5 h-11 rounded-md text-xs uppercase tracking-wider transition cursor-pointer select-none"
            >
              <Save className="h-4 w-4 text-sidebar-foreground/70" />
              <span>Save as Draft / Pending</span>
            </button>

            {/* Complete Transaction */}
            <button
              onClick={() => handleCompleteTransaction(TransactionStatus.APPROVED)}
              disabled={!isFormValid}
              className={`flex items-center gap-2 font-bold px-6 h-12 rounded-lg text-xs uppercase tracking-wider transition select-none cursor-pointer shadow-lg ${
                isFormValid 
                  ? "bg-primary hover:bg-primary/90 text-white" 
                  : "bg-sidebar-accent text-sidebar-foreground/60 border border-sidebar-border cursor-not-allowed"
              }`}
            >
              <Check className="h-4.5 w-4.5" />
              <span>Complete Transaction & Print</span>
            </button>
          </div>
        </footer>
      )}

      {/* QUICK ADD / QUICK EDIT DRAWER/MODAL POPUP */}
      {activeQuickAdd && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-lg shadow-lg border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-sidebar text-white px-5 py-4 flex items-center justify-between border-b border-sidebar-border">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-5 w-5 text-sidebar-primary" />
                Quick-Add New {activeQuickAdd}
              </span>
              <button onClick={resetQuickAddFields} className="text-sidebar-foreground/70 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAdd} className="p-6 space-y-4 text-xs font-medium">
              
              {/* CUSTOMER QUICK FORM */}
              {activeQuickAdd === "customer" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Company / Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victorian Pipelaying Co."
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Payment Terms</label>
                    <SelectBox
                      value={newCustTerms}
                      onChange={(e) => setNewCustTerms(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 focus:outline-none"
                    >
                      <option value="Immediate">Immediate Cash Payment</option>
                      <option value="30 Days Net">30 Days Net Invoice</option>
                      <option value="14 Days Net">14 Days Net Invoice</option>
                    </SelectBox>
                  </div>
                </div>
              )}

              {/* JOB QUICK FORM */}
              {activeQuickAdd === "job" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Job Purchase Order Reference *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PO-ROAD-MELB-09"
                      value={newJobRef}
                      onChange={(e) => setNewJobRef(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-foreground font-bold block">Order Qty (Tonnes)</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={newJobQty}
                        onChange={(e) => setNewJobQty(e.target.value)}
                        className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-foreground font-bold block">Applied Rate ($/t)</label>
                      <input
                        type="number"
                        placeholder="45.00"
                        value={newJobRate}
                        onChange={(e) => setNewJobRate(e.target.value)}
                        className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DESTINATION QUICK FORM */}
              {activeQuickAdd === "destination" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Destination Name / Terminal *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. North Geelong Depot Gate 2"
                      value={newDestName}
                      onChange={(e) => setNewDestName(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 102 Corio Wharf Rd"
                      value={newDestAddress}
                      onChange={(e) => setNewDestAddress(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-ring"
                    />
                  </div>
                </div>
              )}

              {/* CONTACT QUICK FORM */}
              {activeQuickAdd === "contact" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Supervisor Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Hasselhoff"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Mobile Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 0411 999 000"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:border-ring"
                    />
                  </div>
                </div>
              )}

              {/* PRODUCT LOT QUICK FORM */}
              {activeQuickAdd === "lot" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Product Allocation Lot Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lot G-991 Quarry"
                      value={newLotName}
                      onChange={(e) => setNewLotName(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Total Lot Quantity (t)</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={newLotQty}
                      onChange={(e) => setNewLotQty(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* CARTER QUICK FORM */}
              {activeQuickAdd === "carter" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Carter Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toll Freight Express"
                      value={newCarterName}
                      onChange={(e) => setNewCarterName(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Default Cartage Rate ($ per Tonne)</label>
                    <input
                      type="number"
                      placeholder="12.50"
                      value={newCarterRate}
                      onChange={(e) => setNewCarterRate(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* DRIVER QUICK FORM */}
              {activeQuickAdd === "driver" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Driver Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arthur Pendragon"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Truck Driver License No.</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-40091"
                      value={newDriverLicense}
                      onChange={(e) => setNewDriverLicense(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* VEHICLE QUICK FORM */}
              {activeQuickAdd === "vehicle" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Registration Plate Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MELB-882-TR"
                      value={newVehiclePlate}
                      onChange={(e) => setNewVehiclePlate(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-foreground font-bold block">Tare Weight (t)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="14.50"
                        value={newVehicleTare}
                        onChange={(e) => setNewVehicleTare(e.target.value)}
                        className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-foreground font-bold block">Max Gross Weight (t)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="42.50"
                        value={newVehicleMax}
                        onChange={(e) => setNewVehicleMax(e.target.value)}
                        className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground font-bold block">Vehicle Type Classification</label>
                    <SelectBox
                      value={newVehicleCategory}
                      onChange={(e: any) => setNewVehicleCategory(e.target.value)}
                      className="w-full h-10 border border-border rounded-md px-3 focus:outline-none"
                    >
                      <option value="Standard">Standard (Single Semi/Rigid)</option>
                      <option value="Multiaxel">Multiaxel Setup (Multi-trailer / Quad-dog)</option>
                    </SelectBox>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={resetQuickAddFields}
                  className="flex-1 bg-muted hover:bg-input text-foreground font-bold h-11 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-lg transition"
                >
                  Create & Select
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
