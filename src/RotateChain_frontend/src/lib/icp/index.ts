import { HttpAgent, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

// ICP integration utilities
export * from './canisterService'
export * from './userService'

// Re-export common ICP types and utilities
export { Principal } from '@dfinity/principal'
export { Actor, HttpAgent } from '@dfinity/agent'
export type { Identity } from '@dfinity/agent'
export { AuthClient } from '@dfinity/auth-client'

// Export canister service functions
export {
  canisterService,
  formatAmount,
  toE8s,
  formatPrincipal
} from './canisterService'

// Export user service functions
export { 
  getUserProfile, 
  updateUserProfile, 
  getUserStats, 
  getUserActivity,
  loginWithInternetIdentity,
  migrateToInternetIdentity2,
  hasInternetIdentity2Support
} from './userService'

// Utility functions for ICP integration
export const createAgentWithIdentity = async (identity: Identity): Promise<HttpAgent> => {
  const agent = new HttpAgent({
    host: import.meta.env.MODE === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
    identity
  })

  // Only fetch root key in development
  if (import.meta.env.MODE !== 'production') {
    await agent.fetchRootKey()
  }

  return agent
}

export const isValidPrincipal = (principal: string): boolean => {
  try {
    Principal.fromText(principal)
    return true
  } catch {
    return false
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

// Format utilities
export const formatTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1000000) // Convert from nanoseconds
  return date.toLocaleDateString()
}

export const formatDateTime = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1000000) // Convert from nanoseconds  
  return date.toLocaleString()
}