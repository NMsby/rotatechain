import { Principal } from '@dfinity/principal'
import { Actor, HttpAgent, Identity } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'

// Import generated Candid interfaces
// These will be available after running 'dfx generate rotatechain_backend'
import { 
  rotatechain_backend,
  createActor as createBackendActor,
  canisterId
} from '@declarations/rotatechain_backend'
import { 
  Group, 
  GroupSummary,
  RToken as CandidRToken,
  RTokenTransfer as CandidRTokenTransfer,
  Loan as CandidLoan,
  UserAnalytics as CandidUserAnalytics,
  PlatformAnalytics as CandidPlatformAnalytics,
  Error as CandidError 
} from '@declarations/rotatechain_backend/rotatechain_backend.did'

export type BackendError = CandidError


// Fix memo type handling for RToken and RTokenTransfer
const convertCandidRToken = (token: CandidRToken): RToken => ({
  ...token,
  memo: Array.isArray(token.memo) && token.memo.length > 0 ? token.memo[0] : null
})

const convertCandidRTokenTransfer = (transfer: CandidRTokenTransfer): RTokenTransfer => ({
  ...transfer,
  memo: Array.isArray(transfer.memo) && transfer.memo.length > 0 ? transfer.memo[0] : null
})

// Environment configuration
const isProduction = import.meta.env.MODE === 'production'
const host = isProduction ? 'https://ic0.app' : 'http://localhost:4943'
//const canisterId = import.meta.env.VITE_ROTATECHAIN_BACKEND_CANISTER_ID || backendCanisterId


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

export type BackendResult<T> = { ok: T } | { err: BackendError }

class CanisterService {
  private agent: HttpAgent | null = null
  private actor: typeof rotatechain_backend | null = null
  private canisterId: string | Principal = ""


  async initialize(identity?: Identity): Promise<void> {
    this.canisterId = canisterId
    /*if (!this.agent) {
      this.agent = new HttpAgent({
        host,
        identity: identity || undefined
      })

      // Only fetch root key in development
      if (!isProduction) {
        await this.agent.fetchRootKey()
      }
    }*/

    if (!this.actor) {
      this.actor = await createBackendActor(this.canisterId, {
        agentOptions:{
          identity
        }
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
    roundDurationDays: number
    // rotationIntervalDays: number
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()

    return await this.actor!.createGroup(
      name,
      description,
      BigInt(contributionAmount),
      BigInt(maxMembers),
      BigInt(roundDurationDays)
    )
  }

  async joinGroup(groupId: number): Promise<BackendResult<boolean>> {
    await this.initializeWithAuth()
    return await this.actor!.joinGroup(BigInt(groupId))
  }

  // leaveGroup to be implemented (does not exist in backend yet)
  // async leaveGroup(groupId: number): Promise<BackendResult<bigint>> {
  //   await this.initializeWithAuth()
  //   return await this.actor!.leaveGroup(BigInt(groupId))
  // }

  async getGroup(groupId: number): Promise<GroupConfig | null> {
    await this.initializeWithAuth()
    const result = await this.actor!.getGroup(BigInt(groupId))
    return result.length > 0 ? result[0] : null
  }

  async getAllGroups(): Promise<Group[]> {
    await this.initializeWithAuth()
    return await this.actor!.getGroups()
  }

  async getMyGroups(): Promise<GroupSummary[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyGroups()
  }

  // getGroupMembers to be implemented (does not exist in backend yet)
  // async getGroupMembers(groupId: number): Promise<Member[]> {
  //   await this.initializeWithAuth()
  //   return await this.actor!.getGroupMembers(BigInt(groupId))
  // }

  // ==================== CONTRIBUTIONS ====================
  
  async contribute(
    groupId: number,
    amount: number
  ): Promise<BackendResult<bigint>> {
    await this.initializeWithAuth()
    return await this.actor!.recordContribution(BigInt(groupId))
  }

  // getContributionHistory to be implemented (does not exist in backend yet)
  // async getContributionHistory(groupId: number): Promise<any[]> {
  //   await this.initializeWithAuth()
  //   return await this.actor!.getContributionHistory(BigInt(groupId))
  // }

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
    const tokens = await this.actor!.getMyRTokens()
    return tokens.map(convertCandidRToken)
  }

  async getMyTransferHistory(): Promise<RTokenTransfer[]> {
    await this.initializeWithAuth()
    const transfers = await this.actor!.getMyTransferHistory()
    return transfers.map(convertCandidRTokenTransfer)
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
    const result = await this.actor!.getLoanDetails(BigInt(loanId))
    return result.length > 0 ? result[0] : null
  }

  async getMyLoans(): Promise<Loan[]> {
    await this.initializeWithAuth()
    return await this.actor!.getMyLoans()
  }

  // getMyBorrowingHistory to be implemented (does not exist in backend yet)
  // async getMyBorrowingHistory(): Promise<any[]> {
  //   await this.initializeWithAuth()
  //   return await this.actor!.getMyBorrowingHistory()
  // }

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


  // getDashboardData() to be implemented (does not exist in backend yet)
  // async getDashboardData(): Promise<any> {
  //   await this.initializeWithAuth()
  //   return await this.actor!.getDashboardData()
  // }

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

// Result handling utility
export const handleBackendResult = <T>(
  result: { ok: T } | { err: any }
): { success: boolean; data?: T; error?: string } => {
  if ('ok' in result) {
    return { success: true, data: result.ok }
  } else {
    return { success: false, error: handleBackendError(result.err) }
  }
}

// Error handling utilities
export const handleBackendError = (error: any): string => {
  if (typeof error === 'object' && error !== null) {
    if ('GroupNotFound' in error) return 'Group not found'
    if ('InsufficientBalance' in error) return 'Insufficient balance'
    if ('UnauthorizedAccess' in error) return 'Unauthorized access'
    if ('InvalidAmount' in error) return 'Invalid amount'
    if ('GroupFull' in error) return 'Group is full'
    if ('AlreadyMember' in error) return 'Already a member'
    if ('NotMember' in error) return 'Not a group member'
    if ('RotationInProgress' in error) return 'Rotation in progress'
    if ('PaymentFailed' in error) return 'Payment failed'
    if ('LoanNotFound' in error) return 'Loan not found'
    if ('InsufficientCollateral' in error) return 'Insufficient collateral'
    if ('InvalidLoanTerm' in error) return 'Invalid loan term'
    if ('LoanNotActive' in error) return 'Loan is not active'
    if ('CollateralLocked' in error) return 'Collateral is locked'
  }
  return 'An unknown error occurred'
}

export const formatDateTime = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1000000) // Convert from nanoseconds  
  return date.toLocaleString()
}

// Export types for use in components
export type {
  GroupConfig as BackendGroupConfig,
  GroupStatus as BackendGroupStatus,
  Member as BackendMember,
  MemberStatus as BackendMemberStatus,
  RToken as BackendRToken,
  RTokenStatus as BackendRTokenStatus,
  RTokenTransfer as BackendRTokenTransfer,
  Loan as BackendLoan,
  LoanStatus as BackendLoanStatus,
  GroupPerformanceMetrics as BackendGroupPerformanceMetrics,
  UserAnalytics as BackendUserAnalytics,
  PlatformAnalytics as BackendPlatformAnalytics,
  BackendError as BackendErrorType,
  BackendResult as BackendResultType
}