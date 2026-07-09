import React, { useState } from "react";
import { Lock, Building, Edit3, Save, X, Plus, Trash } from "lucide-react";
import { Site } from "../../../../types";

interface SitesLocksTabProps {
  sites: Site[];
  siteLimit: number;
  onUpdateSites: (updatedSites: Site[]) => void;
  onUpdateSiteLimit: (limit: number) => void;
}

export default function SitesLocksTab({
  sites,
  siteLimit,
  onUpdateSites,
  onUpdateSiteLimit
}: SitesLocksTabProps) {
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingSiteName, setEditingSiteName] = useState("");
  const [editingSiteSupervisor, setEditingSiteSupervisor] = useState("");

  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteSupervisor, setNewSiteSupervisor] = useState("");
  const [newSiteScales, setNewSiteScales] = useState(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Developer Access & System Locking Controls Dashboard */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/10 p-5 space-y-4">
        <div className="flex items-center gap-2.5 text-amber-800">
          <Lock className="h-5 w-5 text-amber-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Developer License Control & Site Dispatch Locks
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Configure concurrent site access restrictions to comply with site licensing limits. Restricting allowed sites locks all other quarry scale beds and restricts the active location selector in the header.
        </p>

        {/* Grid of Licensing Limit Options */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          {/* 1 Site Limit */}
          <button
            onClick={() => {
              onUpdateSiteLimit(1);
              alert("Developer System Lock updated: Access restricted to 1 Site only. Other weighbridge stations are locked.");
            }}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
              siteLimit === 1
                ? "border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20"
                : "border-gray-150 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-gray-900 uppercase">Single Site Mode</span>
              {siteLimit === 1 && (
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5">
                  Active Lock
                </span>
              )}
            </div>
            <span className="text-lg font-black text-slate-800">1 Site Limit</span>
            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              Locks tertiary & secondary stations. Only the primary quarry scale is operational.
            </p>
          </button>

          {/* 2 Sites Limit */}
          <button
            onClick={() => {
              onUpdateSiteLimit(2);
              alert("Developer System Lock updated: Access restricted to 2 Sites only. Tertiary stations are locked.");
            }}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
              siteLimit === 2
                ? "border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20"
                : "border-gray-150 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-gray-900 uppercase">Dual Site Mode</span>
              {siteLimit === 2 && (
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5">
                  Active Lock
                </span>
              )}
            </div>
            <span className="text-lg font-black text-slate-800">2 Sites Limit</span>
            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              Locks tertiary stations. Only the first two registered scale stations remain active.
            </p>
          </button>

          {/* Unlimited Limit */}
          <button
            onClick={() => {
              onUpdateSiteLimit(99);
              alert("Developer System Lock cleared: Unlimited access. All weighbridge sites operational.");
            }}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
              siteLimit >= sites.length
                ? "border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20"
                : "border-gray-150 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-gray-900 uppercase">Unlimited Enterprise</span>
              {siteLimit >= sites.length && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                  No Lock
                </span>
              )}
            </div>
            <span className="text-lg font-black text-slate-800">All Sites Active</span>
            <p className="text-[11px] text-gray-500 mt-1 leading-normal">
              Enterprise tier. All registered site weighbridge scale configurations are accessible.
            </p>
          </button>
        </div>
      </div>

      {/* List and Configuration of Sites */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Registered Weighbridge Locations
            </h3>
            <p className="text-xs text-gray-500">
              Manage station parameters, supervisors, and scale profiles below.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Site Station Name</th>
                <th className="px-4 py-3">Site Supervisor</th>
                <th className="px-4 py-3 text-center">Active Scales</th>
                <th className="px-4 py-3">Operational Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px] text-gray-750">
              {sites.map((site, index) => {
                const isRestricted = index >= siteLimit;
                const isEditing = editingSiteId === site.id;

                return (
                  <tr
                    key={site.id}
                    className={`hover:bg-gray-50/30 transition-colors ${
                      isRestricted ? "bg-red-50/10 text-gray-400" : ""
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
                            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-none w-full font-bold"
                            placeholder="Site Name"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{site.name}</span>
                        </div>
                      )}
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">
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
                          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          placeholder="Supervisor"
                        />
                      ) : (
                        <span className="font-medium text-gray-600">{site.operatorName}</span>
                      )}
                    </td>

                    {/* Active scales count */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold font-mono px-2 py-0.5">
                        {site.scaleCount} scales
                      </span>
                    </td>

                    {/* Status and Locks */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {isRestricted ? (
                          <span className="inline-flex items-center rounded-sm bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-red-200">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            Access Locked
                          </span>
                        ) : site.status === "Active" ? (
                          <span className="inline-flex items-center rounded-sm bg-green-50 text-green-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-green-150">
                            ● Operational
                          </span>
                        ) : site.status === "Locked" ? (
                          <span className="inline-flex items-center rounded-sm bg-red-50 text-red-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-red-150">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            Manual Lock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-sm bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-amber-150">
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
                                  alert("Site name is required.");
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
                                alert(`Weighbridge station renamed successfully.`);
                              }}
                              className="p-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition cursor-pointer"
                              title="Save changes"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingSiteId(null)}
                              className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
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
                              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition cursor-pointer"
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
                              className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                              title="Toggle operational states"
                            >
                              Cycle State
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (sites.length <= 1) {
                                  alert("Error: Enterprise deployment must have at least 1 primary site.");
                                  return;
                                }
                                if (
                                  confirm(
                                    `Are you sure you want to permanently delete the site "${site.name}"? This action is irreversible.`
                                  )
                                ) {
                                  const updated = sites.filter((s) => s.id !== site.id);
                                  onUpdateSites(updated);
                                }
                              }}
                              className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
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
      <div className="rounded-2xl border border-gray-100 p-5 bg-slate-50/50">
        <div className="grid gap-6 md:grid-cols-12 items-start">
          <div className="md:col-span-4 space-y-1">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              Register New Quarry Bed Site
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Instantly deploy a new weighbridge location point into the digital platform queue.
            </p>
          </div>

          <div className="md:col-span-8 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                New Site Name
              </label>
              <input
                type="text"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                placeholder="e.g. Northern Silica Quarry"
                className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Assigned Supervisor Name
              </label>
              <input
                type="text"
                value={newSiteSupervisor}
                onChange={(e) => setNewSiteSupervisor(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Scales count
                </label>
                <select
                  value={newSiteScales}
                  onChange={(e) => setNewSiteScales(Number(e.target.value))}
                  className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={1}>1 Scale Bed</option>
                  <option value={2}>2 Scale Beds</option>
                  <option value={3}>3 Scale Beds</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (!newSiteName.trim()) {
                    alert("Please specify a site name.");
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
                    alert(
                      `Site "${newSiteName}" registered successfully!\n\nNote: This site exceeds the active Developer access limit (${siteLimit} sites). It has been added but is currently LOCKED. Increase the allowed site limit inside the licensing dashboard above to unlock it.`
                    );
                  } else {
                    alert(`Site "${newSiteName}" is now active in the system!`);
                  }

                  // reset form
                  setNewSiteName("");
                  setNewSiteSupervisor("");
                  setNewSiteScales(2);
                }}
                className="rounded bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white px-4 py-2 shrink-0 flex items-center gap-1.5 transition cursor-pointer h-[34px]"
              >
                <Plus className="h-4 w-4" />
                Add Site
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
