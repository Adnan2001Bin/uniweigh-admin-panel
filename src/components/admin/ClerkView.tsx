import React from "react";
import { ArrowLeft, Info } from "lucide-react";
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
  DocketConfig
} from "../../types";
import { useClerkTransaction } from "./clerk/hooks/useClerkTransaction";
import HomeScreen from "./clerk/screens/HomeScreen";
import TransactionForm from "./clerk/screens/TransactionForm";
import SuccessScreen from "./clerk/screens/SuccessScreen";
import StickyFooter from "./clerk/components/StickyFooter";
import QuickAddModal from "./clerk/components/QuickAddModal";

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
}

export default function ClerkView(props: ClerkViewProps) {
  const ctx = useClerkTransaction(props);
  const { adminUser, onExit } = props;
  const { toast, screenMode, setScreenMode, setSelectedTxType, lastFiveTxs, lastSavedTx, totalAmount, handleResetForm, handleCompleteTransaction, handlePrintTransaction, handlePrintMock, resetQuickAddFields, handleSaveQuickAdd } = ctx;

  return (
    <div className="min-h-screen w-full bg-[#fafafa] text-gray-900 font-sans antialiased flex flex-col relative">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm">
            U
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-gray-900">
              Clerk Terminal
            </h1>
            <p className="text-xs text-gray-500">
              Melbourne Eastern Quarry · Scale B1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-600">Scale online</span>
          </div>

          <div className="hidden h-8 w-px bg-gray-100 sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
              <p className="text-[11px] text-gray-400">{adminUser.role}</p>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer select-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Admin panel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Toast Notifications */}
        {toast && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-xl font-bold text-sm border flex items-center gap-2.5 transition-all animate-bounce ${
            toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
            toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
            "bg-blue-50 text-blue-800 border-blue-200"
          }`}>
            <Info className="h-4.5 w-4.5" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* SCREEN 1: Home Action Card Selection */}
        {screenMode === "home" && (
          <HomeScreen
            adminUser={adminUser}
            onExit={onExit}
            onSelectAccount={() => {
              setSelectedTxType("Account");
              setScreenMode("transaction");
            }}
            onSelectCash={() => {
              setSelectedTxType("Cash");
              setScreenMode("transaction");
            }}
            recentTransactions={lastFiveTxs}
            onPrintTransaction={handlePrintTransaction}
          />
        )}

        {/* SCREEN 2: Progressive Transaction Workspace */}
        {screenMode === "transaction" && (
          <TransactionForm
            ctx={ctx}
            onBackToHome={() => setScreenMode("home")}
          />
        )}

        {/* SCREEN 3: Success and Docket Printout screen */}
        {screenMode === "success" && lastSavedTx && (
          <SuccessScreen
            transaction={lastSavedTx}
            totalAmount={totalAmount}
            onPrint={handlePrintMock}
            onNext={() => {
              handleResetForm();
              setScreenMode("home");
            }}
          />
        )}
      </div>

      {/* FOOTER ACTION BAR (STICKY) */}
      {screenMode === "transaction" && (
        <StickyFooter
          isFormValid={ctx.isFormValid}
          onResetForm={() => {
            if (confirm("Reset current weigh transaction entries? All changes will be wiped.")) {
              handleResetForm();
            }
          }}
          onCancel={() => {
            if (confirm("Are you sure you want to cancel?")) {
              handleResetForm();
              setScreenMode("home");
            }
          }}
          onSaveDraft={() => handleCompleteTransaction(TransactionStatus.PENDING)}
          onComplete={() => handleCompleteTransaction(TransactionStatus.APPROVED)}
        />
      )}

      {/* QUICK ADD / QUICK EDIT DRAWER/MODAL POPUP */}
      <QuickAddModal
        activeQuickAdd={ctx.activeQuickAdd}
        onCancel={resetQuickAddFields}
        onSubmit={handleSaveQuickAdd}
        newCustName={ctx.newCustName}
        setNewCustName={ctx.setNewCustName}
        newCustTerms={ctx.newCustTerms}
        setNewCustTerms={ctx.setNewCustTerms}
        newJobRef={ctx.newJobRef}
        setNewJobRef={ctx.setNewJobRef}
        newJobQty={ctx.newJobQty}
        setNewJobQty={ctx.setNewJobQty}
        newJobRate={ctx.newJobRate}
        setNewJobRate={ctx.setNewJobRate}
        newDestName={ctx.newDestName}
        setNewDestName={ctx.setNewDestName}
        newDestAddress={ctx.newDestAddress}
        setNewDestAddress={ctx.setNewDestAddress}
        newContactName={ctx.newContactName}
        setNewContactName={ctx.setNewContactName}
        newContactPhone={ctx.newContactPhone}
        setNewContactPhone={ctx.setNewContactPhone}
        newLotName={ctx.newLotName}
        setNewLotName={ctx.setNewLotName}
        newLotQty={ctx.newLotQty}
        setNewLotQty={ctx.setNewLotQty}
        newCarterName={ctx.newCarterName}
        setNewCarterName={ctx.setNewCarterName}
        newCarterRate={ctx.newCarterRate}
        setNewCarterRate={ctx.setNewCarterRate}
        newDriverName={ctx.newDriverName}
        setNewDriverName={ctx.setNewDriverName}
        newDriverLicense={ctx.newDriverLicense}
        setNewDriverLicense={ctx.setNewDriverLicense}
        newVehiclePlate={ctx.newVehiclePlate}
        setNewVehiclePlate={ctx.setNewVehiclePlate}
        newVehicleTare={ctx.newVehicleTare}
        setNewVehicleTare={ctx.setNewVehicleTare}
        newVehicleMax={ctx.newVehicleMax}
        setNewVehicleMax={ctx.setNewVehicleMax}
        newVehicleCategory={ctx.newVehicleCategory}
        setNewVehicleCategory={ctx.setNewVehicleCategory}
      />
    </div>
  );
}
