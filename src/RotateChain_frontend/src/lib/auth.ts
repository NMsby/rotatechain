import { User } from '../types'
import { icpService } from './icp/actor'

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
    localStorage.setItem('rotatechain_auth_method', 'mock')
    
    return this.user
  }

  async logout(): Promise<void> {
    this.user = null
    this.isLoggedIn = false
    localStorage.removeItem('rotatechain_user')
    localStorage.removeItem('rotatechain_authenticated')
    localStorage.removeItem('rotatechain_auth_method')
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user

    // Check localStorage for existing session
    const storedUser = localStorage.getItem('rotatechain_user')
    const isAuthenticated = localStorage.getItem('rotatechain_authenticated')
    const authMethod = localStorage.getItem('rotatechain_auth_method')
    
    if (storedUser && isAuthenticated === 'true' && authMethod === 'mock') {
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

// Production Internet Identity service with ICP integration
class InternetIdentityService implements AuthService {
  private user: User | null = null;

  async login(): Promise<User> {
    try {
      console.log('🔐 Starting Internet Identity login...');

      // Initialize ICP service
      await icpService.initialize();
      console.log('✅ ICP Service initialized');

      // Attempt Internet Identity login
      const success = await icpService.login();
      if (!success) {
        throw new Error('Internet Identity login failed');
      }
      console.log('✅ Internet Identity login successful');

      // Get principal and create user object
      const principal = await icpService.getPrincipal();
      if (!principal) {
        throw new Error('Failed to get principal after login');
      }
      console.log('✅ Principal obtained:', principal);

      // Create user object from Internet Identity
      this.user = {
        id: principal,
        name: `User ${principal.slice(0, 8)}...`,
        email: `${principal.slice(0, 8)}@ic.app`,
        avatar: `https://ui-avatars.com/api/?name=${principal.slice(0, 2)}&background=random`,
        walletAddress: principal,
        internetIdentityPrincipal: principal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('rotatechain_user', JSON.stringify(this.user))
      localStorage.setItem('rotatechain_authenticated', 'true')
      localStorage.setItem('rotatechain_auth_method', 'internet_identity')
      console.log('✅ User data saved to localStorage');

      return this.user;
    } catch (error) {
      console.error('❌ Internet Identity login error:', error);
      throw new Error(`Internet Identity authentication failed: ${error}`);
    }
  }

  async logout(): Promise<void> {
    try {
      await icpService.logout();
    } catch (error) {
      console.error('Internet Identity logout error:', error);
    }
    
    this.user = null;
    localStorage.removeItem('rotatechain_user')
    localStorage.removeItem('rotatechain_authenticated')
    localStorage.removeItem('rotatechain_auth_method')
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user;

    // Check if we have an existing Internet Identity session
    const storedUser = localStorage.getItem('rotatechain_user')
    const isAuthenticated = localStorage.getItem('rotatechain_authenticated')
    const authMethod = localStorage.getItem('rotatechain_auth_method')
    
    if (storedUser && isAuthenticated === 'true' && authMethod === 'internet_identity') {
      // Verify the session is still valid
      await icpService.initialize();
      const stillAuthenticated = await icpService.isAuthenticated();
      
      if (stillAuthenticated) {
        this.user = JSON.parse(storedUser);
        return this.user;
      } else {
        // Session expired, clear storage
        await this.logout();
      }
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    const isAuth = localStorage.getItem('rotatechain_authenticated') === 'true';
    const authMethod = localStorage.getItem('rotatechain_auth_method');
    return isAuth && authMethod === 'internet_identity';
  }
}

// Export the appropriate service based on environment
export const authService: AuthService = 
  import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true'
    ? new InternetIdentityService()
    : new MockAuthService()

// Debug logging to verify configuration
console.log('🔧 Auth Configuration:');
console.log('- VITE_USE_INTERNET_IDENTITY:', import.meta.env.VITE_USE_INTERNET_IDENTITY);
console.log('- Using service:', import.meta.env.VITE_USE_INTERNET_IDENTITY === 'true' ? 'InternetIdentityService' : 'MockAuthService');

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