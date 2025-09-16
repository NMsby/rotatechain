// Core entity types for RotateChain
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletAddress: string;
  internetIdentityPrincipal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalChains: number;
  totalVolume: number;
  systemUptime: number;
  lastBlockTime: string;
  activeChains: number;
}

export interface SystemHealth {
  uptime: number;
  lastBlock: string;
  activeChains: number;
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
}

export interface Chain {
  id: string;
  name: string;
  description: string;
  totalMembers: number;
  contributionAmount: number;
  rotationPeriod: number; // in days
  currentRound: number;
  totalRounds: number;
  status: 'active' | 'completed' | 'paused';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  nextPayoutDate: string;
  chainType: 'standard' | 'premium' | 'enterprise';
}

export interface Group {
  id: string;
  chainId: string;
  name: string;
  members: string[];
  currentPayout: number;
  totalContributions: number;
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Pool {
  id: string;
  name: string;
  totalLiquidity: number;
  apy: number;
  tokenSymbol: string;
  participants: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface RToken {
  id: string;
  symbol: string;
  balance: number;
  usdValue: number;
  chainId: string;
  liquidityRatio: number;
  lastUpdated: string;
}

export interface Activity {
  id: string;
  type: 'contribution' | 'payout' | 'stake' | 'unstake' | 'trade';
  description: string;
  amount: number;
  tokenSymbol: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  chainId?: string;
  poolId?: string;
}

export interface UserBalance {
  rTokens: RToken[];
  liquidAssets: {
    symbol: string;
    balance: number;
    usdValue: number;
  }[];
  totalValue: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Form types
export interface CreateChainFormData {
  name: string;
  description: string;
  contributionAmount: number;
  rotationPeriod: number;
  maxMembers: number;
  chainType: 'standard' | 'premium' | 'enterprise';
}

export interface JoinChainFormData {
  chainId: string;
  agreesToTerms: boolean;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ICP-specific types
export interface ICPAuthData {
  principal: string
  identity: string
  delegationExpiry: number
}

// Wallet connection types
export interface WalletConnection {
  isConnected: boolean
  principal: string | null
  balance: number
  walletType: 'internet-identity' | 'plug' | 'stoic' | null
}

// Theme types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}