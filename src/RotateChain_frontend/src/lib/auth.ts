import { AuthClient } from '@dfinity/auth-client'
import { Identity, AnonymousIdentity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { User } from '../types'
import { 
  plugWalletService,
  isPlugInstalled,
  isPlugConnected,
  type PlugWalletInfo,
} from './wallet/plugWallet'

import { 
  canisterId as ledgerCanisterId
} from '@declarations/icp_ledger_canister'


// Internet Identity 2.0 Provider URLs
const II_URL = import.meta.env.MODE === 'production' 
  ? 'https://identity.ic0.app'
  : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`

const II_ALTERNATIVE_URL = import.meta.env.MODE === 'production'
  ? 'https://id.ai' // New Internet Identity 2.0 endpoint
  : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`

// Auth service interface
export interface AuthService {
  login(): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  isAuthenticated(): boolean
  getIdentity(): Identity
  getPrincipal(): Principal
  // Plug Wallet Methods
  connectPlugWallet(): Promise<User>
  disconnectPlugWallet(): Promise<void>
  getWalletInfo(): Promise<PlugWalletInfo | null>
}

// Mock service for development
class MockAuthService implements AuthService {
  private user: User | null = null
  private isLoggedIn = false

  async login(): Promise<User> {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock successful authentication
    this.user = {
      id: 'user-123',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      walletAddress: '0x742d35Cc6663C0532925a3b8D01Fb00fCcf31185',
      internetIdentityPrincipal: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    }
    
    this.isLoggedIn = true
    
    // Store in localStorage for persistence
    localStorage.setItem('rotatechain_user', JSON.stringify(this.user))
    localStorage.setItem('rotatechain_authenticated', 'true')
    
    return this.user
  }

  async connectPlugWallet(): Promise<User> {
    return this.login()
  }

  async disconnectPlugWallet(): Promise<void> {
    return this.logout()
  }

  async getWalletInfo(): Promise<PlugWalletInfo | null> {
    return null
  }

  async logout(): Promise<void> {
    this.user = null
    this.isLoggedIn = false
    localStorage.removeItem('rotatechain_user')
    localStorage.removeItem('rotatechain_authenticated')
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user

    // Check localStorage for existing session
    const storedUser = localStorage.getItem('rotatechain_user')
    const isAuthenticated = localStorage.getItem('rotatechain_authenticated')
    
    if (storedUser && isAuthenticated === 'true') {
      this.user = JSON.parse(storedUser)
      this.isLoggedIn = true
      return this.user
    }
    
    return null
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn || localStorage.getItem('rotatechain_authenticated') === 'true'
  }

  getIdentity(): Identity {
    return new AnonymousIdentity()
  }

  getPrincipal(): Principal {
    return Principal.anonymous()
  }
}

// Production Internet Identity 2.0 service
class InternetIdentityService implements AuthService {
  private authClient: AuthClient | null = null
  private identity: Identity | null = null
  private plugWalletInfo: PlugWalletInfo | null = null

  async login(): Promise<User> {
    try {
      this.authClient = await AuthClient.create({
        idleOptions: {
          idleTimeout: 30 * 60 * 1000, // 30 minutes
          disableDefaultIdleCallback: true, // Handle idle ourselves
        },
      })

      return new Promise((resolve, reject) => {
        this.authClient!.login({
          identityProvider: II_URL,
          // CRITICAL FIX: Remove derivationOrigin for localhost
          // derivationOrigin: undefined, // Let II handle this automatically
          // Alternative provider for Internet Identity 2.0
          // derivationOrigin: process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4943',
          
          // 7 days expiration
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
          windowOpenerFeatures: `
            left=${window.screen.width / 2 - 250},
            top=${window.screen.height / 2 - 300},
            toolbar=0,location=0,menubar=0,width=500,height=600
          `,
          onSuccess: async () => {
            try {
              this.identity = this.authClient!.getIdentity()
              const principal = this.identity.getPrincipal()
              
              // Create user object from identity
              const user: User = {
                id: principal.toString(),
                name: `User ${principal.toString().slice(0, 8)}`,
                email: '', // Internet Identity doesn't provide email
                avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${principal.toString()}`,
                walletAddress: '', // Will be set by wallet integration
                internetIdentityPrincipal: principal.toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }

              // Store user data
              localStorage.setItem('rotatechain_user', JSON.stringify(user))
              localStorage.setItem('rotatechain_authenticated', 'true')
              localStorage.setItem('rotatechain_identity_principal', principal.toString())

              authEventEmitter.emit({ type: 'login', user })
              resolve(user)
            } catch (error) {
              console.error('Error processing successful login:', error)
              reject(new Error('Failed to process login'))
            }
          },
          onError: (error) => {
            console.error('Internet Identity login error:', error)
            reject(new Error(error || 'Authentication failed'))
          }
        })
      })
    } catch (error) {
      console.error('Failed to create auth client:', error)
      throw new Error('Failed to initialize authentication')
    }
  }

  // Connect Plug Wallet
  async connectPlugWallet(): Promise<User> {
    try {
      if (!isPlugInstalled()) {
        throw new Error('Plug Wallet is not installed')
      }

      const walletInfo = await plugWalletService.connect({
        whitelist: [
          ledgerCanisterId
        ]
      })

      this.plugWalletInfo = walletInfo
      this.identity = plugWalletService.getIdentity()

      const user: User = {
        id: walletInfo.principal.toString(),
        name: `Plug User ${walletInfo.principal.toString().slice(0, 8)}`,
        email: '',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletInfo.principal.toString()}`,
        walletAddress: walletInfo.accountId,
        internetIdentityPrincipal: walletInfo.principal.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('rotatechain_user', JSON.stringify(user))
      localStorage.setItem('rotatechain_authenticated', 'true')
      localStorage.setItem('rotatechain_wallet_type', 'plug')
      localStorage.setItem('rotatechain_identity_principal', walletInfo.principal.toString())

      authEventEmitter.emit({ type: 'login', user })
      return user
    } catch (error) {
      console.error('Plug Wallet connection error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to connect Plug Wallet')
    }
  }

  // Disconnect Plug Wallet
  async disconnectPlugWallet(): Promise<void> {
    try {
      await plugWalletService.disconnect()
      this.plugWalletInfo = null
      this.identity = null
      
      localStorage.removeItem('rotatechain_user')
      localStorage.removeItem('rotatechain_authenticated')
      localStorage.removeItem('rotatechain_wallet_type')
      localStorage.removeItem('rotatechain_identity_principal')
      
      authEventEmitter.emit({ type: 'logout' })
    } catch (error) {
      console.error('Plug Wallet disconnect error:', error)
      throw new Error('Failed to disconnect Plug Wallet')
    }
  }

  // Get wallet info
  async getWalletInfo(): Promise<PlugWalletInfo | null> {
    if (this.plugWalletInfo) {
      return this.plugWalletInfo
    }

    const walletType = localStorage.getItem('rotatechain_wallet_type')
    if (walletType === 'plug' && await isPlugConnected()) {
      try {
        const principal = await plugWalletService.getPrincipal()
        const accountId = await plugWalletService.getAccountId()
        
        if (principal && accountId) {
          this.plugWalletInfo = {
            principal,
            accountId,
            walletAddress: principal.toString(),
            balance: 0,
            isConnected: true
          }
          return this.plugWalletInfo
        }
      } catch (error) {
        console.error('Error getting Plug wallet info:', error)
        // Return null instead of throwing - this is not critical
      }
    }

    return null
  }

  async logout(): Promise<void> {
    try {
      const walletType = localStorage.getItem('rotatechain_wallet_type')

      if (walletType === 'plug') {
        await this.disconnectPlugWallet()
      } else {
        if (this.authClient) {
          await this.authClient.logout()
        }
      
        this.authClient = null
        this.identity = null
      
        // Clear stored data
        localStorage.removeItem('rotatechain_user')
        localStorage.removeItem('rotatechain_authenticated')
        localStorage.removeItem('rotatechain_identity_principal')
      
        authEventEmitter.emit({ type: 'logout' })
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error('Failed to logout')
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const walletType = localStorage.getItem('rotatechain_wallet_type')

      if (walletType === 'plug') {
        const isConnected = await isPlugConnected()
        if (isConnected) {
          const storedUser = localStorage.getItem('rotatechain_user')
          if (storedUser) {
            return JSON.parse(storedUser)
          }
        }
        return null
      }

      if (!this.authClient) {
        this.authClient = await AuthClient.create()
      }

      const isAuthenticated = await this.authClient.isAuthenticated()
      
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity()
        const principal = this.identity.getPrincipal()
        
        // Check if we have stored user data
        const storedUser = localStorage.getItem('rotatechain_user')
        if (storedUser) {
          return JSON.parse(storedUser)
        }
        
        // Create minimal user object if not stored
        const user: User = {
          id: principal.toString(),
          name: `User ${principal.toString().slice(0, 8)}`,
          email: '',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${principal.toString()}`,
          walletAddress: '',
          internetIdentityPrincipal: principal.toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return user
      }
      
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('rotatechain_authenticated') === 'true'
  }

  getIdentity(): Identity {
    const walletType = localStorage.getItem('rotatechain_wallet_type')
    
    if (walletType === 'plug' && this.identity) {
      return this.identity
    }
    
    return this.identity || new AnonymousIdentity()
  }

  getPrincipal(): Principal {
    const identity = this.getIdentity()
    return identity.getPrincipal()
  }
}

// Export the appropriate service based on environment
export const authService: AuthService = 
  import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK_AUTH === 'true' 
  ? new MockAuthService() 
  : new InternetIdentityService()

// Auth event listeners for state management  
export type AuthEventType = 'login' | 'logout' | 'user_updated'

export interface AuthEvent {
  type: AuthEventType
  user?: User | null
}

class AuthEventEmitter {
  private listeners: ((event: AuthEvent) => void)[] = []

  subscribe(listener: (event: AuthEvent) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  emit(event: AuthEvent) {
    this.listeners.forEach(listener => listener(event))
  }
}

export const authEventEmitter = new AuthEventEmitter()

// Export utilities for use in other parts of the app
export { AuthClient } from '@dfinity/auth-client'
export { type Identity } from '@dfinity/agent'
export { Principal } from '@dfinity/principal'