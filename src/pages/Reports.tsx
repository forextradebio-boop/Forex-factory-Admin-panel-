import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { FileSpreadsheet, Download, Filter, Calendar } from "lucide-react";

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<"DEPOSITS" | "WITHDRAWALS" | "TRADES">("DEPOSITS");

  // Queries
  const { data: deposits, isLoading: depLoading } = useQuery({ queryKey: ["deposits"], queryFn: () => adminService.getDeposits() });
  const { data: withdrawals, isLoading: wthLoading } = useQuery({ queryKey: ["withdrawals"], queryFn: () => adminService.getWithdrawals() });
  const { data: trades, isLoading: trdLoading } = useQuery({ queryKey: ["trades"], queryFn: () => adminService.getTrades() });

  const isLoading = depLoading || wthLoading || trdLoading;

  const handleExport = (format: "CSV" | "Excel" | "PDF") => {
    alert(`Export API Not Available.\nThe backend does not currently support generating ${format} exports for ${reportType}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Financial Reports & Auditing</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Export transaction histories, margins, or revenue allocations for corporate compliance reporting.</p>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={() => handleExport("CSV")}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={12} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={12} />
            Export Excel
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <Download size={12} />
            Export Audit PDF
          </button>
        </div>
      </div>

      {/* Reports Filters bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Reports Type Selectors */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950/20 w-max select-none">
          {(["DEPOSITS", "WITHDRAWALS", "TRADES"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer ${reportType === type ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold select-none">
          <Calendar size={14} className="text-emerald-500" />
          <span>SCOPE: ALL-TIME CORPORATE ACCOUNTABILITY</span>
        </div>
      </div>

      {/* Reports Table lists */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-hidden shadow-sm">
          {reportType === "DEPOSITS" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3 px-4">Depositor Name</th>
                  <th className="py-3 px-4">Gateway Route</th>
                  <th className="py-3 px-4">Amount Size</th>
                  <th className="py-3 px-4">Transaction hash</th>
                  <th className="py-3 px-4">Audited Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {(Array.isArray(deposits) ? deposits : []).map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{dep.userFullName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{dep.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">+${dep.amount}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">{dep.transactionId || "N/A"}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(dep.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "WITHDRAWALS" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3 px-4">Trader Name</th>
                  <th className="py-3 px-4">Payout Route</th>
                  <th className="py-3 px-4">Amount size</th>
                  <th className="py-3 px-4">Settlement Reference</th>
                  <th className="py-3 px-4">Audited Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {(Array.isArray(withdrawals) ? withdrawals : []).map((wth) => (
                  <tr key={wth.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{wth.userFullName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-500">{wth.bankName ? "Bank wire wire" : "UPI Instant"}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-500">-${wth.amount}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">{wth.transactionId || "N/A"}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(wth.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "TRADES" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3 px-4">Trader Name</th>
                  <th className="py-3 px-4">Asset Symbol</th>
                  <th className="py-3 px-4">Margin volume</th>
                  <th className="py-3 px-4">Realized Profit/Loss</th>
                  <th className="py-3 px-4">Date Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {(Array.isArray(trades) ? trades : []).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{t.userFullName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">{t.assetSymbol}</td>
                    <td className="py-3.5 px-4 font-mono">${t.amount} (lev {t.leverage}x)</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {t.status === "OPEN" ? (
                        <span className="text-amber-500">CALCULATING...</span>
                      ) : (
                        <span className={t.profit && t.profit >= 0 ? "text-emerald-500" : "text-rose-500"}>
                          {t.profit && t.profit >= 0 ? `+$${t.profit}` : `-$${Math.abs(t.profit || 0)}`}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{t.closedAt ? new Date(t.closedAt).toLocaleDateString() : "ACTIVE"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};
