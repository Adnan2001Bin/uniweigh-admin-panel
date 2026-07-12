import React, { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users2,
  Package,
  Truck,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onEnterClerkMode?: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  onEnterClerkMode
}: SidebarProps) {
  // We keep track of which enterprise accordion is expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operations: true,
    customers_sales: false,
    products: true,
    transport: false,
    reports: false,
    administration: false
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: "operations",
      title: "OPERATIONS",
      icon: ClipboardList,
      items: [
        { id: "operations-transactions", name: "Transactions" }
      ]
    },
    {
      id: "customers_sales",
      title: "CUSTOMERS & SALES",
      icon: Users2,
      items: [
        { id: "customers-list", name: "Customers" },
        { id: "customers-contacts", name: "Destination Contacts" },
        { id: "customers-jobs", name: "Jobs" },
        { id: "customers-destinations", name: "Destinations" }
      ]
    },
    {
      id: "products",
      title: "PRODUCTS",
      icon: Package,
      items: [
        { id: "products-list", name: "Products" },
        { id: "products-lots", name: "Product Lots" }
      ]
    },
    {
      id: "transport",
      title: "TRANSPORT",
      icon: Truck,
      items: [
        { id: "transport-carters", name: "Carters" },
        { id: "transport-drivers", name: "Drivers" },
        { id: "transport-vehicles", name: "Vehicles" }
      ]
    },
    {
      id: "reports",
      title: "REPORTS",
      icon: BarChart3,
      items: [
        { id: "reports-transactions", name: "Transaction Reports" },
        { id: "reports-products", name: "Product Reports" },
        { id: "reports-customers", name: "Customer Reports" },
        { id: "reports-progress", name: "Job Progress Reports" }
      ]
    },
    {
      id: "administration",
      title: "ADMINISTRATION",
      icon: ShieldCheck,
      items: [
        { id: "admin-users", name: "Users" },
        { id: "admin-roles", name: "Roles" },
        { id: "admin-sites", name: "Sites & Locking" },
        { id: "admin-docket", name: "Docket Customization" }
      ]
    }
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand logo bar */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xl">
            U
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">
              uniweigh
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="rounded-md p-1 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors hidden lg:block cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main navigation with scroll area */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none space-y-1">
        {/* Switch to Clerk View Button — the amber hazard CTA */}
        {onEnterClerkMode && (
          <div className="px-1 mb-3">
            <button
              onClick={onEnterClerkMode}
              className="flex w-full items-center gap-3 rounded-md border border-sidebar-primary/60 bg-sidebar-primary/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors cursor-pointer"
              title="Open Operator Clerk View"
            >
              <ClipboardList className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Clerk View Terminal</span>}
            </button>
          </div>
        )}

        {/* Dashboard top-level link */}
        <div className="px-1">
          <button
            onClick={() => onViewChange("dashboard")}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeView === "dashboard"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {activeView === "dashboard" && (
              <span className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-sidebar-primary" />
            )}
            <LayoutDashboard
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                activeView === "dashboard" ? "text-sidebar-primary" : "text-sidebar-foreground/60"
              )}
            />
            {!collapsed && <span className="truncate">Dashboard</span>}
          </button>
        </div>

        {/* Accordion Sections */}
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.id];
          const hasActiveItem = section.items.some((item) => item.id === activeView);

          if (collapsed) {
            return (
              <div key={section.id} className="group relative flex justify-center py-1.5">
                <button
                  onClick={() => {
                    // In collapsed mode, we open the first item
                    onViewChange(section.items[0].id);
                  }}
                  className={cn(
                    "rounded-md p-2.5 transition-colors cursor-pointer",
                    hasActiveItem
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={section.title}
                >
                  <SectionIcon className="h-5 w-5 shrink-0" />
                </button>
                {/* Micro tooltip menu */}
                <div className="pointer-events-none absolute left-full ml-1.5 z-50 top-1.5 w-56 transform scale-95 opacity-0 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 transition-all rounded-md border border-sidebar-border bg-sidebar p-1 shadow-lg">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50">
                    {section.title}
                  </div>
                  {section.items.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onViewChange(subItem.id)}
                      className={cn(
                        "flex w-full rounded-sm px-3 py-1.5 text-left text-xs cursor-pointer",
                        activeView === subItem.id
                          ? "bg-sidebar-accent font-semibold text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      {subItem.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={section.id} className="space-y-0.5 pt-2">
              {/* Accordion Trigger */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50 hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className="h-4 w-4 shrink-0" />
                  <span>{section.title}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {/* Accordion Subitems Wrapper */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden pl-3"
                  >
                    <div className="border-l border-sidebar-border space-y-0.5 py-1 pl-2">
                      {section.items.map((item) => {
                        const isSubActive = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={cn(
                              "relative flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                              isSubActive
                                ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            {isSubActive && (
                              <span className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-sidebar-primary" />
                            )}
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Collapse layout icon at footer */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center lg:justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
