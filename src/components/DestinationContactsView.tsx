import React, { useState, useEffect } from "react";
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
import { RadioBox } from "@/src/components/ui/radio-group";
import PageHeader, { PAGE_HEADER_ADD_BUTTON_CLASS } from "@/src/components/shared/PageHeader";
import FormPage, {
  FORM_PAGE_INPUT_CLASS,
  FORM_PAGE_SELECT_CLASS,
  FORM_PAGE_TEXTAREA_CLASS,
  FORM_PAGE_ACTION_CLASS,
  FORM_PAGE_SECTION_CLASS,
  FORM_PAGE_LABEL_CLASS,
} from "@/src/components/shared/FormPage";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "@/src/components/shared/table-action-styles";

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
  transactions
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
  const [currentMode, setCurrentMode] = useState<"list" | "detail" | "form">("list");
  const [selectedContact, setSelectedContact] = useState<DestinationContact | null>(null);
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
  const [showFiltersDropdown, setShowFiltersDropdown] = useState<boolean>(false);

  // Selection
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

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
  const [exportType, setExportType] = useState<string>("all_filtered"); // all_filtered, selected, safety, site_access, emergency, profile
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

  // Filter application
  const activeSearch = localSearchQuery || globalSearchQuery;
  const filteredContacts = contacts.filter(c => {
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

  // Batch Selection
  const toggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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

  // Exports processor
  const handleExecuteExport = () => {
    let dataToExport: DestinationContact[] = [];

    if (exportType === "all_filtered") {
      dataToExport = filteredContacts;
    } else if (exportType === "selected") {
      dataToExport = contacts.filter(c => selectedContactIds.includes(c.id));
      if (dataToExport.length === 0) {
        showToast("Error: No contacts selected for export.");
        setShowExportModal(false);
        return;
      }
    } else if (exportType === "safety") {
      dataToExport = contacts.filter(c => c.isSafetyContact);
    } else if (exportType === "site_access") {
      dataToExport = contacts.filter(c => c.isSiteAccessContact);
    } else if (exportType === "emergency") {
      dataToExport = contacts.filter(c => c.isEmergencyContact);
    } else if (exportType === "profile" && selectedContact) {
      dataToExport = [selectedContact];
    } else {
      dataToExport = filteredContacts;
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
    <div className="space-y-6" id="destination-contacts-module">
      
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleInitAddContact}
                  className={PAGE_HEADER_ADD_BUTTON_CLASS}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Contact</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="Synchronize Contacts list"
                  className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-info" : ""}`} />
                </button>
              </div>
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

          {/* Search, Filter, Column Visibility Toolbar */}
          <div className="bg-card border border-border rounded-md p-5 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contacts by name, role, email, phone or code..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-md text-xs placeholder:text-muted-foreground focus:outline-none focus:border-info focus:ring-1 focus:ring-info"
                />
                {activeSearch && (
                  <button
                    onClick={() => { setLocalSearchQuery(""); }}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters toggle & selections */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                  className={`rounded-md border px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${showFiltersDropdown ? "bg-muted border-ring text-info" : "bg-card border-border text-foreground hover:bg-muted"}`}
                >
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span>Filters</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                <button
                  onClick={() => {
                    setExportType("all_filtered");
                    setShowExportModal(true);
                  }}
                  className="rounded-md border border-border bg-card text-xs font-bold text-foreground px-4 py-2.5 hover:bg-muted transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="h-4 w-4 text-info" />
                  <span>Export Reports</span>
                </button>

                {/* Filter Chip Cleaners */}
                {(filterCustomer !== "All" || filterStatus !== "All" || filterSafety !== "All" || filterSiteAccess !== "All" || filterEmergency !== "All" || filterCreatedDate !== "All" || filterLastUsedDate !== "All") && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-info hover:text-info font-bold transition flex items-center gap-1"
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
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border text-xs font-semibold text-foreground"
              >
                {/* Customer Selector */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Company Customer</label>
                  <SelectBox
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Customers</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </SelectBox>
                </div>

                {/* Status Selector */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Communication Status</label>
                  <SelectBox
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </SelectBox>
                </div>

                {/* Safety Contact Indicator */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Safety contact</label>
                  <SelectBox
                    value={filterSafety}
                    onChange={(e) => setFilterSafety(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="Yes">Yes (Safety Coordinator)</option>
                    <option value="No">No</option>
                  </SelectBox>
                </div>

                {/* Site Access Contact Indicator */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Site access contact</label>
                  <SelectBox
                    value={filterSiteAccess}
                    onChange={(e) => setFilterSiteAccess(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Access</option>
                    <option value="Yes">Yes (Site Access Approved)</option>
                    <option value="No">No</option>
                  </SelectBox>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Emergency dispatch contact</label>
                  <SelectBox
                    value={filterEmergency}
                    onChange={(e) => setFilterEmergency(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Emergency</option>
                    <option value="Yes">Yes (Emergency Responder)</option>
                    <option value="No">No</option>
                  </SelectBox>
                </div>

                {/* Created Date */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Created Year</label>
                  <SelectBox
                    value={filterCreatedDate}
                    onChange={(e) => setFilterCreatedDate(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Dates</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </SelectBox>
                </div>

                {/* Last Used Date */}
                <div className="space-y-1">
                  <label className="block text-xs uppercase text-muted-foreground">Last Used Year</label>
                  <SelectBox
                    value={filterLastUsedDate}
                    onChange={(e) => setFilterLastUsedDate(e.target.value)}
                    className="w-full border border-border bg-card rounded-md p-1.5 focus:outline-none"
                  >
                    <option value="All">All Dates</option>
                    <option value="2026">2026</option>
                    <option value="N/A">Unused (N/A)</option>
                  </SelectBox>
                </div>
              </motion.div>
            )}
          </div>

          {/* Table Directory */}
          <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    <th className="px-4 py-3.5">Contact ID</th>
                    <th className="px-4 py-3.5">Contact Name</th>
                    <th className="px-4 py-3.5">Associated Company / Customer</th>
                    <th className="px-4 py-3.5">Phone</th>
                    <th className="px-4 py-3.5">Mobile</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5 text-center">Safety Contact</th>
                    <th className="px-4 py-3.5 text-center">Site Access Contact</th>
                    <th className="px-4 py-3.5 text-center">Emergency Contact</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs text-foreground">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-muted-foreground font-medium">
                        No destination contacts matched the given filters or search inputs.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map(c => {
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedContact(c);
                            setDetailTab("overview");
                            setCurrentMode("detail");
                          }}
                        >
                          <td className="px-4 py-3.5 font-mono font-bold text-muted-foreground">
                            {c.id}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-foreground hover:text-info hover:underline">
                            {c.name}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-foreground">
                            {c.customerName}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-muted-foreground">
                            {c.phone || "N/A"}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-muted-foreground">
                            {c.mobile || "N/A"}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-foreground select-all">
                            {c.email || "N/A"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {c.isSafetyContact ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 border border-success/25 rounded px-1.5 py-0.5">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {c.isSiteAccessContact ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-info bg-info/10 border border-info/25 rounded px-1.5 py-0.5">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {c.isEmergencyContact ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/25 rounded px-1.5 py-0.5">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-sm px-1.5 py-0.2 text-xs font-bold uppercase tracking-wider ${
                                c.status === "Active"
                                  ? "bg-success/10 text-success border border-success/25"
                                  : "bg-destructive/10 text-destructive border border-destructive/25"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedContact(c);
                                  setDetailTab("overview");
                                  setCurrentMode("detail");
                                }}
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
            <div className="bg-muted border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground font-medium">
              <div>
                Showing <span className="font-bold text-foreground">{filteredContacts.length}</span> of <span className="font-bold text-foreground">{contacts.length}</span> registered contacts.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: PROFILE PAGE VIEW (FULL-PAGE, RENDERED DIRECTLY, NO SIDE-DRAWER) */}
      {currentMode === "detail" && selectedContact && (
        <div className="space-y-6 animate-fade-in" id="contact-detail-page">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setCurrentMode("list");
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Directory</span>
              </button>

              <div className="h-12 w-12 rounded-full border border-info/25 overflow-hidden shadow-sm shrink-0">
                {selectedContact.photoUrl ? (
                  <img
                    src={selectedContact.photoUrl}
                    alt={selectedContact.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-info to-info text-white flex items-center justify-center font-bold text-base">
                    {getInitials(selectedContact.name)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">
                    {selectedContact.name}
                  </h1>
                  <span
                    className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      selectedContact.status === "Active"
                        ? "bg-success/10 text-success border border-success/25"
                        : "bg-destructive/10 text-destructive border border-destructive/25"
                    }`}
                  >
                    {selectedContact.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  ID: <span className="font-bold">{selectedContact.id}</span> | Code: <span className="font-semibold text-foreground">{selectedContact.contactCode}</span> | Customer: <span className="font-bold text-info">{selectedContact.customerName}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleInitEditContact(selectedContact)}
                className="rounded-md border border-border bg-card text-xs font-bold text-foreground px-4 py-2 hover:bg-muted transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit className="h-4 w-4 text-success" />
                <span>Edit Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  setExportType("profile");
                  setShowExportModal(true);
                }}
                className="rounded-md border border-border bg-card text-xs font-bold text-foreground px-4 py-2 hover:bg-muted transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="h-4 w-4 text-info" />
                <span>Export Profile Report</span>
              </button>

              <button
                onClick={() => handleDeleteContact(selectedContact.id)}
                className="rounded-md border border-destructive/25 bg-destructive/10 text-xs font-bold text-destructive px-4 py-2 hover:bg-destructive/10 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Contact</span>
              </button>
            </div>
          </div>

          {/* CONTACT SUMMARY CARD */}
          <div className="bg-card border border-border rounded-md shadow-sm p-6 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <User className="h-4 w-4 text-info" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact ID</span>
                    <span className="font-mono font-bold text-foreground">{selectedContact.id}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Code</span>
                    <span className="font-mono font-bold text-foreground">{selectedContact.contactCode}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Name</span>
                    <span className="font-bold text-foreground text-sm block mt-0.5">{selectedContact.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Associated Company / Customer</span>
                    <span className="font-semibold text-foreground block mt-0.5">{selectedContact.customerName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Role / Position</span>
                    <span className="font-semibold text-foreground block mt-0.5">{selectedContact.role || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</span>
                    <span className="font-semibold text-foreground font-mono block mt-0.5">{selectedContact.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile</span>
                    <span className="font-semibold text-foreground font-mono block mt-0.5">{selectedContact.mobile || "N/A"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                    <span className="font-semibold text-info font-mono block mt-0.5 break-all select-all">{selectedContact.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                      selectedContact.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>{selectedContact.status}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Safety & Site Access Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Safety & Site Access</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Safety Contact</span>
                    <span className={`font-bold block mt-0.5 ${selectedContact.isSafetyContact ? "text-success" : "text-muted-foreground"}`}>
                      {selectedContact.isSafetyContact ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Access Contact</span>
                    <span className={`font-bold block mt-0.5 ${selectedContact.isSiteAccessContact ? "text-info" : "text-muted-foreground"}`}>
                      {selectedContact.isSiteAccessContact ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Emergency Contact</span>
                    <span className={`font-bold block mt-0.5 ${selectedContact.isEmergencyContact ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
                      {selectedContact.isEmergencyContact ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Induction Required</span>
                    <span className="font-semibold block mt-0.5">{selectedContact.inductionRequired ? "Yes" : "No"}</span>
                  </div>
                  {selectedContact.inductionRequired && (
                    <div className="col-span-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Induction Expiry Date</span>
                      <span className="font-semibold text-foreground font-mono block mt-0.5">{selectedContact.inductionExpiryDate || "N/A"}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">PPE Requirements</span>
                    <span className="font-semibold text-foreground block mt-0.5">{selectedContact.ppeRequirements || "N/A"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Safety Instructions</span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic mt-0.5 line-clamp-2" title={selectedContact.safetyInstructions}>
                      {selectedContact.safetyInstructions || "No explicit safety instructions specified."}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Access Notes</span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic mt-0.5 line-clamp-2" title={selectedContact.siteAccessNotes}>
                      {selectedContact.siteAccessNotes || "No site access notes logged."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: Notes Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <FileText className="h-4 w-4 text-warning" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">General Notes</span>
                    <p className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-line bg-muted p-3 rounded-md border border-border mt-1 max-h-56 overflow-y-auto">
                      {selectedContact.notes || "No general operational notes recorded."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* End of Summary Card */}
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
                
                {/* Scope selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase text-muted-foreground tracking-wider">Report scope & Filter target</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded">
                      <RadioBox checked={exportType === "all_filtered"} onChange={() => setExportType("all_filtered")} />
                      <div>
                        <span className="font-bold text-foreground block">All current directory entries ({filteredContacts.length})</span>
                        <span className="text-xs text-muted-foreground font-medium">Exports all contacts matching current active search & filters.</span>
                      </div>
                    </label>

                    {selectedContactIds.length > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded">
                        <RadioBox checked={exportType === "selected"} onChange={() => setExportType("selected")} />
                        <div>
                          <span className="font-bold text-info block">Selected entries ({selectedContactIds.length})</span>
                          <span className="text-xs text-muted-foreground font-medium">Exports only checked table rows.</span>
                        </div>
                      </label>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded">
                      <RadioBox checked={exportType === "safety"} onChange={() => setExportType("safety")} />
                      <div>
                        <span className="font-bold text-success block">Safety contacts report</span>
                        <span className="text-xs text-muted-foreground font-medium">Generates listing focusing purely on safety coordinators.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded">
                      <RadioBox checked={exportType === "site_access"} onChange={() => setExportType("site_access")} />
                      <div>
                        <span className="font-bold text-info block">Site access contacts report</span>
                        <span className="text-xs text-muted-foreground font-medium">Listing of contacts certified for driver induction gating.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded">
                      <RadioBox checked={exportType === "emergency"} onChange={() => setExportType("emergency")} />
                      <div>
                        <span className="font-bold text-destructive block">Emergency contacts report</span>
                        <span className="text-xs text-muted-foreground font-medium">Evacuation and emergency responders dispatcher report.</span>
                      </div>
                    </label>

                    {selectedContact && currentMode === "detail" && (
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded">
                        <RadioBox checked={exportType === "profile"} onChange={() => setExportType("profile")} />
                        <div>
                          <span className="font-bold text-info block">Individual Contact Profile card</span>
                          <span className="text-xs text-muted-foreground font-medium">Export all safety, access, and details for {selectedContact.name}.</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

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
