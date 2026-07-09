import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Filter, RefreshCw, X, ChevronDown, Check } from "lucide-react";
import { DestinationContact, Customer } from "../../../types";
import ContactsTable from "./ContactsTable";

interface ContactsListProps {
  contacts: DestinationContact[];
  filteredContacts: DestinationContact[];
  customers: Customer[];
  localSearchQuery: string;
  setLocalSearchQuery: (value: string) => void;
  activeSearch: string;
  filterCustomer: string;
  setFilterCustomer: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterSafety: string;
  setFilterSafety: (value: string) => void;
  filterSiteAccess: string;
  setFilterSiteAccess: (value: string) => void;
  filterEmergency: string;
  setFilterEmergency: (value: string) => void;
  filterCreatedDate: string;
  setFilterCreatedDate: (value: string) => void;
  filterLastUsedDate: string;
  setFilterLastUsedDate: (value: string) => void;
  showFiltersDropdown: boolean;
  setShowFiltersDropdown: (value: boolean) => void;
  onResetFilters: () => void;
  onAdd: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onViewDetail: (contact: DestinationContact) => void;
  onEdit: (contact: DestinationContact) => void;
  selectedContactIds: string[];
  setSelectedContactIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const columnLabels: Record<string, string> = {
  id: "Contact ID",
  name: "Contact Name",
  customer: "Associated Company / Customer",
  phone: "Phone",
  email: "Email",
  safety: "Safety Contact",
  siteAccess: "Site Access Contact",
  emergency: "Emergency Contact",
  status: "Status",
  actions: "Actions",
};

export default function ContactsList({
  contacts,
  filteredContacts,
  customers,
  localSearchQuery,
  setLocalSearchQuery,
  activeSearch,
  filterCustomer,
  setFilterCustomer,
  filterStatus,
  setFilterStatus,
  filterSafety,
  setFilterSafety,
  filterSiteAccess,
  setFilterSiteAccess,
  filterEmergency,
  setFilterEmergency,
  filterCreatedDate,
  setFilterCreatedDate,
  filterLastUsedDate,
  setFilterLastUsedDate,
  showFiltersDropdown,
  setShowFiltersDropdown,
  onResetFilters,
  onAdd,
  onExport,
  onRefresh,
  isRefreshing,
  onViewDetail,
  onEdit,
  selectedContactIds,
  setSelectedContactIds,
}: ContactsListProps) {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    customer: true,
    phone: true,
    email: true,
    safety: true,
    siteAccess: true,
    emergency: true,
    status: true,
    actions: true
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  const hasActiveFilters =
    filterCustomer !== "All" ||
    filterStatus !== "All" ||
    filterSafety !== "All" ||
    filterSiteAccess !== "All" ||
    filterEmergency !== "All" ||
    filterCreatedDate !== "All" ||
    filterLastUsedDate !== "All";

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight sm:text-2xl">
            Destination Contacts Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage logistics coordinators, safety directors, and emergency dispatcher
            communications per customer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-750 transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Contact</span>
          </button>

          <button
            onClick={onRefresh}
            title="Synchronize Contacts list"
            className="rounded-lg border border-gray-220 bg-white p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-xs"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Search, Filter Toolbar */}
      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts by name, role, email, phone or code..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 border-0 rounded-lg text-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
          />
          {activeSearch && (
            <button
              onClick={() => setLocalSearchQuery("")}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters & Column Visibility */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              showFiltersDropdown
                ? "bg-slate-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-220 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4 text-gray-500" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-220 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition select-none"
            >
              <span>Column Visibility</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {showColumnsMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 text-xs">
                <div className="px-3.5 py-1 text-gray-400 font-black text-[9px] uppercase tracking-widest border-b border-gray-100 mb-1.5">
                  Toggle Columns
                </div>
                {Object.keys(visibleColumns).map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col],
                      }));
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 font-bold text-gray-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>{columnLabels[col] || col}</span>
                    {visibleColumns[col] && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-blue-650 hover:text-blue-800 font-bold transition flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear active filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters Drawer */}
      {showFiltersDropdown && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white rounded-xl p-3 shadow-sm text-xs font-semibold text-gray-700"
        >
          {/* Customer Selector */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">Company Customer</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">
              Communication Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Safety Contact Indicator */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">Safety contact</label>
            <select
              value={filterSafety}
              onChange={(e) => setFilterSafety(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Roles</option>
              <option value="Yes">Yes (Safety Coordinator)</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Site Access Contact Indicator */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">
              Site access contact
            </label>
            <select
              value={filterSiteAccess}
              onChange={(e) => setFilterSiteAccess(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Access</option>
              <option value="Yes">Yes (Site Access Approved)</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">
              Emergency dispatch contact
            </label>
            <select
              value={filterEmergency}
              onChange={(e) => setFilterEmergency(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Emergency</option>
              <option value="Yes">Yes (Emergency Responder)</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Created Date */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">Created Year</label>
            <select
              value={filterCreatedDate}
              onChange={(e) => setFilterCreatedDate(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Dates</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Last Used Date */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-gray-400">Last Used Year</label>
            <select
              value={filterLastUsedDate}
              onChange={(e) => setFilterLastUsedDate(e.target.value)}
              className="w-full border-0 bg-slate-50 rounded-lg p-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Dates</option>
              <option value="2026">2026</option>
              <option value="N/A">Unused (N/A)</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* AG Grid Table */}
      <ContactsTable
        filteredContacts={filteredContacts}
        contacts={contacts}
        visibleColumns={visibleColumns}
        selectedContactIds={selectedContactIds}
        setSelectedContactIds={setSelectedContactIds}
        onExport={onExport}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
      />
    </div>
  );
}
