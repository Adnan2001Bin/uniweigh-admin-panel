import AdminView from "../../components/admin/AdminView";
import CarterDetailView from "../../components/carters/carter-detail/CarterDetailView";
import CartersView from "../../components/carters/carters-list/CartersView";
import CustomersView from "../../components/customers/customer-view/CustomersView";
import DashboardView from "../../components/dashboard/DashboardView";
import DestinationContactsView from "../../components/destinations/contacts-view/DestinationContactsView";
import DestinationsView from "../../components/destinations/destinations-view/DestinationsView";
import DriverDetailView from "../../components/drivers/driver-detail/DriverDetailView";
import DriversView from "../../components/drivers/drivers-list/DriversView";
import JobsView from "../../components/jobs/jobs-view/JobsView";
import ProductDetailStandaloneView from "../../components/products/ProductDetailStandaloneView";
import ProductLotDetailView from "../../components/products/ProductLotDetailView";
import ProductLotsView from "../../components/products/ProductLotsView";
import ProductsView from "../../components/products/ProductsView";
import ReportsView from "../../components/reports/reports-view/ReportsView";
import TicketDetailView from "../../components/tickets/ticket-detail/TicketDetailView";
import TransactionsView from "../../components/transactions/transactions-view/TransactionsView";
import VehicleDetailView from "../../components/vehicles/vehicle-detail/VehicleDetailView";
import VehiclesView from "../../components/vehicles/vehicles-list/VehiclesView";
import type { useAppState } from "../hooks/useAppState";

type AppState = ReturnType<typeof useAppState>;

function renderAdminView(state: AppState, subView: "sites" | "users" | "roles" | "docket") {
  return (
    <AdminView
      adminUser={state.adminUser}
      subView={subView}
      sites={state.sites}
      onUpdateSites={state.setSites}
      siteLimit={state.siteLimit}
      onUpdateSiteLimit={state.setSiteLimit}
      docketConfig={state.docketConfig}
      onUpdateDocketConfig={state.setDocketConfig}
    />
  );
}

export function renderAppContent(state: AppState) {
  const siteFilteredTransactions = state.getFilteredTransactions();

  switch (state.activeView) {
    case "dashboard":
      return (
        <DashboardView
          transactions={siteFilteredTransactions}
          products={state.products}
          customers={state.customers}
          onViewChange={state.setActiveView}
        />
      );

    case "operations-transactions":
      return (
        <TransactionsView
          transactions={siteFilteredTransactions}
          onUpdateTransaction={state.handleUpdateTransaction}
          subView="all"
          searchQuery={state.searchQuery}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "operations-pending":
      return (
        <TransactionsView
          transactions={siteFilteredTransactions}
          onUpdateTransaction={state.handleUpdateTransaction}
          subView="pending"
          searchQuery={state.searchQuery}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "operations-approved":
      return (
        <TransactionsView
          transactions={siteFilteredTransactions}
          onUpdateTransaction={state.handleUpdateTransaction}
          subView="approved"
          searchQuery={state.searchQuery}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "operations-invoicing":
      return (
        <TransactionsView
          transactions={siteFilteredTransactions}
          onUpdateTransaction={state.handleUpdateTransaction}
          subView="invoicing"
          searchQuery={state.searchQuery}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "operations-weighbridge":
      return (
        <TransactionsView
          transactions={siteFilteredTransactions}
          onUpdateTransaction={state.handleUpdateTransaction}
          subView="weighbridge"
          searchQuery={state.searchQuery}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );

    case "customers-list":
      return (
        <CustomersView
          customers={state.customers}
          onUpdateCustomer={state.handleUpdateCustomer}
          searchQuery={state.searchQuery}
          transactions={state.transactions}
        />
      );
    case "customers-contacts":
      return (
        <DestinationContactsView
          customers={state.customers}
          searchQuery={state.searchQuery}
          transactions={state.transactions}
        />
      );
    case "customers-jobs":
      return (
        <JobsView
          jobs={state.jobs}
          customers={state.customers}
          products={state.products}
          transactions={state.transactions}
          onAddJob={state.handleAddJob}
          onUpdateJob={state.handleUpdateJob}
          onViewTicketDetails={state.handleViewTicketDetails}
          searchQuery={state.searchQuery}
        />
      );
    case "customers-destinations":
      return (
        <DestinationsView
          customers={state.customers}
          jobs={state.jobs}
          transactions={state.transactions}
          onViewTicketDetails={state.handleViewTicketDetails}
          searchQuery={state.searchQuery}
        />
      );

    case "products-list":
      return (
        <ProductsView
          products={state.products}
          onUpdateProduct={state.handleUpdateProduct}
          searchQuery={state.searchQuery}
          onViewProductDetails={(id) => {
            state.setSelectedProductId(id);
            state.setActiveView("product-details");
          }}
        />
      );
    case "products-lots":
      return (
        <ProductLotsView
          productLots={state.productLots}
          products={state.products}
          transactions={state.transactions}
          onAddProductLot={(newLot) => {
            state.setProductLots((previous) => [newLot, ...previous]);
          }}
          onUpdateProductLot={(updatedLot) => {
            state.setProductLots((previous) =>
              previous.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot)),
            );
          }}
          onViewProductLotDetails={(lotId) => {
            state.setSelectedProductLotId(lotId);
            state.setActiveView("product-lot-detail");
          }}
          searchQuery={state.searchQuery}
        />
      );
    case "product-lot-detail":
      return (
        <ProductLotDetailView
          lotId={state.selectedProductLotId || ""}
          productLots={state.productLots}
          products={state.products}
          transactions={state.transactions}
          onBack={() => {
            state.setActiveView("products-lots");
          }}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "product-details":
      return (
        <ProductDetailStandaloneView
          products={state.products}
          onUpdateProduct={state.handleUpdateProduct}
          productId={state.selectedProductId || undefined}
          jobs={state.jobs}
          transactions={state.transactions}
          onBack={() => {
            state.setActiveView("products-list");
          }}
        />
      );

    case "transport-carters":
      return (
        <CartersView
          carriers={state.carriers}
          onAddCarter={(newCarrier) =>
            state.setCarriers((previous) => [...previous, newCarrier])
          }
          onUpdateCarter={(updatedCarrier) =>
            state.setCarriers((previous) =>
              previous.map((carrier) =>
                carrier.id === updatedCarrier.id ? updatedCarrier : carrier,
              ),
            )
          }
          onViewCarterDetails={(id) => {
            state.setSelectedCarterId(id);
            state.setActiveView("carter-detail");
          }}
          searchQuery={state.searchQuery}
        />
      );
    case "carter-detail":
      return (
        <CarterDetailView
          carterId={state.selectedCarterId || ""}
          carriers={state.carriers}
          drivers={state.drivers}
          vehicles={state.vehicles}
          transactions={state.transactions}
          onBack={() => {
            state.setActiveView("transport-carters");
          }}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "transport-drivers":
      return (
        <DriversView
          drivers={state.drivers}
          carriers={state.carriers}
          onAddDriver={(newDriver) =>
            state.setDrivers((previous) => [...previous, newDriver])
          }
          onUpdateDriver={(updatedDriver) =>
            state.setDrivers((previous) =>
              previous.map((driver) =>
                driver.id === updatedDriver.id ? updatedDriver : driver,
              ),
            )
          }
          onViewDriverDetails={(driverId) => {
            state.setSelectedDriverId(driverId);
            state.setActiveView("driver-detail");
          }}
          searchQuery={state.searchQuery}
        />
      );
    case "driver-detail":
      return (
        <DriverDetailView
          driverId={state.selectedDriverId || ""}
          drivers={state.drivers}
          carriers={state.carriers}
          transactions={state.transactions}
          onBack={() => {
            state.setActiveView("transport-drivers");
          }}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "transport-vehicles":
      return (
        <VehiclesView
          vehicles={state.vehicles}
          carriers={state.carriers}
          onAddVehicle={(newVehicle) =>
            state.setVehicles((previous) => [...previous, newVehicle])
          }
          onUpdateVehicle={(updatedVehicle) =>
            state.setVehicles((previous) =>
              previous.map((vehicle) =>
                vehicle.plateNumber === updatedVehicle.plateNumber
                  ? updatedVehicle
                  : vehicle,
              ),
            )
          }
          onViewVehicleDetails={(plateNumber) => {
            state.setSelectedVehiclePlate(plateNumber);
            state.setActiveView("vehicle-detail");
          }}
          searchQuery={state.searchQuery}
        />
      );
    case "vehicle-detail":
      return (
        <VehicleDetailView
          plateNumber={state.selectedVehiclePlate || ""}
          vehicles={state.vehicles}
          carriers={state.carriers}
          transactions={state.transactions}
          onBack={() => {
            state.setActiveView("transport-vehicles");
          }}
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );

    case "reports-transactions":
      return (
        <ReportsView
          transactions={siteFilteredTransactions}
          products={state.products}
          customers={state.customers}
          subView="transactions"
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "reports-products":
      return (
        <ReportsView
          transactions={siteFilteredTransactions}
          products={state.products}
          customers={state.customers}
          subView="products"
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "reports-customers":
      return (
        <ReportsView
          transactions={siteFilteredTransactions}
          products={state.products}
          customers={state.customers}
          subView="customers"
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );
    case "reports-progress":
      return (
        <ReportsView
          transactions={siteFilteredTransactions}
          products={state.products}
          customers={state.customers}
          subView="progress"
          onViewTicketDetails={state.handleViewTicketDetails}
        />
      );

    case "ticket-details": {
      const ticket = state.transactions.find(
        (transaction) => transaction.id === state.selectedTicketId,
      );

      if (!ticket) {
        return (
          <div className="py-20 text-center text-gray-400">
            Weigh Ticket ID not detected. Return and select a record.
          </div>
        );
      }

      return (
        <TicketDetailView
          transaction={ticket}
          onUpdateTransaction={state.handleUpdateTransaction}
          docketConfig={state.docketConfig}
          jobs={state.jobs}
          transactions={state.transactions}
          onBack={() => {
            state.setActiveView(state.prevViewBeforeDetails);
          }}
        />
      );
    }

    case "admin-users":
      return renderAdminView(state, "users");
    case "admin-roles":
      return renderAdminView(state, "roles");
    case "admin-sites":
      return renderAdminView(state, "sites");
    case "admin-docket":
      return renderAdminView(state, "docket");

    default:
      return (
        <div className="py-20 text-center text-gray-400">
          View template under development.
        </div>
      );
  }
}
