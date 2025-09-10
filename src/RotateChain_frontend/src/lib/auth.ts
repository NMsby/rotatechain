import { User } from '../types'

// Mock Internet Identity authentication
// In production, this would integrate with DFINITY's Internet Identity

export interface AuthService {
  login(): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  isAuthenticated(): boolean
}

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
}

// Production Internet Identity service (placeholder)
class InternetIdentityService implements AuthService {
  async login(): Promise<User> {
    // TODO: Implement actual Internet Identity integration
    // This would use @dfinity/auth-client
    throw new Error('Internet Identity not implemented. Please use mock authentication.')
  }

  async logout(): Promise<void> {
    // TODO: Implement Internet Identity logout
    throw new Error('Internet Identity not implemented.')
  }

  async getCurrentUser(): Promise<User | null> {
    // TODO: Get user from Internet Identity
    throw new Error('Internet Identity not implemented.')
  }

  isAuthenticated(): boolean {
    // TODO: Check Internet Identity authentication status
    return false
  }
}

// Export the appropriate service based on environment
export const authService: AuthService = 
  process.env.NODE_ENV === 'production' && process.env.VITE_USE_INTERNET_IDENTITY === 'true'
    ? new InternetIdentityService()
    : new MockAuthService()

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