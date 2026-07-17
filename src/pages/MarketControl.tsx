import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { MarketTrend } from "../types";
import { 
  Play, 
  Pause, 
  Globe, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Activity, 
  RefreshCw,
  Clock
} from "lucide-react";

export const MarketControl: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: market, isLoading } = useQuery({
    queryKey: ["marketSettings"],
    queryFn: () => adminService.getMarketSettings(),
  });

  const { data: symbols } = useQuery({
    queryKey: ["symbols"],
    queryFn: () => adminService.getSymbols(),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof market>) => adminService.updateMarketSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketSettings"] });
      alert("Market parameters updated successfully.");
    }
  });

  const updateSymbolMutation = useMutation({
    mutationFn: ({ symbol, options }: { symbol: string; options: any }) => adminService.updateSymbolStatus(symbol, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symbols"] });
    },
    onError: (err: any) => {
      alert(`Failed to update symbol: ${err.response?.data?.error || err.message}`);
    }
  });

  const handleToggleMarket = () => {
    if (!market) return;
    const newStatus = market.status === "OPEN" ? "CLOSED" : "OPEN";
    updateMutation.mutate({ status: newStatus });
  };

  const handleTrendChange = (trend: MarketTrend) => {
    updateMutation.mutate({ trend });
  };

  const handleSliderChange = (key: string, val: number) => {
    updateMutation.mutate({ [key]: val });
  };

  if (isLoading || !market) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading Market Desk...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Global Market Desk Control</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure asset prices behaviors, define spread thresholds, and schedule open/close intervals.</p>
        </div>
        
        {/* Toggle matching engine */}
        <button
          onClick={handleToggleMarket}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm ${market.status === "OPEN" ? "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500" : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"}`}
        >
          {market.status === "OPEN" ? (
            <>
              <Pause size={14} />
              Close Global Market Exchange
            </>
          ) : (
            <>
              <Play size={14} />
              Open Global Market Exchange
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Market Status Card */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Globe size={14} />
            <span>EXCHANGE STATUS</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Global Trading Status:</span>
              <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${market.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400 animate-pulse border border-emerald-500/20" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                {market.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Market Tick Feed Rate:</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">1.0s / update</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Active Traded Assets:</span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">5 products online</span>
            </div>
          </div>
        </div>

        {/* Global Trend Bias */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <TrendingUp size={14} />
            <span>ALGORITHMIC TREND BIAS</span>
          </div>

          <div className="space-y-2 select-none">
            <button
              onClick={() => handleTrendChange(MarketTrend.BULLISH)}
              className={`w-full py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${market.trend === MarketTrend.BULLISH ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200"}`}
            >
              <TrendingUp size={14} />
              Bullish Bias (Uptrend)
            </button>

            <button
              onClick={() => handleTrendChange(MarketTrend.NORMAL)}
              className={`w-full py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${market.trend === MarketTrend.NORMAL ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200"}`}
            >
              <Activity size={14} />
              Normal Sideways Bias
            </button>

            <button
              onClick={() => handleTrendChange(MarketTrend.BEARISH)}
              className={`w-full py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${market.trend === MarketTrend.BEARISH ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200"}`}
            >
              <TrendingDown size={14} />
              Bearish Bias (Downtrend)
            </button>
          </div>
        </div>

        {/* Global Slippage & Spreads controls */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Sliders size={14} />
            <span>GLOBAL LIQUIDITY SPREAD</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400">Bid-Ask Spread Margin (pips):</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{market.spread} pips</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={5.0}
                step={0.01}
                value={market.spread}
                onChange={(e) => handleSliderChange("spread", parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400">Fluctuation Volatility Factor:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{market.volatility}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={market.volatility}
                onChange={(e) => handleSliderChange("volatility", parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Markets Table */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Quotes & Spreads</h2>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["symbols"] })}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/50 text-slate-400">
                  <th className="py-3 px-4 font-bold">SYMBOL</th>
                  <th className="py-3 px-4 font-bold">PRICE / BID / ASK</th>
                  <th className="py-3 px-4 font-bold">SPREAD</th>
                  <th className="py-3 px-4 font-bold">LEVERAGE</th>
                  <th className="py-3 px-4 font-bold">METRICS</th>
                  <th className="py-3 px-4 font-bold text-center">STATUS</th>
                  <th className="py-3 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20">
                {symbols?.map((sym: any) => {
                  const currentPrice = sym.price || 0;
                  const spread = sym.spread || 0;
                  const bid = currentPrice - spread / 2;
                  const ask = currentPrice + spread / 2;
                  return (
                    <tr key={sym.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{sym.symbol}</div>
                        <div className="text-[10px] text-slate-500">{sym.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">{currentPrice.toFixed(5)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">B: {bid.toFixed(5)} / A: {ask.toFixed(5)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={sym.spread} 
                          className="w-16 bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-xs text-slate-800 dark:text-slate-200"
                          onBlur={(e) => updateSymbolMutation.mutate({ symbol: sym.symbol, options: { spread: Number(e.target.value) } })}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="number" 
                          step="1" 
                          defaultValue={sym.leverageLimit || 500} 
                          className="w-16 bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-xs text-slate-800 dark:text-slate-200"
                          onBlur={(e) => updateSymbolMutation.mutate({ symbol: sym.symbol, options: { leverageLimit: Number(e.target.value) } })}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[10px] text-slate-500">Users: <span className="font-bold text-slate-800 dark:text-slate-200">{sym.connectedUsers || 0}</span></div>
                        <div className="text-[10px] text-slate-500">Pos: <span className="font-bold text-slate-800 dark:text-slate-200">{sym.openPositions || 0}</span></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select 
                          value={sym.status} 
                          onChange={(e) => updateSymbolMutation.mutate({ symbol: sym.symbol, options: { status: e.target.value } })}
                          className={`text-xs font-bold bg-transparent border-none focus:ring-0 ${
                            sym.status === 'OPEN' ? 'text-emerald-500' : 
                            sym.status === 'PAUSED' ? 'text-amber-500' : 'text-rose-500'
                          }`}
                        >
                          <option value="OPEN" className="text-slate-900">OPEN</option>
                          <option value="PAUSED" className="text-slate-900">PAUSED</option>
                          <option value="CLOSED" className="text-slate-900">CLOSED</option>
                          <option value="MAINTENANCE" className="text-slate-900">MAINT.</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center space-y-1">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            onClick={() => updateSymbolMutation.mutate({ symbol: sym.symbol, options: { visibleToUsers: !sym.visibleToUsers } })}
                            className={`text-[9px] font-bold px-2 py-1 rounded w-full ${sym.visibleToUsers ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                          >
                            {sym.visibleToUsers ? 'HIDE MKT' : 'SHOW MKT'}
                          </button>
                          <button
                            onClick={() => updateSymbolMutation.mutate({ symbol: sym.symbol, options: { tradingEnabled: !sym.tradingEnabled } })}
                            className={`text-[9px] font-bold px-2 py-1 rounded w-full ${sym.tradingEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}
                          >
                            {sym.tradingEnabled ? 'DISABLE TRD' : 'ENABLE TRD'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart View */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Market Chart</h2>
          </div>
          <div className="flex-1 min-h-[400px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <iframe
              title="TradingView"
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=FX_IDC%3AEURUSD&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allowFullScreen
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center">
            * Note: This chart reflects true global market data. Simulated Admin trends/spreads apply to user terminals.
          </p>
        </div>

      </div>

    </div>
  );
};
