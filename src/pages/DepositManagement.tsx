import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { Deposit, TransactionStatus } from "../types";
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Eye, 
  Coins, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText
} from "lucide-react";

export const DepositManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | TransactionStatus>("ALL");
  const [customExchangeRate, setCustomExchangeRate] = useState<number | "">("");

  // Queries
  const { data: deposits, isLoading, isError, error } = useQuery({
    queryKey: ["deposits"],
    queryFn: () => adminService.getDeposits(),
  });

  const { data: exchangeRateData } = useQuery({
    queryKey: ["exchangeRate"],
    queryFn: async () => {
      const { api } = await import("../services/api");
      const res = await api.get('/exchange-rates/current');
      if (res.data && res.data.rate) return res.data.rate;
      return { currentRate: res.data.currentRate || 85 };
    }
  });
  const currentRate = exchangeRateData?.currentRate || 85;

  // Mutations
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason, rate }: { id: string; status: TransactionStatus; reason?: string; rate?: number }) =>
      adminService.reviewDeposit(id, status, reason, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setSelectedDeposit(null);
      setRejectionReason("");
      setShowRejectionForm(false);
      alert("Deposit review recorded successfully.");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteDeposit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      setSelectedDeposit(null);
    },
    onError: (err: any) => alert(`Delete failed: ${err.response?.data?.error || err.message}`)
  });

  // Filters
  const filteredDeposits = (Array.isArray(deposits) ? deposits : []).filter(d => {
    const matchesSearch = d.userFullName.toLowerCase().includes(search.toLowerCase()) || d.paymentMethod.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || d.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (dep: Deposit) => {
    const rateToUse = customExchangeRate || currentRate;
    if (confirm(`Approve payment deposit of ₹${dep.amount} for ${dep.userFullName}? This will credit $${(dep.amount / rateToUse).toFixed(2)} to their trading wallet (Exchange Rate: ${rateToUse}).`)) {
      reviewMutation.mutate({ id: dep.id, status: TransactionStatus.APPROVED, rate: customExchangeRate ? Number(customExchangeRate) : undefined });
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit || !rejectionReason) return;
    reviewMutation.mutate({ id: selectedDeposit.id, status: TransactionStatus.REJECTED, reason: rejectionReason });
  };

  const handleDelete = (dep: Deposit) => {
    if (confirm(`Are you sure you want to permanently delete this deposit record?`)) {
      deleteMutation.mutate(dep.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Deposits Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit incoming bank transfers or cryptocurrency tokens ledger proofs and authorize account credits.</p>
      </div>

      {/* Filters bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto shrink-0 select-none">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Filter size={12} />
            STATUS:
          </span>
          {(["ALL", TransactionStatus.PENDING, TransactionStatus.APPROVED, TransactionStatus.REJECTED, "BLOCKED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st as any)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${filter === st ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-200"}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Deposits table list */}
        <div className="lg:col-span-2">
          {isError && (
            <div className="p-4 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
              Failed to load deposit records: {(error as any)?.message || "Network Error"}
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : filteredDeposits.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
              <span className="text-slate-400 text-xs">No deposit ledger records found matching your filters</span>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Amount (INR)</th>
                    <th className="py-3 px-4">Credited (USD)</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredDeposits.map((dep) => (
                    <tr 
                      key={dep.id} 
                      onClick={() => { setSelectedDeposit(dep); setShowRejectionForm(false); }}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${selectedDeposit?.id === dep.id ? "bg-slate-50 dark:bg-slate-800/20" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{dep.userFullName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{dep.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">₹{dep.amount}</td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {dep.status === TransactionStatus.APPROVED && dep.creditedUSD 
                        ? `$${dep.creditedUSD.toFixed(2)}` 
                        : dep.status === TransactionStatus.PENDING 
                          ? <span className="text-slate-400">Est: ${(dep.amount / currentRate).toFixed(2)}</span>
                          : '-'}
                    </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">{dep.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(dep.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] flex items-center gap-1 w-max ${dep.status === "PENDING" ? "bg-amber-500/10 text-amber-500" : dep.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : dep.status === "BLOCKED" ? "bg-purple-500/10 text-purple-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {dep.status === "PENDING" && <Clock size={10} />}
                          {dep.status === "APPROVED" && <CheckCircle size={10} />}
                          {(dep.status === "REJECTED" || dep.status === "BLOCKED") && <AlertCircle size={10} />}
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Deposit Detail / Audit Drawer */}
        <div className="lg:col-span-1">
          {selectedDeposit ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6 relative group">
              <button 
                onClick={() => handleDelete(selectedDeposit)}
                className="absolute top-4 right-4 text-rose-500/50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Deposit Record"
              >
                <X size={16} />
              </button>
              
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Audit Deposit Proof</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Reference: {selectedDeposit.id}</p>
              </div>

              {/* Data table */}
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/30">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Depositor Name:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDeposit.userFullName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Total Deposit:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold font-mono text-emerald-500">₹{selectedDeposit.amount}</span>
                </div>
                {selectedDeposit.creditedUSD && (
                  <>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Exchange Rate:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium font-mono text-[10px]">₹{selectedDeposit.exchangeRate} / 1 USD</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Credited To Wallet:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">${selectedDeposit.creditedUSD.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{selectedDeposit.paymentMethod}</span>
                </div>
                {selectedDeposit.transactionId && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">TX reference ID:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">{selectedDeposit.transactionId}</span>
                  </div>
                )}
                {(selectedDeposit as any).remarks && (
                  <div className="py-2 flex justify-between items-start gap-4">
                    <span className="text-slate-400">Remarks:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-right break-words">{(selectedDeposit as any).remarks}</span>
                  </div>
                )}
              </div>

              {/* Receipt File Preview */}
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-2">User Uploaded Payment Receipt</span>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/20 aspect-video group/img flex items-center justify-center">
                  {selectedDeposit.proofImage ? (
                    <>
                      <img 
                        src={selectedDeposit.proofImage} 
                        alt="Receipt payment proof" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={selectedDeposit.proofImage} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white">
                          <Eye size={16} />
                        </a>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold uppercase">No Receipt Uploaded</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {selectedDeposit.status === TransactionStatus.PENDING && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                  {!showRejectionForm ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-semibold">Custom Exchange Rate</label>
                          <span className="text-[10px] text-slate-500">System rate: {currentRate}</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={currentRate.toString()}
                          value={customExchangeRate}
                          onChange={(e) => setCustomExchangeRate(e.target.value ? Number(e.target.value) : "")}
                          className="w-24 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3 select-none">
                      <button
                        onClick={() => setShowRejectionForm(true)}
                        className="py-2.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} />
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Block this deposit?`)) {
                            reviewMutation.mutate({ id: selectedDeposit.id, status: 'BLOCKED' as TransactionStatus, reason: 'Blocked for security reasons.' });
                          }
                        }}
                        className="py-2.5 rounded-lg border border-purple-500/20 text-purple-500 hover:bg-purple-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <AlertCircle size={14} />
                        Block
                      </button>
                      <button
                        onClick={() => handleApprove(selectedDeposit)}
                        className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                    </div>
                    </>
                  ) : (
                    <form onSubmit={handleRejectSubmit} className="space-y-3">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p>State a clear reason detailing why this payment proof receipt was rejected.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Reason for Rejection</label>
                        <textarea
                          required
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Transaction ID was not found on our bank statements. Check block hash or retry with correct receipt image."
                          rows={3}
                          className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowRejectionForm(false)}
                          className="py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20 text-center select-none space-y-2">
              <FileText size={20} className="mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">Select an incoming deposit row to load receipt attachments and authorize cash credits.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
