import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { canisterIds, host } from './config';

// This will be available after dfx generates declarations
declare const createActor: any;
declare const rotatechain_backend: any;

export class ICPService {
  private static instance: ICPService;
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private agent: HttpAgent | null = null;

  private constructor() {}

  static getInstance(): ICPService {
    if (!ICPService.instance) {
      ICPService.instance = new ICPService();
    }
    return ICPService.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing ICP Service...');

      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: import.meta.env.MODE === 'development',
          idleTimeout: 1000 * 60 * 30, // 30 minutes
        },
      });

      console.log('✅ AuthClient created successfully');
      await this.updateActor();
    } catch (error) {
      console.error('❌ ICP Service initialization failed:', error);
      // Don't throw - allow fallback mock auth to work
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      console.error('❌ AuthClient not initialized');
      return false;
    }

    console.log('🔐 Starting Internet Identity login process...');

    return new Promise((resolve) => {
      const identityProvider = import.meta.env.DFX_NETWORK === "ic" 
        ? "https://identity.ic0.app"
        : `http://localhost:4943/?canisterId=${canisterIds.internet_identity}`;
      
      console.log('🌐 Identity Provider:', identityProvider);

      this.authClient?.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: async () => {
          console.log('✅ Internet Identity login successful');
          await this.updateActor();
          resolve(true);
        },
        onError: (error) => {
          console.error('❌ Internet Identity login failed:', error);
          resolve(false);
        },
      });
    });
  }

  async logout(): Promise<void> {
    try {
      await this.authClient?.logout();
      this.actor = null;
      this.agent = null;
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const result = await this.authClient?.isAuthenticated();
      console.log('🔍 Authentication check:', result);
      return !!result;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      return false;
    }
  }

  async getPrincipal(): Promise<string | null> {
    try {
      const identity = this.authClient?.getIdentity();
      const principal = identity?.getPrincipal().toString() || null;
      console.log('🆔 Principal:', principal);
      return principal;
    } catch (error) {
      console.error('❌ Failed to get principal:', error);
      return null;
    }
  }

  private async updateActor(): Promise<void> {
    try {
      const identity = this.authClient?.getIdentity();
      
      this.agent = new HttpAgent({
        host,
        identity,
      });

      // Fetch root key for local development
      if (import.meta.env.DFX_NETWORK !== "ic") {
        console.log('🔑 Fetching root key for local development...');
        await this.agent.fetchRootKey();
      }

      // Try to create actor with generated declarations
      if (typeof createActor !== 'undefined') {
        this.actor = createActor(canisterIds.rotatechain_backend, {
          agent: this.agent,
        });
        console.log('✅ Actor created successfully');
      } else {
        console.warn('⚠️ createActor not available - declarations not generated yet');
      }
    } catch (error) {
      console.error('❌ Failed to update actor:', error);
    }
  }

  getActor(): any {
    return this.actor;
  }

  async callBackend<T>(method: string, args: any[] = []): Promise<T | null> {
    try {
      if (!this.actor) {
        console.warn('⚠️ Actor not initialized, cannot call backend');
        return null;
      }
      console.log(`🔄 Calling backend method: ${method}`);
      const result = await this.actor[method](...args);
      console.log(`✅ Backend call successful: ${method}`);
      return result;
    } catch (error) {
      console.error(`❌ Backend call failed for ${method}:`, error);
      return null;
    }
  }
}

export const icpService = ICPService.getInstance();