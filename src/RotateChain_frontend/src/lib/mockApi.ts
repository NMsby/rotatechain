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
import { sleep, generateId } from './utils'

// Mock data generators
function generateMockUser(): User {
  return {
    id: 'user-123',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    walletAddress: '0x742d35Cc6663C0532925a3b8D01Fb00fCcf31185',
    internetIdentityPrincipal: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: new Date().toISOString()
  }
}

function generateMockChains(count: number): Chain[] {
  const chains: Chain[] = []
  const chainTypes: Array<'standard' | 'premium' | 'enterprise'> = ['standard', 'premium', 'enterprise']
  const statuses: Array<'active' | 'completed' | 'paused'> = ['active', 'completed', 'paused']

  for (let i = 0; i < count; i++) {
    chains.push({
      id: generateId(),
      name: `Savings Chain ${i + 1}`,
      description: `Community savings group focused on ${['Education', 'Business', 'Emergency Fund', 'Investment', 'Travel'][i % 5]}`,
      totalMembers: Math.floor(Math.random() * 20) + 5,
      contributionAmount: [100, 250, 500, 1000][Math.floor(Math.random() * 4)],
      rotationPeriod: [7, 14, 30][Math.floor(Math.random() * 3)],
      currentRound: Math.floor(Math.random() * 10) + 1,
      totalRounds: Math.floor(Math.random() * 5) + 10,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdBy: 'user-123',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      nextPayoutDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      chainType: chainTypes[Math.floor(Math.random() * chainTypes.length)]
    })
  }
  return chains
}

function generateMockGroups(count: number): Group[] {
  const groups: Group[] = []
  const statuses: Array<'active' | 'completed' | 'pending'> = ['active', 'completed', 'pending']

  for (let i = 0; i < count; i++) {
    groups.push({
      id: generateId(),
      chainId: generateId(),
      name: `Group ${String.fromCharCode(65 + i)}`,
      members: Array.from({ length: Math.floor(Math.random() * 8) + 3 }, () => generateId()),
      currentPayout: Math.floor(Math.random() * 5000) + 1000,
      totalContributions: Math.floor(Math.random() * 50000) + 10000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  return groups
}

function generateMockPools(count: number): Pool[] {
  const pools: Pool[] = []
  const tokens = ['USDC', 'DAI', 'ETH', 'BTC', 'ICP']
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']

  for (let i = 0; i < count; i++) {
    pools.push({
      id: generateId(),
      name: `${tokens[i % tokens.length]} Liquidity Pool`,
      totalLiquidity: Math.floor(Math.random() * 1000000) + 100000,
      apy: Math.random() * 15 + 2, // 2-17% APY
      tokenSymbol: tokens[i % tokens.length],
      participants: Math.floor(Math.random() * 500) + 50,
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  return pools
}

function generateMockActivities(count: number): Activity[] {
  const activities: Activity[] = []
  const types: Array<'contribution' | 'payout' | 'stake' | 'unstake' | 'trade'> = 
    ['contribution', 'payout', 'stake', 'unstake', 'trade']
  const statuses: Array<'completed' | 'pending' | 'failed'> = ['completed', 'pending', 'failed']
  const tokens = ['USDC', 'R-TOKEN', 'DAI', 'ETH']

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    activities.push({
      id: generateId(),
      type,
      description: getActivityDescription(type),
      amount: Math.floor(Math.random() * 1000) + 10,
      tokenSymbol: tokens[Math.floor(Math.random() * tokens.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      chainId: Math.random() > 0.5 ? generateId() : undefined,
      poolId: Math.random() > 0.5 ? generateId() : undefined
    })
  }
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function getActivityDescription(type: Activity['type']): string {
  const descriptions = {
    contribution: 'Monthly contribution to savings chain',
    payout: 'Received payout from rotation',
    stake: 'Staked tokens in liquidity pool',
    unstake: 'Unstaked tokens from liquidity pool',
    trade: 'Traded R-Tokens on marketplace'
  }
  return descriptions[type]
}

function generateMockUserBalance(): UserBalance {
  return {
    rTokens: [
      {
        id: generateId(),
        symbol: 'R-SAVE',
        balance: 1250.50,
        usdValue: 1250.50,
        chainId: generateId(),
        liquidityRatio: 0.85,
        lastUpdated: new Date().toISOString()
      },
      {
        id: generateId(),
        symbol: 'R-INVEST',
        balance: 875.25,
        usdValue: 875.25,
        chainId: generateId(),
        liquidityRatio: 0.92,
        lastUpdated: new Date().toISOString()
      }
    ],
    liquidAssets: [
      { symbol: 'USDC', balance: 2500.00, usdValue: 2500.00 },
      { symbol: 'DAI', balance: 750.00, usdValue: 750.00 },
      { symbol: 'ICP', balance: 125.50, usdValue: 856.41 }
    ],
    totalValue: 6231.66
  }
}

function generateMockDashboardStats(): DashboardStats {
  return {
    activeGroups: 156,
    totalMembers: 12847,  // Remove totalUsers property
    totalValueLocked: 2847592.50,
    userContributions: 45000,
    userReturns: 3750,
    userGroups: 3,
    pendingPayouts: 15000
    // totalUsers: 12847,
    // totalChains: 342,
    // totalVolume: 2547893.50,
    // systemUptime: 99.7,
    // lastBlockTime: new Date(Date.now() - Math.random() * 60000).toISOString(),
    // activeChains: 287
  }
}

function generateMockSystemHealth(): SystemHealth {
  return {
    status: Math.random() > 0.95 ? 'warning' : 'healthy',
    uptime: 99.5 + Math.random() * 0.48,
    services: {
      backend: true,
      database: Math.random() > 0.02,
      blockchain: Math.random() > 0.01
    }
  }
}

function generateMockHealthTimeline(): TimeSeriesDataPoint[] {
  const now = Date.now()
  const points: TimeSeriesDataPoint[] = []
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000) // Last 24 hours
    points.push({
      timestamp: timestamp.toISOString(),
      value: 95 + Math.random() * 4.8, // 95-99.8% uptime
      label: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }
  
  return points
}

// API functions with realistic delays
export const mockApi = {
  // Auth
  async getCurrentUser(): Promise<User> {
    await sleep(500)
    return generateMockUser()
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await sleep(800)
    return generateMockDashboardStats()
  },

  async getSystemHealth(): Promise<SystemHealth> {
    await sleep(300)
    return generateMockSystemHealth()
  },

  async getHealthTimeline(): Promise<TimeSeriesDataPoint[]> {
    await sleep(600)
    return generateMockHealthTimeline()
  },

  async getUserBalance(): Promise<UserBalance> {
    await sleep(700)
    return generateMockUserBalance()
  },

  async getRecentActivity(limit = 10): Promise<Activity[]> {
    await sleep(500)
    return generateMockActivities(limit)
  },

  // Chains
  async getChains(page = 1, limit = 10): Promise<PaginatedResponse<Chain>> {
    await sleep(800)
    const allChains = generateMockChains(45) // Generate more for pagination
    const start = (page - 1) * limit
    const end = start + limit
    const data = allChains.slice(start, end)
    
    return {
      data,
      meta: {
        total: allChains.length,
        page,
        limit,
        totalPages: Math.ceil(allChains.length / limit)
      }
    }
  },

  async getChain(id: string): Promise<Chain> {
    await sleep(500)
    const chains = generateMockChains(1)
    return { ...chains[0], id }
  },

  async createChain(data: any): Promise<Chain> {
    await sleep(1200)
    return {
      id: generateId(),
      name: data.name,
      description: data.description,
      totalMembers: 1,
      contributionAmount: data.contributionAmount,
      rotationPeriod: data.rotationPeriod,
      currentRound: 1,
      totalRounds: data.maxMembers,
      status: 'active',
      createdBy: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextPayoutDate: new Date(Date.now() + data.rotationPeriod * 24 * 60 * 60 * 1000).toISOString(),
      chainType: data.chainType
    }
  },

  async joinChain(chainId: string): Promise<void> {
    await sleep(1000)
    // Simulate joining chain
  },

  // Groups
  async getGroups(page = 1, limit = 10): Promise<PaginatedResponse<Group>> {
    await sleep(600)
    const allGroups = generateMockGroups(23)
    const start = (page - 1) * limit
    const end = start + limit
    const data = allGroups.slice(start, end)
    
    return {
      data,
      meta: {
        total: allGroups.length,
        page,
        limit,
        totalPages: Math.ceil(allGroups.length / limit)
      }
    }
  },

  // Pools
  async getPools(page = 1, limit = 10): Promise<PaginatedResponse<Pool>> {
    await sleep(700)
    const allPools = generateMockPools(15)
    const start = (page - 1) * limit
    const end = start + limit
    const data = allPools.slice(start, end)
    
    return {
      data,
      meta: {
        total: allPools.length,
        page,
        limit,
        totalPages: Math.ceil(allPools.length / limit)
      }
    }
  },

  async getPool(id: string): Promise<Pool> {
    await sleep(500)
    const pools = generateMockPools(1)
    return { ...pools[0], id }
  }
}