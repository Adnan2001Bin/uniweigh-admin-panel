import React, { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Coins,
  Briefcase,
  Plus,
  AlertCircle,
  Info,
  Truck,
  Layers,
  RefreshCw,
  Shield,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Calculator,
  X
} from "lucide-react";
import { ClerkTransactionContextValue } from "../hooks/useClerkTransaction";

const sectionAccents = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
} as const;

type SectionAccent = keyof typeof sectionAccents;

function SectionHeader({
  icon: Icon,
  accent,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  accent: SectionAccent;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${sectionAccents[accent]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function QuickAddButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-50 text-gray-400 ring-1 ring-gray-100 transition-colors hover:bg-blue-50 hover:text-blue-600 hover:ring-blue-100"
      title={title}
    >
      <Plus className="h-3.5 w-3.5" />
    </button>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

const selectClass =
  "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

interface TransactionFormProps {
  ctx: ClerkTransactionContextValue;
  onBackToHome: () => void;
}

export default function TransactionForm({ ctx, onBackToHome }: TransactionFormProps) {
  const {
    selectedTxType,
    customerId, setCustomerId,
    jobId, setJobId,
    destinationId, setDestinationId,
    contactId, setContactId,
    productId, setProductId,
    lotId, setLotId,
    carterId, setCarterId,
    driverId, setDriverId,
    vehiclePlate, setVehiclePlate,
    transportMode, setTransportMode,
    grossWeightInput, setGrossWeightInput,
    tareWeightInput, setTareWeightInput,
    comments, setComments,
    paymentType, setPaymentType,
    scaleConnected, setScaleConnected,
    scaleStable, setScaleStable,
    liveScaleWeight, setLiveScaleWeight,
    manualOverrideAllowed, setManualOverrideAllowed,
    axleWeights,
    handleUpdateAxleWeight,
    handleCaptureAxleWeight,
    customers,
    filteredJobs,
    filteredDestinations,
    filteredContacts,
    filteredLots,
    products,
    carriers,
    filteredDrivers,
    filteredVehicles,
    selectedJobObj,
    selectedVehicleObj,
    selectedCarterObj,
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
    validationErrors,
    setActiveQuickAdd,
    showToast
  } = ctx;

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePin, setOverridePin] = useState("");

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overridePin === "1234" || overridePin === "0000") {
      setManualOverrideAllowed(!manualOverrideAllowed);
      showToast(
        manualOverrideAllowed ? "Manual write disabled" : "Manual override authorized!",
        "info"
      );
      setOverridePin("");
      setShowOverrideModal(false);
    } else {
      showToast("Incorrect override credential!", "error");
    }
  };

  const closeOverrideModal = () => {
    setOverridePin("");
    setShowOverrideModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafa] px-5 py-4 pb-32 md:py-5 w-full">
      <div className="w-full space-y-6">

        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to cancel this entry? All unsaved inputs will be lost.")) {
                ctx.handleResetForm();
                onBackToHome();
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to selection</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Current stream</span>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${
              selectedTxType === "Account"
                ? "bg-blue-50 text-blue-700 ring-blue-100"
                : "bg-amber-50 text-amber-700 ring-amber-100"
            }`}>
              {selectedTxType === "Account" ? <ClipboardList className="h-3.5 w-3.5" /> : <Coins className="h-3.5 w-3.5" />}
              {selectedTxType} billing
            </span>
          </div>
        </div>

        {/* Section 1: Job Information */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <SectionHeader
            icon={Briefcase}
            accent="blue"
            title="Job & order specifications"
            subtitle="Progressive match enabled"
          />

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            {/* Customer Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Customer <span className="text-red-500">*</span></label>
                <QuickAddButton onClick={() => setActiveQuickAdd("customer")} title="Quick Add Customer" />
              </div>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setJobId("");
                  setDestinationId("");
                  setContactId("");
                }}
                className={selectClass}
              >
                <option value="">-- Select Site Customer Account --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) {c.status === "Suspended" ? "⚠️ SUSPENDED" : ""}
                  </option>
                ))}
              </select>
              {validationErrors.customer && <FieldError message={validationErrors.customer} />}
            </div>

            {/* Job / Order Reference */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Job contract / order ref <span className="text-red-500">*</span></label>
                <QuickAddButton
                  onClick={() => {
                    if (!customerId) {
                      showToast("Please select a customer first", "error");
                      return;
                    }
                    setActiveQuickAdd("job");
                  }}
                  title="Quick Add Job"
                />
              </div>
              <select
                value={jobId}
                disabled={!customerId}
                onChange={(e) => {
                  setJobId(e.target.value);
                  setDestinationId("");
                }}
                className={selectClass}
              >
                <option value="">-- {customerId ? "Select Active Job Contract" : "Select Customer Account First" } --</option>
                {filteredJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.customerOrderRef} • {j.productName} ({j.pricingType})
                  </option>
                ))}
              </select>
              {validationErrors.job && <FieldError message={validationErrors.job} />}
            </div>

            {/* Destination Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Destination site</label>
                <QuickAddButton
                  onClick={() => {
                    if (!customerId) {
                      showToast("Please select a customer first", "error");
                      return;
                    }
                    setActiveQuickAdd("destination");
                  }}
                  title="Quick Add Destination"
                />
              </div>
              <select
                value={destinationId}
                disabled={!customerId}
                onChange={(e) => setDestinationId(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Select Project Site Destination --</option>
                {filteredDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.suburb})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Contact */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Site contact</label>
                <QuickAddButton
                  onClick={() => {
                    if (!customerId) {
                      showToast("Please select a customer first", "error");
                      return;
                    }
                    setActiveQuickAdd("contact");
                  }}
                  title="Quick Add Contact"
                />
              </div>
              <select
                value={contactId}
                disabled={!customerId}
                onChange={(e) => setContactId(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Select Inducted Supervisor --</option>
                {filteredContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Product / material loaded <span className="text-red-500">*</span></label>
              <select
                value={productId}
                disabled={!!jobId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setLotId("");
                }}
                className={selectClass}
              >
                <option value="">-- Inherits from selected Job --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {productId && (
                <p className="flex items-center gap-1 text-xs text-blue-600">
                  <Info className="h-3.5 w-3.5" /> Inherited from selected job — cannot be overridden.
                </p>
              )}
            </div>

            {/* Product Lot */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Product allocation lot <span className="text-red-500">*</span></label>
                <QuickAddButton
                  onClick={() => {
                    if (!productId) {
                      showToast("Please select a product/job first", "error");
                      return;
                    }
                    setActiveQuickAdd("lot");
                  }}
                  title="Quick Add Product Lot"
                />
              </div>
              <select
                value={lotId}
                disabled={!productId}
                onChange={(e) => setLotId(e.target.value)}
                className={selectClass}
              >
                <option value="">-- {productId ? "Select Certified Product Lot" : "Select Product First" } --</option>
                {filteredLots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} (Max Order: {lot.orderQuantity}t)
                  </option>
                ))}
              </select>
              {validationErrors.lot && <FieldError message={validationErrors.lot} />}
            </div>
          </div>
        </div>

        {/* Section 2: Transport Information */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <SectionHeader
            icon={Truck}
            accent="violet"
            title="Transit & transport configuration"
          />

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            {/* Carter Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Transit carter company <span className="text-red-500">*</span></label>
                <QuickAddButton onClick={() => setActiveQuickAdd("carter")} title="Quick Add Carter" />
              </div>
              <select
                value={carterId}
                onChange={(e) => {
                  setCarterId(e.target.value);
                  setDriverId("");
                  setVehiclePlate("");
                }}
                className={selectClass}
              >
                <option value="">-- Select Registered Hauler --</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {validationErrors.carter && <FieldError message={validationErrors.carter} />}
            </div>

            {/* Driver Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Driver operator <span className="text-red-500">*</span></label>
                <QuickAddButton
                  onClick={() => {
                    if (!carterId) {
                      showToast("Please select a Carter company first", "error");
                      return;
                    }
                    setActiveQuickAdd("driver");
                  }}
                  title="Quick Add Driver"
                />
              </div>
              <select
                value={driverId}
                disabled={!carterId}
                onChange={(e) => setDriverId(e.target.value)}
                className={selectClass}
              >
                <option value="">-- {carterId ? "Select Inducted Driver" : "Select Carter Company First"} --</option>
                {filteredDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Lic: {d.licenseNumber})
                  </option>
                ))}
              </select>
              {validationErrors.driver && <FieldError message={validationErrors.driver} />}
            </div>

            {/* Vehicle Plate Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Vehicle registration plate <span className="text-red-500">*</span></label>
                <QuickAddButton
                  onClick={() => {
                    if (!carterId) {
                      showToast("Please select a Carter company first", "error");
                      return;
                    }
                    setActiveQuickAdd("vehicle");
                  }}
                  title="Quick Add Vehicle"
                />
              </div>
              <select
                value={vehiclePlate}
                disabled={!carterId}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className={selectClass}
              >
                <option value="">-- {carterId ? "Select Approved Plate" : "Select Carter Company First"} --</option>
                {filteredVehicles.map((v) => (
                  <option key={v.plateNumber} value={v.plateNumber}>
                    {v.plateNumber} ({v.vehicleType} • Tare: {v.tareWeight}t)
                  </option>
                ))}
              </select>
              {validationErrors.vehicle && <FieldError message={validationErrors.vehicle} />}
            </div>

            {/* Mode of Transport Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Transit mode</label>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="transportMode"
                    checked={transportMode === "Standard"}
                    onChange={() => setTransportMode("Standard")}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>Standard carriage</span>
                </label>
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="transportMode"
                    checked={transportMode === "Multiaxel"}
                    onChange={() => setTransportMode("Multiaxel")}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>Multiaxel heavy setup</span>
                </label>
              </div>
            </div>
          </div>

          {transportMode === "Multiaxel" && axleWeights && axleWeights.length > 0 && (
            <div className="mx-5 mb-5 space-y-4 rounded-xl border border-violet-100 bg-violet-50/40 p-5">
              <div className="flex flex-col items-start justify-between gap-2 border-b border-violet-100 pb-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 ring-1 ring-violet-200">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Multi-axle weight terminal</span>
                    <p className="text-xs text-gray-500">Weigh each axle group individually. Gross and tare sum automatically.</p>
                  </div>
                </div>
                <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-700 ring-1 ring-violet-200">
                  Axle balance active
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
                    <div key={set.axleSetNumber} className={`space-y-3 rounded-xl border bg-white p-4 shadow-xs transition-all ${
                      isOverloaded ? "border-red-200 ring-1 ring-red-100" : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-medium text-gray-800">
                          {idx === 0 ? "Steer axle" : idx === 1 ? "Drive axle" : `Trailer axle set #${set.axleSetNumber - 2}`}
                        </span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          isOverloaded ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-gray-50 text-gray-600 ring-1 ring-gray-100"
                        }`}>
                          Max {set.weightMax}t
                        </span>
                      </div>

                      {/* Interactive Individual Axle Inputs */}
                      <div className="space-y-2">
                        {/* Gross Input */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-medium">
                            <span className="text-gray-500">Gross weight</span>
                            <button
                              type="button"
                              onClick={() => handleCaptureAxleWeight(set.axleSetNumber, "gross")}
                              className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700"
                              title="Capture scale reading into this axle group"
                            >
                              <RefreshCw className="h-2.5 w-2.5" /> Capture
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={set.gross}
                              onChange={(e) => handleUpdateAxleWeight(set.axleSetNumber, "gross", e.target.value)}
                              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-2.5 pr-6 font-mono text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">t</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-medium">
                            <span className="text-gray-500">Tare weight</span>
                            <button
                              type="button"
                              onClick={() => handleCaptureAxleWeight(set.axleSetNumber, "tare")}
                              className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700"
                              title="Capture scale reading into this axle tare"
                            >
                              <RefreshCw className="h-2.5 w-2.5" /> Capture
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={set.tare}
                              onChange={(e) => handleUpdateAxleWeight(set.axleSetNumber, "tare", e.target.value)}
                              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-2.5 pr-6 font-mono text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">t</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-gray-100 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Calculated net</span>
                          <span className="font-mono font-medium text-gray-900">{axleNet.toFixed(2)} t</span>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] font-medium">
                            <span className="text-gray-400">Axle stress</span>
                            <span className={isOverloaded ? "text-red-600" : "text-gray-500"}>
                              {safetyPercent}% capacity
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full transition-all duration-500 ${isOverloaded ? "bg-red-500" : safetyPercent > 85 ? "bg-amber-400" : "bg-blue-500"}`}
                              style={{ width: `${safetyPercent}%` }}
                            />
                          </div>
                        </div>

                        {isOverloaded && (
                          <div className="mt-1 flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 p-1.5 text-[10px] font-medium text-red-600">
                            <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                            <span>Exceeds legal limit</span>
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <SectionHeader
            icon={Shield}
            accent="emerald"
            title="Live weighbridge telemetry"
            action={
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Manual override</span>
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(true)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ring-1 transition ${
                    manualOverrideAllowed
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-gray-50 text-gray-600 ring-gray-200"
                  }`}
                >
                  {manualOverrideAllowed ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {manualOverrideAllowed ? "Authorized" : "Locked"}
                </button>
              </div>
            }
          />

          <div className="space-y-5 p-5">
            {!manualOverrideAllowed && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 md:flex-row">
                <div className="flex w-full items-center gap-3 md:w-auto">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${scaleConnected ? "bg-emerald-100 text-emerald-600 ring-emerald-200" : "bg-red-50 text-red-500 ring-red-100"}`}>
                    {scaleConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Scale unit B1</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
                        scaleStable ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"
                      }`}>
                        {scaleStable ? "Stable" : "Unstable"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">Rinstrum R420 Series · 0.00t calibrated</p>
                  </div>
                </div>

                <div className="min-w-[160px] rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center shadow-xs">
                  <div className="font-mono text-2xl font-semibold tracking-wide text-emerald-700">
                    {scaleConnected ? liveScaleWeight.toFixed(2) : "— — —"} <span className="text-sm text-gray-400">t</span>
                  </div>
                  <div className="pt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Live sensor reading
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 md:w-auto">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Simulator controls</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="0.05"
                      value={liveScaleWeight}
                      onChange={(e) => setLiveScaleWeight(parseFloat(e.target.value))}
                      className="h-1.5 w-24 rounded-lg accent-blue-600 md:w-32"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={liveScaleWeight}
                      onChange={(e) => setLiveScaleWeight(parseFloat(e.target.value) || 0)}
                      className="h-8 w-16 rounded-lg border border-gray-200 bg-white text-center font-mono text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setScaleStable(!scaleStable)}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Toggle stability
                    </button>
                    <button
                      type="button"
                      onClick={() => setScaleConnected(!scaleConnected)}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Toggle offline
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">Gross weight (entering)</label>
                  <span className="text-xs text-gray-400">Manual entry</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={grossWeightInput}
                    onChange={(e) => setGrossWeightInput(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-4 pr-10 font-mono text-lg font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">t</span>
                </div>

                {validationErrors.gross && <FieldError message={validationErrors.gross} />}
                {validationErrors.grossOver && (
                  <p className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {validationErrors.grossOver}
                  </p>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">Tare weight (empty vehicle)</label>
                  <span className="text-xs text-gray-400">Manual entry</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={tareWeightInput}
                    onChange={(e) => setTareWeightInput(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-4 pr-10 font-mono text-lg font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">t</span>
                </div>

                {validationErrors.tare && <FieldError message={validationErrors.tare} />}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Dispatch comments & remarks</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add site safety notes, billing comments, or delivery instructions..."
                className="min-h-[72px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Transaction summary — live preview panel */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20">
                <Calculator className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Transaction summary & checkout</h4>
                <p className="text-xs text-slate-400">Calculated live · GST (10%) aligned</p>
              </div>
            </div>
            <span className="hidden rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 ring-1 ring-slate-700 sm:inline">
              Live preview
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
            {/* Weight summary */}
            <div className="flex flex-col justify-between rounded-lg border border-slate-700/60 bg-slate-800/50 p-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Weight summary</p>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Gross weight</span>
                    <span className="font-mono font-medium text-slate-200">{grossW.toFixed(2)} t</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Tare weight</span>
                    <span className="font-mono text-slate-500">-{tareW.toFixed(2)} t</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-700/60 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Calculated net</span>
                  <span className="font-mono text-2xl font-semibold text-blue-400">{netW.toFixed(2)} t</span>
                </div>
              </div>
            </div>

            {/* Billing / costing */}
            {selectedTxType === "Account" ? (
              <div className="flex flex-col justify-between rounded-lg border border-blue-500/20 bg-blue-950/30 p-5">
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-blue-400">Account billing</p>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-950/40 p-3">
                    <p className="text-xs font-medium text-blue-300">Digital ledger settlement</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Billed to commercial credit ledger. Site clearance without cash or card payment.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account status</span>
                      <span className="font-medium text-emerald-400">Verified active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ledger route</span>
                      <span className="font-medium text-blue-400">Commercial credit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Billing mode</span>
                      <span className="font-medium text-slate-300">Digital ledger</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-blue-500/20 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Checkout mode</span>
                    <span className="text-sm font-semibold text-blue-400">Digital ledger</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between rounded-lg border border-amber-500/20 bg-amber-950/20 p-5">
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400">Costing breakdown</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Material price</span>
                      <span className="font-mono text-slate-200">
                        {selectedJobObj ? `$${productPricePerTonne.toFixed(2)}/t` : "No pricing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Material subtotal</span>
                      <span className="font-mono text-slate-200">${productPriceTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cartage freight</span>
                      <span className="font-mono text-slate-200">
                        ${cartageTotal.toFixed(2)} {selectedCarterObj ? `($${cartageRate.toFixed(2)}/t)` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GST (10%)</span>
                      <span className="font-mono text-slate-200">${gst.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-amber-500/20 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Total invoice</span>
                    <span className="font-mono text-2xl font-semibold text-emerald-400">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Checkout / verification */}
            <div className="flex flex-col justify-between rounded-lg border border-violet-500/20 bg-violet-950/20 p-5">
              <div className="space-y-3">
                {selectedTxType === "Cash" ? (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400">Cash checkout</p>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Payment method</label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="h-10 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="Cash">Cash currency</option>
                        <option value="EFTPOS">EFTPOS card swipe</option>
                        <option value="Credit Card">Credit card terminal</option>
                        <option value="Bank Transfer">Bank transfer (EFT)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-violet-400">Contract verification</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract code</span>
                        <span className="font-mono font-medium text-slate-200">{selectedJobObj ? selectedJobObj.id : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pricing mode</span>
                        <span className="font-medium text-blue-400">Contract rate</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ledger status</span>
                        <span className="font-medium text-emerald-400">Pre-approved</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 space-y-2 border-t border-violet-500/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Job allocation remaining</span>
                  <span className="font-mono font-medium text-slate-200">{selectedJobObj ? `${jobRemainingQty} t` : "N/A"}</span>
                </div>
                {validationErrors.jobQty && (
                  <p className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/40 p-2 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    Over order limit
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-2 text-center text-xs text-gray-400">
          <p>Weighbridge scale status verified active.</p>
          <p>Calculations align with GST tax schedules (ATO standard 10%).</p>
        </div>
      </div>

      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <Lock className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Manager authorization</h3>
                  <p className="text-xs text-gray-500">
                    {manualOverrideAllowed ? "Enter PIN to lock manual override" : "Enter PIN to authorize manual override"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeOverrideModal}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label htmlFor="override-pin" className="text-sm font-medium text-gray-700">
                  Operator manager PIN
                </label>
                <input
                  id="override-pin"
                  type="password"
                  autoFocus
                  value={overridePin}
                  onChange={(e) => setOverridePin(e.target.value)}
                  placeholder="Enter PIN"
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeOverrideModal}
                  className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {manualOverrideAllowed ? "Lock override" : "Authorize"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
