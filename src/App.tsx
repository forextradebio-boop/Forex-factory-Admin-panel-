import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";

// Page imports
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { UserManagement } from "./pages/UserManagement";
import { KycManagement } from "./pages/KycManagement";
import { DepositManagement } from "./pages/DepositManagement";
import { WithdrawRequests } from "./pages/WithdrawRequests";
import { PaymentSettings } from "./pages/PaymentSettings";
import { ExchangeRateSettings } from "./pages/ExchangeRateSettings";
import { TradingManagement } from "./pages/TradingManagement";
import { MarketControl } from "./pages/MarketControl";
import { GraphControl } from "./pages/GraphControl";
import { AssetManagement } from "./pages/AssetManagement";
import { BonusManagement } from "./pages/BonusManagement";
import { Notifications } from "./pages/Notifications";
import { Reports } from "./pages/Reports";
import { Analytics } from "./pages/Analytics";
import { Support } from "./pages/Support";
import { Settings } from "./pages/Settings";
import { RoleManagement } from "./pages/RoleManagement";
import { HistoryManagement } from "./pages/HistoryManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard component checking authorization states
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/25 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading terminal state...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main Frame split panels layout containing the sidebar and top head navbar
const MainLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const { user, logout } = useAuth();
  
  const [theme, setTheme] = React.useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark"; // Default to dark for "Elegant Dark" design theme!
  });

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0b] text-slate-800 dark:text-gray-200 flex transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        onLogout={logout}
        role={user?.role || "ADMIN"}
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Head navbar */}
        <Navbar 
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          onLogout={logout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic nested routing content canvas */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/kyc" element={<KycManagement />} />
            <Route path="/deposits" element={<DepositManagement />} />
            <Route path="/withdrawals" element={<WithdrawRequests />} />
            <Route path="/payment-settings" element={<PaymentSettings />} />
            <Route path="/exchange-rates" element={<ExchangeRateSettings />} />
            <Route path="/trading" element={<TradingManagement />} />
            <Route path="/market-control" element={<MarketControl />} />
            <Route path="/graph-control" element={<GraphControl />} />
            <Route path="/assets" element={<AssetManagement />} />
            <Route path="/bonuses" element={<BonusManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/support" element={<Support />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/history" element={<HistoryManagement />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Authenticated route wrappers */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              } 
            />
            {/* Unauthenticated route parameters */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
