import React, { useState } from "react";
import {
  Search,
  Bell,
  MapPin,
  Check,
  ChevronDown,
  User,
  AlertTriangle,
  Lock,
  ClipboardList,
} from "lucide-react";
import { AdminUser, Site } from "../../types";

interface HeaderProps {
  adminUser: AdminUser;
  selectedSite: string;
  onSiteChange: (site: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  sites: Site[];
  siteLimit: number;
  onEnterClerkMode?: () => void;
}

export default function Header({
  adminUser,
  selectedSite,
  onSiteChange,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  sites,
  siteLimit,
  onEnterClerkMode,
}: HeaderProps) {
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // High premium notifications suited for a weighbridge platform
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert",
      message: "Tare discrepancy variance (>5%) detected on vehicle IC-88-TT.",
      time: "10m ago",
      unread: true,
    },
    {
      id: 2,
      type: "warning",
      message:
        "Gippsland Earth Group (C-406) marked Suspended due to credit check.",
      time: "45m ago",
      unread: true,
    },
    {
      id: 3,
      type: "info",
      message:
        "Scale-B1 automatic calibration selfcheck completed successfully.",
      time: "2h ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-6 shadow-xs">
      {/* Left Search Bar and Toggle Option */}
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden lg:hidden"
          title="Toggle Navigation Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-[18px] w-[18px] text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search transactions, customers, plates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="hidden rounded-sm border border-gray-200 bg-white px-1.5 font-mono text-[10px] text-gray-400 sm:inline-block">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Right User Configurations */}
      <div className="flex items-center gap-4">
        {onEnterClerkMode && (
          <button
            onClick={onEnterClerkMode}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all select-none shadow-sm cursor-pointer"
          >
            <ClipboardList className="h-4 w-4 text-blue-400" />
            <span>Open Clerk View</span>
          </button>
        )}

        {/* Site Location Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSiteDropdown(!showSiteDropdown)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-hidden"
          >
            <MapPin className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
            <span className="max-w-[140px] truncate">{selectedSite}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showSiteDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSiteDropdown(false)}
              />
              <div className="absolute right-0 mt-1 z-20 w-72 origin-top-right rounded-lg border border-gray-100 bg-white p-1 shadow-lg focus:outline-hidden">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Site Scale Operations
                  </div>
                  {siteLimit < sites.length && (
                    <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                      <Lock className="h-3 w-3 shrink-0" />
                      <span>
                        Developer Access Locked ({siteLimit} of {sites.length}{" "}
                        sites active)
                      </span>
                    </div>
                  )}
                </div>

                {/* All Sites Option */}
                <button
                  onClick={() => {
                    if (siteLimit < sites.length) {
                      alert(
                        `All Sites view is locked under the current Developer Access constraint. Please select an active individual site.`,
                      );
                      return;
                    }
                    onSiteChange("All Sites");
                    setShowSiteDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    selectedSite === "All Sites"
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : siteLimit < sites.length
                        ? "text-gray-400 cursor-not-allowed hover:bg-red-50/10"
                        : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>All Sites</span>
                    {siteLimit < sites.length && (
                      <Lock className="h-3 w-3 text-red-400" />
                    )}
                  </span>
                  {selectedSite === "All Sites" && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>

                {/* Dynamic Sites */}
                {sites.map((site, index) => {
                  const isLocked = site.status === "Locked";
                  const isMaintenance = site.status === "Maintenance";
                  const isRestrictedByLimit = index >= siteLimit;
                  const isDisabled =
                    isLocked || isMaintenance || isRestrictedByLimit;

                  let statusLabel = "";
                  if (isRestrictedByLimit) statusLabel = "Access Locked";
                  else if (isLocked) statusLabel = "System Lock";
                  else if (isMaintenance) statusLabel = "Maint";

                  return (
                    <button
                      key={site.id}
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        onSiteChange(site.name);
                        setShowSiteDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                        selectedSite === site.name
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : isDisabled
                            ? "text-gray-400 cursor-not-allowed bg-slate-50/40"
                            : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 max-w-[210px] truncate">
                        <span className="truncate">{site.name}</span>
                        {isDisabled && (
                          <span className="shrink-0 inline-flex items-center rounded bg-red-50 text-red-700 px-1 py-0.2 text-xs font-bold border border-red-100">
                            <Lock className="h-2 w-2 mr-0.5" />
                            {statusLabel}
                          </span>
                        )}
                      </div>
                      {selectedSite === site.name && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Audit Alerts / Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
            }}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-hidden"
            title="Weighbridge Alerts and Alerts"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-1 z-20 w-80 origin-top-right rounded-lg border border-gray-100 bg-white shadow-xl focus:outline-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    Active System Alerts
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-hidden"
                    >
                      Clear alerts
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No critical weighbridge warnings.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          n.unread ? "bg-blue-50/20" : ""
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.type === "alert" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : n.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-700 leading-normal">
                            {n.message}
                          </p>
                          <span className="text-xs text-gray-400">
                            {n.time}
                          </span>
                        </div>
                        {n.unread && (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Admin User Panel */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="hidden text-right lg:block">
            <div className="text-sm font-semibold text-gray-950">
              {adminUser.name}
            </div>
            <div className="text-xs text-gray-500">{adminUser.role}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white select-none">
            {adminUser.avatarUrl ? (
              <img
                src={adminUser.avatarUrl}
                alt={adminUser.name}
                referrerPolicy="no-referrer"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              "AD"
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
