import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { Withdrawal, TransactionStatus } from "../types";
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  DollarSign
} from "lucide-react";

export const WithdrawRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedWithdraw, setSelectedWithdraw] = useState<Withdrawal | null>(null);
  
  // Review inputs
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | TransactionStatus>("ALL");

  // Queries
  const { data: withdrawals, isLoading, isError, error } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => adminService.getWithdrawals(),
  });

  // Mutations
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, txId, rm }: { id: string; status: TransactionStatus; txId?: string; rm?: string }) =>
      adminService.reviewWithdrawal(id, status, txId, rm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setSelectedWithdraw(null);
      setTransactionId("");
      setRemarks("");
      setShowApprovalForm(false);
      setShowRejectionForm(false);
      alert("Withdrawal request audited successfully.");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  // Filter lists
  const filteredWithdrawals = (Array.isArray(withdrawals) ? withdrawals : []).filter(w => {
    const matchesSearch = w.userFullName.toLowerCase().includes(search.toLowerCase()) || (w.bankName || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || w.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdraw || !transactionId) return;
    reviewMutation.mutate({
      id: selectedWithdraw.id,
      status: TransactionStatus.APPROVED,
      txId: transactionId,
      rm: remarks
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdraw || !remarks) return;
    reviewMutation.mutate({
      id: selectedWithdraw.id,
      status: TransactionStatus.REJECTED,
      rm: remarks
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payout Requests Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit trader cash withdrawal requests, execute payouts to Bank/UPI details, and log transactions.</p>
      </div>

      {/* Filters bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, bank..."
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
          {(["ALL", TransactionStatus.PENDING, TransactionStatus.APPROVED, TransactionStatus.REJECTED] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${filter === st ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-200"}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main requests table */}
        <div className="lg:col-span-2">
          {isError && (
            <div className="p-4 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
              Failed to load withdrawal requests: {(error as any)?.message || "Network Error"}
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
              <span className="text-slate-400 text-xs">No payout requests match your criteria</span>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Payout Target</th>
                    <th className="py-3 px-4">Withdrawal (USD)</th>
                    <th className="py-3 px-4">Expected (INR)</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredWithdrawals.map((w) => (
                    <tr 
                      key={w.id} 
                      onClick={() => { 
                        setSelectedWithdraw(w); 
                        setShowApprovalForm(false); 
                        setShowRejectionForm(false); 
                      }}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${selectedWithdraw?.id === w.id ? "bg-slate-50 dark:bg-slate-800/20" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{w.userFullName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{w.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {w.bankName ? (
                          <div>
                            <p className="font-medium text-slate-600 dark:text-slate-400">{w.bankName}</p>
                            <p className="text-[9px] text-slate-500 font-mono">Acct: {w.accountNumber}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-indigo-400 font-mono">UPI Transfer</p>
                            <p className="text-[9px] text-slate-500 font-mono">{w.upiId}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-500">-${w.amount}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {w.receivedINR ? `₹${w.receivedINR.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] flex items-center gap-1 w-max ${w.status === "PENDING" ? "bg-amber-500/10 text-amber-500 animate-pulse" : w.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {w.status === "PENDING" && <Clock size={10} />}
                          {w.status === "APPROVED" && <CheckCircle size={10} />}
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Request Detail Audit Panel */}
        <div className="lg:col-span-1">
          {selectedWithdraw ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Audit Payout Request</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Request Ref: {selectedWithdraw.id}</p>
              </div>

              {/* Bank accounts / UPI info cards */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 border-b border-slate-200 dark:border-slate-800/50 pb-2">
                  <CreditCard size={14} />
                  <span>PAYOUT BANKING DETAILS</span>
                </div>
                
                {selectedWithdraw.bankName ? (
                  /* Bank wire details */
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Bank Name:</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedWithdraw.bankName}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Account Number:</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">{selectedWithdraw.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Account Holder Name:</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedWithdraw.accountHolderName}</p>
                    </div>
                    {selectedWithdraw.routingNumber && (
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Routing / IFSC code:</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">{selectedWithdraw.routingNumber}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* UPI Details */
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">UPI handle identifier:</span>
                      <p className="font-bold text-indigo-400 font-mono text-[12px]">{selectedWithdraw.upiId}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Payout Type:</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">UPI Instant Settlement</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial values summary */}
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/30">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Target Trader:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedWithdraw.userFullName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Total Settlement Debit:</span>
                  <span className="text-rose-500 font-bold font-mono text-[13px]">${selectedWithdraw.amount}</span>
                </div>
                {selectedWithdraw.receivedINR && (
                  <>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Exchange Rate:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium font-mono text-[10px]">₹{selectedWithdraw.exchangeRate} / 1 USD</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Expected Settlement (INR):</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">₹{selectedWithdraw.receivedINR.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payout compliance Actions */}
              {selectedWithdraw.status === TransactionStatus.PENDING && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                  
                  {!showApprovalForm && !showRejectionForm && (
                    <div className="grid grid-cols-2 gap-3 select-none">
                      <button
                        onClick={() => setShowRejectionForm(true)}
                        className="py-2.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} />
                        Decline Payout
                      </button>
                      <button
                        onClick={() => setShowApprovalForm(true)}
                        className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                      >
                        <Check size={14} />
                        Approve & Pay
                      </button>
                    </div>
                  )}

                  {/* APPROVAL SUBMISSION FORM */}
                  {showApprovalForm && (
                    <form onSubmit={handleApproveSubmit} className="space-y-3">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-start gap-2">
                        <CheckCircle size={14} className="shrink-0 mt-0.5" />
                        <p>Process the payout externally via bank wire/UPI. Once completed, enter the settlement Transaction ID reference below to mark this request as APPROVED.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Settlement Transaction ID (Required)</label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. TXN_WTH_8829103"
                          className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 p-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Audit/Reconciliation Remarks (Optional)</label>
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="e.g. Cleared via Chase Wire."
                          className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 p-2 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowApprovalForm(false)}
                          className="py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Submit Approval
                        </button>
                      </div>
                    </form>
                  )}

                  {/* REJECTION SUBMISSION FORM */}
                  {showRejectionForm && (
                    <form onSubmit={handleRejectSubmit} className="space-y-3">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p>Rejecting this payout request will automatically credit the settlement funds back to the user's main wallet balance.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Reason for Decline / Remarks</label>
                        <textarea
                          required
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="e.g. Bank Account details incorrect. Please re-enter routing number and try again."
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
                          Reject & Refund
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
              <p className="text-xs font-semibold text-slate-400">Select a pending payout request row to load banking credentials and process payouts.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
