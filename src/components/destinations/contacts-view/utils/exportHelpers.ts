import { DestinationContact } from "../../../../types";

export type ContactsExportType =
  | "all_filtered"
  | "selected"
  | "safety"
  | "site_access"
  | "emergency"
  | "profile";
export type ContactsExportFormat = "CSV" | "Excel" | "PDF";

interface ExecuteExportParams {
  exportType: ContactsExportType;
  exportFormat: ContactsExportFormat;
  filteredContacts: DestinationContact[];
  contacts: DestinationContact[];
  selectedContactIds: string[];
  selectedContact: DestinationContact | null;
  showToast: (msg: string) => void;
  onComplete: () => void;
}

export function executeContactsExport(params: ExecuteExportParams) {
  const {
    exportType,
    exportFormat,
    filteredContacts,
    contacts,
    selectedContactIds,
    selectedContact,
    showToast,
    onComplete,
  } = params;

  let dataToExport: DestinationContact[] = [];

  if (exportType === "all_filtered") {
    dataToExport = filteredContacts;
  } else if (exportType === "selected") {
    dataToExport = contacts.filter((c) => selectedContactIds.includes(c.id));
    if (dataToExport.length === 0) {
      showToast("Error: No contacts selected for export.");
      onComplete();
      return;
    }
  } else if (exportType === "safety") {
    dataToExport = contacts.filter((c) => c.isSafetyContact);
  } else if (exportType === "site_access") {
    dataToExport = contacts.filter((c) => c.isSiteAccessContact);
  } else if (exportType === "emergency") {
    dataToExport = contacts.filter((c) => c.isEmergencyContact);
  } else if (exportType === "profile" && selectedContact) {
    dataToExport = [selectedContact];
  } else {
    dataToExport = filteredContacts;
  }

  const reportName = `Uniweigh_Contacts_Report_${exportType}_${
    new Date().toISOString().split("T")[0]
  }`;

  if (exportFormat === "CSV" || exportFormat === "Excel") {
    const formattedData = dataToExport.map((c) => ({
      "Contact ID": c.id,
      "Contact Code": c.contactCode,
      "Contact Name": c.name,
      "Customer Name": c.customerName,
      "Role / Position": c.role,
      Phone: c.phone,
      Mobile: c.mobile,
      Email: c.email,
      "Is Safety Contact": c.isSafetyContact ? "Yes" : "No",
      "Is Site Access Contact": c.isSiteAccessContact ? "Yes" : "No",
      "Is Emergency Contact": c.isEmergencyContact ? "Yes" : "No",
      Status: c.status,
      "Last Used Date": c.lastUsedDate || "N/A",
      "Created On": c.createdOn,
      "Created By": c.createdBy,
      "Induction Required": c.inductionRequired ? "Yes" : "No",
      "PPE Requirements": c.ppeRequirements || "N/A",
    }));

    const headers = Object.keys(formattedData[0] || {}).join(",");
    const rows = formattedData.map((item) =>
      Object.values(item)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${reportName}.${exportFormat === "Excel" ? "xls" : "csv"}`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      `Successfully downloaded ${exportFormat} export report: ${dataToExport.length} entries.`,
    );
  } else {
    const printContent = `
        UNIWEIGH LOGISTICS GATEWAY - ENTERPRISE DESTINATION CONTACTS PROFILE REPORT
        Generated Date: ${new Date().toLocaleString()}
        Scope: ${exportType.toUpperCase()} | Count: ${dataToExport.length}
        ========================================================================

        ${dataToExport
          .map(
            (c) => `
        Contact: [${c.id}] ${c.name} (${c.contactCode}) - Status: ${c.status}
        Company Customer: ${c.customerName}
        Role/Position: ${c.role} | Phone: ${c.phone} | Mobile: ${c.mobile}
        Email Address: ${c.email}
        Flags: Safety Contact: ${c.isSafetyContact ? "YES" : "NO"} | Site Access: ${c.isSiteAccessContact ? "YES" : "NO"} | Emergency Contact: ${c.isEmergencyContact ? "YES" : "NO"}
        Safety Instructions: ${c.safetyInstructions || "Standard protocols apply"}
        Access Notes: ${c.siteAccessNotes || "Standard gate access"}
        PPE Rules: ${c.ppeRequirements || "Hi-Vis, Steel Caps"}
        Induction Status: ${c.inductionRequired ? `Induction Required (Expires: ${c.inductionExpiryDate || "N/A"})` : "No induction mandated"}
        ------------------------------------------------------------------------`,
          )
          .join("\n")}
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

    showToast(
      "Successfully downloaded printable PDF raw report format (.txt extension).",
    );
  }

  onComplete();
}
