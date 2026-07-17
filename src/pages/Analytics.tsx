import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { ChartSkeleton } from "../components/Skeletons";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { BarChart3, TrendingUp, Users, Trophy, Coins } from "lucide-react";

export const Analytics: React.FC = () => {
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ["dashboardAnalytics"],
    queryFn: () => adminService.getAnalyticsData(),
    retry: false
  });

  const topTraders: any[] = [];
  const topAssets: any[] = [];

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance Analytics & Intelligence</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deep analysis on trading volumes, user registration slopes, and top-tier assets portfolios.</p>
        </div>
        <div className="p-8 text-center border border-rose-500/20 bg-rose-500/10 rounded-xl text-rose-500 font-bold text-sm">
          Backend API Not Available. Historical chart data endpoints are missing in the server implementation.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance Analytics & Intelligence</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deep analysis on trading volumes, user registration slopes, and top-tier assets portfolios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User Growth */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Users size={14} className="text-emerald-500" />
            <span>ACCOUNT SIGNUP TRAJECTORY</span>
          </div>
          
          <div className="h-64 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", fontSize: 11 }} />
                <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Distributions */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <BarChart3 size={14} className="text-emerald-500" />
            <span>EXCHANGE TRADING SIZE (WEEKLY)</span>
          </div>

          <div className="h-64 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.tradingVolume} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", fontSize: 11 }} />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Assets */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Coins size={14} className="text-emerald-500" />
            <span>PORTFOLIO SHARES</span>
          </div>

          <div className="space-y-3">
            {topAssets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 dark:bg-slate-950/20">
                <span className="font-bold font-mono">{asset.symbol}</span>
                <div className="flex items-center gap-2 font-mono font-semibold">
                  <div className="w-16 h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${asset.share}%`, backgroundColor: asset.color }} />
                  </div>
                  <span>{asset.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Traders leader board */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Trophy size={14} className="text-emerald-500" />
            <span>LEADERBOARD TRADERS</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Rank</th>
                  <th className="py-2.5 px-4">Trader</th>
                  <th className="py-2.5 px-4">Net profits</th>
                  <th className="py-2.5 px-4">Trade Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {topTraders.map((trader) => (
                  <tr key={trader.rank} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-2.5 px-4 font-bold font-mono text-emerald-500">#{trader.rank}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{trader.name}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">{trader.profit}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold">{trader.winRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
