import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { 
  Archive, 
  Trash2, 
  AlertOctagon, 
  RefreshCcw, 
  History, 
  Database,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Wallet
} from "lucide-react";

export const HistoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<"deposit" | "withdrawal" | "position" | "transaction">("deposit");
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "deleted">("active");

  const { data: records, isLoading } = useQuery({
    queryKey: ["history", activeType, activeTab],
    queryFn: async () => {
      let query = "";
      if (activeTab === "archived") query = "?archived=true";
      if (activeTab === "deleted") query = "?deleted=true";
      const res = await adminService.api.get(`/admin/history/${activeType}${query}`);
      return res.data;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminService.api.patch(`/admin/history/${activeType}/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", activeType] });
      alert("Record archived successfully.");
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminService.api.patch(`/admin/history/${activeType}/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", activeType] });
      alert("Record restored successfully.");
    }
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: string) => adminService.api.delete(`/admin/history/${activeType}/${id}/soft`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", activeType] });
      alert("Record soft deleted.");
    }
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => adminService.api.delete(`/admin/history/${activeType}/${id}/hard`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", activeType] });
      alert("Record permanently deleted.");
    },
    onError: (err: any) => {
      alert(`Failed: ${err.response?.data?.error || err.message}`);
    }
  });

  const getIcon = (type: string) => {
    switch(type) {
      case "deposit": return <ArrowDownCircle size={14} className="text-emerald-500" />;
      case "withdrawal": return <ArrowUpCircle size={14} className="text-rose-500" />;
      case "position": return <Activity size={14} className="text-indigo-500" />;
      case "transaction": return <Wallet size={14} className="text-amber-500" />;
      default: return <Database size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History className="text-slate-500" />
            Central Data History & Retention
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage data retention policies, archive old records, or perform audit deletions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-3">Record Type</span>
            
            {["deposit", "withdrawal", "position", "transaction"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type as any)}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all capitalize ${activeType === type ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"}`}
              >
                {getIcon(type)}
                {type}s
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-3">Retention Status</span>
            
            <button
              onClick={() => setActiveTab("active")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${activeTab === "active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent"}`}
            >
              <Database size={14} />
              Active Records
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${activeTab === "archived" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent"}`}
            >
              <Archive size={14} />
              Archived
            </button>
            <button
              onClick={() => setActiveTab("deleted")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${activeTab === "deleted" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent"}`}
            >
              <Trash2 size={14} />
              Soft Deleted (Trash)
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="lg:col-span-3">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
            
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : !records || records.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/20">
                <span className="text-slate-400 text-xs">No records found for this filter.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">ID Reference</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {records.map((record: any) => (
                      <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {record.userId?.fullName || record.userId?.email || 'Unknown User'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                          {record._id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === "active" && (
                              <>
                                <button 
                                  onClick={() => archiveMutation.mutate(record._id)}
                                  className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 cursor-pointer transition-colors" title="Archive"
                                >
                                  <Archive size={14} />
                                </button>
                                <button 
                                  onClick={() => softDeleteMutation.mutate(record._id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors" title="Soft Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                            
                            {(activeTab === "archived" || activeTab === "deleted") && (
                              <button 
                                onClick={() => restoreMutation.mutate(record._id)}
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 cursor-pointer transition-colors" title="Restore Record"
                              >
                                <RefreshCcw size={14} />
                              </button>
                            )}

                            {activeTab === "deleted" && (
                              <button 
                                onClick={() => {
                                  if (window.confirm("WARNING: Hard Delete cannot be reversed. This physically wipes the record from the database. Only Super Admins can do this. Proceed?")) {
                                    hardDeleteMutation.mutate(record._id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 cursor-pointer transition-colors ml-2" title="Hard Delete (Wipe)"
                              >
                                <AlertOctagon size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
