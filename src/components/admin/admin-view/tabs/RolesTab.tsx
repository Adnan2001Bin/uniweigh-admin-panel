import React from "react";
import { MOCK_ROLES } from "../../../../data";

export default function RolesTab() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Operator Role Specifications</h3>
        <p className="text-xs text-gray-500">Role permissions defining weigh ticket adjustments and overrides:</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {MOCK_ROLES.map((role, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-3 shadow-xs bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">{role.name}</span>
              <span className="rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5">
                {role.usersCount} users
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-normal">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
