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
  MapPin,
  Briefcase,
  FileText,
  UserCheck,
  Building,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  // We keep track of which enterprise accordion is expanded
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    operations: true,
    customers_sales: false,
    products: true,
    transport: false,
    reports: false,
    administration: false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: "operations",
      title: "OPERATIONS",
      icon: ClipboardList,
      items: [{ id: "operations-transactions", name: "Transactions" }],
    },
    {
      id: "customers_sales",
      title: "CUSTOMERS & SALES",
      icon: Users2,
      items: [
        { id: "customers-list", name: "Customers" },
        { id: "customers-contacts", name: "Destination Contacts" },
        { id: "customers-jobs", name: "Jobs" },
        { id: "customers-destinations", name: "Destinations" },
      ],
    },
    {
      id: "products",
      title: "PRODUCTS",
      icon: Package,
      items: [
        { id: "products-list", name: "Products" },
        { id: "products-lots", name: "Product Lots" },
      ],
    },
    {
      id: "transport",
      title: "TRANSPORT",
      icon: Truck,
      items: [
        { id: "transport-carters", name: "Carters" },
        { id: "transport-drivers", name: "Drivers" },
        { id: "transport-vehicles", name: "Vehicles" },
      ],
    },
    {
      id: "reports",
      title: "REPORTS",
      icon: BarChart3,
      items: [
        { id: "reports-transactions", name: "Transaction Reports" },
        { id: "reports-products", name: "Product Reports" },
        { id: "reports-customers", name: "Customer Reports" },
        { id: "reports-progress", name: "Job Progress Reports" },
      ],
    },
    {
      id: "administration",
      title: "ADMINISTRATION",
      icon: ShieldCheck,
      items: [
        { id: "admin-users", name: "Users" },
        { id: "admin-roles", name: "Roles" },
        { id: "admin-sites", name: "Sites & Locking" },
        { id: "admin-docket", name: "Docket Customization" },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-gray-150 bg-white text-gray-700 transition-[width] duration-300 ease-in-out select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand logo bar */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Custom Uniweigh Logo */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-xl shadow-xs">
            U
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap"
              >
                uniweigh
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors hidden lg:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main navigation with scroll area */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none space-y-1">
        {/* Dashboard top-level link */}
        <div className="px-1">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeView === "dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard
              className={`h-[18px] w-[18px] shrink-0 ${activeView === "dashboard" ? "text-blue-700" : "text-gray-500"}`}
            />
            {!collapsed && <span className="truncate">Dashboard</span>}
          </button>
        </div>

        {/* Accordion Sections */}
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div
              key="collapsed-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const hasActiveItem = section.items.some(
                  (item) => item.id === activeView,
                );

                return (
                  <div
                    key={section.id}
                    className="group relative flex justify-center py-1.5"
                  >
                    <button
                      onClick={() => {
                        // In collapsed mode, we open the first item
                        onViewChange(section.items[0].id);
                      }}
                      className={`rounded-lg p-2.5 transition-colors ${
                        hasActiveItem
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      title={section.title}
                    >
                      <SectionIcon className="h-5 w-5 shrink-0" />
                    </button>
                    {/* Micro tooltip menu */}
                    <div className="pointer-events-none absolute left-full ml-1.5 z-50 top-1.5 w-56 transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-400 tracking-wider">
                        {section.title}
                      </div>
                      {section.items.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => onViewChange(subItem.id)}
                          className={`flex w-full rounded-md px-3 py-1.5 text-left text-sm ${
                            activeView === subItem.id
                              ? "bg-blue-50 font-semibold text-blue-700"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="expanded-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections[section.id];

                return (
                  <div key={section.id} className="space-y-0.5 pt-2">
                    {/* Accordion Trigger */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-bold tracking-wider text-gray-400 hover:text-gray-700 transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <SectionIcon className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>{section.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
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
                          <div className="border-l border-gray-100 space-y-0.5 py-1 pl-2">
                            {section.items.map((item) => {
                              const isSubActive = activeView === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => onViewChange(item.id)}
                                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.8 text-sm font-medium transition-all ${
                                    isSubActive
                                      ? "bg-blue-50/80 font-semibold text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse layout icon at footer */}
      <div className="border-t border-gray-100 p-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center lg:justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
