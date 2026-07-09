import React, { useState, useEffect, useMemo } from "react";
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
} from "../../../../types";
import { INITIAL_DESTINATIONS } from "../../../../data_destinations";

interface UseClerkTransactionProps {
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
  transactions?: Transaction[];
  docketConfig?: DocketConfig;
}

export interface ClerkTransactionContextValue {
  // Navigation / flow
  screenMode: "home" | "transaction" | "success";
  setScreenMode: (mode: "home" | "transaction" | "success") => void;
  selectedTxType: "Account" | "Cash";
  setSelectedTxType: (type: "Account" | "Cash") => void;

  // Toast
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;

  // Local reference data
  localDestinations: Destination[];
  localContacts: DestinationContact[];
  customers: Customer[];
  products: Product[];
  carriers: Carrier[];

  // Scale telemetry
  scaleConnected: boolean;
  setScaleConnected: (v: boolean) => void;
  scaleStable: boolean;
  setScaleStable: (v: boolean) => void;
  liveScaleWeight: number;
  setLiveScaleWeight: (v: number) => void;
  manualOverrideAllowed: boolean;
  setManualOverrideAllowed: (v: boolean) => void;

  // Axle weights
  axleWeights: { axleSetNumber: number; gross: string; tare: string; weightMax: number }[];
  setAxleWeights: React.Dispatch<React.SetStateAction<{ axleSetNumber: number; gross: string; tare: string; weightMax: number }[]>>;
  handleUpdateAxleWeight: (axleSetNum: number, field: "gross" | "tare", val: string) => void;
  handleCaptureAxleWeight: (axleSetNum: number, field: "gross" | "tare") => void;

  // Selection state
  customerId: string;
  setCustomerId: (id: string) => void;
  jobId: string;
  setJobId: (id: string) => void;
  destinationId: string;
  setDestinationId: (id: string) => void;
  contactId: string;
  setContactId: (id: string) => void;
  productId: string;
  setProductId: (id: string) => void;
  lotId: string;
  setLotId: (id: string) => void;
  carterId: string;
  setCarterId: (id: string) => void;
  driverId: string;
  setDriverId: (id: string) => void;
  vehiclePlate: string;
  setVehiclePlate: (plate: string) => void;
  transportMode: "Standard" | "Multiaxel";
  setTransportMode: (mode: "Standard" | "Multiaxel") => void;

  // Weight inputs
  grossWeightInput: string;
  setGrossWeightInput: (v: string) => void;
  tareWeightInput: string;
  setTareWeightInput: (v: string) => void;

  // Comments / payment
  comments: string;
  setComments: (v: string) => void;
  paymentType: "Cash" | "EFTPOS" | "Credit Card" | "Bank Transfer";
  setPaymentType: (v: "Cash" | "EFTPOS" | "Credit Card" | "Bank Transfer") => void;

  // Quick add
  activeQuickAdd: string | null;
  setActiveQuickAdd: (v: string | null) => void;
  resetQuickAddFields: () => void;
  handleSaveQuickAdd: (e: React.FormEvent) => void;

  // Last saved
  lastSavedTx: Transaction | null;

  // Derived data
  filteredJobs: Job[];
  selectedJobObj?: Job;
  filteredDestinations: Destination[];
  filteredContacts: DestinationContact[];
  filteredLots: ProductLot[];
  filteredDrivers: Driver[];
  filteredVehicles: Vehicle[];
  selectedVehicleObj?: Vehicle;
  selectedCarterObj?: Carrier;
  selectedLotObj?: ProductLot;
  grossW: number;
  tareW: number;
  netW: number;
  productPricePerTonne: number;
  productPriceTotal: number;
  cartageRate: number;
  cartageTotal: number;
  gst: number;
  totalAmount: number;
  jobRemainingQty: number;
  lotRemainingQty: number;
  lastFiveTxs: Transaction[];
  validationErrors: Record<string, string>;
  isFormValid: boolean;

  // Handlers
  handleCaptureGross: () => void;
  handleCaptureTare: () => void;
  handleResetForm: () => void;
  handleCompleteTransaction: (statusToSave: TransactionStatus) => void;
  handlePrintMock: () => void;
  handlePrintTransaction: (tx: Transaction) => void;

  // Quick-add form state
  newCustName: string;
  setNewCustName: (v: string) => void;
  newCustTerms: string;
  setNewCustTerms: (v: string) => void;
  newJobRef: string;
  setNewJobRef: (v: string) => void;
  newJobQty: string;
  setNewJobQty: (v: string) => void;
  newJobRate: string;
  setNewJobRate: (v: string) => void;
  newDestName: string;
  setNewDestName: (v: string) => void;
  newDestAddress: string;
  setNewDestAddress: (v: string) => void;
  newContactName: string;
  setNewContactName: (v: string) => void;
  newContactPhone: string;
  setNewContactPhone: (v: string) => void;
  newLotName: string;
  setNewLotName: (v: string) => void;
  newLotQty: string;
  setNewLotQty: (v: string) => void;
  newCarterName: string;
  setNewCarterName: (v: string) => void;
  newCarterRate: string;
  setNewCarterRate: (v: string) => void;
  newDriverName: string;
  setNewDriverName: (v: string) => void;
  newDriverLicense: string;
  setNewDriverLicense: (v: string) => void;
  newVehiclePlate: string;
  setNewVehiclePlate: (v: string) => void;
  newVehicleTare: string;
  setNewVehicleTare: (v: string) => void;
  newVehicleMax: string;
  setNewVehicleMax: (v: string) => void;
  newVehicleCategory: "Standard" | "Multiaxel";
  setNewVehicleCategory: (v: "Standard" | "Multiaxel") => void;
}

export function useClerkTransaction({
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
  transactions = [],
  docketConfig
}: UseClerkTransactionProps): ClerkTransactionContextValue {
  // --- View States ---
  const [screenMode, setScreenMode] = useState<"home" | "transaction" | "success">("home");
  const [selectedTxType, setSelectedTxType] = useState<"Account" | "Cash">("Account");

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
  const [liveScaleWeight, setLiveScaleWeight] = useState<number>(32.45);
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
  const [activeQuickAdd, setActiveQuickAdd] = useState<string | null>(null);

  // Message toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Success screen saved transaction detail placeholder
  const [lastSavedTx, setLastSavedTx] = useState<Transaction | null>(null);

  // --- Smart Workflow / Cascading Filter Logic ---
  const filteredJobs = useMemo(() => {
    if (!customerId) return [];
    return jobs.filter(j => j.customerId === customerId && j.status === "Active");
  }, [customerId, jobs]);

  const selectedJobObj = useMemo(() => {
    return jobs.find(j => j.id === jobId);
  }, [jobId, jobs]);

  useEffect(() => {
    if (selectedJobObj) {
      setProductId(selectedJobObj.productId);
      setComments(`Contract Job pricing rule applied: ${selectedJobObj.pricingType}`);
    } else {
      setProductId("");
    }
  }, [selectedJobObj]);

  const filteredDestinations = useMemo(() => {
    if (!customerId) return [];
    let dests = localDestinations.filter(d => d.customerId === customerId && d.status === "Active");
    if (jobId) {
      const jobDests = dests.filter(d => d.jobId === jobId);
      if (jobDests.length > 0) return jobDests;
    }
    return dests;
  }, [customerId, jobId, localDestinations]);

  const filteredContacts = useMemo(() => {
    if (!customerId) return [];
    return localContacts.filter(c => c.customerId === customerId && c.status === "Active");
  }, [customerId, localContacts]);

  const filteredLots = useMemo(() => {
    if (!productId) return [];
    return productLots.filter(lot => lot.productId === productId && lot.status === "Active");
  }, [productId, productLots]);

  const filteredDrivers = useMemo(() => {
    if (!carterId) return drivers;
    return drivers.filter(d => d.carrierId === carterId);
  }, [carterId, drivers]);

  const filteredVehicles = useMemo(() => {
    if (!carterId) return vehicles;
    return vehicles.filter(v => v.carrierName === carriers.find(c => c.id === carterId)?.name);
  }, [carterId, vehicles, carriers]);

  const selectedVehicleObj = useMemo(() => {
    return vehicles.find(v => v.plateNumber === vehiclePlate);
  }, [vehiclePlate, vehicles]);

  useEffect(() => {
    if (selectedVehicleObj) {
      setTransportMode(selectedVehicleObj.category === "Multiaxel" ? "Multiaxel" : "Standard");
      setTareWeightInput(selectedVehicleObj.tareWeight.toFixed(2));
    }
  }, [selectedVehicleObj]);

  useEffect(() => {
    if (transportMode === "Multiaxel" && selectedVehicleObj) {
      if (selectedVehicleObj.axleSets && selectedVehicleObj.axleSets.length > 0) {
        setAxleWeights(
          selectedVehicleObj.axleSets.map((set) => ({
            axleSetNumber: set.axleSetNumber,
            gross: (set.tareWeight + 10.0).toFixed(2),
            tare: set.tareWeight.toFixed(2),
            weightMax: set.weightMax || 15.0
          }))
        );
      } else {
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

  const productPricePerTonne = selectedJobObj ? selectedJobObj.appliedRate : 0;
  const productPriceTotal = parseFloat((netW * productPricePerTonne).toFixed(2));

  const selectedCarterObj = useMemo(() => {
    return carriers.find(c => c.id === carterId);
  }, [carterId, carriers]);

  const cartageRate = selectedCarterObj?.transportRate || 0;
  const cartageTotal = parseFloat((netW * cartageRate).toFixed(2));

  const gst = parseFloat(((productPriceTotal + cartageTotal) * 0.10).toFixed(2));
  const totalAmount = parseFloat((productPriceTotal + cartageTotal + gst).toFixed(2));

  const jobRemainingQty = useMemo(() => {
    if (!selectedJobObj) return 0;
    return Math.max(0, parseFloat((selectedJobObj.orderQty - selectedJobObj.deliveredQty - netW).toFixed(2)));
  }, [selectedJobObj, netW]);

  const selectedLotObj = useMemo(() => {
    return productLots.find(lot => lot.id === lotId);
  }, [lotId, productLots]);

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
    if (!jobId) errors.job = "Job/Order reference is required";
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
  }, [customerId, jobId, productId, lotId, vehiclePlate, driverId, carterId, grossW, tareW, netW, selectedVehicleObj, selectedJobObj]);

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
      lotNo: lotId,
      transactionCode: `C-${Math.floor(2000 + Math.random() * 7999)}`,
      accountBalance: customerObj?.accountBalance || 0
    };

    if (selectedJobObj && statusToSave === TransactionStatus.APPROVED) {
      const updatedJobObj: Job = {
        ...selectedJobObj,
        deliveredQty: parseFloat((selectedJobObj.deliveredQty + netW).toFixed(2))
      };
      onUpdateJob(updatedJobObj);
    }

    onAddTransaction(newTx);
    setLastSavedTx(newTx);
    setScreenMode("success");
    showToast(`Transaction ${statusToSave} saved successfully! Ticket code: ${ticketNumber}`);
  };

  const handlePrintTransaction = (tx: Transaction) => {
    import("../utils/printDocket").then(({ printDocket }) => {
      const success = printDocket(tx, docketConfig);
      if (!success) {
        showToast("Popup blocked! Print output sent to console.", "info");
        console.log("Mock printed docket:", tx);
      }
    });
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

  return {
    screenMode,
    setScreenMode,
    selectedTxType,
    setSelectedTxType,
    toast,
    showToast,
    localDestinations,
    localContacts,
    customers,
    products,
    carriers,
    scaleConnected,
    setScaleConnected,
    scaleStable,
    setScaleStable,
    liveScaleWeight,
    setLiveScaleWeight,
    manualOverrideAllowed,
    setManualOverrideAllowed,
    axleWeights,
    setAxleWeights,
    handleUpdateAxleWeight,
    handleCaptureAxleWeight,
    customerId,
    setCustomerId,
    jobId,
    setJobId,
    destinationId,
    setDestinationId,
    contactId,
    setContactId,
    productId,
    setProductId,
    lotId,
    setLotId,
    carterId,
    setCarterId,
    driverId,
    setDriverId,
    vehiclePlate,
    setVehiclePlate,
    transportMode,
    setTransportMode,
    grossWeightInput,
    setGrossWeightInput,
    tareWeightInput,
    setTareWeightInput,
    comments,
    setComments,
    paymentType,
    setPaymentType,
    activeQuickAdd,
    setActiveQuickAdd,
    resetQuickAddFields,
    handleSaveQuickAdd,
    lastSavedTx,
    filteredJobs,
    selectedJobObj,
    filteredDestinations,
    filteredContacts,
    filteredLots,
    filteredDrivers,
    filteredVehicles,
    selectedVehicleObj,
    selectedCarterObj,
    selectedLotObj,
    grossW,
    tareW,
    netW,
    productPricePerTonne,
    productPriceTotal,
    cartageRate,
    cartageTotal,
    gst,
    totalAmount,
    jobRemainingQty,
    lotRemainingQty,
    lastFiveTxs,
    validationErrors,
    isFormValid,
    handleCaptureGross,
    handleCaptureTare,
    handleResetForm,
    handleCompleteTransaction,
    handlePrintTransaction,
    handlePrintMock,
    newCustName,
    setNewCustName,
    newCustTerms,
    setNewCustTerms,
    newJobRef,
    setNewJobRef,
    newJobQty,
    setNewJobQty,
    newJobRate,
    setNewJobRate,
    newDestName,
    setNewDestName,
    newDestAddress,
    setNewDestAddress,
    newContactName,
    setNewContactName,
    newContactPhone,
    setNewContactPhone,
    newLotName,
    setNewLotName,
    newLotQty,
    setNewLotQty,
    newCarterName,
    setNewCarterName,
    newCarterRate,
    setNewCarterRate,
    newDriverName,
    setNewDriverName,
    newDriverLicense,
    setNewDriverLicense,
    newVehiclePlate,
    setNewVehiclePlate,
    newVehicleTare,
    setNewVehicleTare,
    newVehicleMax,
    setNewVehicleMax,
    newVehicleCategory,
    setNewVehicleCategory
  };
}
