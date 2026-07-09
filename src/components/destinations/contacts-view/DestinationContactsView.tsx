import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DestinationContact, Customer, Transaction } from "../../../types";
import ContactsList from "./ContactsList";
import ContactDetail from "./ContactDetail";
import ContactForm from "./ContactForm";
import ExportModal from "./ExportModal";
import {
  ContactsExportType,
  ContactsExportFormat,
} from "./utils/exportHelpers";

interface DestinationContactsViewProps {
  customers: Customer[];
  searchQuery: string;
  transactions: Transaction[];
}

const DEFAULT_CONTACTS: DestinationContact[] = [
  {
    id: "CON-001",
    contactCode: "CON-APX-01",
    name: "Jonathan Vance",
    customerId: "C-401",
    customerName: "Apex Infrastructure Group",
    phone: "+61 3 9845 2210",
    mobile: "+61 412 345 601",
    email: "j.vance@apexinfra.com",
    role: "Project Manager",
    isSafetyContact: true,
    isSiteAccessContact: true,
    isEmergencyContact: true,
    status: "Active",
    lastUsedDate: "2026-06-22",
    createdOn: "2024-01-15",
    createdBy: "System Admin",
    modifiedOn: "2026-06-20",
    modifiedBy: "Admin User",
    safetyInstructions:
      "All visitors must undergo site induction. Hard hat, hi-vis vest, and steel-capped boots are mandatory at all times. Standard 10 km/h speed limit.",
    siteAccessNotes:
      "Enter through Gate A on Collins St. Register at front office before unloading. Security barrier code is 8841#.",
    ppeRequirements:
      "Hard Hat, Hi-Vis Vest, Steel-capped Boots, Protective Eyewear",
    inductionRequired: true,
    inductionExpiryDate: "2027-01-15",
    notes:
      "Prefers site communication via SMS before transit dispatch. Extremely professional.",
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "CON-002",
    contactCode: "CON-APX-02",
    name: "Marcus Aurelius",
    customerId: "C-401",
    customerName: "Apex Infrastructure Group",
    phone: "+61 3 9845 2215",
    mobile: "+61 425 889 112",
    email: "m.aurelius@apexinfra.com",
    role: "HSE Superintendent",
    isSafetyContact: true,
    isSiteAccessContact: false,
    isEmergencyContact: true,
    status: "Active",
    lastUsedDate: "2026-06-18",
    createdOn: "2024-02-10",
    createdBy: "System Admin",
    modifiedOn: "2026-05-14",
    modifiedBy: "Operator G",
    safetyInstructions:
      "Random drug & alcohol testing active on site. Report all safety incidents to Marcus immediately. Zero tolerance for speeding.",
    siteAccessNotes:
      "Induction records must be uploaded in portal before entry. Main gate open 6:00 AM - 6:00 PM.",
    ppeRequirements: "Hi-Vis Vest, Steel-capped Boots, Safety Glasses",
    inductionRequired: true,
    inductionExpiryDate: "2026-12-31",
    notes: "Direct line for all major health and safety queries.",
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "CON-003",
    contactCode: "CON-BAY-01",
    name: "Sarah Jenkins",
    customerId: "C-402",
    customerName: "Bayside Civil Construction",
    phone: "+61 3 9522 9911",
    mobile: "+61 412 345 602",
    email: "s.jenkins@baysidecivil.com.au",
    role: "Site Coordinator",
    isSafetyContact: false,
    isSiteAccessContact: true,
    isEmergencyContact: false,
    status: "Active",
    lastUsedDate: "2026-06-21",
    createdOn: "2024-03-12",
    createdBy: "System Admin",
    modifiedOn: "2026-06-11",
    modifiedBy: "Admin User",
    safetyInstructions:
      "Observe exclusion zones around moving excavator equipment. Stay inside truck cabin during automatic overhead loading.",
    siteAccessNotes:
      "Enter via Dandenong Rd side gate. Weighbridge ticket must be handed over upon entry verification.",
    ppeRequirements: "Hi-Vis Vest, Steel-capped Boots",
    inductionRequired: false,
    notes:
      "Main office point of contact for Bayside civil accounts and deliveries.",
    photoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "CON-004",
    contactCode: "CON-BAY-02",
    name: "Robert Thorne",
    customerId: "C-402",
    customerName: "Bayside Civil Construction",
    phone: "+61 3 9522 9915",
    mobile: "+61 433 990 124",
    email: "r.thorne@baysidecivil.com.au",
    role: "Lead Dispatcher",
    isSafetyContact: false,
    isSiteAccessContact: true,
    isEmergencyContact: true,
    status: "Active",
    lastUsedDate: "2026-06-20",
    createdOn: "2024-04-01",
    createdBy: "System Admin",
    modifiedOn: "2026-06-20",
    modifiedBy: "System Operator",
    safetyInstructions:
      "Speed limit inside yard is strictly 5 km/h. Watch for forklift operations near loading bays.",
    siteAccessNotes:
      "Must display valid weighbridge digital pass on mobile. Exit through automatic rear gate.",
    ppeRequirements: "Hi-Vis Vest, Steel-capped Boots, Hearing Protection",
    inductionRequired: true,
    inductionExpiryDate: "2027-04-01",
    notes:
      "Manages all transport slot bookings. Quick to resolve scheduling issues.",
    photoUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
  },
];

export default function DestinationContactsView({
  customers,
  searchQuery: globalSearchQuery,
  transactions,
}: DestinationContactsViewProps) {
  // Load initial state
  const [contacts, setContacts] = useState<DestinationContact[]>(() => {
    const saved = localStorage.getItem("uniweigh_contacts");
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("uniweigh_contacts", JSON.stringify(contacts));
  }, [contacts]);

  // Views management
  const [currentMode, setCurrentMode] = useState<"list" | "detail" | "form">(
    "list",
  );
  const [selectedContact, setSelectedContact] =
    useState<DestinationContact | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Search & Filters
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");
  const [filterCustomer, setFilterCustomer] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterSafety, setFilterSafety] = useState<string>("All");
  const [filterSiteAccess, setFilterSiteAccess] = useState<string>("All");
  const [filterEmergency, setFilterEmergency] = useState<string>("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState<string>("All");
  const [filterLastUsedDate, setFilterLastUsedDate] = useState<string>("All");
  const [showFiltersDropdown, setShowFiltersDropdown] =
    useState<boolean>(false);

  // Selection
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);



  // Profile Sub-tab in Detail screen
  const [detailTab, setDetailTab] = useState<string>("overview");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string>("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Export States
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportType, setExportType] =
    useState<ContactsExportType>("all_filtered");
  const [exportFormat, setExportFormat] = useState<ContactsExportFormat>("CSV");

  // Form State
  const [formCustomer, setFormCustomer] = useState<string>("");
  const [formPhoto, setFormPhoto] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formCode, setFormCode] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formMobile, setFormMobile] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");
  const [formSafety, setFormSafety] = useState<boolean>(false);
  const [formSiteAccess, setFormSiteAccess] = useState<boolean>(false);
  const [formEmergency, setFormEmergency] = useState<boolean>(false);
  const [formSafetyInstructions, setFormSafetyInstructions] =
    useState<string>("");
  const [formSiteAccessNotes, setFormSiteAccessNotes] = useState<string>("");
  const [formPPE, setFormPPE] = useState<string>("");
  const [formInduction, setFormInduction] = useState<boolean>(false);
  const [formInductionExpiry, setFormInductionExpiry] = useState<string>("");
  const [formGeneralNotes, setFormGeneralNotes] = useState<string>("");

  // Handle Refresh
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Destination Contacts list successfully synchronized.");
    }, 800);
  };

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPhoto(reader.result as string);
        showToast("Profile image uploaded successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger form setup for new contact
  const handleInitAddContact = () => {
    setSelectedContact(null);
    setIsEditing(false);
    setFormCustomer(customers[0]?.id || "");
    setFormPhoto("");
    setFormName("");
    setFormCode("CON-NEW-" + Math.floor(100 + Math.random() * 900));
    setFormRole("");
    setFormPhone("");
    setFormMobile("");
    setFormEmail("");
    setFormStatus("Active");
    setFormSafety(false);
    setFormSiteAccess(false);
    setFormEmergency(false);
    setFormSafetyInstructions("");
    setFormSiteAccessNotes("");
    setFormPPE("");
    setFormInduction(false);
    setFormInductionExpiry("");
    setFormGeneralNotes("");

    setCurrentMode("form");
  };

  // Trigger form setup for editing
  const handleInitEditContact = (contact: DestinationContact) => {
    setSelectedContact(contact);
    setIsEditing(true);

    setFormCustomer(contact.customerId);
    setFormPhoto(contact.photoUrl || "");
    setFormName(contact.name);
    setFormCode(contact.contactCode);
    setFormRole(contact.role);
    setFormPhone(contact.phone);
    setFormMobile(contact.mobile);
    setFormEmail(contact.email);
    setFormStatus(contact.status);
    setFormSafety(contact.isSafetyContact);
    setFormSiteAccess(contact.isSiteAccessContact);
    setFormEmergency(contact.isEmergencyContact);
    setFormSafetyInstructions(contact.safetyInstructions || "");
    setFormSiteAccessNotes(contact.siteAccessNotes || "");
    setFormPPE(contact.ppeRequirements || "");
    setFormInduction(contact.inductionRequired);
    setFormInductionExpiry(contact.inductionExpiryDate || "");
    setFormGeneralNotes(contact.notes || "");

    setCurrentMode("form");
  };

  // Save actions
  const handleSaveContact = (addAnother: boolean = false) => {
    if (!formName.trim()) {
      showToast("Error: Contact Name is required.");
      return;
    }

    const linkedCust = customers.find((c) => c.id === formCustomer);
    const updatedContact: DestinationContact = {
      id:
        isEditing && selectedContact
          ? selectedContact.id
          : "CON-" + Math.floor(1000 + Math.random() * 9000),
      contactCode: formCode || "CON-CUST",
      photoUrl: formPhoto || undefined,
      name: formName,
      customerId: formCustomer,
      customerName: linkedCust ? linkedCust.name : "Unlinked Customer",
      phone: formPhone,
      mobile: formMobile,
      email: formEmail,
      role: formRole,
      isSafetyContact: formSafety,
      isSiteAccessContact: formSiteAccess,
      isEmergencyContact: formEmergency,
      status: formStatus,
      lastUsedDate:
        isEditing && selectedContact ? selectedContact.lastUsedDate : "N/A",
      createdOn:
        isEditing && selectedContact
          ? selectedContact.createdOn
          : new Date().toISOString().split("T")[0],
      createdBy:
        isEditing && selectedContact
          ? selectedContact.createdBy
          : "Admin Operator",
      modifiedOn: new Date().toISOString().split("T")[0],
      modifiedBy: "Admin Operator",
      safetyInstructions: formSafetyInstructions,
      siteAccessNotes: formSiteAccessNotes,
      ppeRequirements: formPPE,
      inductionRequired: formInduction,
      inductionExpiryDate: formInduction ? formInductionExpiry : undefined,
      notes: formGeneralNotes,
    };

    if (isEditing && selectedContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === selectedContact.id ? updatedContact : c)),
      );
      showToast(`Contact '${formName}' details successfully updated.`);
      setSelectedContact(updatedContact);
    } else {
      setContacts((prev) => [updatedContact, ...prev]);
      showToast(`Contact '${formName}' successfully registered.`);
    }

    if (addAnother && !isEditing) {
      setFormName("");
      setFormCode("CON-NEW-" + Math.floor(100 + Math.random() * 900));
      setFormRole("");
      setFormPhone("");
      setFormMobile("");
      setFormEmail("");
      setFormSafety(false);
      setFormSiteAccess(false);
      setFormEmergency(false);
      setFormSafetyInstructions("");
      setFormSiteAccessNotes("");
      setFormPPE("");
      setFormInduction(false);
      setFormInductionExpiry("");
      setFormGeneralNotes("");
      setFormPhoto("");
    } else {
      setCurrentMode(isEditing ? "detail" : "list");
    }
  };

  // Delete Contact
  const handleDeleteContact = (contactId: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this destination contact?",
      )
    ) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      showToast("Contact successfully removed.");
      if (currentMode === "detail") {
        setCurrentMode("list");
      }
    }
  };

  // Filter application
  const activeSearch = localSearchQuery || globalSearchQuery;
  const filteredContacts = contacts.filter((c) => {
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.contactCode.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.mobile.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (filterCustomer !== "All" && c.customerId !== filterCustomer)
      return false;
    if (filterStatus !== "All" && c.status !== filterStatus) return false;

    if (filterSafety !== "All") {
      const isS = filterSafety === "Yes";
      if (c.isSafetyContact !== isS) return false;
    }
    if (filterSiteAccess !== "All") {
      const isSA = filterSiteAccess === "Yes";
      if (c.isSiteAccessContact !== isSA) return false;
    }
    if (filterEmergency !== "All") {
      const isE = filterEmergency === "Yes";
      if (c.isEmergencyContact !== isE) return false;
    }

    if (
      filterCreatedDate !== "All" &&
      !c.createdOn.startsWith(filterCreatedDate)
    )
      return false;
    if (filterLastUsedDate !== "All") {
      if (
        !c.lastUsedDate ||
        c.lastUsedDate === "N/A" ||
        !c.lastUsedDate.startsWith(filterLastUsedDate)
      )
        return false;
    }

    return true;
  });

  // Reset Filters
  const resetFilters = () => {
    setFilterCustomer("All");
    setFilterStatus("All");
    setFilterSafety("All");
    setFilterSiteAccess("All");
    setFilterEmergency("All");
    setFilterCreatedDate("All");
    setFilterLastUsedDate("All");
    showToast("Filters successfully reset.");
  };

  // Helper Initials Badge
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleViewDetail = (contact: DestinationContact) => {
    setSelectedContact(contact);
    setDetailTab("overview");
    setCurrentMode("detail");
  };

  return (
    <div className="space-y-6" id="destination-contacts-module">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold font-mono"
          >
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage("")}
              className="text-gray-400 hover:text-white transition ml-4"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {currentMode === "list" && (
        <ContactsList
          contacts={contacts}
          filteredContacts={filteredContacts}
          customers={customers}
          localSearchQuery={localSearchQuery}
          setLocalSearchQuery={setLocalSearchQuery}
          activeSearch={activeSearch}
          filterCustomer={filterCustomer}
          setFilterCustomer={setFilterCustomer}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterSafety={filterSafety}
          setFilterSafety={setFilterSafety}
          filterSiteAccess={filterSiteAccess}
          setFilterSiteAccess={setFilterSiteAccess}
          filterEmergency={filterEmergency}
          setFilterEmergency={setFilterEmergency}
          filterCreatedDate={filterCreatedDate}
          setFilterCreatedDate={setFilterCreatedDate}
          filterLastUsedDate={filterLastUsedDate}
          setFilterLastUsedDate={setFilterLastUsedDate}
          showFiltersDropdown={showFiltersDropdown}
          setShowFiltersDropdown={setShowFiltersDropdown}
          onResetFilters={resetFilters}
          onAdd={handleInitAddContact}
          onExport={() => {
            setExportType("all_filtered");
            setShowExportModal(true);
          }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onViewDetail={handleViewDetail}
          onEdit={handleInitEditContact}
          selectedContactIds={selectedContactIds}
          setSelectedContactIds={setSelectedContactIds}
        />
      )}

      {currentMode === "detail" && selectedContact && (
        <ContactDetail
          selectedContact={selectedContact}
          getInitials={getInitials}
          onBack={() => setCurrentMode("list")}
          onEdit={handleInitEditContact}
          onExportProfile={() => {
            setExportType("profile");
            setShowExportModal(true);
          }}
          onDelete={handleDeleteContact}
        />
      )}

      {currentMode === "form" && (
        <ContactForm
          isEditing={isEditing}
          formName={formName}
          setFormName={setFormName}
          formCustomer={formCustomer}
          setFormCustomer={setFormCustomer}
          formPhoto={formPhoto}
          setFormPhoto={setFormPhoto}
          formCode={formCode}
          setFormCode={setFormCode}
          formRole={formRole}
          setFormRole={setFormRole}
          formPhone={formPhone}
          setFormPhone={setFormPhone}
          formMobile={formMobile}
          setFormMobile={setFormMobile}
          formEmail={formEmail}
          setFormEmail={setFormEmail}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formSafety={formSafety}
          setFormSafety={setFormSafety}
          formSiteAccess={formSiteAccess}
          setFormSiteAccess={setFormSiteAccess}
          formEmergency={formEmergency}
          setFormEmergency={setFormEmergency}
          formSafetyInstructions={formSafetyInstructions}
          setFormSafetyInstructions={setFormSafetyInstructions}
          formSiteAccessNotes={formSiteAccessNotes}
          setFormSiteAccessNotes={setFormSiteAccessNotes}
          formPPE={formPPE}
          setFormPPE={setFormPPE}
          formInduction={formInduction}
          setFormInduction={setFormInduction}
          formInductionExpiry={formInductionExpiry}
          setFormInductionExpiry={setFormInductionExpiry}
          formGeneralNotes={formGeneralNotes}
          setFormGeneralNotes={setFormGeneralNotes}
          customers={customers}
          onImageChange={handleImageChange}
          onSave={handleSaveContact}
          onCancel={() => setCurrentMode(isEditing ? "detail" : "list")}
        />
      )}

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportType={exportType}
        setExportType={setExportType}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        filteredContacts={filteredContacts}
        contacts={contacts}
        selectedContactIds={selectedContactIds}
        selectedContact={selectedContact}
        currentMode={currentMode}
        showToast={showToast}
      />
    </div>
  );
}

export type { DestinationContactsViewProps };
