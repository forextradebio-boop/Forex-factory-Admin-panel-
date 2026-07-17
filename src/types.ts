export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING"
}

export enum KycStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum WalletType {
  MAIN = "MAIN",
  BONUS = "BONUS",
  DEMO = "DEMO"
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRADE_PROFIT = "TRADE_PROFIT",
  TRADE_LOSS = "TRADE_LOSS",
  BONUS = "BONUS",
  ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED"
}

export enum TradeStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  FORCE_CLOSED = "FORCE_CLOSED"
}

export enum TradeDirection {
  BUY = "BUY",
  SELL = "SELL"
}

export enum AssetType {
  CRYPTO = "CRYPTO",
  FOREX = "FOREX",
  STOCKS = "STOCKS",
  COMMODITIES = "COMMODITIES",
  INDICES = "INDICES"
}

export enum MarketTrend {
  BULLISH = "BULLISH",
  BEARISH = "BEARISH",
  NORMAL = "NORMAL"
}

export enum TicketStatus {
  OPEN = "OPEN",
  PENDING = "PENDING",
  CLOSED = "CLOSED"
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SUPPORT = "SUPPORT",
  VIEWER = "VIEWER"
}

// Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  status: UserStatus;
  kycStatus: KycStatus;
  country: string;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
  lastLoginAt?: string;
  isOnline: boolean;
  wallet: Wallet;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  bonusBalance: number;
  demoBalance: number;
  isFrozen: boolean;
  currency: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  documentType: string;
  documentNumber: string;
  aadharNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  aadharDocument?: string;
  panDocument?: string;
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  status: KycStatus;
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  proofImage: string;
  transactionId?: string;
  status: TransactionStatus;
  rejectionReason?: string;
  exchangeRate?: number;
  creditedUSD?: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  amount: number;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  upiId?: string;
  status: TransactionStatus;
  transactionId?: string;
  remarks?: string;
  exchangeRate?: number;
  receivedINR?: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface Trade {
  id: string;
  userId: string;
  userFullName: string;
  assetSymbol: string;
  assetType: AssetType;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  leverage: number;
  profit?: number;
  status: TradeStatus;
  createdAt: string;
  closedAt?: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  priceChange24h: number;
  isActive: boolean;
  spread: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  updatedAt: string;
}

export interface Symbol {
  symbol: string;
  name: string;
  category: string;
  price: number;
  leverageLimit: number;
  spread: number;
  contractSize: number;
  digits: number;
  minLot: number;
  maxLot: number;
  lotStep: number;
  status: 'OPEN' | 'PAUSED' | 'CLOSED' | 'MAINTENANCE';
  visibleToUsers: boolean;
  tradingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userFullName: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: "USER" | "ADMIN" | "SUPPORT";
  message: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminId?: string;
  adminEmail?: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface BonusConfig {
  id: string;
  type: "SIGNUP" | "REFERRAL" | "PROMO" | "CASHBACK" | "TRADING";
  amount: number;
  percentage?: number;
  promoCode?: string;
  isActive: boolean;
  minDepositRequired?: number;
}

export interface SystemSettings {
  logoUrl: string;
  faviconUrl: string;
  siteName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smsGatewayUrl?: string;
  maintenanceMode: boolean;
  tradingEnabled: boolean;
  allowNewRegistrations: boolean;
}

export interface MarketSettings {
  status: "OPEN" | "CLOSED";
  volatility: number; // 0 to 100
  trend: MarketTrend;
  spread: number;
  priceSpeed: number; // multiplier
  refreshInterval: number; // ms
  manualControl: boolean;
}

export interface GraphSettings {
  isPaused: boolean;
  trend: MarketTrend | "RANDOM";
  volatility: number;
  priceSpeed: number;
  priceOffset: number;
  currentPrice: number;
  targetPrice: number;
  supportLevel: number;
  resistanceLevel: number;
}
