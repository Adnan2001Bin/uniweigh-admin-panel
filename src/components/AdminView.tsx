import React, { useState, useEffect } from "react";
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
  Trash,
  Edit3,
  Lock,
  ShieldCheck,
  Building,
  AlertOctagon,
  Save,
  X
} from "lucide-react";
import { AdminUser, Site, DocketConfig } from "../types";
import { MOCK_ROLES } from "../data";
import { toast } from "sonner";
import { confirmDialog } from "@/src/components/shared/dialog-service";
import { SelectBox } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";

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

  // States for adding site
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteSupervisor, setNewSiteSupervisor] = useState("");
  const [newSiteScales, setNewSiteScales] = useState(2);

  // States for editing site
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingSiteName, setEditingSiteName] = useState("");
  const [editingSiteSupervisor, setEditingSiteSupervisor] = useState("");

  const mockBackOfficeUsers = [
    { name: "John Davis", email: "john.davis@uniweigh.com", role: "Weighbridge Operator", station: "Melbourne Eastern Quarry", active: "Scale-A2 active" },
    { name: "Sarah JenkinsK", email: "sarah.k@uniweigh.com", role: "Weighbridge Operator", station: "Bayside Coastal Sands", active: "Scale-C1 active" },
    { name: "Steve G", email: "steve.g@uniweigh.com", role: "Weighbridge Operator", station: "Western Eco-Recycling Depot", active: "Idle" },
    { name: "Admin User", email: "admin.user@uniweigh.com", role: "Administrator", station: "HQ Corporate Services", active: "System config active" }
  ];

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
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Weighbridge Operators</h3>
            <p className="text-xs text-muted-foreground mb-3">Logged-in back-office representatives operating physical scales:</p>

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
                  {mockBackOfficeUsers.map((u, idx) => (
                    <tr key={idx} className="hover:bg-muted">
                      <td className="px-4 py-4 font-bold text-foreground">{u.name}</td>
                      <td className="px-4 py-4 font-mono text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-4 font-semibold text-foreground">{u.role}</td>
                      <td className="px-4 py-4 text-info font-medium">{u.station}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex rounded-full bg-success/10 text-success font-bold font-mono text-xs px-2 py-0.5 border border-success/25 uppercase animate-pulse">
                          {u.active}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              {MOCK_ROLES.map((role, i) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Logo Brand Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={docketConfig.logoColor}
                          onChange={(e) => onUpdateDocketConfig({ ...docketConfig, logoColor: e.target.value })}
                          className="w-8 h-8 rounded border border-border cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={docketConfig.logoColor}
                          onChange={(e) => onUpdateDocketConfig({ ...docketConfig, logoColor: e.target.value })}
                          className="flex-1 rounded border border-border bg-card px-2 py-1 text-xs text-foreground font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Checkbox id="showLogoCheckbox" checked={docketConfig.showLogo} onCheckedChange={(checked) => (((e) => onUpdateDocketConfig({ ...docketConfig, showLogo: e.target.checked })) as any)({ target: { checked } })} className="h-4 w-4 text-info rounded border-input focus:ring-ring" />
                      <label htmlFor="showLogoCheckbox" className="text-xs font-bold text-foreground cursor-pointer">
                        Display Logo on Docket
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive preview panel */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success animate-ping"></span>
                  Live A4 Docket Preview (Scale Adjusted)
                </span>

                <div className="w-full bg-muted p-8 rounded-md border border-border flex justify-center shadow-inner overflow-x-auto">
                  {/* Miniature A4 Sheet Aspect Ratio (roughly 1:1.41) */}
                  <div className="w-[520px] min-h-[730px] bg-card border border-input shadow-lg p-8 text-foreground flex flex-col justify-between font-sans text-xs leading-relaxed relative select-none">
                    <div>
                      {/* Top Branding Section */}
                      <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                        {/* Custom SVG dynamic logo */}
                        <div className="flex items-center gap-3">
                          {docketConfig.showLogo && (
                            <div className="flex flex-col items-center shrink-0">
                              <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 5L90 35L75 90L25 90L10 35L50 5Z" fill={docketConfig.logoColor} opacity="0.15" />
                                <path d="M50 15L80 40H20L50 15Z" fill={docketConfig.logoColor} />
                                <path d="M45 40H55V85H45V40Z" fill={docketConfig.logoColor} />
                                <path d="M30 55L50 45L70 55L50 65L30 55Z" fill="#fff" opacity="0.9" />
                                <path d="M50 5L95 38L78 92H22L5 38L50 5ZM50 10L10 40L25 87H75L90 40L50 10Z" fill={docketConfig.logoColor} />
                              </svg>
                              <span className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: docketConfig.logoColor }}>
                                BLACK OAK
                              </span>
                            </div>
                          )}
                          <div className="max-w-[180px]">
                            <h4 className="font-bold text-xs uppercase tracking-tight leading-tight text-foreground">
                              {docketConfig.eftAccountName}
                            </h4>
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mt-0.5">
                              Certified Weighbridge Material Record
                            </span>
                          </div>
                        </div>

                        {/* Top Right Address block */}
                        <div className="text-right text-xs space-y-0.5 text-muted-foreground max-w-[200px]">
                          <p className="font-bold text-foreground leading-tight">{docketConfig.businessName}</p>
                          <p>{docketConfig.poBox}</p>
                          <p>CONTACT: {docketConfig.contact}</p>
                          <p>FAX: {docketConfig.fax}</p>
                          <p>EMAIL: {docketConfig.email}</p>
                          <p className="font-semibold">ABN: {docketConfig.abn}</p>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-center my-4">
                        <h2 className="text-sm font-bold tracking-widest text-foreground border-y border-border py-1.5 uppercase">
                          DELIVERY DOCKET
                        </h2>
                      </div>

                      {/* Header Fields grid */}
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs border-b border-border pb-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">TO :</span> <span className="font-bold text-foreground">Intract Australia Pty Ltd</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">JOB NUMBER :</span> <span className="font-mono font-bold text-foreground">J-731</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">PURCHASE ORDER :</span> <span className="font-semibold text-foreground">3200110 - SITE 3 SP2-SP5</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">TRANSPORT COMPANY :</span> <span className="font-semibold text-foreground">Zaclan Transport</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">WEIGHBRIDGE LOCATION :</span> <span className="font-bold text-foreground">{docketConfig.weighbridgeLocation}</span></div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">DATE :</span> <span className="font-bold text-foreground">2026-06-22</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">TIME :</span> <span className="font-bold text-foreground">16 : 08 pm</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">DOCKET NUMBER :</span> <span className="font-mono font-bold text-foreground text-xs">BQA23650</span></div>
                          <div className="flex"><span className="w-24 font-bold text-muted-foreground">DESTINATION :</span> <span className="font-bold text-foreground">SP2 - SP5 - Site 3</span></div>
                        </div>
                      </div>

                      {/* Middle Grid */}
                      <div className="grid grid-cols-3 gap-4 border-b border-border pb-4 mb-4 text-xs">
                        <div className="border border-border rounded-md p-2.5 bg-muted">
                          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">TRAILER</span>
                          <span className="font-bold text-muted-foreground">N/A (Standard Unit)</span>
                        </div>
                        <div className="border border-border rounded-md p-2.5 bg-muted space-y-1">
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">TRUCK REG NO.</span>
                            <span className="font-mono font-bold text-foreground">S176BPB</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">PRODUCT</span>
                            <span className="font-bold text-info">20MM QR PM2/20QG WET</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">LOT NUMBER</span>
                            <span className="font-semibold text-muted-foreground">L-850 LOT 20</span>
                          </div>
                        </div>
                        <div className="border border-border rounded-md p-2.5 bg-muted space-y-1 text-right">
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">TRUCK GROSS</span>
                            <span className="font-mono font-bold text-foreground">5.00 t</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">STORED TARE</span>
                            <span className="font-mono font-bold text-muted-foreground">0.80 t</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">TRUCK NETT</span>
                            <span className="font-mono font-bold text-success text-xs">4.20 t</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Weights block */}
                      <div className="mb-4">
                        <span className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          TOTAL ORDER WEIGHT SUMMARY:
                        </span>
                        <table className="w-full text-center border border-border border-collapse text-xs">
                          <thead>
                            <tr className="bg-muted border-b border-border text-muted-foreground font-bold">
                              <th className="py-1 border-r border-border">Gross (t)</th>
                              <th className="py-1 border-r border-border">Tare (t)</th>
                              <th className="py-1">Net Weight (t)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="font-mono font-bold text-foreground text-xs">
                              <td className="py-2 border-r border-border">5.00</td>
                              <td className="py-2 border-r border-border">0.80</td>
                              <td className="py-2 text-info">4.20</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-12 border border-border rounded-md p-2 bg-muted text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">DRIVER COMMENTS & SAFETY PRECAUTIONS:</span>
                          <p className="mt-0.5">Own Driver. Ensure compliance with strict 20km/h quarry speed limits. PPE safety glasses, vest, and steel caps mandatory.</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="space-y-4">
                      {/* EFT Payments Info */}
                      <div className="border border-border rounded-md p-3 bg-muted flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                            EFT PAYMENTS BANKING
                          </span>
                          <div className="grid grid-cols-3 gap-x-4 mt-1 text-xs text-muted-foreground">
                            <div><span className="font-semibold text-foreground">Account Name:</span> {docketConfig.eftAccountName}</div>
                            <div><span className="font-semibold text-foreground">BSB:</span> {docketConfig.eftBsb}</div>
                            <div><span className="font-semibold text-foreground">Account No:</span> {docketConfig.eftAccountNo}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-info/10 text-info px-1.5 py-0.5 rounded tracking-wide uppercase font-mono shrink-0">
                          EFT APPROVED
                        </span>
                      </div>

                      {/* Signature block */}
                      <div className="grid grid-cols-2 gap-8 pt-2">
                        <div>
                          <span className="text-xs text-muted-foreground font-bold block mb-1">Customer Copy:</span>
                          <div className="border-t border-input pt-1 text-xs text-muted-foreground font-semibold italic text-center">
                            Received in Good Order
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-bold block mb-1">Weighbridge Operator:</span>
                          <div className="border-t border-input pt-1 text-xs text-foreground font-bold text-center">
                            (For {docketConfig.eftAccountName})
                          </div>
                        </div>
                      </div>
                    </div>
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
                Configure concurrent site access restrictions to comply with site licensing limits. Restricting allowed sites locks all other quarry scale beds and restricts the active location selector in the header.
              </p>

              {/* Grid of Licensing Limit Options */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                
                {/* 1 Site Limit */}
                <button
                  onClick={() => {
                    onUpdateSiteLimit(1);
                    toast.error("Developer System Lock updated: Access restricted to 1 Site only. Other weighbridge stations are locked.");
                  }}
                  className={`flex flex-col text-left p-4 rounded-md border transition-all cursor-pointer ${
                    siteLimit === 1
                      ? "border-warning bg-warning/10 ring-2 ring-warning"
                      : "border-border bg-card hover:border-input"
                  }`}
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
                  onClick={() => {
                    onUpdateSiteLimit(2);
                    toast.error("Developer System Lock updated: Access restricted to 2 Sites only. Tertiary stations are locked.");
                  }}
                  className={`flex flex-col text-left p-4 rounded-md border transition-all cursor-pointer ${
                    siteLimit === 2
                      ? "border-warning bg-warning/10 ring-2 ring-warning"
                      : "border-border bg-card hover:border-input"
                  }`}
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
                  onClick={() => {
                    onUpdateSiteLimit(99);
                    toast.success("Developer System Lock cleared: Unlimited access. All weighbridge sites operational.");
                  }}
                  className={`flex flex-col text-left p-4 rounded-md border transition-all cursor-pointer ${
                    siteLimit >= sites.length
                      ? "border-success bg-success/10 ring-2 ring-success"
                      : "border-border bg-card hover:border-input"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-foreground uppercase">Unlimited Enterprise</span>
                    {siteLimit >= sites.length && (
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
                    {sites.map((site, index) => {
                      const isRestricted = index >= siteLimit;
                      const isEditing = editingSiteId === site.id;

                      return (
                        <tr
                          key={site.id}
                          className={`hover:bg-muted transition-colors ${
                            isRestricted ? "bg-destructive/10 text-muted-foreground" : ""
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
                              ID: {site.id} &bull; Position: Site #{index + 1}
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
                              {isRestricted ? (
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
                                    onClick={() => setEditingSiteId(null)}
                                    className="p-1 rounded bg-muted text-muted-foreground hover:bg-secondary transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Rename Edit Button */}
                                  <button
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

                                  {/* Toggle site lock/unlock */}
                                  <button
                                    onClick={() => {
                                      const newStatus =
                                        site.status === "Active"
                                          ? "Locked"
                                          : site.status === "Locked"
                                          ? "Maintenance"
                                          : "Active";
                                      const updated = sites.map((s) =>
                                        s.id === site.id ? { ...s, status: newStatus as any } : s
                                      );
                                      onUpdateSites(updated);
                                    }}
                                    className="rounded border border-border bg-card px-2 py-1 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                                    title="Toggle operational states"
                                  >
                                    Cycle State
                                  </button>

                                  {/* Delete button */}
                                  <button
                                    onClick={async () => {
                                      if (sites.length <= 1) {
                                        toast.error("Error: Enterprise deployment must have at least 1 primary site.");
                                        return;
                                      }
                                      if (
                                        await confirmDialog(
                                          `Are you sure you want to permanently delete the site "${site.name}"? This action is irreversible.`
                                        )
                                      ) {
                                        const updated = sites.filter((s) => s.id !== site.id);
                                        onUpdateSites(updated);
                                      }
                                    }}
                                    className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                                    title="Delete site"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </button>
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
                    Instantly deploy a new weighbridge location point into the digital platform queue.
                  </p>
                </div>

                <div className="md:col-span-8 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      New Site Name
                    </label>
                    <input
                      type="text"
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      placeholder="e.g. Northern Silica Quarry"
                      className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                      className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                        Scales count
                      </label>
                      <SelectBox
                        value={newSiteScales}
                        onChange={(e) => setNewSiteScales(Number(e.target.value))}
                        className="w-full rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value={1}>1 Scale Bed</option>
                        <option value={2}>2 Scale Beds</option>
                        <option value={3}>3 Scale Beds</option>
                      </SelectBox>
                    </div>

                    <button
                      onClick={() => {
                        if (!newSiteName.trim()) {
                          toast.info("Please specify a site name.");
                          return;
                        }
                        const newSiteObj: Site = {
                          id: `site-${Date.now().toString().slice(-4)}`,
                          name: newSiteName.trim(),
                          status: "Active",
                          scaleCount: newSiteScales,
                          operatorName: newSiteSupervisor.trim() || "Unassigned"
                        };
                        const updated = [...sites, newSiteObj];
                        onUpdateSites(updated);
                        
                        // Check and notify of potential lock conditions
                        if (updated.length > siteLimit) {
                          toast.error(
                            `Site "${newSiteName}" registered successfully!\n\nNote: This site exceeds the active Developer access limit (${siteLimit} sites). It has been added but is currently LOCKED. Increase the allowed site limit inside the licensing dashboard above to unlock it.`
                          );
                        } else {
                          toast.info(`Site "${newSiteName}" is now active in the system!`);
                        }
                        
                        // reset form
                        setNewSiteName("");
                        setNewSiteSupervisor("");
                        setNewSiteScales(2);
                      }}
                      className="rounded bg-primary hover:bg-primary/90 text-xs font-bold text-white px-4 py-2 shrink-0 flex items-center gap-1.5 transition cursor-pointer h-[34px]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Site
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
