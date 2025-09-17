import { Actor, HttpAgent, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { AuthClient } from '@dfinity/auth-client'

// Import generated Candid interfaces
// These will be available after running 'dfx generate rotatechain_backend'
import { 
  rotatechain_backend,
  createActor as createBackendActor,
  canisterId as backendCanisterId
} from '../../../../declarations/rotatechain_backend'

// Environment configuration
const isProduction = import.meta.env.MODE === 'production'
const host = isProduction ? 'https://ic0.app' : 'http://localhost:4943'
const canisterId = import.meta.env.VITE_ROTATECHAIN_BACKEND_CANISTER_ID || backendCanisterId

// Backend service types (derived from your Motoko implementation)
export interface GroupConfig {
  id: bigint
  name: string
  description: string
  admin: Principal
  members: Principal[]
  maxMembers: bigint
  minMembers: bigint
  contributionAmount: bigint
  rotationIntervalDays: bigint
  startDate: bigint
  endDate: bigint | null
  status: GroupStatus
}

export interface GroupStatus {
  forming?: null
  active?: null
  paused?: null
  completed?: null
  cancelled?: null
}

export interface Member {
  principal: Principal
  joinedAt: bigint
  totalContributions: bigint
  receivedPayouts: bigint
  liquidTokens: bigint
  status: MemberStatus
}

export interface MemberStatus {
  active?: null
  pending?: null
  suspended?: null
  exited?: null
}

export interface RToken {
  id: bigint
  groupId: bigint
  holder: Principal
  originalAmount: bigint
  currentAmount: bigint
  issuedAt: bigint
  lastYieldUpdate: bigint
  accumulatedYield: bigint
  status: RTokenStatus
  memo: string | null
}

export interface RTokenStatus {
  active?: null
  redeemed?: null
  locked?: null
}

export interface RTokenTransfer {
  id: bigint
  tokenId: bigint
  from: Principal
  to: Principal
  amount: bigint
  timestamp: bigint
  memo: string | null
}

export interface Loan {
  id: bigint
  borrower: Principal
  borrowerGroupId: bigint
  principalAmount: bigint
  interestRate: number
  termDays: bigint
  collateralTokenIds: bigint[]
  disbursedAt: bigint | null
  repaidAt: bigint | null
  defaultedAt: bigint | null
  status: LoanStatus
  memo: string | null
}

export interface LoanStatus {
  pending?: null
  approved?: null
  active?: null
  repaid?: null
  defaulted?: null
}

export interface GroupPerformanceMetrics {
  groupId: bigint
  totalMembers: bigint
  activeMembers: bigint
  totalContributions: bigint
  completedRounds: bigint
  totalRounds: bigint
  averageYield: number
  totalYieldGenerated: bigint
  participationRate: number
  groupHealth: number
  rTokenCirculation: bigint
  averageContributionDelay: number
  complianceRate: number
}

export interface UserAnalytics {
  principal: Principal
  groupsJoined: bigint
  totalContributed: bigint
  totalReceived: bigint
  rTokenBalance: bigint
  rTokensTransferred: bigint
  loansRequested: bigint
  loansApproved: bigint
  totalBorrowed: bigint
  totalRepaid: bigint
  creditScore: number
  participationScore: number
  yieldEarned: bigint
  missedContributions: bigint
  averageResponseTime: number
}

export interface PlatformAnalytics {
  totalGroups: bigint
  activeGroups: bigint
  totalUsers: bigint
  activeUsers: bigint
  totalValueLocked: bigint
  totalRTokens: bigint
  totalLoans: bigint
  averageGroupSize: number
  averageYield: number
  defaultRate: number
  rTokenVelocity: number
}

export type BackendError = 
  | { GroupNotFound: null }
  | { InsufficientBalance: null }
  | { UnauthorizedAccess: null }
  | { InvalidAmount: null }
  | { GroupFull: null }
  | { AlreadyMember: null }
  | { NotMember: null }
  | { RotationInProgress: null }
  | { PaymentFailed: null }
  | { LoanNotFound: null }
  | { InsufficientCollateral: null }
  | { InvalidLoanTerm: null }
  | { LoanNotActive: null }
  | { CollateralLocked: null }

export type BackendResult<T> = { ok: T } | { err: BackendError }

class CanisterService {
  private agent: HttpAgent | null = null
  private actor: typeof rotatechain_backend | null = null

  async initialize(identity?: Identity): Promise<void> {
    if (!this.agent) {
      this.agent = new HttpAgent({
        host,
        identity: identity || undefined
      })

      // Only fetch root key in development
      if (!isProduction) {
        await this.agent.fetchRootKey()
      }
    }

    if (!this.actor) {
      this.actor = createBackendActor(canisterId, {
        agent: this.agent
      })
    }
  }

  async initializeWithAuth(): Promise<void> {
    const authClient = await AuthClient.create()
    const isAuthenticated = await authClient.isAuthenticated()
    
    if (isAuthenticated) {
      const identity = authClient.getIdentity()
      await this.initialize(identity)
    } else {
      await this.initialize()
    }
  }

  // ==================== HEALTH & SYSTEM ====================
  
  async healthCheck(): Promise<boolean> {
    await this.initializeWithAuth()
    return await this.actor!.healthCheck()
  }

  async runSystemTests(): Promise<any> {
    await this.initializeWithAuth()
    return await this.actor!.runSystemTests()
  }

  // ==================== GROUP MANAGEMENT ====================
  
  async createGroup(
    name: string,
    description: string,
    maxMembers: number,
    contributionAmount: number,
    rotationIntervalDays: number
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.createGroup(
      name,
      description,
      BigInt(maxMembers),
      BigInt(contributionAmount),
      BigInt(rotationIntervalDays)
    )
  }

  async joinGroup(groupId: number): Promise<BackendResult<boolean>> {
    await this.initializeWithAuth()
    return await this.actor!.joinGroup(BigInt(groupId))
  }

  async leaveGroup(groupId: number): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.leaveGroup(BigInt(groupId))
  }

  async getGroup(groupId: number): Promise<GroupConfig | null> {
    await this.initializeWithAuth()
    const result = await this.actor!.getGroup(BigInt(groupId))
    return result.length > 0 ? result[0] : null
  }

  async getAllGroups(): Promise<GroupConfig[]> {
    await this.initializeWithAuth()
    return await this.actor!.getAllGroups()
  }

  async getMyGroups(): Promise<GroupConfig[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyGroups()
  }

  async getGroupMembers(groupId: number): Promise<Member[]> {
    await this.initializeWithAuth()
    return await this.actor!.getGroupMembers(BigInt(groupId))
  }

  // ==================== CONTRIBUTIONS ====================
  
  async contribute(
    groupId: number,
    amount: number
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.contribute(BigInt(groupId), BigInt(amount))
  }

  async getContributionHistory(groupId: number): Promise<any[]> {
    await this.initializeWithAuth()
    return await this.actor!.getContributionHistory(BigInt(groupId))
  }

  // ==================== R TOKEN OPERATIONS ====================
  
  async transferRTokens(
    tokenId: number,
    to: Principal,
    amount: number,
    memo?: string
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.transferRTokens(
      BigInt(tokenId),
      to,
      BigInt(amount),
      memo ? [memo] : []
    )
  }

  async redeemRTokens(
    tokenId: number,
    amount: number
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.redeemRTokens(BigInt(tokenId), BigInt(amount))
  }

  async getRTokenBalance(groupId: number): Promise<bigint> {
    await this.initializeWithAuth()
    return await this.actor!.getRTokenBalance(BigInt(groupId))
  }

  async getAllRTokenBalances(): Promise<[bigint, bigint][]> {
    await this.initializeWithAuth()
    return await this.actor!.getAllRTokenBalances()
  }

  async getMyRTokens(): Promise<RToken[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyRTokens()
  }

  async getMyTransferHistory(): Promise<RTokenTransfer[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyTransferHistory()
  }

  // ==================== LENDING OPERATIONS ====================
  
  async requestLoan(
    borrowerGroupId: number,
    principalAmount: number,
    termDays: number,
    collateralTokenIds: number[],
    memo?: string
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.requestLoan(
      BigInt(borrowerGroupId),
      BigInt(principalAmount),
      BigInt(termDays),
      collateralTokenIds.map(id => BigInt(id)),
      memo ? [memo] : []
    )
  }

  async makeLoanPayment(
    loanId: number,
    amount: number
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.makeLoanPayment(BigInt(loanId), BigInt(amount))
  }

  async getLoan(loanId: number): Promise<Loan | null> {
    await this.initializeWithAuth()
    const result = await this.actor!.getLoan(BigInt(loanId))
    return result.length > 0 ? result[0] : null
  }

  async getMyLoans(): Promise<Loan[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyLoans()
  }

  async getMyBorrowingHistory(): Promise<any[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyBorrowingHistory()
  }

  // ==================== ANALYTICS ====================
  
  async getGroupAnalytics(groupId: number): Promise<GroupPerformanceMetrics | null> {
    await this.initializeWithAuth()
    const result = await this.actor!.getGroupAnalytics(BigInt(groupId))
    return result.length > 0 ? result[0] : null
  }

  async getMyAnalytics(): Promise<UserAnalytics> {
    await this.initializeWithAuth()
    return await this.actor!.getMyAnalytics()
  }

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    await this.initializeWithAuth()
    return await this.actor!.getPlatformAnalytics()
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  async getPlatformStats(): Promise<any> {
    await this.initializeWithAuth()
    return await this.actor!.getPlatformStats()
  }

  async getDashboardData(): Promise<any> {
    await this.initializeWithAuth()
    return await this.actor!.getDashboardData()
  }

  // Cleanup method
  cleanup(): void {
    this.agent = null
    this.actor = null
  }
}

// Export singleton instance
export const canisterService = new CanisterService()

// Export service class for testing
export { CanisterService }

// Utility functions
export const formatAmount = (amount: bigint): number => {
  return Number(amount) / 100_000_000 // Convert from e8s to ICP
}

export const toE8s = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 100_000_000)) // Convert ICP to e8s
}

export const formatPrincipal = (principal: Principal): string => {
  const str = principal.toString()
  if (str.length <= 12) return str
  return `${str.slice(0, 6)}...${str.slice(-6)}`
}

// Export types for use in components
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
}