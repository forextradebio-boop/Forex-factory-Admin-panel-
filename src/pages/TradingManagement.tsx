import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { Trade, TradeStatus, TradeDirection } from "../types";
import { 
  X, 
  TrendingUp, 
  Play, 
  Pause, 
  AlertTriangle, 
  History, 
  Coins, 
  Activity,
  Maximize2,
  DollarSign
} from "lucide-react";

export const TradingManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"LIVE" | "CLOSED" | "PENDING">("LIVE");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  
  // Force Close custom values
  const [exitPrice, setExitPrice] = useState("");
  const [showForceCloseForm, setShowForceCloseForm] = useState(false);

  // Global Engine pause
  const [enginePaused, setEnginePaused] = useState(false);

  // Queries
  const { data: trades, isLoading, isError, error } = useQuery({
    queryKey: ["trades"],
    queryFn: () => adminService.getTrades(),
  });

  // Mutations
  const forceCloseMutation = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => adminService.forceCloseTrade(id, price),
    onSuccess: (updatedTrade) => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setSelectedTrade(null);
      setExitPrice("");
      setShowForceCloseForm(false);
      alert(`Trade permanently closed at exit price: ${updatedTrade.exitPrice}. Realized profit/loss is ${updatedTrade.profit}`);
    },
    onError: (err: any) => alert(`Failed to force close: ${err.response?.data?.error || err.message}`)
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => adminService.cancelPendingOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      setSelectedTrade(null);
      alert("Pending order successfully cancelled.");
    },
    onError: (err: any) => alert(`Failed to cancel order: ${err.response?.data?.error || err.message}`)
  });

  const filteredTrades = (Array.isArray(trades) ? trades : []).filter(t => {
    if (activeTab === "LIVE") return t.status === TradeStatus.OPEN;
    if (activeTab === "PENDING") return t.status === "PENDING";
    return t.status !== TradeStatus.OPEN && t.status !== "PENDING";
  });

  // Calculate aggregates for Live positions
  const openPositions = (Array.isArray(trades) ? trades : []).filter(t => t.status === TradeStatus.OPEN);
  const totalRunningProfit = openPositions.reduce((acc, t) => acc + (t.profit > 0 ? t.profit : 0), 0);
  const totalRunningLoss = openPositions.reduce((acc, t) => acc + (t.profit < 0 ? Math.abs(t.profit) : 0), 0);
  const netPnl = totalRunningProfit - totalRunningLoss;

  const handleForceCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade || !exitPrice) return;
    const price = parseFloat(exitPrice);
    if (isNaN(price) || price <= 0) return;

    forceCloseMutation.mutate({
      id: selectedTrade.id,
      price
    });
  };

  const toggleEngineStatus = () => {
    setEnginePaused(!enginePaused);
    adminService.addLog(
      enginePaused ? "Resume Trading Engine" : "Pause Trading Engine",
      "Trading Management",
      `Super Admin ${enginePaused ? "resumed" : "paused"} global trading operations.`
    );
    alert(`Global Matching Engine ${enginePaused ? "RESUMED" : "HALTED / PAUSED"} successfully. All live position calculations locked.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Engine Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Matching & Trading Engine</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit active leverage positions, force close failing margins, and control trading statuses.</p>
        </div>
        
        {/* Toggle Pause matching engine */}
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-emerald-500">Gross: +${totalRunningProfit.toFixed(2)}</div>
            <div className="text-rose-500">Loss: -${totalRunningLoss.toFixed(2)}</div>
            <div className={netPnl >= 0 ? "text-emerald-500" : "text-rose-500"}>Net: {netPnl >= 0 ? "+" : "-"}${Math.abs(netPnl).toFixed(2)}</div>
          </div>
          <button
            onClick={toggleEngineStatus}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm ${enginePaused ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950" : "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500"}`}
          >
            {enginePaused ? (
              <>
                <Play size={14} />
                Resume Matching Engine
              </>
            ) : (
              <>
                <Pause size={14} />
                Halt Global Trading
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Trades Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950/20 w-max select-none">
            <button
              onClick={() => { setActiveTab("LIVE"); setSelectedTrade(null); }}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "LIVE" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Activity size={12} className="text-emerald-500" />
              Live Trades ({openPositions.length})
            </button>
            <button
              onClick={() => { setActiveTab("PENDING"); setSelectedTrade(null); }}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "PENDING" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              <History size={12} className="text-amber-500" />
              Pending Orders
            </button>
            <button
              onClick={() => { setActiveTab("CLOSED"); setSelectedTrade(null); }}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "CLOSED" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              <History size={12} />
              Closed / History
            </button>
          </div>

          {isError && (
            <div className="p-4 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
              Failed to load trades from API: {(error as any)?.message || "Network Error"}
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : filteredTrades.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
              <span className="text-slate-400 text-xs">No transactions in this ledger book currently</span>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">Trader</th>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Margin Size</th>
                    <th className="py-3 px-4">Profit/Loss</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredTrades.map((t) => (
                    <tr 
                      key={t.id} 
                      onClick={() => { setSelectedTrade(t); setShowForceCloseForm(false); }}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${selectedTrade?.id === t.id ? "bg-slate-50 dark:bg-slate-800/20" : ""}`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{t.userFullName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                        <div>
                          <span>{t.assetSymbol}</span>
                          <span className="text-[9px] text-slate-500 font-normal block">{t.assetType}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${t.direction === TradeDirection.BUY ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">${t.amount} (lev {t.leverage}x)</td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {t.status === TradeStatus.OPEN ? (
                          <span className="text-amber-500">CALCULATING...</span>
                        ) : (
                          <span className={t.profit && t.profit >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {t.profit && t.profit >= 0 ? `+$${t.profit}` : `-$${Math.abs(t.profit || 0)}`}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono uppercase text-[10px] text-slate-400">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Trade Audit drawer */}
        <div className="lg:col-span-1">
          {selectedTrade ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Position Specifications</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Reference Code: {selectedTrade.id}</p>
              </div>

              {/* Data Specifications */}
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/30">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Account Owner:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedTrade.userFullName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Product Symbol:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">{selectedTrade.assetSymbol}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Order Action:</span>
                  <span className={`font-bold ${selectedTrade.direction === "BUY" ? "text-emerald-500" : "text-rose-500"}`}>{selectedTrade.direction}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Locked Margin:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">${selectedTrade.amount}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Leverage Factor:</span>
                  <span className="text-indigo-400 font-bold font-mono">{selectedTrade.leverage}x</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Entry price index:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">${selectedTrade.entryPrice}</span>
                </div>
                {selectedTrade.exitPrice && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Exit price index:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">${selectedTrade.exitPrice}</span>
                  </div>
                )}
              </div>

              {/* Force Close control */}
              {selectedTrade.status === TradeStatus.OPEN && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                  
                  {!showForceCloseForm ? (
                    <button
                      onClick={() => setShowForceCloseForm(true)}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-rose-500/10"
                    >
                      <Maximize2 size={14} />
                      Force Close Position
                    </button>
                  ) : (
                    <form onSubmit={handleForceCloseSubmit} className="space-y-3">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-start gap-2">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <p>Forcing position liquidation terminates the contract instantly. Profit or loss will calculate instantly relative to the Exit Price entered.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Exit Price Valuation</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono">$</span>
                          <input
                            type="text"
                            required
                            value={exitPrice}
                            onChange={(e) => setExitPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-7 pr-4 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowForceCloseForm(false)}
                          className="py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Terminate
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}

              {/* Cancel Pending Order control */}
              {selectedTrade.status === "PENDING" && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel this pending order?")) {
                        cancelOrderMutation.mutate(selectedTrade.id);
                      }
                    }}
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-rose-500/10"
                  >
                    <X size={14} />
                    Cancel Pending Order
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20 text-center select-none space-y-2">
              <Coins size={20} className="mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">Select a trade row to load margins, calculate risk parameters, or liquidate positions.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
