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

// Export user service functions for convenience
export { getUserProfile, updateUserProfile, getUserStats, getUserActivity } from './userService'

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

export const formatPrincipal = (principal: string): string => {
  if (principal.length <= 12) return principal
  return `${principal.slice(0, 6)}...${principal.slice(-6)}`
}

export const isValidPrincipal = (principal: string): boolean => {
  try {
    Principal.fromText(principal)
    return true
  } catch {
    return false
  }
}