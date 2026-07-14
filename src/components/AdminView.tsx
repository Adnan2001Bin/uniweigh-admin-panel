import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Sliders,
  Users2,
  Settings2,
  Check,
  CheckCircle,
  HelpCircle,
  Wrench,
  Plus,
  UserPlus,
  Edit3,
  Lock,
  ShieldCheck,
  Building,
  AlertOctagon,
  Save,
  X,
  Upload,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { AdminUser, Site, DocketConfig } from "../types";
import { MOCK_ROLES, INITIAL_TRANSACTIONS } from "../data";
import { toast } from "sonner";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { isDeveloperRole, getVisibleSites } from "@/src/lib/role-access";
import { readDocketLogo, hasDocketLogo } from "@/src/lib/docket-logo";
import { buildDeliveryDocketHtml } from "@/src/lib/delivery-docket";
import { getPreviewIframeHeight } from "@/src/lib/print-preview";

const DOCKET_PREVIEW_WIDTH_PX = 728;

type BackOfficeOperator = {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  active: string;
};

const INITIAL_BACK_OFFICE_OPERATORS: BackOfficeOperator[] = [
  { id: "op-1", name: "John Davis", email: "john.davis@uniweigh.com", role: "Weighbridge Operator", station: "Melbourne Eastern Quarry", active: "Scale-A2 active" },
  { id: "op-2", name: "Sarah JenkinsK", email: "sarah.k@uniweigh.com", role: "Weighbridge Operator", station: "Bayside Coastal Sands", active: "Scale-C1 active" },
  { id: "op-3", name: "Steve G", email: "steve.g@uniweigh.com", role: "Weighbridge Operator", station: "Western Eco-Recycling Depot", active: "Idle" },
  { id: "op-4", name: "Admin User", email: "admin.user@uniweigh.com", role: "Administrator", station: "HQ Corporate Services", active: "System config active" },
  { id: "op-5", name: "Dev User", email: "dev.user@uniweigh.com", role: "Developer", station: "HQ Corporate Services", active: "System config active" },
];

interface AdminViewProps {
  adminUser: AdminUser;
  subView: "users" | "roles" | "sites" | "docket";
  sites: Site[];
  onUpdateSites: (updatedSites: Site[]) => void;
  siteLimit: number;
  onUpdateSiteLimit: (limit: number) => void;
  docketConfig: DocketConfig;
  onUpdateDocketConfig: (config: DocketConfig) => void;
}

export default function AdminView({
  adminUser,
  subView,
  sites,
  onUpdateSites,
  siteLimit,
  onUpdateSiteLimit,
  docketConfig,
  onUpdateDocketConfig
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "sites" | "docket">(
    subView === "roles"
      ? "roles"
      : subView === "sites"
      ? "sites"
      : subView === "docket"
      ? "docket"
      : "users"
  );

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  const docketPreviewHtml = useMemo(
    () =>
      buildDeliveryDocketHtml(INITIAL_TRANSACTIONS[0], docketConfig, {
        autoPrint: false,
        reprintCopy: false,
      }),
    [docketConfig]
  );

  // States for adding site
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteSupervisor, setNewSiteSupervisor] = useState("");
  const [newSiteScales, setNewSiteScales] = useState("");

  // States for editing site
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingSiteName, setEditingSiteName] = useState("");
  const [editingSiteSupervisor, setEditingSiteSupervisor] = useState("");
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [operators, setOperators] = useState<BackOfficeOperator[]>(() => {
    const saved = localStorage.getItem("uniweigh_back_office_users");
    if (saved) {
      try {
        return JSON.parse(saved) as BackOfficeOperator[];
      } catch {
        // fall through to defaults
      }
    }
    return INITIAL_BACK_OFFICE_OPERATORS;
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [newUserStation, setNewUserStation] = useState("");

  useEffect(() => {
    localStorage.setItem("uniweigh_back_office_users", JSON.stringify(operators));
  }, [operators]);

  const resetAddUserForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("");
    setNewUserStation("");
  };

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
    resetAddUserForm();
  };

  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();

    const name = newUserName.trim();
    const email = newUserEmail.trim().toLowerCase();

    if (!name) {
      toast.info("Please enter the operator name.");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.info("Please enter a valid corporate email address.");
      return;
    }
    if (!newUserRole) {
      toast.info("Please select a system role.");
      return;
    }
    if (!newUserStation) {
      toast.info("Please select an operating station.");
      return;
    }
    if (operators.some((operator) => operator.email.toLowerCase() === email)) {
      toast.error("A user with this email already exists.");
      return;
    }

    const newOperator: BackOfficeOperator = {
      id: `op-${Date.now().toString().slice(-6)}`,
      name,
      email,
      role: newUserRole,
      station: newUserStation,
      active: newUserRole === "Administrator" || newUserRole === "Developer" ? "System config active" : "Idle",
    };

    setOperators((prev) => [...prev, newOperator]);
    toast.success(`User "${name}" added successfully.`);
    closeAddUserModal();
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsLogoUploading(true);
    try {
      const logoUrl = await readDocketLogo(file);
      onUpdateDocketConfig({ ...docketConfig, logoUrl, showLogo: true });
      toast.success(`Logo "${file.name}" uploaded successfully.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload logo.";
      toast.error(message);
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    const { logoUrl: _removed, ...rest } = docketConfig;
    onUpdateDocketConfig(rest);
    toast.success("Logo removed from docket configuration.");
  };

  const mockBackOfficeUsers = operators;
  const isDeveloper = isDeveloperRole(adminUser.role);
  const visibleSitesForLimit = getVisibleSites(sites);
  const visibleRoles = isDeveloper
    ? MOCK_ROLES
    : MOCK_ROLES.filter((role) => role.name !== "Developer");

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">Administration Platform</h1>
        <p className="text-xs text-muted-foreground">Administration / Settings & Users Manager</p>
      </div>

      {/* Nav internal tabs */}
      <div className="flex border-b border-border text-xs sm:text-sm bg-card p-1 rounded-md border max-w-xl flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 min-w-[80px] py-1.5 text-center font-semibold rounded-md transition ${
            activeTab === "users" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Operators
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex-1 min-w-[70px] py-1.5 text-center font-semibold rounded-md transition ${
            activeTab === "roles" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab("sites")}
          className={`flex-1 min-w-[100px] py-1.5 text-center font-semibold rounded-md transition ${
            activeTab === "sites" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sites & Locks
        </button>
        <button
          onClick={() => setActiveTab("docket")}
          className={`flex-1 min-w-[140px] py-1.5 text-center font-semibold rounded-md transition ${
            activeTab === "docket" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Docket Layout
        </button>
      </div>

      {/* Main Canvas layout details */}
      <div className="bg-card border border-border rounded-md shadow-xs p-5">
        
        {/* USERS / OPERATORS TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Weighbridge Operators</h3>
                <p className="text-xs text-muted-foreground mt-1">Logged-in back-office representatives operating physical scales:</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold text-white hover:bg-primary/90 transition cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted border-b border-border font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-2.5">Operator Name</th>
                    <th className="px-4 py-2.5">Corporate Email</th>
                    <th className="px-4 py-2.5">System Role</th>
                    <th className="px-4 py-2.5">Operating Station</th>
                    <th className="px-4 py-2.5 text-center">Duty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground">
                  {mockBackOfficeUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-xs font-medium text-muted-foreground">
                        No operators registered yet. Use Add User to create the first account.
                      </td>
                    </tr>
                  ) : (
                    mockBackOfficeUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted">
                      <td className="px-4 py-4 font-bold text-foreground">{u.name}</td>
                      <td className="px-4 py-4 font-mono text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-4 font-semibold text-foreground">{u.role}</td>
                      <td className="px-4 py-4 text-info font-medium">{u.station}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full font-bold font-mono text-xs px-2 py-0.5 border uppercase ${
                          u.active.toLowerCase() === "idle"
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-success/10 text-success border-success/25 animate-pulse"
                        }`}>
                          {u.active}
                        </span>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLES DICTIONARY */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Operator Role Specifications</h3>
            <p className="text-xs text-muted-foreground mb-3">Role permissions defining weigh ticket adjustments and overrides:</p>

            <div className="grid gap-4 sm:grid-cols-3">
              {visibleRoles.map((role, i) => (
                <div key={i} className="rounded-md border border-border p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">{role.name}</span>
                    <span className="rounded-full bg-info/10 text-info text-xs font-bold px-2 py-0.2">
                      {role.usersCount} users
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCKET CUSTOMIZATION TAB */}
        {activeTab === "docket" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Docket Design & Layout Customization</h3>
                <p className="text-xs text-muted-foreground">Configure legal business entities, contact details, EFT payment parameters, and logo brand settings for professional A4 delivery dockets.</p>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Form panel */}
              <div className="lg:col-span-5 space-y-6 bg-muted p-5 rounded-md border border-border">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-info" />
                    Company Identity Details
                  </h4>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">Trading / Business Name</label>
                    <textarea
                      rows={2}
                      value={docketConfig.businessName}
                      onChange={(e) => onUpdateDocketConfig({ ...docketConfig, businessName: e.target.value })}
                      className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">P.O. Box / Address</label>
                      <input
                        type="text"
                        value={docketConfig.poBox}
                        onChange={(e) => onUpdateDocketConfig({ ...docketConfig, poBox: e.target.value })}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">ABN Number</label>
                      <input
                        type="text"
                        value={docketConfig.abn}
                        onChange={(e) => onUpdateDocketConfig({ ...docketConfig, abn: e.target.value })}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Contact Phone / Mobile</label>
                      <input
                        type="text"
                        value={docketConfig.contact}
                        onChange={(e) => onUpdateDocketConfig({ ...docketConfig, contact: e.target.value })}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Fax Number</label>
                      <input
                        type="text"
                        value={docketConfig.fax}
                        onChange={(e) => onUpdateDocketConfig({ ...docketConfig, fax: e.target.value })}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">Official Email Address</label>
                    <input
                      type="email"
                      value={docketConfig.email}
                      onChange={(e) => onUpdateDocketConfig({ ...docketConfig, email: e.target.value })}
                      className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-success" />
                    EFT Payment Details
                  </h4>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">EFT Account Name</label>
                    <input
                      type="text"
                      value={docketConfig.eftAccountName}
                      onChange={(e) => onUpdateDocketConfig({ ...docketConfig, eftAccountName: e.target.value })}
                      className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">BSB Code</label>
                      <input
                        type="text"
                        value={docketConfig.eftBsb}
                        onChange={(e) => onUpdateDocketConfig({ ...docketConfig, eftBsb: e.target.value })}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Account Number</label>
                      <input
                        type="text"
                        value={docketConfig.eftAccountNo}
                        onChange={(e) => onUpdateDocketConfig({ ...docketConfig, eftAccountNo: e.target.value })}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-info" />
                    Docket Theme & Brand
                  </h4>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">Weighbridge Location Name</label>
                    <input
                      type="text"
                      value={docketConfig.weighbridgeLocation}
                      onChange={(e) => onUpdateDocketConfig({ ...docketConfig, weighbridgeLocation: e.target.value })}
                      className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">Company Logo</label>

                    <div className="rounded-md border border-border bg-card p-3 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted">
                          {hasDocketLogo(docketConfig.logoUrl) ? (
                            <img
                              src={docketConfig.logoUrl}
                              alt="Uploaded company logo"
                              className="max-h-full max-w-full object-contain p-1"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-xs font-semibold text-foreground">
                            {hasDocketLogo(docketConfig.logoUrl) ? "Logo ready for print" : "No logo uploaded yet"}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            PNG, JPG, WebP, or SVG up to 2 MB.
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition">
                              <Upload className="h-3.5 w-3.5" />
                              <span>
                                {isLogoUploading
                                  ? "Uploading..."
                                  : hasDocketLogo(docketConfig.logoUrl)
                                  ? "Replace logo"
                                  : "Upload logo"}
                              </span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
                                onChange={handleLogoUpload}
                                disabled={isLogoUploading}
                                className="hidden"
                              />
                            </label>
                            {hasDocketLogo(docketConfig.logoUrl) && (
                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/25 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-border pt-3">
                        <Checkbox
                          id="showLogoCheckbox"
                          checked={docketConfig.showLogo}
                          onCheckedChange={(checked) =>
                            onUpdateDocketConfig({ ...docketConfig, showLogo: Boolean(checked) })
                          }
                          className="h-4 w-4 text-info rounded border-input focus:ring-ring"
                        />
                        <label htmlFor="showLogoCheckbox" className="text-xs font-bold text-foreground cursor-pointer">
                          Display Logo on Docket
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive preview panel */}
              <div className="lg:col-span-7 flex min-w-0 flex-col items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success animate-ping"></span>
                  Live A4 Docket Preview (Scale Adjusted)
                </span>

                <div className="w-full rounded-md border border-border bg-muted p-4 shadow-inner overflow-x-auto">
                  <div
                    className="mx-auto w-full overflow-hidden rounded-md border border-input bg-white shadow-lg"
                    style={{ maxWidth: `${DOCKET_PREVIEW_WIDTH_PX}px` }}
                  >
                    <iframe
                      title="Delivery docket preview"
                      srcDoc={docketPreviewHtml}
                      className="w-full border-0 block"
                      style={{ height: getPreviewIframeHeight(DOCKET_PREVIEW_WIDTH_PX) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "sites" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Developer Access & System Locking Controls Dashboard */}
            <div className="rounded-md border border-warning/30 bg-warning/10 p-5 space-y-4">
              <div className="flex items-center gap-2.5 text-warning">
                <Lock className="h-5 w-5 text-warning" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Developer License Control & Site Dispatch Locks
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                {isDeveloper
                  ? "Configure concurrent site access restrictions to comply with site licensing limits. Restricting allowed sites locks all other quarry scale beds and restricts the active location selector in the header."
                  : "View-only license status. Only a Developer can change the active site mode. The highlighted card shows the mode currently in effect."}
              </p>

              {/* Grid of Licensing Limit Options */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                
                {/* 1 Site Limit */}
                <button
                  type="button"
                  disabled={!isDeveloper}
                  onClick={() => {
                    if (!isDeveloper) return;
                    onUpdateSiteLimit(1);
                    toast.error("Developer System Lock updated: Access restricted to 1 Site only. Other weighbridge stations are locked.");
                  }}
                  className={`flex flex-col text-left p-4 rounded-md border transition-all ${
                    siteLimit === 1
                      ? "border-warning bg-warning/10 ring-2 ring-warning"
                      : "border-border bg-card"
                  } ${isDeveloper ? "cursor-pointer hover:border-input" : "cursor-default opacity-90"}`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-foreground uppercase">Single Site Mode</span>
                    {siteLimit === 1 && (
                      <span className="inline-flex items-center rounded-full bg-warning/10 text-warning text-xs font-bold px-2 py-0.5">
                        Active Lock
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-foreground">1 Site Limit</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    Locks tertiary & secondary stations. Only the primary quarry scale is operational.
                  </p>
                </button>

                {/* 2 Sites Limit */}
                <button
                  type="button"
                  disabled={!isDeveloper}
                  onClick={() => {
                    if (!isDeveloper) return;
                    onUpdateSiteLimit(2);
                    toast.error("Developer System Lock updated: Access restricted to 2 Sites only. Tertiary stations are locked.");
                  }}
                  className={`flex flex-col text-left p-4 rounded-md border transition-all ${
                    siteLimit === 2
                      ? "border-warning bg-warning/10 ring-2 ring-warning"
                      : "border-border bg-card"
                  } ${isDeveloper ? "cursor-pointer hover:border-input" : "cursor-default opacity-90"}`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-foreground uppercase">Dual Site Mode</span>
                    {siteLimit === 2 && (
                      <span className="inline-flex items-center rounded-full bg-warning/10 text-warning text-xs font-bold px-2 py-0.5">
                        Active Lock
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-foreground">2 Sites Limit</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    Locks tertiary stations. Only the first two registered scale stations remain active.
                  </p>
                </button>

                {/* Unlimited Limit */}
                <button
                  type="button"
                  disabled={!isDeveloper}
                  onClick={() => {
                    if (!isDeveloper) return;
                    onUpdateSiteLimit(99);
                    toast.success("Developer System Lock cleared: Unlimited access. All weighbridge sites operational.");
                  }}
                  className={`flex flex-col text-left p-4 rounded-md border transition-all ${
                    siteLimit >= visibleSitesForLimit.length
                      ? "border-success bg-success/10 ring-2 ring-success"
                      : "border-border bg-card"
                  } ${isDeveloper ? "cursor-pointer hover:border-input" : "cursor-default opacity-90"}`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-foreground uppercase">Unlimited Enterprise</span>
                    {siteLimit >= visibleSitesForLimit.length && (
                      <span className="inline-flex items-center rounded-full bg-success/10 text-success text-xs font-bold px-2 py-0.5">
                        No Lock
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-foreground">All Sites Active</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    Enterprise tier. All registered site weighbridge scale configurations are accessible.
                  </p>
                </button>

              </div>
            </div>

            {/* List and Configuration of Sites */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Registered Weighbridge Locations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage station parameters, supervisors, and scale profiles below.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border border-border bg-card">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-border font-bold text-muted-foreground uppercase tracking-wider text-xs">
                      <th className="px-4 py-3">Site Station Name</th>
                      <th className="px-4 py-3">Site Supervisor</th>
                      <th className="px-4 py-3 text-center">Active Scales</th>
                      <th className="px-4 py-3">Operational Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm text-foreground">
                    {sites.map((site) => {
                      const visibleIndex = visibleSitesForLimit.findIndex((s) => s.id === site.id);
                      const isPending = site.status === "PendingApproval";
                      const isInactive = site.status === "Inactive";
                      const isRestricted = !isPending && !isInactive && visibleIndex >= 0 && visibleIndex >= siteLimit;
                      const isEditing = editingSiteId === site.id;

                      return (
                        <tr
                          key={site.id}
                          className={`hover:bg-muted transition-colors ${
                            isRestricted || isInactive ? "bg-muted/60 text-muted-foreground" : ""
                          }`}
                        >
                          {/* Name field (supports editing) */}
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <div className="flex items-center gap-2 max-w-sm">
                                <input
                                  type="text"
                                  value={editingSiteName}
                                  onChange={(e) => setEditingSiteName(e.target.value)}
                                  className="rounded border border-input bg-card px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-ring focus:outline-none w-full font-bold"
                                  placeholder="Site Name"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 font-bold text-foreground">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{site.name}</span>
                              </div>
                            )}
                            <div className="font-mono text-xs text-muted-foreground mt-0.5">
                              ID: {site.id}
                              {!isPending && !isInactive && visibleIndex >= 0
                                ? ` • Position: Site #${visibleIndex + 1}`
                                : isPending
                                ? " • Awaiting developer approval"
                                : isInactive
                                ? " • Hidden from all views"
                                : ""}
                            </div>
                          </td>

                          {/* Supervisor field (supports editing) */}
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingSiteSupervisor}
                                onChange={(e) => setEditingSiteSupervisor(e.target.value)}
                                className="rounded border border-input bg-card px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                                placeholder="Supervisor"
                              />
                            ) : (
                              <span className="font-medium text-muted-foreground">{site.operatorName}</span>
                            )}
                          </td>

                          {/* Active scales count */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex rounded-md bg-muted border border-border text-foreground text-xs font-bold font-mono px-2 py-0.5">
                              {site.scaleCount} scales
                            </span>
                          </td>

                          {/* Status and Locks */}
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {isPending ? (
                                <span className="inline-flex items-center rounded-sm bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-warning/30">
                                  Send for Approval
                                </span>
                              ) : isInactive ? (
                                <span className="inline-flex items-center rounded-sm bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-border">
                                  Inactive
                                </span>
                              ) : isRestricted ? (
                                <span className="inline-flex items-center rounded-sm bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-destructive/25">
                                  <Lock className="h-2.5 w-2.5 mr-1" />
                                  Access Locked
                                </span>
                              ) : site.status === "Active" ? (
                                <span className="inline-flex items-center rounded-sm bg-success/10 text-success text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-success/25">
                                  ● Operational
                                </span>
                              ) : site.status === "Locked" ? (
                                <span className="inline-flex items-center rounded-sm bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-destructive/25">
                                  <Lock className="h-2.5 w-2.5 mr-1" />
                                  Manual Lock
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-sm bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-warning/30">
                                  ⚠️ Maintenance
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!editingSiteName.trim()) {
                                        toast.error("Site name is required.");
                                        return;
                                      }
                                      const updated = sites.map((s) =>
                                        s.id === site.id
                                          ? {
                                              ...s,
                                              name: editingSiteName.trim(),
                                              operatorName: editingSiteSupervisor.trim() || "Unassigned"
                                            }
                                          : s
                                      );
                                      onUpdateSites(updated);
                                      setEditingSiteId(null);
                                      toast.success(`Weighbridge station renamed successfully.`);
                                    }}
                                    className="p-1 rounded bg-success/10 text-success hover:bg-success/10 transition cursor-pointer"
                                    title="Save changes"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSiteId(null)}
                                    className="p-1 rounded bg-muted text-muted-foreground hover:bg-secondary transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSiteId(site.id);
                                      setEditingSiteName(site.name);
                                      setEditingSiteSupervisor(site.operatorName);
                                    }}
                                    className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-info transition cursor-pointer"
                                    title="Rename & edit site"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>

                                  {isPending ? (
                                    isDeveloper ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = sites.map((s) =>
                                            s.id === site.id ? { ...s, status: "Active" as const } : s
                                          );
                                          onUpdateSites(updated);
                                          toast.success(
                                            `Site "${site.name}" approved. It is now operational and available everywhere.`
                                          );
                                        }}
                                        className="rounded border border-success/25 bg-success/10 px-2 py-1 text-xs font-bold text-success hover:bg-success/10 transition cursor-pointer"
                                        title="Approve site for operational use"
                                      >
                                        Approve
                                      </button>
                                    ) : (
                                      <span className="text-xs font-medium text-muted-foreground px-1">
                                        Awaiting developer
                                      </span>
                                    )
                                  ) : isInactive ? null : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newStatus =
                                          site.status === "Active"
                                            ? "Locked"
                                            : site.status === "Locked"
                                            ? "Maintenance"
                                            : "Active";
                                        const updated = sites.map((s) =>
                                          s.id === site.id ? { ...s, status: newStatus } : s
                                        );
                                        onUpdateSites(updated);
                                      }}
                                      className="rounded border border-border bg-card px-2 py-1 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                                      title="Toggle operational states"
                                    >
                                      Cycle State
                                    </button>
                                  )}

                                  {!isPending && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isInactive) {
                                          const updated = sites.map((s) =>
                                            s.id === site.id ? { ...s, status: "Active" as const } : s
                                          );
                                          onUpdateSites(updated);
                                          toast.success(
                                            `Site "${site.name}" is active and available everywhere.`
                                          );
                                          return;
                                        }

                                        if (visibleSitesForLimit.length <= 1) {
                                          toast.error(
                                            "At least one active site must remain available across the platform."
                                          );
                                          return;
                                        }

                                        const updated = sites.map((s) =>
                                          s.id === site.id ? { ...s, status: "Inactive" as const } : s
                                        );
                                        onUpdateSites(updated);
                                        toast.info(
                                          `Site "${site.name}" is inactive and hidden from all views.`
                                        );
                                      }}
                                      className={`rounded border px-2 py-1 text-xs font-bold transition cursor-pointer ${
                                        isInactive
                                          ? "border-success/25 bg-success/10 text-success hover:bg-success/10"
                                          : "border-border bg-card text-foreground hover:bg-muted"
                                      }`}
                                      title={isInactive ? "Set site active" : "Set site inactive"}
                                    >
                                      {isInactive ? "Set Active" : "Set Inactive"}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form to Provision a New site */}
            <div className="rounded-md border border-border p-5 bg-muted">
              <div className="grid gap-6 md:grid-cols-12 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-info" />
                    Register New Quarry Bed Site
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isDeveloper
                      ? "Developer sites go operational immediately and appear in the location selector everywhere."
                      : "Admin submissions are sent for developer approval. They will not appear elsewhere until approved."}
                  </p>
                </div>

                <div className="md:col-span-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      New Site Name
                    </label>
                    <input
                      type="text"
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      placeholder="e.g. Northern Silica Quarry"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      Assigned Supervisor Name
                    </label>
                    <input
                      type="text"
                      value={newSiteSupervisor}
                      onChange={(e) => setNewSiteSupervisor(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      Scales count
                    </label>
                    <SelectBox
                      value={newSiteScales}
                      onChange={(e) => setNewSiteScales(e.target.value)}
                      className="h-9 w-full text-xs"
                    >
                      <option value="">Select scale count…</option>
                      <option value={1}>1 Scale Bed</option>
                      <option value={2}>2 Scale Beds</option>
                      <option value={3}>3 Scale Beds</option>
                    </SelectBox>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                        if (!newSiteName.trim()) {
                          toast.info("Please specify a site name.");
                          return;
                        }
                        if (!newSiteScales) {
                          toast.info("Please select a scales count.");
                          return;
                        }
                        const siteName = newSiteName.trim();
                        const newSiteObj: Site = {
                          id: `site-${Date.now().toString().slice(-4)}`,
                          name: siteName,
                          status: isDeveloper ? "Active" : "PendingApproval",
                          scaleCount: Number(newSiteScales),
                          operatorName: newSiteSupervisor.trim() || "Unassigned"
                        };
                        const updated = [...sites, newSiteObj];
                        onUpdateSites(updated);

                        if (isDeveloper) {
                          const visibleCount = getVisibleSites(updated).length;
                          if (visibleCount > siteLimit) {
                            toast.error(
                              `Site "${siteName}" is operational, but exceeds the active Developer access limit (${siteLimit} sites). Increase the allowed site limit above to unlock it in the header.`
                            );
                          } else {
                            toast.success(`Site "${siteName}" is now operational and available everywhere.`);
                          }
                        } else {
                          toast.info(
                            `Site "${siteName}" submitted for approval. A developer must approve it before it becomes operational.`
                          );
                        }

                        setNewSiteName("");
                        setNewSiteSupervisor("");
                        setNewSiteScales("");
                    }}
                    className="h-9 shrink-0 rounded-md bg-primary hover:bg-primary/90 text-xs font-bold text-white px-4 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    {isDeveloper ? "Add Site" : "Send for Approval"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={closeAddUserModal}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-xs"
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-info" />
                <h3 className="text-sm font-bold text-foreground">Register New Operator</h3>
              </div>
              <button
                type="button"
                onClick={closeAddUserModal}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                aria-label="Close add user dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase">Operator Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase">Corporate Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. marcus.vance@uniweigh.com"
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase">System Role</label>
                <SelectBox
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="h-9 w-full text-xs"
                >
                  <option value="">Select role…</option>
                  {visibleRoles.map((role) => (
                    <option key={role.name} value={role.name}>{role.name}</option>
                  ))}
                </SelectBox>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase">Operating Station</label>
                <SelectBox
                  value={newUserStation}
                  onChange={(e) => setNewUserStation(e.target.value)}
                  className="h-9 w-full text-xs"
                >
                  <option value="">Select station…</option>
                  <option value="HQ Corporate Services">HQ Corporate Services</option>
                  {visibleSitesForLimit.map((site) => (
                    <option key={site.id} value={site.name}>{site.name}</option>
                  ))}
                </SelectBox>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  className="h-9 rounded-md border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 rounded-md bg-primary px-4 text-xs font-bold text-white hover:bg-primary/90 transition cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
