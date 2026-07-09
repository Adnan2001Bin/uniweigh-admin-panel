import ClerkView from "./components/admin/ClerkView";
import ProductDetailStandaloneView from "./components/products/ProductDetailStandaloneView";
import AppShell from "./app/components/AppShell";
import { useAppState } from "./app/hooks/useAppState";

export default function App() {
  const state = useAppState();

  if (state.isClerkMode) {
    return (
      <ClerkView
        adminUser={state.adminUser}
        customers={state.customers}
        onUpdateCustomer={state.handleUpdateCustomer}
        jobs={state.jobs}
        onAddJob={state.handleAddJob}
        onUpdateJob={state.handleUpdateJob}
        products={state.products}
        onUpdateProduct={state.handleUpdateProduct}
        productLots={state.productLots}
        onAddProductLot={(newLot) =>
          state.setProductLots((previous) => [newLot, ...previous])
        }
        carriers={state.carriers}
        onAddCarter={(newCarrier) =>
          state.setCarriers((previous) => [...previous, newCarrier])
        }
        drivers={state.drivers}
        onAddDriver={(newDriver) =>
          state.setDrivers((previous) => [...previous, newDriver])
        }
        vehicles={state.vehicles}
        onAddVehicle={(newVehicle) =>
          state.setVehicles((previous) => [...previous, newVehicle])
        }
        onAddTransaction={(newTransaction) =>
          state.setTransactions((previous) => [newTransaction, ...previous])
        }
        onExit={() => state.setIsClerkMode(false)}
        transactions={state.transactions}
        docketConfig={state.docketConfig}
      />
    );
  }

  if (state.activeView === "product-details-standalone") {
    return (
      <ProductDetailStandaloneView
        products={state.products}
        onUpdateProduct={state.handleUpdateProduct}
        jobs={state.jobs}
        transactions={state.transactions}
      />
    );
  }

  return <AppShell state={state} />;
}
