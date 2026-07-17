import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { User, UserStatus, WalletType } from "../types";
import { 
  Search, 
  Filter, 
  Edit, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Key, 
  Eye, 
  Wallet, 
  TrendingUp, 
  Download, 
  Plus, 
  Minus,
  RefreshCw,
  LogOut,
  Sparkles,
  Info
} from "lucide-react";

export const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"details" | "wallet" | "trades" | "history">("details");

  // Wallet Adjust state
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"balance" | "bonusBalance" | "demoBalance">("balance");
  const [adjustOperation, setAdjustOperation] = useState<"credit" | "debit">("credit");

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Queries
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => adminService.getUsers(),
  });

  const { data: trades } = useQuery({
    queryKey: ["trades"],
    queryFn: () => adminService.getTrades(),
  });

  const { data: userDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["userDetails", selectedUser?.id],
    queryFn: () => adminService.getUserDetails(selectedUser!.id),
    enabled: !!selectedUser,
  });

  // Mutations
  const walletMutation = useMutation({
    mutationFn: ({ id, type, amount, op }: { id: string; type: "balance" | "bonusBalance" | "demoBalance"; amount: number; op: "credit" | "debit" }) =>
      adminService.adjustWallet(id, type, amount, op),
    onSuccess: (updatedWallet) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setSelectedUser(prev => prev ? { ...prev, wallet: updatedWallet } : null);
      setAdjustAmount("");
      alert(`Successfully adjust user wallet!`);
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const freezeMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "FREEZE" | "UNFREEZE" }) => adminService.toggleFreezeWallet(id, action),
    onSuccess: (updatedWallet) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUser(prev => prev ? { ...prev, wallet: updatedWallet } : null);
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => adminService.blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User blocked successfully");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminService.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User unblocked successfully");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, pass }: { id: string; pass: string }) => adminService.resetPassword(id, pass),
    onSuccess: () => {
      alert(`Password reset successful! New temporary credentials: ${newPassword}`);
      setShowPasswordReset(false);
      setNewPassword("");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUser(null);
      alert("User permanently deleted.");
    },
    onError: (err: any) => alert(err.response?.data?.error || err.message)
  });

  // Filtering
  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    const matchesSearch = (u.fullName || '').toLowerCase().includes((search || '').toLowerCase()) || (u.email || '').toLowerCase().includes((search || '').toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // CSV Exporter
  const exportUsersToCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Status", "KYC Status", "Balance", "Bonus Balance", "Country", "Created At"];
    const rows = filteredUsers.map(u => [
      u.id, u.fullName, u.email, u.phone || "", u.status, u.kycStatus, u.wallet.balance, u.wallet.bonusBalance, u.country, u.createdAt
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aura_Users_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;

    walletMutation.mutate({
      id: selectedUser.id,
      type: adjustType,
      amount,
      op: adjustOperation
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    
    resetPasswordMutation.mutate({ id: selectedUser.id, pass: newPassword });
  };

  const simulateLoginAsUser = (user: User) => {
    adminService.addLog("Impersonation Login", "User Management", `Super Admin logged into user desk: ${user.fullName}`);
    alert(`🔒 Entering client simulation mode as user: ${user.fullName}.\nImpersonated session established successfully in new secure container tab!`);
  };

  const clearHistoryMutation = useMutation({
    mutationFn: (id: string) => adminService.clearUserHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      alert("User's closed trade history cleared successfully.");
    },
    onError: (err: any) => alert(`Failed to clear history: ${err.message}`)
  });

  // Get selected user's active trades
  const userTrades = (Array.isArray(trades) ? trades : []).filter(t => t.userId === selectedUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Management Console</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Search, modify metadata, adjust cash reserves, and monitor positions.</p>
        </div>
        <button
          onClick={exportUsersToCSV}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/10"
        >
          <Download size={14} />
          Export CSV ledger
        </button>
      </div>

      {/* Filters bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0 select-none">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Filter size={12} />
            STATUS:
          </span>
          {(["ALL", UserStatus.ACTIVE, UserStatus.BLOCKED] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${statusFilter === status ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-200"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left is users list, right is active detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Users Table List */}
        <div className="lg:col-span-2 space-y-4">
          {isError && (
            <div className="p-4 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
              Failed to load users: {(error as any)?.message || "Network Error"}
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
              <span className="text-slate-400 text-xs">No registered users matched your criteria</span>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">Trader Name</th>
                    <th className="py-3 px-4">Wallets</th>
                    <th className="py-3 px-4">KYC Status</th>
                    <th className="py-3 px-4">Account status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${selectedUser?.id === user.id ? "bg-slate-50 dark:bg-slate-800/20" : ""}`}
                      onClick={() => { setSelectedUser(user); setActiveDetailTab("details"); }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.isOnline ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                            {(user.fullName || user.username || user.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{user.fullName || user.username}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{user.email || 'No Email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        <div>
                          <p className="text-slate-800 dark:text-slate-200">${(user.wallet?.balance || 0).toFixed(2)}</p>
                          <p className="text-[10px] text-indigo-400">Bonus: ${(user.wallet?.bonusBalance || 0).toFixed(0)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${user.kycStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : user.kycStatus === "PENDING" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => simulateLoginAsUser(user)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-500"
                            title="Login As User"
                          >
                            <Eye size={14} />
                          </button>
                          
                          {user.status === UserStatus.ACTIVE ? (
                            <button
                              onClick={() => blockMutation.mutate(user.id)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500"
                              title="Block User"
                            >
                              <Ban size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => unblockMutation.mutate(user.id)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500"
                              title="Unblock User"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected User Desk / Operations Panel */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6">
              {/* Header profile */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedUser.fullName}</h2>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{selectedUser.id} | {selectedUser.country}</span>
                </div>
                <div className="flex rounded p-0.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setActiveDetailTab("details")} 
                    className={`px-2 py-1 text-[10px] font-bold rounded ${activeDetailTab === "details" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "text-slate-400"}`}
                  >
                    Info
                  </button>
                  <button 
                    onClick={() => setActiveDetailTab("wallet")} 
                    className={`px-2 py-1 text-[10px] font-bold rounded ${activeDetailTab === "wallet" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "text-slate-400"}`}
                  >
                    Reserves
                  </button>
                  <button 
                    onClick={() => setActiveDetailTab("trades")} 
                    className={`px-2 py-1 text-[10px] font-bold rounded ${activeDetailTab === "trades" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "text-slate-400"}`}
                  >
                    Trades
                  </button>
                  <button 
                    onClick={() => setActiveDetailTab("history")} 
                    className={`px-2 py-1 text-[10px] font-bold rounded ${activeDetailTab === "history" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "text-slate-400"}`}
                  >
                    History
                  </button>
                </div>
              </div>

              {/* Tabs Content */}
              {activeDetailTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[10px] text-slate-400 uppercase">Main Balance</span>
                      <p className="font-bold text-slate-800 dark:text-slate-100 font-mono mt-1">${selectedUser.wallet.balance.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[10px] text-slate-400 uppercase">Promo Bonus</span>
                      <p className="font-bold text-indigo-400 font-mono mt-1">${selectedUser.wallet.bonusBalance.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/30">
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedUser.phone || "Not Set"}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Affiliate:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{selectedUser.referralCode || "N/A"}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Wallet:</span>
                      <button 
                        onClick={() => freezeMutation.mutate({ id: selectedUser.id, action: selectedUser.wallet?.isFrozen ? "UNFREEZE" : "FREEZE" })}
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase cursor-pointer ${selectedUser.wallet?.isFrozen ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}
                      >
                        {selectedUser.wallet?.isFrozen ? "FROZEN" : "ACTIVE"}
                      </button>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">KYC Status:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedUser.kycStatus === "APPROVED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : selectedUser.kycStatus === "PENDING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                        {selectedUser.kycStatus || "UNVERIFIED"}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-slate-400">Register:</span>
                      <span className="text-slate-700 dark:text-slate-300">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Security utilities */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                    <button
                      onClick={() => setShowPasswordReset(!showPasswordReset)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Key size={14} />
                      Reset Account Password
                    </button>

                    {showPasswordReset && (
                      <form onSubmit={handleResetPasswordSubmit} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950/20 space-y-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold">New secure password</label>
                        <input
                          type="text"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="e.g. AuraPassSecure99!"
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-100"
                        />
                        <button type="submit" className="w-full py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded cursor-pointer">
                          Confirm password reset
                        </button>
                      </form>
                    )}

                    <button
                      onClick={() => { if(confirm("Are you sure you want to permanently delete this user data ledger?")) deleteMutation.mutate(selectedUser.id); }}
                      className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Purge Account Ledger
                    </button>

                    <button
                      onClick={() => { if(confirm("Are you sure you want to soft-delete this user's closed trade history? Records will be hidden from the user but retained for audit.")) clearHistoryMutation.mutate(selectedUser.id); }}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Clear Trade History
                    </button>
                  </div>
                </div>
              )}

              {activeDetailTab === "wallet" && (
                <form onSubmit={handleWalletSubmit} className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash reserves adjuster</h3>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1 font-semibold">Target Reserve</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as any)}
                      className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 p-2 focus:outline-none"
                    >
                      <option value="balance">Main Balance (USD)</option>
                      <option value="bonusBalance">Promo Bonus Balance</option>
                      <option value="demoBalance">Demo Sandbox Balance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1 font-semibold">Adjustment Operation</label>
                    <div className="grid grid-cols-2 gap-2 select-none">
                      <button
                        type="button"
                        onClick={() => setAdjustOperation("credit")}
                        className={`py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${adjustOperation === "credit" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}
                      >
                        <Plus size={14} />
                        Credit Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustOperation("debit")}
                        className={`py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${adjustOperation === "debit" ? "bg-rose-500/20 text-rose-400 border-rose-500/50" : "border-slate-200 dark:border-slate-800 text-slate-400"}`}
                      >
                        <Minus size={14} />
                        Debit Cash
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1 font-semibold">Adjustment Size (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono">$</span>
                      <input
                        type="text"
                        required
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-4 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={walletMutation.isPending}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10"
                  >
                    <Wallet size={14} />
                    {walletMutation.isPending ? "Writing adjusting transaction..." : "Commit reserves adjustment"}
                  </button>
                </form>
              )}

              {activeDetailTab === "trades" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active desk positions</h3>
                  {userTrades.length === 0 ? (
                    <div className="p-4 text-center rounded bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[11px] text-slate-500">This trader has no open/closed graph trades</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userTrades.map((t) => (
                        <div key={t.id} className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{t.assetSymbol}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.direction === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                              {t.direction}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Amount: ${t.amount}</span>
                            <span className="font-mono">Lev: {t.leverage}x</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Entry Price: ${t.entryPrice}</span>
                            <span className={t.status === "OPEN" ? "text-amber-500" : "text-emerald-500"}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === "history" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial History (Deposits & Withdrawals)</h3>
                  {isDetailsLoading ? (
                    <div className="text-center text-slate-400 text-xs">Loading...</div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {userDetails?.deposits?.length === 0 && userDetails?.withdrawals?.length === 0 && (
                        <div className="p-4 text-center rounded bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40">
                          <span className="text-[11px] text-slate-500">No deposit or withdrawal history found.</span>
                        </div>
                      )}
                      
                      {userDetails?.deposits?.map((d: any) => (
                        <div key={d._id} className="p-3 border border-slate-200 dark:border-slate-800 bg-emerald-500/5 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-500">DEPOSIT</span>
                            <span className="text-[10px] text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Amount:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">${d.amount} {d.currency}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Status:</span>
                            <span className={d.status === "APPROVED" ? "text-emerald-500" : "text-amber-500"}>{d.status}</span>
                          </div>
                        </div>
                      ))}
                      
                      {userDetails?.withdrawals?.map((w: any) => (
                        <div key={w._id} className="p-3 border border-slate-200 dark:border-slate-800 bg-rose-500/5 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-500">WITHDRAWAL</span>
                            <span className="text-[10px] text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Amount:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">${w.amount} {w.currency}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Status:</span>
                            <span className={w.status === "APPROVED" ? "text-emerald-500" : "text-amber-500"}>{w.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20 text-center select-none space-y-2">
              <Info size={20} className="mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">Select a trader account to view active desks, balances, and execute adjustments.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
