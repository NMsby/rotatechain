import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthState } from '../types'
import { authService, authEventEmitter } from '../lib/auth'
import { icpService } from '../lib/icp/actor'

interface AuthContextType extends AuthState {
  login: () => Promise<void>
  logout: () => Promise<void>
  // ICP-specific methods
  getActor: () => any
  callBackend: <T>(method: string, args?: any[]) => Promise<T | null>
  principal: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })
  const [principal, setPrincipal] = useState<string | null>(null)

  useEffect(() => {
    // Initialize authentication state
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing AuthContext...');
        console.log('🔧 Using Internet Identity:', import.meta.env.VITE_USE_INTERNET_IDENTITY);
        
        // Initialize ICP Service in parallel if using Internet Identity
        if (import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true') {
          console.log('🔄 Initializing ICP service...');
          await icpService.initialize()
        }

        const user = await authService.getCurrentUser()
        console.log('👤 Current user:', user ? 'Found' : 'None');

        // If using Internet Identity, also get the principal
        if (user && import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true') {
          const principalId = await icpService.getPrincipal()
          setPrincipal(principalId)
        }

        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        })
      }
    }

    initAuth()

    // Subscribe to auth events
    const unsubscribe = authEventEmitter.subscribe((event) => {
      console.log('🔔 Auth event:', event.type);
      
      switch (event.type) {
        case 'login':
          setState(prev => ({
            ...prev,
            user: event.user || null,
            isAuthenticated: !!event.user,
            error: null
          }))
          // Update principal if using Internet Identity
          if (import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true') {
            icpService.getPrincipal().then(setPrincipal)
          }
          break
        case 'logout':
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            error: null
          }))
          setPrincipal(null)
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

  const login = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      console.log('🔐 Login attempt starting...');
      const user = await authService.login()
      console.log('✅ Login successful');
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      // Update principal if using Internet Identity
      if (import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true') {
        const principalId = await icpService.getPrincipal()
        setPrincipal(principalId)
      }
      
      authEventEmitter.emit({ type: 'login', user })
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      })
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
      setPrincipal(null)
      
      authEventEmitter.emit({ type: 'logout' })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }))
    }
  }

  // ICP-specific methods
  const getActor = () => {
    return icpService.getActor()
  }

  const callBackend = async <T,>(method: string, args: any[] = []): Promise<T | null> => {
    try {
      return await icpService.callBackend<T>(method, args)
    } catch (error) {
      console.error(`Backend call failed for ${method}:`, error)
      return null
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    getActor,
    callBackend,
    principal
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