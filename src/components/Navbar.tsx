import React, { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Languages, 
  LogOut, 
  ChevronDown, 
  Menu,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  onLogout, 
  theme, 
  onToggleTheme 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState("EN");

  const [notifications, setNotifications] = useState([
    { id: 1, type: "warning", message: "New withdraw request of $1,200 from John Doe", time: "5 mins ago", read: false },
    { id: 2, type: "info", message: "KYC Document submitted by Sara Smith", time: "15 mins ago", read: false },
    { id: 3, type: "success", message: "System settings successfully updated", time: "1 hour ago", read: true },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0f0f12] px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Search Bar / Menu button */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 lg:hidden cursor-pointer focus:outline-none"
        >
          <Menu size={20} />
        </button>

        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, users, trades..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-gray-800 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-4 select-none">
        
        {/* Dark/Light Toggler */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Dark Mode"
        >
          {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLanguage(!showLanguage);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            <Languages size={18} />
            <span className="hidden sm:inline">{language}</span>
            <ChevronDown size={14} className="opacity-60" />
          </button>
          
          {showLanguage && (
            <div className="absolute right-0 mt-2 w-32 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#151518] shadow-xl overflow-hidden py-1 z-50">
              {["EN", "ES", "RU", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguage(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-gray-800 ${language === lang ? "text-blue-500 dark:text-blue-400 font-bold" : "text-slate-600 dark:text-slate-400"}`}
                >
                  {lang === "EN" && "English (EN)"}
                  {lang === "ES" && "Español (ES)"}
                  {lang === "RU" && "Русский (RU)"}
                  {lang === "JP" && "日本語 (JP)"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowLanguage(false);
            }}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#151518] shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-[#0f0f12]/40">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">System Alerts</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-blue-500 hover:underline cursor-pointer">
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-800/40">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 flex items-start gap-3 text-xs hover:bg-slate-50 dark:hover:bg-gray-800/20 transition-all ${!notif.read ? "bg-slate-50/50 dark:bg-gray-800/10" : ""}`}>
                    {notif.type === "warning" && <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
                    {notif.type === "success" && <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />}
                    {notif.type === "info" && <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-200 dark:border-gray-800 text-center bg-slate-50 dark:bg-[#0f0f12]/40">
                <span className="text-[10px] text-slate-400">Showing last 3 notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-gray-800" />

        {/* Admin Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">
            SA
          </div>
          <button onClick={onLogout} className="text-slate-500 hover:text-rose-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Logout">
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </header>
  );
};
