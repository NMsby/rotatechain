import { Principal } from '@dfinity/principal'

// Import backend types from canister service
export type {
  GroupConfig,
  GroupStatus,
  Member,
  MemberStatus,
  RToken,
  RTokenStatus,
  RTokenTransfer,
  Loan,
  LoanStatus,
  GroupPerformanceMetrics,
  UserAnalytics,
  PlatformAnalytics,
  BackendError,
  BackendResult
} from '../lib/icp/canisterService'

// Additional frontend-specific types
export interface CreateGroupFormData {
  name: string
  description: string
  maxMembers: number
  contributionAmount: number
  rotationIntervalDays: number
}

export interface JoinGroupRequest {
  groupId: number
  agreesToTerms: boolean
}

export interface ContributeRequest {
  groupId: number
  amount: number
  memo?: string
}

export interface TransferRTokenRequest {
  tokenId: number
  to: Principal
  amount: number
  memo?: string
}

export interface LoanRequest {
  borrowerGroupId: number
  principalAmount: number
  termDays: number
  collateralTokenIds: number[]
  memo?: string
}

export interface LoanPaymentRequest {
  loanId: number
  amount: number
}

export interface RedeemRTokenRequest {
  tokenId: number
  amount: number
}

// API Response wrapper for frontend
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Dashboard data structure
export interface DashboardData {
  userGroups: GroupConfig[]
  userAnalytics: UserAnalytics
  platformStats: PlatformAnalytics
  recentActivity: any[]
}

// Group summary for listings
export interface GroupSummary {
  id: number
  name: string
  memberCount: number
  contributionAmount: number
  currentRound: number
  totalRounds: number
  isActive: boolean
  spotsRemaining: number
  nextRecipient?: Principal
  progress: number
}

// Canister configuration
export interface CanisterConfig {
  canisterId: string
  host: string
  network: 'local' | 'ic'
}

// System health status
export interface SystemHealth {
  isHealthy: boolean
  uptime: number
  lastCheck: string
  services: {
    backend: boolean
    ledger: boolean
    internetIdentity: boolean
  }
}