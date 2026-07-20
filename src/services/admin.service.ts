import { api, API_BASE_URL } from "./api";
import {
  User,
  UserStatus,
  KycStatus,
  TransactionStatus,
  TradeStatus,
  AssetType,
  MarketTrend,
  TicketStatus,
  TicketPriority,
  AdminRole,
  KycDocument,
  Deposit,
  Withdrawal,
  Trade,
  TradeDirection,
  Asset,
  SupportTicket,
  ActivityLog,
  BonusConfig,
  SystemSettings,
  MarketSettings,
  GraphSettings
} from "../types";

export const adminService = {
  // --- AUTH SERVICES ---
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await api.post("/auth/login", { username: email, password });
    return { token: res.data.token, user: res.data.profile };
  },

  async getCurrentUser(): Promise<any> {
    const res = await api.get("/auth/me");
    return res.data;
  },

  // --- STATS / ANALYTICS ---
  async getDashboardStats() {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },

  async getAnalyticsData(): Promise<any> {
    // TODO: Waiting for backend endpoint for time-series analytics charts
    // The main dashboard stats are now fetched from /admin/dashboard
    throw new Error("No API Available");
  },

  async getPlatformStatus(): Promise<any> {
    const res = await api.get("/admin/platform/status");
    return res.data;
  },

  async updatePlatformTradingStatus(status: "ON" | "OFF"): Promise<any> {
    const res = await api.patch("/admin/platform/trading-status", { status });
    return res.data;
  },

  async updatePlatformGraphStatus(status: "LIVE" | "PAUSED"): Promise<any> {
    const res = await api.patch("/admin/platform/graph-status", { status });
    return res.data;
  },

  async updatePlatformMarketStatus(status: "OPEN" | "CLOSED" | "MAINTENANCE" | "HOLIDAY"): Promise<any> {
    const res = await api.patch("/admin/platform/market-status", { status });
    return res.data;
  },

  // --- USER MANAGEMENT ---
  async getUsers(): Promise<User[]> {
    const res = await api.get("/admin/users");
    // Map backend _id to frontend id
    return (res.data.users || []).map((u: any) => ({
      ...u,
      id: u._id || u.id,
      // Provide an empty wallet fallback since backend doesn't populate it on this route
      wallet: u.wallet || { balance: 0, bonusBalance: 0, demoBalance: 0, isFrozen: false }
    }));
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    throw new Error("Backend API Not Available");
  },

  async adjustWallet(id: string, type: "balance" | "bonusBalance" | "demoBalance", amount: number, operation: "credit" | "debit"): Promise<any> {
    const res = await api.post(`/admin/wallet`, {
      userId: id,
      action: operation === "credit" ? "CREDIT" : "DEBIT",
      amount
    });
    return res.data;
  },

  async toggleFreezeWallet(id: string, action: "FREEZE" | "UNFREEZE"): Promise<any> {
    const res = await api.post(`/admin/wallet`, { userId: id, action });
    return res.data;
  },

  async blockUser(id: string): Promise<User> {
    const res = await api.post(`/admin/user`, { userId: id, action: "DISABLE" });
    return res.data;
  },

  async unblockUser(id: string): Promise<User> {
    const res = await api.post(`/admin/user`, { userId: id, action: "ENABLE" });
    return res.data;
  },

  async resetPassword(id: string, newPassword: string): Promise<User> {
    const res = await api.post(`/admin/user`, { userId: id, action: "RESET_PASSWORD", newPassword });
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    throw new Error("Backend API Not Available");
  },

  async clearUserHistory(id: string): Promise<void> {
    const res = await api.delete(`/admin/users/${id}/history`);
    return res.data;
  },

  // --- KYC SERVICES ---
  async getKycDocuments(): Promise<KycDocument[]> {
    const res = await api.get("/admin/kyc");
    console.log("RAW KYC RESPONSE:", res.data);

    const extractImageValue = (value: any): string => {
      if (!value) return "";
      if (typeof value === "string") {
        const trimmed = value.trim();
        return /^data:image\//i.test(trimmed) || /^blob:/i.test(trimmed) || /^https?:\/\//i.test(trimmed) || /\/uploads\//i.test(trimmed) || /^uploads\//i.test(trimmed) || /^\/api\/uploads\//i.test(trimmed) ? trimmed : "";
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          const found = extractImageValue(item);
          if (found) return found;
        }
        return "";
      }
      if (typeof value === "object") {
        for (const key of ["url", "src", "path", "image", "file", "document", "documentUrl", "fileUrl", "aadharDocument", "panDocument", "frontImage", "selfieImage", "aadharUrl", "panUrl", "aadharDocumentUrl", "panDocumentUrl"]) {
          const found = extractImageValue((value as any)[key]);
          if (found) return found;
        }
      }
      return "";
    };

    return (res.data.kycRequests || []).map((kyc: any) => {
      const frontImage = extractImageValue(kyc.aadharDocument || kyc.frontImage || kyc.aadharDocumentUrl || kyc.aadharUrl) || extractImageValue(kyc.documents?.[0] || kyc.documents);
      const selfieImage = extractImageValue(kyc.panDocument || kyc.selfieImage || kyc.panDocumentUrl || kyc.panUrl) || extractImageValue(kyc.documents?.[1] || kyc.documents);

      return {
        ...kyc,
        id: kyc._id,
        userId: kyc.userId?._id || kyc.userId,
        userFullName: kyc.userId?.fullName || kyc.userId?.username || 'Unknown User',
        userEmail: kyc.userId?.email || 'N/A',
        documentType: kyc.aadharNumber ? 'Aadhar & PAN' : 'National ID',
        documentNumber: kyc.aadharNumber || kyc.panNumber || kyc.accountNumber || 'N/A',
        aadharNumber: kyc.aadharNumber,
        panNumber: kyc.panNumber,
        bankName: kyc.bankName,
        accountNumber: kyc.accountNumber,
        ifscCode: kyc.ifscCode,
        accountHolderName: kyc.accountHolderName,
        aadharDocument: kyc.aadharDocument,
        panDocument: kyc.panDocument,
        frontImage,
        selfieImage,
        status: kyc.status,
        adminNotes: kyc.adminNotes,
        submittedAt: kyc.createdAt
      };
    });
  },

  async reviewKyc(id: string, status: KycStatus, rejectionReason?: string): Promise<KycDocument> {
    if (status === KycStatus.APPROVED) {
      const res = await api.post(`/admin/kyc/${id}/approve`);
      return res.data;
    } else {
      const res = await api.post(`/admin/kyc/${id}/reject`, { reason: rejectionReason });
      return res.data;
    }
  },

  // --- DEPOSITS ---
  async getDeposits(): Promise<Deposit[]> {
    try {
      const res = await api.get("/admin/deposits");
      const mapped = (res.data.deposits || []).map((d: any) => ({
        id: d._id,
        userId: d.userId?._id || "",
        userFullName: d.userId?.fullName || "Unknown",
        userEmail: d.userId?.email || "Unknown",
        amount: d.amount,
        currency: d.currency,
        paymentMethod: d.paymentMethod,
        proofImage: d.screenshot || "",
        transactionId: d.utr || "",
        status: d.status,
        rejectionReason: d.remarks || "",
        exchangeRate: d.exchangeRate,
        creditedUSD: d.creditedUSD,
        createdAt: d.createdAt,
        reviewedAt: d.approvedAt || d.updatedAt
      }));
      return mapped;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async approveTransaction(id: string, customExchangeRate?: number): Promise<Deposit> {
    try {
      const res = await api.patch(`/admin/deposits/${id}/approve`, { customExchangeRate });
      return res.data.deposit;
    } catch (err: any) {
      throw err;
    }
  },

  async reviewDeposit(id: string, status: TransactionStatus, rejectionReason?: string, customExchangeRate?: number): Promise<Deposit> {
    if (status === TransactionStatus.APPROVED) {
      const res = await api.patch(`/admin/deposits/${id}/approve`, { customExchangeRate });
      return res.data.deposit;
    } else {
      const res = await api.patch(`/admin/deposits/${id}/reject`, { reason: rejectionReason });
      return res.data.deposit;
    }
  },

  async deleteDeposit(id: string): Promise<void> {
    const res = await api.delete(`/admin/deposits/${id}`);
    return res.data;
  },

  // --- WITHDRAWALS ---
  async getWithdrawals(): Promise<Withdrawal[]> {
    const res = await api.get("/admin/withdrawals");
    return (res.data.withdrawals || []).map((w: any) => ({
      ...w,
      id: w._id,
      userId: w.userId?._id || w.userId,
      userFullName: w.userId?.fullName || w.userId?.username || 'Unknown User',
      userEmail: w.userId?.email || 'N/A',
      amount: w.amount,
      currency: w.currency || 'USD',
      bankName: w.bankDetails?.bankName,
      accountNumber: w.bankDetails?.accountNumber,
      accountHolderName: w.bankDetails?.accountHolderName,
      routingNumber: w.bankDetails?.ifsc,
      upiId: w.bankDetails?.upiId,
      status: w.status,
      createdAt: w.createdAt
    }));
  },

  async reviewWithdrawal(id: string, status: TransactionStatus, transactionId?: string, remarks?: string): Promise<Withdrawal> {
    if (status === TransactionStatus.APPROVED) {
      const res = await api.post(`/admin/withdrawals/${id}/approve`, { transactionId });
      return res.data;
    } else {
      const res = await api.post(`/admin/withdrawals/${id}/reject`, { reason: remarks });
      return res.data;
    }
  },

  // --- TRADING SERVICES ---
  async getTrades(): Promise<Trade[]> {
    try {
      const res = await api.get("/admin/trades");
      return res.data;
    } catch (err) {
      console.error("Backend API not fully available", err);
      return [];
    }
  },

  async cancelPendingOrder(id: string): Promise<void> {
    await api.delete(`/admin/orders/${id}`);
  },

  async forceCloseTrade(id: string, exitPrice: number): Promise<Trade> {
    const res = await api.post(`/admin/trades/force-close/${id}`, { price: exitPrice });

    const p = res.data;
    return {
      id: p._id || p.id,
      userId: p.userId,
      userFullName: "Unknown (Admin View)",
      assetSymbol: p.symbol,
      assetType: AssetType.FOREX,
      direction: p.type,
      amount: p.volume,
      leverage: p.leverage || 100,
      entryPrice: p.openPrice,
      exitPrice: p.closePrice,
      profit: p.pnl,
      status: p.status,
      createdAt: p.createdAt || new Date().toISOString()
    };
  },

  // --- MARKET SETTINGS ---
  async getMarketSettings(): Promise<MarketSettings> {
    const res = await api.get("/admin/market-settings");
    return res.data;
  },

  async updateMarketSettings(data: Partial<MarketSettings>): Promise<MarketSettings> {
    const res = await api.put("/admin/market-settings", data);
    return res.data;
  },

  // --- GRAPH CONTROL (WEBSOCKET INTEGRATED REALTIME CONTROLS) ---
  async getGraphSettings(): Promise<GraphSettings> {
    const res = await api.get("/admin/market-settings");
    return res.data;
  },

  async updateGraphSettings(data: Partial<GraphSettings>): Promise<GraphSettings> {
    const res = await api.put("/admin/market-settings", data);
    return res.data;
  },

  async triggerGraphEvent(type: "spike" | "crash" | "reset", size: number = 500): Promise<GraphSettings> {
    const res = await api.post("/graph/event", { type, size });
    return res.data;
  },

  // --- ASSET MANAGEMENT ---
  async getAssets(): Promise<Asset[]> {
    const res = await api.get("/admin/symbols");
    return (res.data.symbols || []).map((s: any) => ({
      id: s.symbol, // Use symbol as ID for toggling
      symbol: s.symbol,
      name: s.name,
      type: s.category as AssetType || AssetType.CRYPTO,
      currentPrice: s.price || 0,
      spread: s.spread || 0,
      priceChange24h: 0,
      isActive: s.isActive,
      minTradeAmount: 10,
      maxTradeAmount: 100000
    }));
  },

  async createAsset(data: Omit<Asset, "id" | "updatedAt">): Promise<Asset> {
    const payload = {
      symbol: data.symbol,
      name: data.name,
      category: data.type,
      price: data.currentPrice,
      leverageLimit: 100,
      spread: data.spread
    };
    const res = await api.post("/admin/symbols", payload);
    const s = res.data;
    return {
      id: s.symbol,
      symbol: s.symbol,
      name: s.name,
      type: s.category as AssetType,
      currentPrice: s.price,
      spread: s.spread,
      priceChange24h: 0,
      isActive: s.isActive,
      minTradeAmount: 10,
      maxTradeAmount: 100000,
      updatedAt: new Date().toISOString()
    };
  },

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    // The backend only supports toggling symbol status
    const res = await api.post(`/admin/symbols/${id}/toggle`);
    return res.data;
  },

  async deleteAsset(id: string): Promise<void> {
    throw new Error("Backend API Not Available - Cannot delete symbols permanently");
  },

  // --- BONUSES ---
  async getBonuses(): Promise<BonusConfig[]> {
    const res = await api.get("/bonuses");
    return res.data;
  },

  async updateBonus(id: string, data: Partial<BonusConfig>): Promise<BonusConfig> {
    const res = await api.put(`/bonuses/${id}`, data);
    return res.data;
  },

  // --- SUPPORT ---
  async getTickets(): Promise<SupportTicket[]> {
    const res = await api.get("/support/tickets");
    return res.data;
  },

  async replyToTicket(id: string, message: string): Promise<SupportTicket> {
    const res = await api.post(`/support/tickets/${id}/reply`, { message });
    return res.data;
  },

  async closeTicket(id: string): Promise<SupportTicket> {
    const res = await api.post(`/support/tickets/${id}/close`);
    return res.data;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SystemSettings> {
    const res = await api.get("/settings");
    return res.data;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await api.put("/settings", data);
    return res.data;
  },

  // --- PAYMENT SETTINGS ---
  async getPaymentSettings(): Promise<any> {
    const res = await api.get('/payment-settings');
    return res.data.settings;
  },

  async updatePaymentSettings(data: any): Promise<any> {
    const res = await api.patch('/payment-settings', data);
    return res.data.settings;
  },

  // --- NEWS & NOTIFICATIONS ---
  async sendNotification(userId: string, title: string, content: string): Promise<any> {
    const res = await api.post("/admin/notifications", { userId, title, content });
    return res.data;
  },

  async createNews(title: string, summary: string, content: string, category: string, source: string): Promise<any> {
    const res = await api.post("/admin/news", { title, summary, content, category, source });
    return res.data;
  },

  // --- ACTIVITY LOGS ---
  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await api.get("/logs");
    return res.data;
  },

  async addLog(action: string, module: string, details: string) {
    const res = await api.post("/logs", { action, module, details });
    return res.data;
  },

  // --- SYMBOLS / MARKETS ---
  async getSymbols(): Promise<any[]> {
    const res = await api.get("/admin/symbols");
    return res.data.symbols || [];
  },

  async updateSymbolStatus(symbol: string, options: any): Promise<any> {
    const res = await api.post(`/admin/symbols/${symbol}/status`, options);
    return res.data;
  },

  async getUserDetails(id: string): Promise<any> {
    const res = await api.get(`/admin/users/${id}/details`);
    return res.data;
  }
};
