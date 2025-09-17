// Enhanced User types with ICP integration
import { Principal } from '@dfinity/principal'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  walletAddress: string
  internetIdentityPrincipal: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  principal: string
  personalInfo: {
    displayName: string
    email?: string
    bio?: string
    location?: string
    website?: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: {
      email: boolean
      browser: boolean
      mobile: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends'
      showActivity: boolean
      showBalances: boolean
    }
  }
  walletConnections: {
    internetIdentity: {
      isConnected: boolean
      principal: string
      anchorNumber?: number
      connectedAt: string
    }
    plugWallet?: {
      isConnected: boolean
      address: string
      connectedAt: string
    }
    stoicWallet?: {
      isConnected: boolean
      address: string
      connectedAt: string
    }
  }
  icpData: {
    balance: number
    transactions: UserTransaction[]
    rTokens: RTokenHolding[]
    groupMemberships: GroupMembership[]
  }
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export interface UserTransaction {
  id: string
  type: 'contribution' | 'payout' | 'transfer' | 'stake' | 'unstake'
  amount: number
  tokenSymbol: string
  fromAddress?: string
  toAddress?: string
  groupId?: string
  chainId?: string
  transactionHash?: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
}

export interface RTokenHolding {
  tokenId: string
  groupId: string
  groupName: string
  balance: number
  liquidValue: number
  yieldGenerated: number
  lastUpdated: string
}

export interface GroupMembership {
  groupId: string
  groupName: string
  role: 'member' | 'admin' | 'creator'
  joinedAt: string
  totalContributions: number
  payoutsReceived: number
  currentRound: number
  nextPayoutDate?: string
  status: 'active' | 'completed' | 'paused'
}

export interface UserStats {
  totalContributions: number
  totalPayoutsReceived: number
  activeGroupsCount: number
  completedGroupsCount: number
  rTokensValue: number
  averageYield: number
  joinDate: string
  membershipDuration: number // in days
}

export interface UserActivitySummary {
  last30Days: {
    contributionsMade: number
    payoutsReceived: number
    poolInteractions: number
    rTokenTransfers: number
  }
  lifetime: {
    totalGroups: number
    totalContributions: number
    totalPayouts: number
    averageYield: number
  }
}

// User management types
export interface UpdateUserProfileRequest {
  personalInfo?: Partial<UserProfile['personalInfo']>
  preferences?: Partial<UserProfile['preferences']>
}

export interface UserProfileResponse {
  success: boolean
  data?: UserProfile
  error?: string
}

export interface ConnectWalletRequest {
  walletType: 'plug' | 'stoic'
  address: string
  signature: string
}

export interface DisconnectWalletRequest {
  walletType: 'internetIdentity' | 'plug' | 'stoic'
}

// Privacy and security types
export interface UserSecuritySettings {
  twoFactorEnabled: boolean
  backupPhrasesGenerated: boolean
  recoveryMethodsConfigured: number
  lastSecurityReview: string
  trustedDevices: TrustedDevice[]
}

export interface TrustedDevice {
  id: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  operatingSystem: string
  lastUsed: string
  isCurrentDevice: boolean
}

// Export utility types
export type UserRole = 'user' | 'admin' | 'superadmin'
export type UserStatus = 'active' | 'suspended' | 'pending' | 'inactive'