import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { User, AuthState } from '../types'
import { authService, authEventEmitter, type Identity, Principal } from '../lib/auth'
import { 
  userService,
  loginWithInternetIdentity,
  type InternetIdentityOptions,
  type IdentityVersion
} from '../lib/icp/userService'
import { type PlugWalletInfo } from '../lib/wallet/plugWallet'

export type WalletType = 'internet-identity' | 'plug' | null

interface AuthContextType extends AuthState {
  login: (options?: InternetIdentityOptions) => Promise<void>
  loginWithPlug: () => Promise<void>
  logout: () => Promise<void>
  getIdentity: () => Identity
  getPrincipal: () => Principal
  refreshUser: () => Promise<void>
  // Wallet type information
  walletType: WalletType
  plugWalletInfo: PlugWalletInfo | null
  // Internet Identity 2.0 features
  identityVersion: IdentityVersion | null
  supportsIdentity2: boolean
  migrateToIdentity2: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [plugWalletInfo, setPlugWalletInfo] = useState<PlugWalletInfo | null>(null)
  const [identityVersion, setIdentityVersion] = useState<IdentityVersion | null>(null)
  const [supportsIdentity2, setSupportsIdentity2] = useState(false)

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser()
      const storedWalletType = localStorage.getItem('rotatechain_wallet_type') as WalletType
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        error: null
      }))

      setWalletType(storedWalletType)

      // Get wallet info if using Plug
      if (storedWalletType === 'plug' && user) {
        const walletInfo = await authService.getWalletInfo()
        setPlugWalletInfo(walletInfo)
      }

      // Check Internet Identity version if using II
      if (storedWalletType === 'internet-identity' && user) {
        const authInfo = userService.getAuthenticationInfo()
        setIdentityVersion(authInfo.version)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh user'
      }))
    }
  }, [])

  useEffect(() => {
    // Initialize authentication state
    const initAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))

        // Check Internet Identity 2.0 support
        const supports2_0 = await userService.hasInternetIdentity2Support()
        setSupportsIdentity2(supports2_0)

        // Initialize user service
        await userService.initialize()

        // Get current user and wallet type
        const user = await authService.getCurrentUser()
        const storedWalletType = localStorage.getItem('rotatechain_wallet_type') as WalletType
        
        setWalletType(storedWalletType)

        // Get wallet-specific information
        if (storedWalletType === 'plug' && user) {
          // Get Plug wallet info
          const walletInfo = await authService.getWalletInfo()
          setPlugWalletInfo(walletInfo)
        } else if (storedWalletType === 'internet-identity' && user) {
          // Get Internet Identity version info
          const authInfo = userService.getAuthenticationInfo()
          setIdentityVersion(authInfo.version)
        }

        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication initialization failed'
        })
      }
    }

    initAuth()

    // Subscribe to auth events
    const unsubscribe = authEventEmitter.subscribe((event) => {
      switch (event.type) {
        case 'login':
          setState(prev => ({
            ...prev,
            user: event.user || null,
            isAuthenticated: !!event.user,
            isLoading: false,
            error: null
          }))
          // Update wallet type and info
          const newWalletType = localStorage.getItem('rotatechain_wallet_type') as WalletType
          setWalletType(newWalletType)

          if (newWalletType === 'internet-identity') {
            // Update identity version info
            const authInfo = userService.getAuthenticationInfo()
            setIdentityVersion(authInfo.version)
          }
          break
        case 'logout':
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          }))
          setWalletType(null)
          setPlugWalletInfo(null)
          setIdentityVersion(null)
          break
        case 'user_updated':
          setState(prev => ({
            ...prev,
            user: event.user || prev.user
          }))
          break
      }
    })

    return unsubscribe
  }, [])

  // Enhanced login with Internet Identity 2.0 support
  const login = async (options: InternetIdentityOptions = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Use the enhanced userService login by default
      const user = await loginWithInternetIdentity({
        version: supportsIdentity2 ? '2.0' : '1.0',
        preferredMethod: 'passkey',
        allowFallback: true,
        ...options
      })

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      // Update wallet type
      setWalletType('internet-identity')

      // Update identity version
      const authInfo = userService.getAuthenticationInfo()
      setIdentityVersion(authInfo.version)

      // Emit login event
      authEventEmitter.emit({ type: 'login', user })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      })
      throw error // Re-throw for component handling
    }
  }

  // Plug Wallet login
  const loginWithPlug = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const user = await authService.connectPlugWallet()
      const walletInfo = await authService.getWalletInfo()

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      setWalletType('plug')
      setPlugWalletInfo(walletInfo)

      authEventEmitter.emit({ type: 'login', user })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Plug Wallet connection failed'
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await authService.logout()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      setWalletType(null)
      setPlugWalletInfo(null)
      setIdentityVersion(null)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }))
      throw error
    }
  }

  // Migrate to Internet Identity 2.0
  const migrateToIdentity2 = async (): Promise<boolean> => {
    try {
      const result = await userService.migrateToInternetIdentity2()
      if (result.success) {
        await refreshUser()
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Migration failed'
        }))
        return false
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Migration failed'
      }))
      return false
    }
  }

  const getIdentity = useCallback(() => {
    return authService.getIdentity()
  }, [])

  const getPrincipal = useCallback(() => {
    return authService.getPrincipal()
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    loginWithPlug,
    logout,
    getIdentity,
    getPrincipal,
    refreshUser,
    walletType,
    plugWalletInfo,
    identityVersion,
    supportsIdentity2,
    migrateToIdentity2
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext