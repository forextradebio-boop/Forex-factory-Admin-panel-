import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { Search, Filter, Shield, Clock } from "lucide-react";

export const ActivityLogs: React.FC = () => {
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activityLogs"],
    queryFn: () => adminService.getActivityLogs(),
  });

  const filteredLogs = (Array.isArray(logs) ? logs : []).filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    (l.adminEmail || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Administrative Audit Trails</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trace all backend edits, balance manual adjustments, KYC reviews, and price spikes coordinates.</p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold select-none">
          <Shield size={14} className="text-emerald-500 animate-pulse" />
          <span>LEDGER LOGS PERMANENT</span>
        </div>
      </div>

      {/* Audit table list */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
          <span className="text-slate-400 text-xs">No audit logs found matching criteria</span>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Module Class</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Trace Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{log.adminEmail || "Admin"}</p>
                      <p className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-indigo-400 font-bold uppercase text-[9px]">{log.module}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{log.details}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
