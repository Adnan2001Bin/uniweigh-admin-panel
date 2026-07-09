import React, { useState, useEffect } from "react";
import { AdminUser, Site, DocketConfig } from "../../types";
import OperatorUsersTab from "./admin-view/tabs/OperatorUsersTab";
import RolesTab from "./admin-view/tabs/RolesTab";
import SitesLocksTab from "./admin-view/tabs/SitesLocksTab";
import DocketLayoutTab from "./admin-view/tabs/DocketLayoutTab";

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

const tabs: { id: AdminViewProps["subView"]; label: string }[] = [
  { id: "users", label: "Operators" },
  { id: "roles", label: "Roles" },
  { id: "sites", label: "Sites & Locks" },
  { id: "docket", label: "Docket Layout" }
];

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
  const [activeTab, setActiveTab] = useState<AdminViewProps["subView"]>(subView);

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">Administration Platform</h1>
        <p className="text-xs text-gray-500">Administration / Settings & Users Manager</p>
      </div>

      {/* Nav internal tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 text-xs sm:text-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-2.5 pt-1 px-1 font-bold transition relative ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Canvas layout details */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-5">
        {activeTab === "users" && <OperatorUsersTab />}
        {activeTab === "roles" && <RolesTab />}
        {activeTab === "sites" && (
          <SitesLocksTab
            sites={sites}
            siteLimit={siteLimit}
            onUpdateSites={onUpdateSites}
            onUpdateSiteLimit={onUpdateSiteLimit}
          />
        )}
        {activeTab === "docket" && (
          <DocketLayoutTab
            docketConfig={docketConfig}
            onUpdateDocketConfig={onUpdateDocketConfig}
          />
        )}
      </div>
    </div>
  );
}
