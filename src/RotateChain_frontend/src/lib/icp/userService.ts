import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { AuthClient } from '@dfinity/auth-client'
import { 
    UserProfile, 
    UserStats, 
    UserActivitySummary, 
    UpdateUserProfileRequest,
    UserProfileResponse,
    ConnectWalletRequest,
    DisconnectWalletRequest,
    UserSecuritySettings,
    User
} from '../../types/user'

// Environment configuration
const isProduction = import.meta.env.MODE === 'production'
const host = isProduction ? 'https://ic0.app' : 'http://localhost:4943'
const canisterId = import.meta.env.VITE_ROTATECHAIN_BACKEND_CANISTER_ID || 'trmuc-riaaa-aaaan-qz6dq-cai'

// Internet Identity 2.0 Configuration
const INTERNET_IDENTITY_2_0_URL = isProduction ? 'https://id.ai' : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`
const INTERNET_IDENTITY_1_0_URL = isProduction ? 'https://identity.ic0.app' : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`

export type IdentityVersion = '1.0' | '2.0'
export type AuthenticationMethod = 'passkey' | 'google' | 'traditional'

export interface InternetIdentityOptions {
    version?: IdentityVersion
    preferredMethod?: AuthenticationMethod
    allowFallback?: boolean
}

class UserService {
    private agent: HttpAgent | null = null
    private actor: any = null // Will be typed when Candid interfaces are generated
    private authClient: AuthClient | null = null
    private identityVersion: IdentityVersion = '2.0' // Default to latest version

    async initialize() {
        if (!this.agent) {
            this.agent = new HttpAgent({ host })
      
            // Only fetch root key in development
            if (!isProduction) {
                await this.agent.fetchRootKey()
            }
        }

        if (!this.authClient) {
            this.authClient = await AuthClient.create({
                idleOptions: {
                    idleTimeout: 30 * 60 * 1000, // 30 minutes
                    disableDefaultIdleCallback: true,
                }
            })
        }

        // Initialize actor when Candid interfaces are available
        // TODO: Replace with generated actor from dfx generate
        // this.actor = Actor.createActor(idlFactory, {
        //   agent: this.agent,
        //   canisterId,
        // })
    }

    // Enhanced login with Internet Identity 2.0 support
    async loginWithInternetIdentity(options: InternetIdentityOptions = {}): Promise<User> {
        await this.initialize()

        const { 
            version = '2.0', 
            preferredMethod = 'passkey',
            allowFallback = true 
        } = options

        this.identityVersion = version

        // Determine the identity provider URL based on version
        let identityProviderUrl: string
        let authOptions: any = {
            maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
            windowOpenerFeatures: `
                left=${window.screen.width / 2 - 250},
                top=${window.screen.height / 2 - 300},
                toolbar=0,location=0,menubar=0,width=500,height=600
            `
        }

        if (version === '2.0') {
            identityProviderUrl = INTERNET_IDENTITY_2_0_URL
      
            // Internet Identity 2.0 specific options
            authOptions = {
                ...authOptions,
                // Support for discoverable passkeys (no anchor numbers needed)
                createOptions: {
                    publicKey: {
                        authenticatorSelection: {
                            residentKey: 'required',
                            userVerification: 'required'
                        }
                    }
                }
            }
        } else {
            identityProviderUrl = INTERNET_IDENTITY_1_0_URL
        }

        return new Promise((resolve, reject) => {
            this.authClient!.login({
                ...authOptions,
                identityProvider: identityProviderUrl,
                onSuccess: async () => {
                    try {
                        const identity = this.authClient!.getIdentity()
                        const principal = identity.getPrincipal()
            
                        // Create enhanced user profile
                        const user = await this.createEnhancedUserProfile(principal, version, preferredMethod)
            
                        // Store authentication info
                        this.storeAuthenticationInfo(user, version, preferredMethod)
            
                        resolve(user)
                    } catch (error) {
                        console.error('Error processing login:', error)
                        reject(new Error('Failed to process authentication'))
                    }
                },
                onError: async (error) => {
                    console.error(`Internet Identity ${version} login error:`, error)
          
                    // Fallback to Internet Identity 1.0 if 2.0 fails
                    if (version === '2.0' && allowFallback) {
                        console.log('Attempting fallback to Internet Identity 1.0...')
                        try {
                            const fallbackUser = await this.loginWithInternetIdentity({
                                version: '1.0',
                                preferredMethod: 'traditional',
                                allowFallback: false
                            })
                            resolve(fallbackUser)
                            return
                        } catch (fallbackError) {
                            console.error('Fallback to Internet Identity 1.0 also failed:', fallbackError)
                        }
                    }
          
                    reject(new Error(`Authentication failed with Internet Identity ${version}: ${error || 'Unknown error'}`))
                }
            })
        })
    }

    // Create enhanced user profile with Internet Identity 2.0 features
    private async createEnhancedUserProfile(
        principal: Principal, 
        version: IdentityVersion,
        method: AuthenticationMethod
    ): Promise<User> {
        const principalString = principal.toString()
    
        // Generate a more user-friendly display name for II 2.0
        let displayName: string
        if (version === '2.0') {
            // Internet Identity 2.0 supports custom names
            displayName = `Member ${principalString.slice(0, 6)}`
        } else {
            displayName = `User ${principalString.slice(0, 8)}`
        }

        const user: User = {
            id: principalString,
            name: displayName,
            email: method === 'google' ? 'Connected via Google' : '',
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${principalString}`,
            walletAddress: '',
            internetIdentityPrincipal: principalString,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        return user
    }

    // Store authentication information with version details
    private storeAuthenticationInfo(user: User, version: IdentityVersion, method: AuthenticationMethod) {
        localStorage.setItem('rotatechain_user', JSON.stringify(user))
        localStorage.setItem('rotatechain_authenticated', 'true')
        localStorage.setItem('rotatechain_identity_principal', user.internetIdentityPrincipal)
        localStorage.setItem('rotatechain_identity_version', version)
        localStorage.setItem('rotatechain_auth_method', method)
        localStorage.setItem('rotatechain_last_login', new Date().toISOString())
    }

    // Get authentication method used
    getAuthenticationInfo(): {
        version: IdentityVersion | null
        method: AuthenticationMethod | null
        lastLogin: string | null
    } {
        return {
            version: localStorage.getItem('rotatechain_identity_version') as IdentityVersion | null,
            method: localStorage.getItem('rotatechain_auth_method') as AuthenticationMethod | null,
            lastLogin: localStorage.getItem('rotatechain_last_login')
        }
    }

    // Get current user's identity and principal
    async getCurrentUserPrincipal(): Promise<Principal | null> {
        if (!this.authClient) {
            await this.initialize()
        }

        const isAuthenticated = await this.authClient!.isAuthenticated()
        if (!isAuthenticated) {
            return null
        }

        const identity = this.authClient!.getIdentity()
        return identity.getPrincipal()
    }

    // Check if user has Internet Identity 2.0 features available
    async hasInternetIdentity2Support(): Promise<boolean> {
        try {
            // Check if the browser supports WebAuthn (required for II 2.0 passkeys)
            return !!(navigator.credentials && window.PublicKeyCredential)
        } catch {
            return false
        }
    }

    // Enhanced user profile with Internet Identity version info with ICP integration
    async getUserProfile(): Promise<UserProfile | null> {
        try {
            const principal = await this.getCurrentUserPrincipal()
            if (!principal) {
                return null
            }

            const authInfo = this.getAuthenticationInfo()

            // TODO: Replace with actual backend call when Candid interfaces are ready
            // const backendProfile = await this.actor.getUserProfile()
      
            // Mock profile data for now
            const profile: UserProfile = {
                id: principal.toString(),
                principal: principal.toString(),
                personalInfo: {
                    displayName: `User ${principal.toString().slice(0, 8)}`,
                    bio: 'RotateChain community member',
                    location: 'Kenya'
                },
                preferences: {
                    theme: 'system',
                    language: 'en',
                    notifications: {
                        email: true,
                        browser: true,
                        mobile: false
                    },
                    privacy: {
                        profileVisibility: 'public',
                        showActivity: true,
                        showBalances: false
                    }
                },
                walletConnections: {
                    internetIdentity: {
                        isConnected: true,
                        principal: principal.toString(),
                        connectedAt: authInfo.lastLogin || new Date().toISOString(),
                        // Internet Identity 2.0 specific fields
                        ...(authInfo.version === '2.0' && {
                            version: '2.0',
                            authMethod: authInfo.method,
                            supportsPasskeys: await this.hasInternetIdentity2Support()
                        })
                    }
                },
                icpData: {
                    balance: 0,
                    transactions: [],
                    rTokens: [],
                    groupMemberships: []
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: authInfo.lastLogin || new Date().toISOString()
            }

            return profile
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
    }

    // Migrate from Internet Identity 1.0 to 2.0
    async migrateToInternetIdentity2(): Promise<UserProfileResponse> {
        try {
            const authInfo = this.getAuthenticationInfo()
      
            if (authInfo.version === '2.0') {
                return {
                    success: true,
                    data: await this.getUserProfile() as UserProfile,
                    error: 'Already using Internet Identity 2.0'
                }
            }

            // Check if browser supports Internet Identity 2.0
            const supports2_0 = await this.hasInternetIdentity2Support()
            if (!supports2_0) {
                return {
                    success: false,
                    error: 'Your browser does not support Internet Identity 2.0 features (WebAuthn required)'
                }
            }

            // Initiate migration process
            // This would typically involve re-authenticating with II 2.0
            console.log('Migration to Internet Identity 2.0 available - user should re-authenticate')
      
            return {
                success: true,
                data: await this.getUserProfile() as UserProfile
            }
      
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Migration failed'
            }
        }
    }

    // Convert Internet Identity data to User profile (backwards compatibility)
    async createUserFromIdentity(): Promise<User | null> {
        const principal = await this.getCurrentUserPrincipal()
        if (!principal) {
            return null
        }

        return this.createEnhancedUserProfile(principal, this.identityVersion, 'passkey')
    }

    // Enhanced logout with cleanup
    async logout(): Promise<void> {
        try {
            if (this.authClient) {
                await this.authClient.logout()
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Always clean up local storage
            localStorage.removeItem('rotatechain_user')
            localStorage.removeItem('rotatechain_authenticated')
            localStorage.removeItem('rotatechain_identity_principal')
            localStorage.removeItem('rotatechain_identity_version')
            localStorage.removeItem('rotatechain_auth_method')
            localStorage.removeItem('rotatechain_last_login')
            
            // Clean up service state
            this.cleanup()
        }
    }

    // Update user profile
    async updateUserProfile(updates: UpdateUserProfileRequest): Promise<UserProfileResponse> {
        try {
            await this.initialize()
      
            // TODO: Replace with actual backend call
            // const result = await this.actor.updateUserProfile(updates)
      
            // Mock response for now
            return {
                success: true,
                data: await this.getUserProfile() as UserProfile
            }
        } catch (error) {
            console.error('Error updating user profile:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update profile'
            }
        }
    }

    // Get user statistics
    async getUserStats(): Promise<UserStats | null> {
        try {
            const principal = await this.getCurrentUserPrincipal()
            if (!principal) {
                return null
            }

            // TODO: Replace with actual backend call
            // const stats = await this.actor.getUserStats()

            // Mock stats for now
            const stats: UserStats = {
                totalContributions: 2450,
                totalPayoutsReceived: 1800,
                activeGroupsCount: 3,
                completedGroupsCount: 1,
                rTokensValue: 650,
                averageYield: 8.5,
                joinDate: '2024-01-15T10:00:00Z',
                membershipDuration: 245
            }

            return stats
        } catch (error) {
            console.error('Error fetching user stats:', error)
            return null
        }
    }

    // Get user activity summary
    async getUserActivity(): Promise<UserActivitySummary | null> {
        try {
            const principal = await this.getCurrentUserPrincipal()
            if (!principal) {
                return null
            }

            // TODO: Replace with actual backend call
            // const activity = await this.actor.getUserActivity()

            // Mock activity for now
            const activity: UserActivitySummary = {
                last30Days: {
                    contributionsMade: 8,
                    payoutsReceived: 2,
                    poolInteractions: 5,
                    rTokenTransfers: 3
                },
                lifetime: {
                    totalGroups: 4,
                    totalContributions: 2450,
                    totalPayouts: 1800,
                    averageYield: 8.5
                }
            }

            return activity
        } catch (error) {
            console.error('Error fetching user activity:', error)
            return null
        }
    }

    // Connect additional wallet
    async connectWallet(request: ConnectWalletRequest): Promise<UserProfileResponse> {
        try {
            await this.initialize()
      
            // TODO: Implement wallet connection verification
            // const result = await this.actor.connectWallet(request)
      
            return {
                success: true,
                data: await this.getUserProfile() as UserProfile
            }
        } catch (error) {
            console.error('Error connecting wallet:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to connect wallet'
            }
        }
    }

    // Disconnect wallet
    async disconnectWallet(request: DisconnectWalletRequest): Promise<UserProfileResponse> {
        try {
            await this.initialize()
        
            // TODO: Implement wallet disconnection
            // const result = await this.actor.disconnectWallet(request)
            
            return {
                success: true,
                data: await this.getUserProfile() as UserProfile
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to disconnect wallet'
            }
        }
    }

    // Get security settings
    async getUserSecurity(): Promise<UserSecuritySettings | null> {
        try {
            const principal = await this.getCurrentUserPrincipal()
            if (!principal) {
              return null
            }

            const authInfo = this.getAuthenticationInfo()
            const supports2_0 = await this.hasInternetIdentity2Support()

            // TODO: Replace with actual backend call
            // const security = await this.actor.getUserSecurity()

            // Mock security settings
            const security: UserSecuritySettings = {
                twoFactorEnabled: false,
                backupPhrasesGenerated: true,
                recoveryMethodsConfigured: 1,
                lastSecurityReview: new Date().toISOString(),
                trustedDevices: [
                    {
                        id: '1',
                        deviceType: 'desktop',
                        browser: 'Chrome',
                        operatingSystem: 'Linux',
                        lastUsed: new Date().toISOString(),
                        isCurrentDevice: true
                    }
                ]       
            }

            return security
        } catch (error) {
            console.error('Error fetching security settings:', error)
            return null
        }
    }

    // Cleanup method
    cleanup() {
        this.agent = null
        this.actor = null
        this.authClient = null
    }
}

// Export singleton instance
export const userService = new UserService()

// Export service class for testing
export { UserService }

// Export commonly used functions
export const getUserProfile = () => userService.getUserProfile()
export const updateUserProfile = (updates: UpdateUserProfileRequest) => userService.updateUserProfile(updates)
export const getUserStats = () => userService.getUserStats()
export const getUserActivity = () => userService.getUserActivity()
export const loginWithInternetIdentity = (options?: InternetIdentityOptions) => userService.loginWithInternetIdentity(options)
export const migrateToInternetIdentity2 = () => userService.migrateToInternetIdentity2()
export const hasInternetIdentity2Support = () => userService.hasInternetIdentity2Support()