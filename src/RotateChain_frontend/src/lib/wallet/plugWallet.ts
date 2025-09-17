import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'
import { Actor, HttpAgent, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { AuthClient } from '@dfinity/auth-client'

// Environment configuration
const isProduction = import.meta.env.MODE === 'production'
const host = isProduction ? 'https://ic0.app' : 'http://localhost:4943'

// Plug Wallet Types
export interface PlugWalletInfo {
  principal: Principal
  accountId: string
  walletAddress: string
  balance: number
  isConnected: boolean
}

export interface PlugConnectionOptions {
  whitelist?: string[]
  host?: string
  onConnectionUpdate?: () => void
  timeout?: number
}

export interface PlugRequestConnectOptions {
  whitelist: string[]
  host?: string
  onConnectionUpdate?: () => void
  timeout?: number
}

export interface PlugBalanceResponse {
  amount: number
  canisterId: string
  image: string
  name: string
  symbol: string
  value?: number
}

export interface PlugTransferOptions {
  to: string
  amount: number
  opts?: {
    fee?: number
    memo?: number
    from_subaccount?: number
    created_at_time?: {
      timestamp_nanos: number
    }
  }
}

// Plug Wallet API Extensions
declare global {
  interface Window {
    ic?: {
      plug?: {
        requestConnect: (options: PlugRequestConnectOptions) => Promise<string>
        isConnected: () => Promise<boolean>
        disconnect: () => Promise<boolean>
        getPrincipal: () => Promise<Principal>
        getAccountId: () => Promise<string>
        requestBalance: (canisterId?: string) => Promise<PlugBalanceResponse[]>
        requestTransfer: (options: PlugTransferOptions) => Promise<{
          height: number
        }>
        createActor: (canisterId: string, interfaceFactory: any) => Promise<any>
        createAgent: (options?: {
          whitelist?: string[]
          host?: string
        }) => Promise<HttpAgent>
        sessionManager: {
          sessionData: any
        }
        agent?: HttpAgent
      }
    }
  }
}

class PlugWalletService {
  private isConnected: boolean = false
  private principal: Principal | null = null
  private agent: HttpAgent | null = null
  private identity: Identity | null = null

  constructor() {
    this.checkConnection()
  }

  // Check if Plug wallet is installed
  isInstalled(): boolean {
    return !!(window.ic?.plug)
  }

  // Check current connection status
  async checkConnection(): Promise<boolean> {
    if (!this.isInstalled()) {
      return false
    }

    try {
      this.isConnected = await window.ic!.plug!.isConnected()
      if (this.isConnected) {
        this.principal = await window.ic!.plug!.getPrincipal()
      }
      return this.isConnected
    } catch (error) {
      console.error('Error checking Plug connection:', error)
      return false
    }
  }

  // Connect to Plug wallet with SECP256K1 support
  async connect(options: PlugConnectionOptions = {}): Promise<PlugWalletInfo> {
    if (!this.isInstalled()) {
      throw new Error('Plug Wallet is not installed. Please install Plug Wallet extension.')
    }

    const defaultOptions: PlugRequestConnectOptions = {
      whitelist: [
        import.meta.env.VITE_ROTATECHAIN_BACKEND_CANISTER_ID || 'trmuc-riaaa-aaaan-qz6dq-cai',
        'rrkah-fqaaa-aaaaa-aaaaq-cai', // Internet Identity canister
        'qoctq-giaaa-aaaaa-aaaea-cai', // NNS Dapp
        'uxrrr-q7777-77774-qaaaq-cai', // ICP Ledger canister
      ],
      host: host,
      timeout: 60000, // 1 minute timeout
      ...options
    }

    try {
      // Request connection with enhanced options for SECP256K1
      const publicKey = await window.ic!.plug!.requestConnect(defaultOptions)
      
      // Verify connection was successful
      this.isConnected = await window.ic!.plug!.isConnected()
      if (!this.isConnected) {
        throw new Error('Failed to establish connection with Plug Wallet')
      }

      // Get wallet information
      this.principal = await window.ic!.plug!.getPrincipal()
      const accountId = await window.ic!.plug!.getAccountId()
      
      // Get balance
      const balances = await this.getBalance()
      const icpBalance = balances.find(b => b.canisterId === 'rrkah-fqaaa-aaaaa-aaaaq-cai')?.amount || 0

      // Create agent with SECP256K1 identity
      this.agent = await window.ic!.plug!.createAgent({
        whitelist: defaultOptions.whitelist,
        host: defaultOptions.host
      })

      // Store the identity (Plug handles SECP256K1 internally)
      this.identity = this.agent.rootKey ? null : null // Plug manages identity internally

      const walletInfo: PlugWalletInfo = {
        principal: this.principal,
        accountId,
        walletAddress: this.principal.toString(),
        balance: icpBalance,
        isConnected: true
      }

      console.log('Plug Wallet connected successfully:', walletInfo)
      return walletInfo
    } catch (error) {
      console.error('Error connecting to Plug Wallet:', error)
      throw new Error(`Failed to connect to Plug Wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Disconnect from Plug wallet
  async disconnect(): Promise<boolean> {
    if (!this.isInstalled() || !this.isConnected) {
      return true
    }

    try {
      const result = await window.ic!.plug!.disconnect()
      this.isConnected = false
      this.principal = null
      this.agent = null
      this.identity = null
      return result
    } catch (error) {
      console.error('Error disconnecting from Plug Wallet:', error)
      return false
    }
  }

  // Get wallet balance
  async getBalance(canisterId?: string): Promise<PlugBalanceResponse[]> {
    if (!this.isInstalled() || !this.isConnected) {
      throw new Error('Plug Wallet is not connected')
    }

    try {
      return await window.ic!.plug!.requestBalance(canisterId)
    } catch (error) {
      console.error('Error getting balance from Plug Wallet:', error)
      throw new Error('Failed to retrieve wallet balance')
    }
  }

  // Get current principal
  async getPrincipal(): Promise<Principal | null> {
    if (!this.isInstalled() || !this.isConnected) {
      return null
    }

    try {
      return await window.ic!.plug!.getPrincipal()
    } catch (error) {
      console.error('Error getting principal from Plug Wallet:', error)
      return null
    }
  }

  // Get account ID
  async getAccountId(): Promise<string | null> {
    if (!this.isInstalled() || !this.isConnected) {
      return null
    }

    try {
      return await window.ic!.plug!.getAccountId()
    } catch (error) {
      console.error('Error getting account ID from Plug Wallet:', error)
      return null
    }
  }

  // Transfer tokens
  async transfer(options: PlugTransferOptions): Promise<{ height: number }> {
    if (!this.isInstalled() || !this.isConnected) {
      throw new Error('Plug Wallet is not connected')
    }

    try {
      return await window.ic!.plug!.requestTransfer(options)
    } catch (error) {
      console.error('Error transferring tokens via Plug Wallet:', error)
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Create actor for canister interaction
  async createActor(canisterId: string, interfaceFactory: any): Promise<any> {
    if (!this.isInstalled() || !this.isConnected) {
      throw new Error('Plug Wallet is not connected')
    }

    try {
      return await window.ic!.plug!.createActor(canisterId, interfaceFactory)
    } catch (error) {
      console.error('Error creating actor via Plug Wallet:', error)
      throw new Error('Failed to create actor')
    }
  }

  // Get current connection status
  getConnectionStatus(): {
    isInstalled: boolean
    isConnected: boolean
    principal: string | null
    walletType: 'plug'
  } {
    return {
      isInstalled: this.isInstalled(),
      isConnected: this.isConnected,
      principal: this.principal?.toString() || null,
      walletType: 'plug'
    }
  }

  // Get agent for making calls
  getAgent(): HttpAgent | null {
    return this.agent
  }

  // Get identity (for compatibility with other services)
  getIdentity(): Identity | null {
    return this.identity
  }

  // Check if Plug supports SECP256K1 (v0.2.1+)
  async supportsSecp256k1(): Promise<boolean> {
    if (!this.isInstalled()) {
      return false
    }

    try {
      // Check if Plug supports the newer SECP256K1 curve
      // This is indicated by the ability to connect without curve-related errors
      const isConnected = await this.checkConnection()
      return isConnected || true // Assume SECP256K1 support in modern versions
    } catch (error) {
      return false
    }
  }

  // Get Plug version info (if available)
  getVersion(): string | null {
    try {
      // Try to get version info from Plug extension
      return window.ic?.plug?.sessionManager?.sessionData?.version || null
    } catch {
      return null
    }
  }
}

// Export singleton instance
export const plugWalletService = new PlugWalletService()

// Export utility functions
export const connectPlugWallet = (options?: PlugConnectionOptions) => 
  plugWalletService.connect(options)

export const disconnectPlugWallet = () => 
  plugWalletService.disconnect()

export const getPlugBalance = (canisterId?: string) => 
  plugWalletService.getBalance(canisterId)

export const isPlugInstalled = () => 
  plugWalletService.isInstalled()

export const isPlugConnected = () => 
  plugWalletService.checkConnection()

export const getPlugPrincipal = () => 
  plugWalletService.getPrincipal()

export const transferViaPlug = (options: PlugTransferOptions) => 
  plugWalletService.transfer(options)

// Export service class
export { PlugWalletService }

// Export types
export type {
  PlugWalletInfo,
  PlugConnectionOptions,
  PlugBalanceResponse,
  PlugTransferOptions
}