import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  History,
  Coins,
  Globe,
  Sliders,
  DollarSign,
  Sparkles,
  Bell,
  FileSpreadsheet,
  BarChart3,
  HelpCircle,
  Settings as SettingsIcon,
  UserCheck,
  ClipboardList,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  role: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onLogout, role }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "KYC Management", path: "/kyc", icon: UserCheck },
    { name: "Deposits", path: "/deposits", icon: ArrowDownCircle },
    { name: "Withdraw Requests", path: "/withdrawals", icon: ArrowUpCircle },
    { name: "Payment Settings", path: "/payment-settings", icon: Wallet },
    { name: "Exchange Rates", path: "/exchange-rates", icon: DollarSign },
    { name: "Trading", path: "/trading", icon: TrendingUp },
    { name: "Market Control", path: "/market-control", icon: Globe },
    { name: "Graph Control", path: "/graph-control", icon: Sliders },
    { name: "Asset Management", path: "/assets", icon: Coins },
    { name: "Bonuses", path: "/bonuses", icon: Sparkles },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Reports", path: "/reports", icon: FileSpreadsheet },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Support Tickets", path: "/support", icon: HelpCircle },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
    { name: "Roles & Permissions", path: "/roles", icon: ClipboardList, superAdminOnly: true },
    { name: "History & Archives", path: "/history", icon: History }
  ];

  const activeClass = "bg-emerald-500/10 text-emerald-500 dark:bg-blue-600/10 dark:text-blue-400 border border-emerald-500/20 dark:border-blue-600/20 font-medium";
  const inactiveClass = "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-800/50 border border-transparent transition-all duration-200";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 dark:bg-[#0f0f12] border-r border-slate-800 dark:border-gray-800 z-50 flex flex-col transition-transform duration-300 transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:h-screen`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 dark:border-gray-800 bg-slate-950/40 dark:bg-[#050507]/40">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-500 dark:bg-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-blue-500/20">
              <span className="text-slate-900 dark:text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-slate-100">AURA ADMIN</h1>
              <p className="text-[10px] text-emerald-400 dark:text-blue-400 font-medium tracking-widest uppercase">Trading Desk</p>
            </div>
          </Link>
          <button onClick={onToggle} className="text-slate-400 hover:text-slate-100 lg:hidden focus:outline-none">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 select-none">
          {menuItems.map((item) => {
            if (item.superAdminOnly && role !== "SUPER_ADMIN") return null;
            
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? activeClass : inactiveClass}`}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
              >
                <Icon size={18} className={isActive ? "text-emerald-500 dark:text-blue-400" : "text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Section */}
        <div className="p-4 border-t border-slate-800 dark:border-gray-800 bg-slate-950/20 dark:bg-[#050507]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-slate-200 text-sm border border-slate-700">
                SA
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">Super Admin</p>
                <p className="text-[10px] text-slate-500">admin@trading.com</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800/40 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
