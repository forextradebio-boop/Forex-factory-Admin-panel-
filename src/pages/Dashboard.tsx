import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { CardSkeleton, ChartSkeleton } from "../components/Skeletons";
import { 
  Users, 
  UserCheck, 
  UserX, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  Wallet, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  Share2, 
  Percent, 
  CheckCircle2, 
  XCircle, 
  Activity,
  ChevronRight,
  TrendingDown,
  Info
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { Link } from "react-router-dom";
import { UniversalCurrencyCalculator } from "../components/UniversalCurrencyCalculator";

export const Dashboard: React.FC = () => {
  const [activeChartTab, setActiveChartTab] = useState<"deposits" | "withdrawals" | "users" | "volume">("deposits");

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 10000,
    retry: false,
  });

  const { data: platformStatus, error: platformError } = useQuery({
    queryKey: ["platformStatus"],
    queryFn: () => adminService.getPlatformStatus(),
    refetchInterval: 5000,
    retry: false,
  });

  // Derived state
  const latestUsers = (Array.isArray(stats?.users) ? stats.users : []).slice(0, 3);
  const latestDeposits = (Array.isArray(stats?.deposits) ? stats.deposits : []).filter((d: any) => d?.status === "PENDING").slice(0, 3);
  const latestWithdrawals = (Array.isArray(stats?.withdrawals) ? stats.withdrawals : []).filter((w: any) => w?.status === "PENDING").slice(0, 3);

  // Stats Card data mappings
  const liveCards = stats ? [
    { name: "Total Users", value: stats.analytics?.totalUsers ?? 0, description: "All registered players", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Verified Users", value: stats.users?.filter((u: any) => u.kycStatus === 'APPROVED').length ?? 0, description: "KYC approved accounts", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Pending KYC", value: stats.kycRequests?.filter((k: any) => k.status === 'PENDING').length ?? 0, description: "Documents awaiting audit", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Online Users", value: stats.analytics?.activeUsers ?? 0, description: "Active sessions right now", icon: Activity, color: "text-emerald-400 border border-emerald-400/20", bg: "bg-emerald-500/10 shadow-emerald-500/10 shadow-lg glow-green" },
    { name: "Today's Deposits", value: `₹${(stats.analytics?.depositsToday ?? 0).toLocaleString()}`, description: "Accumulated credit volume (INR)", icon: ArrowDownCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Pending Deposits", value: stats.deposits?.filter((d: any) => d.status === 'PENDING').length ?? 0, description: "Requests waiting for review", icon: Clock, color: "text-emerald-400 border border-emerald-400/20", bg: "bg-emerald-500/10 shadow-emerald-500/10 shadow-lg glow-green" },
    { name: "Today's Withdrawals", value: `$${(stats.analytics?.withdrawalsToday ?? 0).toLocaleString()}`, description: "Requested payout volume (USD)", icon: ArrowUpCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { name: "Pending Withdrawals", value: stats.withdrawals?.filter((w: any) => w.status === 'PENDING').length ?? 0, description: "Requests waiting for review", icon: Clock, color: "text-rose-400 border border-rose-400/20", bg: "bg-rose-500/10 shadow-rose-500/10 shadow-lg glow-red" },
    { name: "Total Vault Balance", value: `$${(stats.wallets?.reduce((acc: number, w: any) => acc + (w.balance || 0), 0) ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, description: "Main account funds sum", icon: Wallet, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Trading Volume", value: `$${(stats.analytics?.totalPlatformVolume ?? 0).toLocaleString()}`, description: "Aggregate trade size (24h)", icon: Coins, color: "text-teal-500", bg: "bg-teal-500/10" },
    { name: "Open Trades", value: stats.analytics?.openPositions ?? 0, description: "Active positions on graph", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Daily Gross Profit", value: `$${Math.max(0, stats.analytics?.totalPnl ?? 0).toLocaleString()}`, description: "Positive closures total", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Daily Net Loss", value: `$${Math.abs(Math.min(0, stats.analytics?.totalPnl ?? 0)).toLocaleString()}`, description: "Negative closures total", icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-500/10" },
    { name: "Daily Net Revenue", value: `$${((stats.analytics?.depositsToday ?? 0) - (stats.analytics?.withdrawalsToday ?? 0)).toLocaleString()}`, description: "Commission + Net profit share", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Referral Earnings", value: `$0`, description: "Affiliate payout totals", icon: Share2, color: "text-sky-500", bg: "bg-sky-500/10" },
    { name: "Global Trading", value: platformStatus?.globalTradingStatus || 'ON', description: "Platform-wide order accept", icon: Activity, color: platformStatus?.globalTradingStatus === 'ON' ? "text-emerald-500" : "text-rose-500", bg: platformStatus?.globalTradingStatus === 'ON' ? "bg-emerald-500/10" : "bg-rose-500/10" },
    { name: "Global Graph", value: platformStatus?.globalGraphStatus || 'LIVE', description: "Live price data feed", icon: Activity, color: platformStatus?.globalGraphStatus === 'LIVE' ? "text-emerald-500" : "text-rose-500", bg: platformStatus?.globalGraphStatus === 'LIVE' ? "bg-emerald-500/10" : "bg-rose-500/10" },
    { name: "Global Market", value: platformStatus?.globalMarketStatus || 'OPEN', description: "Overall market session", icon: Activity, color: platformStatus?.globalMarketStatus === 'OPEN' ? "text-emerald-500" : "text-rose-500", bg: platformStatus?.globalMarketStatus === 'OPEN' ? "bg-emerald-500/10" : "bg-rose-500/10" },
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero / Status banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trading Operations Command Room</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time statistics, graph flow, and transaction logs monitor.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE DESK: CONNECTED</span>
          </div>
          <button 
            onClick={() => { refetchStats(); }} 
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Refresh data
          </button>
        </div>
      </div>

      {/* Grid of 14 Live cards */}
      {statsError ? (
        <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
          <h3 className="font-bold flex items-center gap-2">
            <XCircle size={18} /> Dashboard unavailable
          </h3>
          <p className="text-sm mt-1">{(statsError as Error).message || "The admin dashboard could not be loaded. Please sign in again or try again shortly."}</p>
          {platformError ? (
            <p className="text-xs mt-2">Platform status could not be loaded as well.</p>
          ) : null}
        </div>
      ) : statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {liveCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex items-start justify-between transition-all hover:translate-y-[-2px] hover:shadow-md"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{card.name}</span>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{card.value}</p>
                  <p className="text-[10px] text-slate-500">{card.description}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart Section and Tickers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Area charts (Recharts) */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Desks Performance Analytics</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Historical and real-time visual analytics of users, funds flow, and sizes.</p>
            </div>
            
            {/* Tab selection */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950/40 shrink-0">
              {(["deposits", "withdrawals", "users", "volume"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-2.5 py-1 text-[10px] font-semibold uppercase rounded-md transition-colors cursor-pointer ${activeChartTab === tab ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {statsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <ChartSkeleton />
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeChartTab === "withdrawals" ? "#f43f5e" : "#10b981"} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={activeChartTab === "withdrawals" ? "#f43f5e" : "#10b981"} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#f1f5f9"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeChartTab === "users" ? "users" : activeChartTab === "volume" ? "volume" : "amount"}
                    stroke={activeChartTab === "withdrawals" ? "#f43f5e" : "#10b981"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Live Market Status Tickers */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Live Assets Status</h2>
              <span className="text-[10px] uppercase font-bold text-slate-400">Trading Tickers</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bitcoin / USD</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">$62,410.50</p>
                  <span className="text-[9px] text-emerald-500 font-bold">+3.42%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Apple Inc.</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">$189.84</p>
                  <span className="text-[9px] text-emerald-500 font-bold">+1.89%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ethereum / USD</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">$3,450.20</p>
                  <span className="text-[9px] text-rose-500 font-bold">-1.24%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Market Feed Status</span>
            <span className="text-emerald-500 font-bold">100% ONLINE</span>
          </div>
        </div>

      </div>

      {/* Universal Currency Calculator Widget */}
      <div className="mb-6">
        <UniversalCurrencyCalculator />
      </div>

      {/* Tables Row: Recent Registrations, Withdrawals, and Deposits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Registrations */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Registrations</h3>
            <Link to="/users" className="text-[10px] text-emerald-500 hover:underline flex items-center gap-0.5">
              <span>All Users</span>
              <ChevronRight size={12} />
            </Link>
          </div>
          
          <div className="space-y-3 flex-1">
            {latestUsers.map((u: any) => (
              <div key={u.id || u._id || Math.random()} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/30">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{u.fullName || u.username}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{u.email || 'No Email'}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Deposits */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Deposits</h3>
            <Link to="/deposits" className="text-[10px] text-emerald-500 hover:underline flex items-center gap-0.5">
              <span>View Desk</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {latestDeposits.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 py-6">
                <span>No pending deposits</span>
              </div>
            ) : (
              latestDeposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/30">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{d.userFullName}</p>
                    <p className="text-[10px] text-emerald-500 font-mono font-bold">{d.paymentMethod}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">${d.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Withdrawals</h3>
            <Link to="/withdrawals" className="text-[10px] text-emerald-500 hover:underline flex items-center gap-0.5">
              <span>Review Desk</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {latestWithdrawals.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 py-6">
                <span>No pending withdrawal requests</span>
              </div>
            ) : (
              latestWithdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/30">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{w.userFullName}</p>
                    <p className="text-[10px] text-rose-500 font-mono font-bold">Payout Requested</p>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">${w.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
