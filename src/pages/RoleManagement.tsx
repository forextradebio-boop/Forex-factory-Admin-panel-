import React, { useState } from "react";
import { Shield, Check, Lock, ShieldAlert } from "lucide-react";

interface AdminRole {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "RISK_OFFICER" | "COMPLIANCE_OFFICER";
  permissions: string[];
}

export const RoleManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRole[]>([
    {
      id: "adm-1",
      name: "Compliance Manager",
      email: "compliance@auratrading.com",
      role: "COMPLIANCE_OFFICER",
      permissions: ["MANAGE_KYC", "REVIEW_DEPOSITS", "REVIEW_WITHDRAWALS"]
    },
    {
      id: "adm-2",
      name: "Risk Controller Desk",
      email: "risk@auratrading.com",
      role: "RISK_OFFICER",
      permissions: ["MANAGE_TRADES", "HALT_ENGINE", "MANAGE_MARKETS", "MANAGE_GRAPH"]
    }
  ]);

  const allPermissions = [
    { key: "MANAGE_KYC", name: "Audit KYC Documents" },
    { key: "REVIEW_DEPOSITS", name: "Authorize Deposit Credits" },
    { key: "REVIEW_WITHDRAWALS", name: "Approve Payout Settlements" },
    { key: "MANAGE_TRADES", name: "Terminate Active Positions" },
    { key: "HALT_ENGINE", name: "Pause Matching Engine" },
    { key: "MANAGE_MARKETS", name: "Configure Market Spreads" },
    { key: "MANAGE_GRAPH", name: "Manipulate Live Graph Coordinates" }
  ];

  const handleTogglePermission = (adminId: string, permissionKey: string) => {
    setAdmins(prev => prev.map(adm => {
      if (adm.id === adminId) {
        const hasPerm = adm.permissions.includes(permissionKey);
        const nextPerms = hasPerm
          ? adm.permissions.filter(p => p !== permissionKey)
          : [...adm.permissions, permissionKey];
        return { ...adm, permissions: nextPerms };
      }
      return adm;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Roles & Access Permissions</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit administrative staff accounts, restrict access coordinates, and manage risk authorities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {admins.map((adm) => (
          <div key={adm.id} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{adm.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{adm.email}</p>
              </div>
              
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {adm.role.replace("_", " ")}
              </span>
            </div>

            {/* Checklists */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">AUTHORIZED COMPLIANCE CAPABILITIES</span>
              
              <div className="grid grid-cols-1 gap-1.5 select-none">
                {allPermissions.map((perm) => {
                  const active = adm.permissions.includes(perm.key);
                  return (
                    <div 
                      key={perm.key} 
                      onClick={() => handleTogglePermission(adm.id, perm.key)}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                    >
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{perm.name}</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${active ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-300 dark:border-slate-800"}`}>
                        {active && <Check size={10} strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ))}

        {/* Super admin locked alert */}
        <div className="p-6 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between h-56 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Lock size={14} />
            <span>ROOT OWNER SUPER ADMIN</span>
          </div>

          <p className="text-xs text-slate-400">The root executive super-administrator account holds absolute authorization keys. Dynamic modifications on Root permissions are permanently locked for safety.</p>

          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-500">
            <Shield size={12} />
            <span>ALL CAPABILITIES SYSTEM GRANTED</span>
          </div>
        </div>

      </div>

    </div>
  );
};
