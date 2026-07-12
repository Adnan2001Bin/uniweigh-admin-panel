import React, { useState } from "react";
import { Search, Bell, MapPin, Check, ChevronDown, AlertTriangle, Lock, ClipboardList } from "lucide-react";
import { AdminUser, Site } from "../types";
import { cn } from "@/src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { toast } from "sonner";

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
  onEnterClerkMode
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
      message: "Gippsland Earth Group (C-406) marked Suspended due to credit check.",
      time: "45m ago",
      unread: true,
    },
    {
      id: 3,
      type: "info",
      message: "Scale-B1 automatic calibration selfcheck completed successfully.",
      time: "2h ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground">
      {/* Left Search Bar and Toggle Option */}
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none lg:hidden cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-[18px] w-[18px] text-sidebar-foreground/50" />
          </div>
          <input
            type="text"
            placeholder="Search transactions, customers, plates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-md border border-sidebar-border bg-sidebar-accent/50 pl-10 pr-9 text-sm text-sidebar-accent-foreground placeholder:text-sidebar-foreground/40 focus:border-sidebar-ring focus:ring-1 focus:ring-sidebar-ring focus:outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="hidden rounded-sm border border-sidebar-border bg-sidebar px-1.5 font-mono text-xs text-sidebar-foreground/50 sm:inline-block">
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
            className="flex items-center gap-2 rounded-md border border-sidebar-primary/60 bg-sidebar-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors select-none cursor-pointer"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Open Clerk View</span>
          </button>
        )}

        {/* Site Location Selector */}
        <Popover open={showSiteDropdown} onOpenChange={setShowSiteDropdown}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 rounded-md border border-sidebar-border px-3 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none cursor-pointer transition-colors">
              <MapPin className="h-4 w-4 text-sidebar-foreground/60" />
              <span className="max-w-[140px] truncate">{selectedSite}</span>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-1">
            <div className="px-3 py-2 border-b border-border mb-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Site Scale Operations
              </div>
              {siteLimit < sites.length && (
                <div className="text-xs text-warning font-semibold flex items-center gap-1 mt-0.5">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>Developer Access Locked ({siteLimit} of {sites.length} sites active)</span>
                </div>
              )}
            </div>

            {/* All Sites Option */}
            <button
              onClick={() => {
                if (siteLimit < sites.length) {
                  toast.error(`All Sites view is locked under the current Developer Access constraint. Please select an active individual site.`);
                  return;
                }
                onSiteChange("All Sites");
                setShowSiteDropdown(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm cursor-pointer",
                selectedSite === "All Sites"
                  ? "bg-muted font-semibold text-foreground"
                  : siteLimit < sites.length
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-1.5">
                <span>All Sites</span>
                {siteLimit < sites.length && <Lock className="h-3 w-3 text-destructive" />}
              </span>
              {selectedSite === "All Sites" && <Check className="h-4 w-4 text-accent-foreground" />}
            </button>

            {/* Dynamic Sites */}
            {sites.map((site, index) => {
              const isLocked = site.status === "Locked";
              const isMaintenance = site.status === "Maintenance";
              const isRestrictedByLimit = index >= siteLimit;
              const isDisabled = isLocked || isMaintenance || isRestrictedByLimit;

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
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm",
                    selectedSite === site.name
                      ? "bg-muted font-semibold text-foreground"
                      : isDisabled
                      ? "text-muted-foreground cursor-not-allowed bg-muted/40"
                      : "text-foreground hover:bg-muted cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-2 max-w-[210px] truncate">
                    <span className="truncate">{site.name}</span>
                    {isDisabled && (
                      <Badge variant="destructive" className="shrink-0 text-[inherit] px-1 py-0 text-xs normal-case">
                        <Lock className="h-2.5 w-2.5" />
                        {statusLabel}
                      </Badge>
                    )}
                  </div>
                  {selectedSite === site.name && <Check className="h-4 w-4 text-accent-foreground" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* Audit Alerts / Notification Bell */}
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverTrigger asChild>
            <button
              className="relative rounded-md p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none cursor-pointer transition-colors"
              title="Weighbridge Alerts and Alerts"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground leading-none ring-2 ring-sidebar">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                Active System Alerts
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-info hover:underline focus:outline-none cursor-pointer"
                >
                  Clear alerts
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No critical weighbridge warnings.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b border-border/60 hover:bg-muted/60 transition-colors",
                      n.unread && "bg-accent/5"
                    )}
                  >
                    <div className="mt-0.5">
                      {n.type === "alert" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : n.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-success bg-success/10 rounded-full p-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-foreground leading-normal">
                        {n.message}
                      </p>
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                    </div>
                    {n.unread && (
                      <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Custom Admin User Panel */}
        <div className="flex items-center gap-3 border-l border-sidebar-border pl-4">
          <div className="hidden text-right lg:block">
            <div className="text-sm font-semibold text-sidebar-accent-foreground">{adminUser.name}</div>
            <div className="text-xs text-sidebar-foreground/60">{adminUser.role}</div>
          </div>
          <Avatar>
            {adminUser.avatarUrl ? (
              <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} referrerPolicy="no-referrer" />
            ) : null}
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
