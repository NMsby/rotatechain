import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthState } from '../types'
import { authService, authEventEmitter } from '../lib/auth'

interface AuthContextType extends AuthState {
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    // Initialize authentication state
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null
        })
      } catch (error) {
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
      switch (event.type) {
        case 'login':
          setState(prev => ({
            ...prev,
            user: event.user || null,
            isAuthenticated: !!event.user,
            error: null
          }))
          break
        case 'logout':
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
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
      
      authEventEmitter.emit({ type: 'login', user })
    } catch (error) {
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
      
      authEventEmitter.emit({ type: 'logout' })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }))
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout
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