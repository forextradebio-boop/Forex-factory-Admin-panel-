import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { MarketTrend } from "../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from "recharts";
import { 
  Play, 
  Pause, 
  ArrowUp, 
  ArrowDown, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw,
  Sliders,
  DollarSign,
  AlertTriangle,
  Globe,
  Settings
} from "lucide-react";

interface PriceTick {
  time: string;
  price: number;
}

export const GraphControl: React.FC = () => {
  const queryClient = useQueryClient();
  const [chartData, setChartData] = useState<PriceTick[]>([]);
  const tickCounterRef = useRef(0);

  // Queries
  const { data: graph, isLoading } = useQuery({
    queryKey: ["graphSettings"],
    queryFn: () => adminService.getGraphSettings(),
  });

  // Local matching variables to reflect inputs instantly
  const [targetPrice, setTargetPrice] = useState("62500");
  const [supportLevel, setSupportLevel] = useState("62000");
  const [resistanceLevel, setResistanceLevel] = useState("63000");

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof graph>) => adminService.updateGraphSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graphSettings"] });
    }
  });

  // Generate initial price sequence data
  useEffect(() => {
    const initialPrice = graph?.currentPrice || 62410.50;
    const initialData: PriceTick[] = [];
    for (let i = 20; i >= 0; i--) {
      const timeStr = new Date(Date.now() - i * 1000).toLocaleTimeString();
      initialData.push({
        time: timeStr,
        price: initialPrice - (Math.random() - 0.5) * 40
      });
    }
    setChartData(initialData);
    tickCounterRef.current = 20;
  }, [graph?.currentPrice]);

  // Dynamic ticking interval loop simulating live WebSockets price stream
  useEffect(() => {
    if (!graph || graph.isPaused) return;

    const interval = setInterval(() => {
      setChartData((prevData) => {
        const lastTick = prevData[prevData.length - 1];
        let priceChange = 0;

        // Apply trend bias
        if (graph.trend === MarketTrend.BULLISH) {
          priceChange = Math.random() * 40 + 10; // Upwards bias
        } else if (graph.trend === MarketTrend.BEARISH) {
          priceChange = -Math.random() * 40 - 10; // Downwards bias
        } else {
          priceChange = (Math.random() - 0.5) * graph.volatility * 2; // Random noise
        }

        // Apply price offset delta
        let nextPrice = lastTick.price + priceChange;

        // Enforce support and resistance levels locally on price simulation
        if (nextPrice <= graph.supportLevel) {
          nextPrice = graph.supportLevel + Math.random() * 10; // Bounce up
        } else if (nextPrice >= graph.resistanceLevel) {
          nextPrice = graph.resistanceLevel - Math.random() * 10; // Bounce down
        }

        // Keep price format uniform
        nextPrice = parseFloat(nextPrice.toFixed(2));

        const newTick = {
          time: new Date().toLocaleTimeString(),
          price: nextPrice
        };

        // Update current price in DB/Service on tick so widgets sync
        updateMutation.mutate({ currentPrice: nextPrice });

        // Maintain array of last 30 ticks
        const currentSeries = [...prevData, newTick];
        if (currentSeries.length > 30) currentSeries.shift();
        return currentSeries;
      });
    }, 1000 * (graph.priceSpeed || 1));

    return () => clearInterval(interval);
  }, [graph, graph?.trend, graph?.volatility, graph?.supportLevel, graph?.resistanceLevel, graph?.isPaused, graph?.priceSpeed]);

  const handlePauseToggle = () => {
    if (!graph) return;
    updateMutation.mutate({ isPaused: !graph.isPaused });
  };

  const handleTriggerEvent = async (type: "spike" | "crash" | "reset", size: number) => {
    const updated = await adminService.triggerGraphEvent(type, size);
    queryClient.invalidateQueries({ queryKey: ["graphSettings"] });
    
    // Instantly inject the change on the line chart array so visual is dramatic
    setChartData((prevData) => {
      const last = prevData[prevData.length - 1];
      let delta = 0;
      if (type === "spike") delta = size;
      if (type === "crash") delta = -size;
      
      const newTick = {
        time: new Date().toLocaleTimeString(),
        price: type === "reset" ? 62410.50 : parseFloat((last.price + delta).toFixed(2))
      };
      const series = [...prevData, newTick];
      if (series.length > 30) series.shift();
      return series;
    });
  };

  const handleApplyParameters = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      targetPrice: parseFloat(targetPrice),
      supportLevel: parseFloat(supportLevel),
      resistanceLevel: parseFloat(resistanceLevel)
    });
    alert("Real-time graph boundaries applied instantly! Broadcasted to all connected trader accounts.");
  };

  const handleManualPush = (direction: "up" | "down") => {
    const change = direction === "up" ? 150 : -150;
    handleTriggerEvent(direction === "up" ? "spike" : "crash", 150);
  };

  if (isLoading || !graph) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading Real-Time Graph Desk...</div>;
  }

  // Get current graph price bound states for Y-Axis rendering
  const priceValues = chartData.map(d => d.price);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) - 100 : 61000;
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) + 100 : 64000;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dynamic Graph & Price Control Deck</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct algorithmic price adjustments. Injected spikes, crashes, or support lines propagate instantly via WebSockets.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-emerald-400 font-mono">REAL-TIME PORT: 3000/WS</span>
        </div>
      </div>

      {/* Main Grid: Left is Live chart, right is real-time controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* SVG/Recharts Ticking Price Line Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">BTC/USD Live Feed</span>
                <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">${(graph.currentPrice ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-500"><Activity size={10} /> FEED: ONLINE</span>
                  <span className="flex items-center gap-1 text-slate-400"><DollarSign size={10} /> PROV: BINANCE</span>
                  <span className="flex items-center gap-1 text-indigo-400"><Globe size={10} /> CLI: 1,402</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 select-none">
                <button
                  onClick={handlePauseToggle}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${graph.isPaused ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200"}`}
                >
                  {graph.isPaused ? <Play size={12} /> : <Pause size={12} />}
                  {graph.isPaused ? "Resume graph" : "Pause graph"}
                </button>
                <button
                  onClick={() => alert("Reconnected to feed source.")}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer text-xs flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Reconnect
                </button>
                <button
                  onClick={() => alert("Provider switched from Binance to TradingView WS.")}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer text-xs flex items-center gap-1"
                >
                  <Settings size={12} /> Switch Provider
                </button>
              </div>
            </div>

            {/* Price Line chart canvas */}
            <div className="h-80 w-full select-none rounded-lg overflow-hidden border border-slate-700">
              <iframe 
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BITSTAMP%3ABTCUSD&interval=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BITSTAMP%3ABTCUSD" 
                style={{ width: "100%", height: "100%", margin: 0, padding: 0 }} 
                frameBorder="0" 
                allowTransparency={true} 
                scrolling="no"
                title="TradingView Chart"
              ></iframe>
            </div>
          </div>

          {/* Quick Real-Time Push Buttons Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
            
            <button
              onClick={() => handleManualPush("up")}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <ArrowUp size={20} className="text-emerald-500 animate-bounce" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Push Price Up</span>
              <span className="text-[10px] text-slate-500 font-mono">+$150 instant</span>
            </button>

            <button
              onClick={() => handleManualPush("down")}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <ArrowDown size={20} className="text-rose-500 animate-bounce" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Push Price Down</span>
              <span className="text-[10px] text-slate-500 font-mono">-$150 instant</span>
            </button>

            <button
              onClick={() => handleTriggerEvent("spike", 600)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <Zap size={20} className="text-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Trigger Spike Run</span>
              <span className="text-[10px] text-slate-500 font-mono">+$600 instant</span>
            </button>

            <button
              onClick={() => handleTriggerEvent("crash", 600)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <AlertTriangle size={20} className="text-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Trigger Crash Run</span>
              <span className="text-[10px] text-slate-500 font-mono">-$600 instant</span>
            </button>

          </div>
        </div>

        {/* Real-time parameters modification forms */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Trend manipulation */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Graph Run Modifiers</span>
            
            <div className="space-y-2 select-none">
              <button
                onClick={() => updateMutation.mutate({ trend: MarketTrend.BULLISH })}
                className={`w-full py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${graph.trend === MarketTrend.BULLISH ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}
              >
                <TrendingUp size={14} />
                Bull Run (Algorithmic Uptrend)
              </button>

              <button
                onClick={() => updateMutation.mutate({ trend: MarketTrend.BEARISH })}
                className={`w-full py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${graph.trend === MarketTrend.BEARISH ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}
              >
                <TrendingDown size={14} />
                Bear Run (Algorithmic Downtrend)
              </button>

              <button
                onClick={() => updateMutation.mutate({ trend: MarketTrend.NORMAL })}
                className={`w-full py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${graph.trend === MarketTrend.NORMAL ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}
              >
                <Activity size={14} />
                Random Mode (No Bias)
              </button>
            </div>
          </div>

          {/* Boundaries Inputs */}
          <form onSubmit={handleApplyParameters} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Reconciliation Coordinates</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Target price index (USD)</label>
                <input
                  type="text"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 62500"
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Resistance Limit coordinate</label>
                <input
                  type="text"
                  value={resistanceLevel}
                  onChange={(e) => setResistanceLevel(e.target.value)}
                  placeholder="e.g. 63000"
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Support Limit coordinate</label>
                <input
                  type="text"
                  value={supportLevel}
                  onChange={(e) => setSupportLevel(e.target.value)}
                  placeholder="e.g. 62000"
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10"
            >
              <Sliders size={14} />
              Apply parameters instantly
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
