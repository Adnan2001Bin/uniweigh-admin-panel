import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  X,
  Edit,
  Trash2,
  FileText,
  User,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Briefcase,
  MapPin,
  ShieldAlert,
  Check,
  FileDown,
  ChevronDown,
  Upload,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DestinationContact, Customer, Transaction } from "../types";
import { confirmDialog } from "@/src/components/shared/dialog-service";
import { SelectBox } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_ACTION_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS,
} from "@/src/components/shared/FormPage";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

const CONTACT_DETAIL_ACTION_CLASS =
  "inline-flex h-9 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer shadow-xs";

interface DestinationContactsViewProps {
  customers: Customer[];
  searchQuery: string;
  transactions: Transaction[];
  routeDetailId?: string | null;
  onRouteDetailChange?: (id: string | null) => void;
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
    safetyInstructions: "All visitors must undergo site induction. Hard hat, hi-vis vest, and steel-capped boots are mandatory at all times. Standard 10 km/h speed limit.",
    siteAccessNotes: "Enter through Gate A on Collins St. Register at front office before unloading. Security barrier code is 8841#.",
    ppeRequirements: "Hard Hat, Hi-Vis Vest, Steel-capped Boots, Protective Eyewear",
    inductionRequired: true,
    inductionExpiryDate: "2027-01-15",
    notes: "Prefers site communication via SMS before transit dispatch. Extremely professional.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
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
    safetyInstructions: "Random drug & alcohol testing active on site. Report all safety incidents to Marcus immediately. Zero tolerance for speeding.",
    siteAccessNotes: "Induction records must be uploaded in portal before entry. Main gate open 6:00 AM - 6:00 PM.",
    ppeRequirements: "Hi-Vis Vest, Steel-capped Boots, Safety Glasses",
    inductionRequired: true,
    inductionExpiryDate: "2026-12-31",
    notes: "Direct line for all major health and safety queries.",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
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
    safetyInstructions: "Observe exclusion zones around moving excavator equipment. Stay inside truck cabin during automatic overhead loading.",
    siteAccessNotes: "Enter via Dandenong Rd side gate. Weighbridge ticket must be handed over upon entry verification.",
    ppeRequirements: "Hi-Vis Vest, Steel-capped Boots",
    inductionRequired: false,
    notes: "Main office point of contact for Bayside civil accounts and deliveries.",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
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
    safetyInstructions: "Speed limit inside yard is strictly 5 km/h. Watch for forklift operations near loading bays.",
    siteAccessNotes: "Must display valid weighbridge digital pass on mobile. Exit through automatic rear gate.",
    ppeRequirements: "Hi-Vis Vest, Steel-capped Boots, Hearing Protection",
    inductionRequired: true,
    inductionExpiryDate: "2027-04-01",
    notes: "Manages all transport slot bookings. Quick to resolve scheduling issues.",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  }
];

export default function DestinationContactsView({
  customers,
  searchQuery: globalSearchQuery,
  transactions,
  routeDetailId = null,
  onRouteDetailChange,
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

  // Views management: "list" | "detail" | "form"
  const [currentMode, setCurrentMode] = useState<"list" | "detail" | "form">(
    routeDetailId ? "detail" : "list"
  );
  const [selectedContact, setSelectedContact] = useState<DestinationContact | null>(() =>
    routeDetailId ? DEFAULT_CONTACTS.find((c) => c.id === routeDetailId) || null : null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (routeDetailId) {
      const found = contacts.find((c) => c.id === routeDetailId) || null;
      setSelectedContact(found);
      if (found) setCurrentMode("detail");
    } else if (currentMode === "detail") {
      setCurrentMode("list");
    }
  }, [routeDetailId, contacts]);

  const openContactDetail = (contact: DestinationContact) => {
    setSelectedContact(contact);
    setCurrentMode("detail");
    onRouteDetailChange?.(contact.id);
  };

  const closeContactDetail = () => {
    setCurrentMode("list");
    onRouteDetailChange?.(null);
  };

  // Search & Filters
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");
  const [filterCustomer, setFilterCustomer] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterSafety, setFilterSafety] = useState<string>("All");
  const [filterSiteAccess, setFilterSiteAccess] = useState<string>("All");
  const [filterEmergency, setFilterEmergency] = useState<string>("All");
  const [filterCreatedDate, setFilterCreatedDate] = useState<string>("All");
  const [filterLastUsedDate, setFilterLastUsedDate] = useState<string>("All");
  const [showFiltersDropdown, setShowFiltersDropdown] = useState<boolean>(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    contactCode: true,
    photo: true,
    name: true,
    customer: true,
    phone: true,
    mobile: true,
    email: true,
    role: true,
    safety: true,
    siteAccess: true,
    emergency: true,
    status: true,
    lastUsed: true,
    createdOn: true,
    actions: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);

  // Profile Sub-tab in Detail screen: "overview" | "safety" | "records" | "audit"
  const [detailTab, setDetailTab] = useState<string>("overview");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string>("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Export States
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportType, setExportType] = useState<"filtered" | "all" | "profile">("filtered");
  const [exportFormat, setExportFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");

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
  const [formSafetyInstructions, setFormSafetyInstructions] = useState<string>("");
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
    // Defaults
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

    const linkedCust = customers.find(c => c.id === formCustomer);
    const updatedContact: DestinationContact = {
      id: isEditing && selectedContact ? selectedContact.id : "CON-" + Math.floor(1000 + Math.random() * 9000),
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
      isSiteAccessContact: false,
      isEmergencyContact: false,
      status: formStatus,
      lastUsedDate: isEditing && selectedContact ? selectedContact.lastUsedDate : "N/A",
      createdOn: isEditing && selectedContact ? selectedContact.createdOn : new Date().toISOString().split('T')[0],
      createdBy: isEditing && selectedContact ? selectedContact.createdBy : "Admin Operator",
      modifiedOn: new Date().toISOString().split('T')[0],
      modifiedBy: "Admin Operator",
      safetyInstructions: formSafetyInstructions,
      siteAccessNotes: formSiteAccessNotes,
      ppeRequirements: formPPE,
      inductionRequired: formInduction,
      inductionExpiryDate: formInduction ? formInductionExpiry : undefined,
      notes: formGeneralNotes
    };

    if (isEditing && selectedContact) {
      setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
      showToast(`Contact '${formName}' details successfully updated.`);
      setSelectedContact(updatedContact);
    } else {
      setContacts(prev => [updatedContact, ...prev]);
      showToast(`Contact '${formName}' successfully registered.`);
    }

    if (addAnother && !isEditing) {
      // Keep adding
      setFormName("");
      setFormCode("CON-NEW-" + Math.floor(100 + Math.random() * 900));
      setFormRole("");
      setFormPhone("");
      setFormMobile("");
      setFormEmail("");
      setFormSafety(false);
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
  const handleDeleteContact = async (contactId: string) => {
    if (await confirmDialog("Are you sure you want to permanently delete this destination contact?")) {
      setContacts(prev => prev.filter(c => c.id !== contactId));
      showToast("Contact successfully removed.");
      if (currentMode === "detail") {
        setCurrentMode("list");
      }
    }
  };

  // Filter application — contacts for customers linked to the selected site only
  const siteCustomerIds = useMemo(() => new Set(customers.map((c) => c.id)), [customers]);
  const activeSearch = localSearchQuery || globalSearchQuery;
  const filteredContacts = contacts.filter(c => {
    if (!siteCustomerIds.has(c.customerId)) return false;

    // Search
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

    // Customer Filter
    if (filterCustomer !== "All" && c.customerId !== filterCustomer) return false;

    // Status Filter
    if (filterStatus !== "All" && c.status !== filterStatus) return false;

    // Boolean filters
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

    // Date Filters
    if (filterCreatedDate !== "All" && !c.createdOn.startsWith(filterCreatedDate)) return false;
    if (filterLastUsedDate !== "All") {
      if (!c.lastUsedDate || c.lastUsedDate === "N/A" || !c.lastUsedDate.startsWith(filterLastUsedDate)) return false;
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
    setLocalSearchQuery("");
    showToast("Filters successfully reset.");
  };

  // Exports processor
  const handleExecuteExport = () => {
    let dataToExport: DestinationContact[] = [];

    if (exportType === "filtered") {
      dataToExport = filteredContacts;
    } else if (exportType === "all") {
      dataToExport = contacts;
    } else if (exportType === "profile" && selectedContact) {
      dataToExport = [selectedContact];
    } else {
      dataToExport = filteredContacts;
    }

    if (dataToExport.length === 0) {
      showToast("Error: No contacts available to export.");
      setShowExportModal(false);
      return;
    }

    const reportName = `Uniweigh_Contacts_Report_${exportType}_${new Date().toISOString().split('T')[0]}`;

    if (exportFormat === "CSV" || exportFormat === "Excel") {
      const formattedData = dataToExport.map(c => ({
        "Contact ID": c.id,
        "Contact Code": c.contactCode,
        "Contact Name": c.name,
        "Customer Name": c.customerName,
        "Role / Position": c.role,
        "Phone": c.phone,
        "Mobile": c.mobile,
        "Email": c.email,
        "Is Safety Contact": c.isSafetyContact ? "Yes" : "No",
        "Is Site Access Contact": c.isSiteAccessContact ? "Yes" : "No",
        "Is Emergency Contact": c.isEmergencyContact ? "Yes" : "No",
        "Status": c.status,
        "Last Used Date": c.lastUsedDate || "N/A",
        "Created On": c.createdOn,
        "Created By": c.createdBy,
        "Induction Required": c.inductionRequired ? "Yes" : "No",
        "PPE Requirements": c.ppeRequirements || "N/A"
      }));

      // Trigger download
      const headers = Object.keys(formattedData[0] || {}).join(",");
      const rows = formattedData.map(item => 
        Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportName}.${exportFormat === "Excel" ? "xls" : "csv"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Successfully downloaded ${exportFormat} export report: ${dataToExport.length} entries.`);
    } else {
      // Simulate PDF Report Generation
      const printContent = `
        UNIWEIGH LOGISTICS GATEWAY - ENTERPRISE DESTINATION CONTACTS PROFILE REPORT
        Generated Date: ${new Date().toLocaleString()}
        Scope: ${exportType.toUpperCase()} | Count: ${dataToExport.length}
        ========================================================================
        
        ${dataToExport.map(c => `
        Contact: [${c.id}] ${c.name} (${c.contactCode}) - Status: ${c.status}
        Company Customer: ${c.customerName}
        Role/Position: ${c.role} | Phone: ${c.phone} | Mobile: ${c.mobile}
        Email Address: ${c.email}
        Flags: Safety Contact: ${c.isSafetyContact ? "YES" : "NO"} | Site Access: ${c.isSiteAccessContact ? "YES" : "NO"} | Emergency Contact: ${c.isEmergencyContact ? "YES" : "NO"}
        Safety Instructions: ${c.safetyInstructions || "Standard protocols apply"}
        Access Notes: ${c.siteAccessNotes || "Standard gate access"}
        PPE Rules: ${c.ppeRequirements || "Hi-Vis, Steel Caps"}
        Induction Status: ${c.inductionRequired ? `Induction Required (Expires: ${c.inductionExpiryDate || "N/A"})` : "No induction mandated"}
        ------------------------------------------------------------------------`).join("\n")}
      `;

      const blob = new Blob([printContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Successfully downloaded printable PDF raw report format (.txt extension).");
    }

    setShowExportModal(false);
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

  // Filter linked transactions for selected contact
  const getContactTransactions = (contact: DestinationContact) => {
    return transactions.filter(t => t.customerId === contact.customerId);
  };

  return (
    <div className="space-y-4" id="destination-contacts-module">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-primary border border-primary text-white px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-xs font-semibold font-mono"
          >
            <div className="h-2 w-2 rounded-full bg-info animate-pulse"></div>
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-muted-foreground hover:text-white transition ml-4">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(currentMode === "list" || currentMode === "form") && (
        <PageHeader
          title="Destination Contacts Directory"
          icon={User}
          breadcrumbs={[
            { label: "Customers & Sales" },
            { label: "Destination Contacts" },
          ]}
          actions={
            currentMode === "list" ? (
              <button
                type="button"
                onClick={handleInitAddContact}
                className={PAGE_HEADER_ADD_BUTTON_CLASS}
              >
                <Plus className="h-4 w-4" />
                <span>Add New Contact</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentMode(isEditing ? "detail" : "list")}
                className={`${FORM_PAGE_ACTION_CLASS} gap-2 border border-border bg-card px-3 text-foreground shadow-xs hover:bg-muted`}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Back to Listing</span>
              </button>
            )
          }
        />
      )}

      {/* VIEW 1: LIST VIEW */}
      {currentMode === "list" && (
        <div className="space-y-4">

          {/* Toolbar: Search + Filters + Refresh | Export */}
          <div className="bg-card border border-border rounded-md p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="w-full bg-muted border border-border hover:border-input focus:bg-card rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {localSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLocalSearchQuery("")}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 select-none ${
                    showFiltersDropdown ||
                    filterCustomer !== "All" ||
                    filterStatus !== "All" ||
                    filterSafety !== "All" ||
                    filterSiteAccess !== "All" ||
                    filterEmergency !== "All" ||
                    filterCreatedDate !== "All" ||
                    filterLastUsedDate !== "All"
                      ? "bg-info/10 border-info/25 text-info hover:bg-info/10"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {[
                    filterCustomer !== "All",
                    filterStatus !== "All",
                    filterSafety !== "All",
                    filterSiteAccess !== "All",
                    filterEmergency !== "All",
                    filterCreatedDate !== "All",
                    filterLastUsedDate !== "All",
                  ].filter(Boolean).length > 0 && (
                    <span className="bg-primary text-white font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {[
                        filterCustomer !== "All",
                        filterStatus !== "All",
                        filterSafety !== "All",
                        filterSiteAccess !== "All",
                        filterEmergency !== "All",
                        filterCreatedDate !== "All",
                        filterLastUsedDate !== "All",
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-md border border-border bg-card hover:bg-muted p-1.5 text-xs font-bold text-foreground transition flex items-center justify-center select-none"
                  title="Refresh dataset"
                >
                  <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin text-info" : ""}`} />
                </button>
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer transition select-none"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Records</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {isExportDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 z-50 rounded-md border border-border bg-card py-2 shadow-lg animate-fade-in text-xs text-foreground">
                    <div className="px-3 py-1.5 border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Export Scope
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setExportType("filtered");
                        setShowExportModal(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted font-semibold"
                    >
                      Export Filtered Results ({filteredContacts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setExportType("all");
                        setShowExportModal(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                    >
                      Export All Records ({contacts.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Filters Drawer */}
            {(showFiltersDropdown ||
              filterCustomer !== "All" ||
              filterStatus !== "All" ||
              filterSafety !== "All" ||
              filterSiteAccess !== "All" ||
              filterEmergency !== "All" ||
              filterCreatedDate !== "All" ||
              filterLastUsedDate !== "All") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted border border-border p-3.5 rounded-md text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Company Customer
                  </label>
                  <SelectBox
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Customers</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Status
                  </label>
                  <SelectBox
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Safety Contact
                  </label>
                  <SelectBox
                    value={filterSafety}
                    onChange={(e) => setFilterSafety(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Site Access Contact
                  </label>
                  <SelectBox
                    value={filterSiteAccess}
                    onChange={(e) => setFilterSiteAccess(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Access</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Emergency Contact
                  </label>
                  <SelectBox
                    value={filterEmergency}
                    onChange={(e) => setFilterEmergency(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Emergency</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Created Year
                  </label>
                  <SelectBox
                    value={filterCreatedDate}
                    onChange={(e) => setFilterCreatedDate(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Dates</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </SelectBox>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Last Used Year
                  </label>
                  <SelectBox
                    value={filterLastUsedDate}
                    onChange={(e) => setFilterLastUsedDate(e.target.value)}
                    className="w-full rounded-md border border-border bg-card p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Dates</option>
                    <option value="2026">2026</option>
                    <option value="N/A">Unused (N/A)</option>
                  </SelectBox>
                </div>

                <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-1.5 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-foreground font-bold px-2 py-1 text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table Directory */}
          <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted text-xs font-bold uppercase text-muted-foreground tracking-wider select-none">
                    <th className="px-4 py-3.5 whitespace-nowrap">Contact ID</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Contact Name</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Company / Customer</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Phone</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Mobile</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Email</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Safety</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Site Access</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Emergency</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-xs text-muted-foreground">
                        No destination contacts matched the given filters or search inputs.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map(c => {
                      return (
                        <tr
                          key={c.id}
                          className="group cursor-pointer select-none transition-colors hover:bg-muted"
                          onClick={() => openContactDetail(c)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-bold text-foreground">{c.id}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-foreground group-hover:text-info transition-colors">
                              {c.name}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap max-w-[180px] truncate" title={c.customerName}>
                            <span className="text-sm font-semibold text-foreground">{c.customerName}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium font-mono text-muted-foreground">{c.phone || "N/A"}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium font-mono text-muted-foreground">{c.mobile || "N/A"}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap max-w-[200px] truncate" title={c.email || undefined}>
                            <span className="text-sm font-medium text-muted-foreground select-all">{c.email || "N/A"}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {c.isSafetyContact ? (
                              <span className="inline-flex items-center text-xs font-bold text-success bg-success/10 border border-success/25 rounded px-1.5 py-0.5">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-bold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {c.isSiteAccessContact ? (
                              <span className="inline-flex items-center text-xs font-bold text-success bg-success/10 border border-success/25 rounded px-1.5 py-0.5">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-bold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {c.isEmergencyContact ? (
                              <span className="inline-flex items-center text-xs font-bold text-success bg-success/10 border border-success/25 rounded px-1.5 py-0.5">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-bold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openContactDetail(c)}
                                className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                title="View Contact Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitEditContact(c)}
                                className={TABLE_ACTION_ICON_BUTTON_CLASS}
                                title="Edit Contact details"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Selection info and pagination bottom bar */}
            <div className="border-t border-border px-5 py-3.5 flex items-center justify-between bg-muted">
              <span className="text-xs text-muted-foreground font-medium">
                Showing {filteredContacts.length} of {contacts.length} registered contacts.
              </span>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: PROFILE PAGE VIEW (FULL-PAGE, RENDERED DIRECTLY, NO SIDE-DRAWER) */}
      {currentMode === "detail" && selectedContact && (
        <div className="space-y-6 animate-fade-in" id="contact-detail-page">

          {/* Return Navigation */}
          <button
            type="button"
            onClick={() => closeContactDetail()}
            className="group inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-info transition bg-card border border-border rounded-md px-3.5 py-2 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Directory</span>
          </button>

          {/* Hero header card */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border rounded-md px-6 py-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted border border-border overflow-hidden shadow-inner shrink-0 flex items-center justify-center">
                {selectedContact.photoUrl ? (
                  <img
                    src={selectedContact.photoUrl}
                    alt={selectedContact.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-bold text-lg text-info">
                    {getInitials(selectedContact.name)}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact ID: {selectedContact.id}
                  </span>
                  <StatusBadge status={selectedContact.status} className="rounded-md" />
                  <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-foreground">
                    {selectedContact.contactCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 mt-1">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                    {selectedContact.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2.5 py-1 select-none">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedContact.customerName}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 self-start md:self-center items-center">
              <button
                type="button"
                onClick={() => handleInitEditContact(selectedContact)}
                className={`${CONTACT_DETAIL_ACTION_CLASS} gap-1.5 border border-border bg-card px-4 text-foreground hover:bg-muted`}
              >
                <Edit className="h-4 w-4 shrink-0" />
                <span>Edit Profile Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExportType("profile");
                  setShowExportModal(true);
                }}
                className={`${CONTACT_DETAIL_ACTION_CLASS} gap-1.5 border border-border bg-card px-4 text-foreground hover:bg-muted`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span>Export Profile Report</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteContact(selectedContact.id)}
                className={`${CONTACT_DETAIL_ACTION_CLASS} gap-1.5 border border-destructive/25 bg-destructive/10 px-4 text-destructive hover:bg-destructive/10`}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>Delete Contact</span>
              </button>
            </div>
          </div>

          {/* Main grid: left metadata (4) + right expanded profile (8) — matches Ticket Detail */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                  Contact Details
                </h3>
                <div className="space-y-4 text-sm text-foreground font-normal">
                  <div className="flex items-start gap-2.5">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Contact ID</div>
                      <div className="font-mono font-bold text-foreground">{selectedContact.id}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Contact Code</div>
                      <div className="font-mono font-bold text-foreground">{selectedContact.contactCode}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Contact Name</div>
                      <div className="font-bold text-foreground">{selectedContact.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{selectedContact.role || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Associated Company / Customer</div>
                      <div className="font-bold text-foreground">{selectedContact.customerName}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Phone / Mobile</div>
                      <div className="font-mono font-semibold text-foreground">{selectedContact.phone || "N/A"}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{selectedContact.mobile || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Email</div>
                      <div className="font-mono font-semibold text-foreground break-all select-all">{selectedContact.email || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold mb-0.5">Status</div>
                      <StatusBadge status={selectedContact.status} className="mt-0.5 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted border border-border rounded-md p-4 text-xs space-y-2">
                <span className="font-bold text-foreground block uppercase tracking-wider text-xs">
                  Access Snapshot
                </span>
                <div className="space-y-1.5 font-medium">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Safety Contact:</span>
                    <span className={`font-bold ${selectedContact.isSafetyContact ? "text-success" : "text-foreground"}`}>
                      {selectedContact.isSafetyContact ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Site Access:</span>
                    <span className={`font-bold ${selectedContact.isSiteAccessContact ? "text-info" : "text-foreground"}`}>
                      {selectedContact.isSiteAccessContact ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Account State:</span>
                    <span className={selectedContact.status === "Active" ? "text-success font-bold" : "text-destructive font-bold"}>
                      {selectedContact.status === "Active" ? "Operational" : selectedContact.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — wide profile card */}
            <div className="lg:col-span-8 bg-card border border-border rounded-md shadow-xs overflow-hidden">
              <div className="p-6 space-y-6 text-sm leading-relaxed text-foreground min-h-[360px]">
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Safety & Site Access Profile
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Gate induction, PPE, and site access controls registered against this destination contact.
                  </p>
                </div>

                <div className="rounded-md border border-info/25 bg-info/10 p-5 space-y-5">
                  <h4 className="text-xs font-bold text-info uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Safety & Site Access Flags
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-md bg-card p-3 border border-border text-center">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Safety Contact</div>
                      <div className={`text-sm font-bold mt-1 ${selectedContact.isSafetyContact ? "text-success" : "text-muted-foreground"}`}>
                        {selectedContact.isSafetyContact ? "Yes" : "No"}
                      </div>
                    </div>
                    <div className="rounded-md bg-card p-3 border border-border text-center">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Site Access</div>
                      <div className={`text-sm font-bold mt-1 ${selectedContact.isSiteAccessContact ? "text-info" : "text-muted-foreground"}`}>
                        {selectedContact.isSiteAccessContact ? "Yes" : "No"}
                      </div>
                    </div>
                    <div className="rounded-md bg-card p-3 border border-border text-center">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Emergency</div>
                      <div className={`text-sm font-bold mt-1 ${selectedContact.isEmergencyContact ? "text-destructive" : "text-muted-foreground"}`}>
                        {selectedContact.isEmergencyContact ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-info/25 pt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground">PPE Requirements:</span>
                      {selectedContact.ppeRequirements?.trim() ? (
                        <ul className="mt-1.5 space-y-1 list-disc list-inside">
                          {selectedContact.ppeRequirements
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .map((item) => (
                              <li key={item} className="text-sm font-bold text-foreground">
                                {item}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <span className="text-sm font-bold text-foreground block mt-0.5">N/A</span>
                      )}
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <span className="text-xs font-bold text-muted-foreground block mb-0.5">Induction:</span>
                      <span className="text-sm font-bold text-foreground">
                        {selectedContact.inductionRequired
                          ? `Required${selectedContact.inductionExpiryDate ? ` · Expires ${selectedContact.inductionExpiryDate}` : ""}`
                          : "Not required"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-b border-border pb-5">
                  <div className="p-3 bg-muted border border-border rounded-md">
                    <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      Safety Instructions
                    </div>
                    <div className="text-xs font-medium italic text-muted-foreground mt-1 leading-relaxed">
                      {selectedContact.safetyInstructions || "No explicit safety instructions specified."}
                    </div>
                  </div>
                  <div className="p-3 bg-muted border border-border rounded-md">
                    <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Site Access Notes
                    </div>
                    <div className="text-xs font-medium italic text-muted-foreground mt-1 leading-relaxed">
                      {selectedContact.siteAccessNotes || "No site access notes logged."}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                    General Notes
                  </h4>
                  <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs font-medium italic text-warning whitespace-pre-line">
                    &ldquo;{selectedContact.notes || "No general operational notes recorded."}&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ADD / EDIT CONTACT FORM (FULL PAGE VIEW) */}
      {currentMode === "form" && (
        <FormPage
          icon={User}
          title={isEditing ? `Edit Contact: ${formName}` : "Register New Destination Contact"}
          subtitle="Configure company link, safety inductions, and site gate parameters."
          modeBadge={isEditing ? "Modifying Live Record" : "Draft Mode"}
          saveLabel="Save Contact Details"
          saveAndAddAnotherLabel="Save & Add Another"
          onCancel={() => setCurrentMode(isEditing ? "detail" : "list")}
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveContact(false);
          }}
          onSaveAndAddAnother={!isEditing ? () => handleSaveContact(true) : undefined}
        >
          <div className="p-6 space-y-5 text-xs">
            {/* Section 1: Contact Profile & Organization Details */}
            <div className="space-y-4">
              <h3 className={FORM_PAGE_SECTION_CLASS}>
                <Building className="h-4 w-4 text-info" />
                <span>1. Contact Profile & Organization Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>
                    Company Customer Link <span className="text-destructive">*</span>
                  </label>
                  <SelectBox
                    value={formCustomer}
                    onChange={(e) => setFormCustomer(e.target.value)}
                    className={FORM_PAGE_SELECT_CLASS}
                    required
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </SelectBox>
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>
                    Contact Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Alistair Cooke"
                    className={FORM_PAGE_INPUT_CLASS}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Contact Code</label>
                  <Input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CON-APX-05"
                    className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Role / Position Title</label>
                  <Input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. HSE Manager"
                    className={FORM_PAGE_INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Office Direct Phone</label>
                  <Input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +61 3 9999 1111"
                    className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Mobile Dispatch Contact</label>
                  <Input
                    type="text"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="e.g. +61 412 345 678"
                    className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Email Address</label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. a.cooke@apex.com"
                    className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Communication Status</label>
                  <SelectBox
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className={FORM_PAGE_SELECT_CLASS}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </SelectBox>
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Profile Picture / Avatar</label>
                  <div className="flex items-center gap-3">
                    {formPhoto ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border">
                        <img src={formPhoto} alt="Upload preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormPhoto("")}
                          className="absolute inset-0 flex items-center justify-center bg-foreground text-xs font-bold text-white opacity-0 transition hover:opacity-100"
                        >
                          REMOVE
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-input bg-muted"
                        title="No photo uploaded"
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-input bg-muted px-3 text-xs font-semibold text-foreground transition hover:bg-muted/80">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Upload JPG/PNG</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Safety Protocols & Site Access */}
            <div className="space-y-4 pt-2">
              <h3 className={FORM_PAGE_SECTION_CLASS}>
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <span>2. Safety Protocols & Site Access Parameters</span>
              </h3>

              <div className="border border-border p-4 rounded-md bg-muted">
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-card transition">
                  <Checkbox
                    checked={formSafety}
                    onCheckedChange={(checked) => setFormSafety(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold block text-foreground">Safety contact</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Designated point of contact for safety auditing and incident reporting.
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Safety Instructions / Inductions Mandate</label>
                  <Textarea
                    value={formSafetyInstructions}
                    onChange={(e) => setFormSafetyInstructions(e.target.value)}
                    placeholder="e.g. Standard steel cap boots required. No lone working permitted."
                    className={FORM_PAGE_TEXTAREA_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Site Access & Gate Keycode Notes</label>
                  <Textarea
                    value={formSiteAccessNotes}
                    onChange={(e) => setFormSiteAccessNotes(e.target.value)}
                    placeholder="e.g. Enter via Gate B. Keypad security barrier code is #4092."
                    className={FORM_PAGE_TEXTAREA_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>PPE Requirements (comma-separated list)</label>
                  <Input
                    type="text"
                    value={formPPE}
                    onChange={(e) => setFormPPE(e.target.value)}
                    placeholder="e.g. Hi-Vis Vest, Steel Cap Boots, Hard Hat, Protective Glasses"
                    className={FORM_PAGE_INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={FORM_PAGE_LABEL_CLASS}>Induction Required?</label>
                  <SelectBox
                    value={formInduction ? "Yes" : "No"}
                    onChange={(e) => setFormInduction(e.target.value === "Yes")}
                    className={FORM_PAGE_SELECT_CLASS}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Mandatory)</option>
                  </SelectBox>

                  {formInduction && (
                    <div className="space-y-1.5 pt-1 animate-fade-in">
                      <label className={FORM_PAGE_LABEL_CLASS}>Induction Expiry Date</label>
                      <Input
                        type="date"
                        value={formInductionExpiry}
                        onChange={(e) => setFormInductionExpiry(e.target.value)}
                        className={`${FORM_PAGE_INPUT_CLASS} font-mono`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: General Notes */}
            <div className="space-y-4 pt-2">
              <h3 className={FORM_PAGE_SECTION_CLASS}>
                <FileText className="h-4 w-4 text-warning" />
                <span>3. General Logistics Notes</span>
              </h3>

              <div className="space-y-1.5">
                <label className={FORM_PAGE_LABEL_CLASS}>Operational & Dispatch Notes</label>
                <Textarea
                  value={formGeneralNotes}
                  onChange={(e) => setFormGeneralNotes(e.target.value)}
                  placeholder="e.g. Prefers site dispatches via SMS before truck transit departure. High-priority client."
                  className={FORM_PAGE_TEXTAREA_CLASS}
                />
              </div>
            </div>
          </div>
        </FormPage>
      )}

      {/* EXPORT OPTIONS MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-md max-w-md w-full border border-border shadow-lg overflow-hidden text-xs text-foreground"
            >
              {/* Header */}
              <div className="border-b border-border p-4 flex justify-between items-center bg-muted">
                <div className="flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-info" />
                  <h3 className="text-sm font-bold text-foreground">Export Contacts Report Wizard</h3>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 font-semibold text-foreground">
                <p className="text-xs text-muted-foreground">
                  Exporting contacts based on selected scope:{" "}
                  <span className="font-bold text-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                    {exportType === "filtered" && "Filtered Results"}
                    {exportType === "all" && "All Registry Data"}
                    {exportType === "profile" && "Individual Profile Card"}
                  </span>
                </p>

                {/* Format selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase text-muted-foreground tracking-wider">Target Report File Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "CSV", icon: FileText, label: "CSV" },
                      { id: "Excel", icon: FileSpreadsheet, label: "Excel" },
                      { id: "PDF", icon: FileDown, label: "PDF / Print" }
                    ].map((fmt) => {
                      const Icon = fmt.icon;
                      const isFmtSelected = exportFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setExportFormat(fmt.id as any)}
                          className={`border rounded-md p-3 text-center transition cursor-pointer flex flex-col items-center gap-1.5 font-bold ${isFmtSelected ? "border-primary bg-info/10 text-info" : "border-border bg-card text-foreground hover:bg-muted"}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{fmt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 bg-muted flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-md border border-border bg-card text-xs font-bold text-foreground px-4 py-2 hover:bg-muted transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleExecuteExport}
                  className="rounded-md bg-primary text-xs font-bold text-white px-5 py-2 hover:bg-primary/90 transition cursor-pointer flex items-center gap-1 shadow"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Report</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper to get active customer details stats
const activeCustomerMockStats = (customerId: string, transactions: Transaction[]) => {
  const matchingTxs = transactions.filter(t => t.customerId === customerId);
  const totalTonnes = matchingTxs.reduce((sum, t) => sum + (t.netWeight || 0), 0);
  const totalRevenue = matchingTxs.reduce((sum, t) => sum + (t.totalValue || 0), 0);
  return {
    matchingTxs,
    totalTonnes,
    totalRevenue
  };
};
