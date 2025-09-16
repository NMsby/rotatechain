import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { User, AuthState } from '../types'
import { authService, authEventEmitter, type Identity, Principal } from '../lib/auth'

interface AuthContextType extends AuthState {
  login: () => Promise<void>
  logout: () => Promise<void>
  getIdentity: () => Identity
  getPrincipal: () => Principal
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser()
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        error: null
      }))
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
        const user = await authService.getCurrentUser()
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
          break
        case 'logout':
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          }))
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
      const user = await authService.login()
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
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
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }))
      throw error
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
    logout,
    getIdentity,
    getPrincipal,
    refreshUser
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