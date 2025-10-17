import { 
  User, 
  DashboardStats, 
  Chain, 
  Group, 
  Pool, 
  Activity, 
  UserBalance, 
  PaginatedResponse,
  SystemHealth,
  TimeSeriesDataPoint
} from '../types'

import { 
  canisterService, 
  formatAmount, 
  toE8s, 
  handleBackendResult,
  handleBackendError,
  formatDateTime,
  type GroupConfig,
  type UserAnalytics,
  type PlatformAnalytics,
  type RToken,
  type RTokenTransfer,
  type Loan
} from './icp/canisterService'


import { Principal } from '@dfinity/principal'

// Helper function to convert backend types to frontend types
const convertGroupConfigToChain = (group: GroupConfig): Chain => ({
  id: group.id.toString(),
  name: group.name,
  description: group.description,
  totalMembers: Number(group.members.length),
  contributionAmount: formatAmount(group.contributionAmount),
  rotationPeriod: Number(group.rotationIntervalDays),
  currentRound: 1, // Will be updated with rotation data
  totalRounds: Number(group.maxMembers),
  status: Object.keys(group.status)[0] as 'active' | 'completed' | 'paused',
  createdBy: group.admin.toString(),
  createdAt: formatDateTime(group.startDate),
  updatedAt: new Date().toISOString(),
  nextPayoutDate: new Date(Date.now() + Number(group.rotationIntervalDays) * 24 * 60 * 60 * 1000).toISOString(),
  chainType: Number(group.maxMembers) > 20 ? 'enterprise' : Number(group.maxMembers) > 10 ? 'premium' : 'standard'
})

const convertGroupConfigToGroup = (group: GroupConfig): Group => ({
  id: group.id.toString(),
  chainId: group.id.toString(),
  name: group.name,
  members: group.members.map(p => p.toString()),
  currentPayout: formatAmount(group.contributionAmount),
  totalContributions: formatAmount(group.contributionAmount) * group.members.length,
  status: Object.keys(group.status)[0] as 'active' | 'completed' | 'pending',
  createdAt: formatDateTime(group.startDate),
  updatedAt: new Date().toISOString()
})

const convertRTokenToActivity = (transfer: RTokenTransfer): Activity => ({
  id: transfer.id.toString(),
  type: 'trade' as const,
  description: `R Token transfer: ${formatAmount(transfer.amount)} tokens`,
  amount: formatAmount(transfer.amount),
  tokenSymbol: 'R-TOKEN',
  timestamp: formatDateTime(transfer.timestamp),
  status: 'completed' as const,
  chainId: transfer.tokenId.toString()
})

const convertUserAnalyticsToUser = (analytics: UserAnalytics): User => ({
  id: analytics.principal.toString(),
  name: `User ${analytics.principal.toString().slice(0, 8)}`,
  email: '', // Not available from backend
  avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${analytics.principal.toString()}`,
  walletAddress: analytics.principal.toString(),
  internetIdentityPrincipal: analytics.principal.toString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

// Real API implementation using backend canister
export const realApi = {
  // ==================== AUTH ====================
  async getCurrentUser(): Promise<User> {
    try {
      const analytics = await canisterService.getMyAnalytics()
      return convertUserAnalyticsToUser(analytics)
    } catch (error) {
      console.error('Failed to get current user:', error)
      throw new Error('Failed to get user information')
    }
  },

  // ==================== WALLET ===================
  async approve({contributionAmount:number,option:string}):Promise<any>{
    console.log("contribution amount")
    try{
      const approve = await canisterService.approveSpender({contributionAmount:contributionAmount,option:option})
      return approve
    }
    catch(error){
      console.error('failed to approve request: \n',error)
      throw new Error('failed to approve request')
    }
  },

  // ==================== DASHBOARD ====================
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [platformAnalytics, userAnalytics] = await Promise.all([
        canisterService.getPlatformAnalytics(),
        canisterService.getMyAnalytics()
      ])

      return {
        // totalGroups: Number(platformAnalytics.totalGroups),
        activeGroups: Number(platformAnalytics.activeGroups),
        totalMembers: Number(platformAnalytics.totalUsers),
        totalValueLocked: formatAmount(platformAnalytics.totalValueLocked),
        userContributions: formatAmount(userAnalytics.totalContributed),
        userReturns: formatAmount(userAnalytics.yieldEarned),
        userGroups: Number(userAnalytics.groupsJoined),
        pendingPayouts: formatAmount(userAnalytics.totalReceived)
      }
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      throw new Error('Failed to load dashboard statistics')
    }
  },

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const isHealthy = await canisterService.healthCheck()
      return {
        status: isHealthy ? 'healthy' : 'error',
        uptime: 99.9,
        services: {
          backend: isHealthy,
          database: isHealthy,
          blockchain: isHealthy
        }
      }
    } catch (error) {
      console.error('Failed to get system health:', error)
      return {
        status: 'error',
        uptime: 0,
        services: {
          backend: false,
          database: false,
          blockchain: false
        }
      }
    }
  },

  async getHealthTimeline(): Promise<TimeSeriesDataPoint[]> {
    // For now, return simulated data since we don't have historical health data
    const points: TimeSeriesDataPoint[] = []
    const now = Date.now()
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000)
      points.push({
        timestamp: timestamp.toISOString(),
        value: 95 + Math.random() * 4.8,
        label: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    }
    
    return points
  },

  async getUserBalance(): Promise<UserBalance> {
    try {
      const [userAnalytics, rTokenBalances] = await Promise.all([
        canisterService.getMyAnalytics(),
        canisterService.getAllRTokenBalances()
      ])

      const totalRTokenBalance = rTokenBalances.reduce((sum, [_, balance]) => sum + formatAmount(balance), 0)

      return {
        icp: formatAmount(userAnalytics.totalContributed),
        rTokens: totalRTokenBalance,
        staked: formatAmount(userAnalytics.totalReceived),
        pendingRewards: formatAmount(userAnalytics.yieldEarned)
      }
    } catch (error) {
      console.error('Failed to get user balance:', error)
      throw new Error('Failed to load user balance')
    }
  },

  async getRecentActivity(limit = 10): Promise<Activity[]> {
    try {
      const transfers = await canisterService.getMyTransferHistory()
      return transfers.slice(0, limit).map(convertRTokenToActivity)
    } catch (error) {
      console.error('Failed to get recent activity:', error)
      return []
    }
  },

  // ==================== CHAINS (GROUPS) ====================
  async getChains(page = 1, limit = 10): Promise<PaginatedResponse<Chain>> {
    try {
      const allGroups = await canisterService.getAllGroups()
      const chains = allGroups.map(convertGroupConfigToChain)
      
      const start = (page - 1) * limit
      const end = start + limit
      const data = chains.slice(start, end)
      
      return {
        data,
        meta: {
          total: chains.length,
          page,
          limit,
          totalPages: Math.ceil(chains.length / limit)
        }
      }
    } catch (error) {
      console.error('Failed to get chains:', error)
      throw new Error('Failed to load savings chains')
    }
  },

  async getChain(id: string): Promise<Chain> {
    try {
      const group = await canisterService.getGroup(parseInt(id))
      if (!group) {
        throw new Error('Chain not found')
      }
      return convertGroupConfigToChain(group)
    } catch (error) {
      console.error('Failed to get chain:', error)
      throw new Error('Failed to load chain details')
    }
  },

  async createChain(data: any): Promise<Chain> {
    try {
      const result = await canisterService.createGroup(
        data.name,
        data.description,
        data.chainType,
        data.maxMembers,
        toE8s(data.contributionAmount),
        data.rotationPeriod
      )

      const response = handleBackendResult(result)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create chain')
      }

      const groupId = Number(response.data)
      const group = await canisterService.getGroup(groupId)
      if (!group) {
        throw new Error('Failed to create chain')
      }

      return convertGroupConfigToChain(group)
    } catch (error) {
      console.error('Failed to create chain:', error)
      throw new Error(`Failed to create chain: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  async joinChain(chainId: string): Promise<void> {
    try {
      const result = await canisterService.joinGroup(parseInt(chainId))
      const response = handleBackendResult(result)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to join chain')
      }
    } catch (error) {
      console.error('Failed to join chain:', error)
      throw new Error(`Failed to join chain: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // ==================== GROUPS ====================
  async getGroups(page = 1, limit = 10): Promise<PaginatedResponse<Group>> {
    try {
      const myGroups = await canisterService.getMyGroups()
      const groups = myGroups.map(group => ({
        id: group.id.toString(),
        chainId: group.id.toString(),
        name: group.name,
        members: [], // GroupSummary doesn't include member list
        currentPayout: formatAmount(group.contributionAmount),
        totalContributions: formatAmount(group.contributionAmount) * group.members.length,
        status: Object.keys(group.status)[0] as 'active' | 'completed' | 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      
      const start = (page - 1) * limit
      const end = start + limit
      const data = groups.slice(start, end)
      
      return {
        data,
        meta: {
          total: groups.length,
          page,
          limit,
          totalPages: Math.ceil(groups.length / limit)
        }
      }
    } catch (error) {
      console.error('Failed to get groups:', error)
      throw new Error('Failed to load groups')
    }
  },

  // ==================== POOLS (R TOKEN STATS) ====================
  async getPools(page = 1, limit = 10): Promise<PaginatedResponse<Pool>> {
    try {
      const [myGroups, platformAnalytics] = await Promise.all([
        canisterService.getMyGroups(),
        canisterService.getPlatformAnalytics()
      ])

      // Convert group data to pool-like structures
      const pools: Pool[] = myGroups.map((group, index) => ({
        id: group.id.toString(),
        name: `${group.name} Yield Pool`,
        totalLiquidity: formatAmount(group.contributionAmount) * group.members.length,
        apy: 5 + (index % 3) * 2.5, // Simulated APY: 5%, 7.5%, 10%
        tokenSymbol: 'ICP',
        participants: group.members.length,
        riskLevel: group.members.length > 15 ? 'low' : group.members.length > 8 ? 'medium' : 'high',
        status: Object.keys(group.status)[0] === 'active' ? 'active' : 'inactive',
        createdAt: new Date().toISOString()
      }))
      
      const start = (page - 1) * limit
      const end = start + limit
      const data = pools.slice(start, end)
      
      return {
        data,
        meta: {
          total: pools.length,
          page,
          limit,
          totalPages: Math.ceil(pools.length / limit)
        }
      }
    } catch (error) {
      console.error('Failed to get pools:', error)
      throw new Error('Failed to load yield pools')
    }
  },

  async getPool(id: string): Promise<Pool> {
    try {
      const group = await canisterService.getGroup(parseInt(id))
      if (!group) {
        throw new Error('Pool not found')
      }

      return {
        id: group.id.toString(),
        name: `${group.name} Yield Pool`,
        totalLiquidity: formatAmount(group.contributionAmount) * group.members.length,
        apy: 6.5, // Simulated APY
        tokenSymbol: 'ICP',
        participants: group.members.length,
        riskLevel: group.members.length > 15 ? 'low' : group.members.length > 8 ? 'medium' : 'high',
        status: Object.keys(group.status)[0] === 'active' ? 'active' : 'inactive',
        createdAt: formatDateTime(group.startDate)
      }
    } catch (error) {
      console.error('Failed to get pool:', error)
      throw new Error('Failed to load pool details')
    }
  }
}