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
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: process.env.NODE_ENV === 'development',
          idleTimeout: 1000 * 60 * 30, // 30 minutes
        },
      });

      await this.updateActor();
    } catch (error) {
      console.error('ICP Service initialization failed:', error);
      // Don't throw - allow mock auth to work
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      console.error('AuthClient not initialized');
      return false;
    }

    return new Promise((resolve) => {
      this.authClient?.login({
        identityProvider: process.env.DFX_NETWORK === "ic" 
          ? "https://identity.ic0.app"
          : `http://localhost:4943/?canisterId=${canisterIds.internet_identity}`,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: async () => {
          await this.updateActor();
          resolve(true);
        },
        onError: () => resolve(false),
      });
    });
  }

  async logout(): Promise<void> {
    await this.authClient?.logout();
    this.actor = null;
    this.agent = null;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      return !!(await this.authClient?.isAuthenticated());
    } catch {
      return false;
    }
  }

  async getPrincipal(): Promise<string | null> {
    try {
      const identity = this.authClient?.getIdentity();
      return identity?.getPrincipal().toString() || null;
    } catch {
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
      if (process.env.DFX_NETWORK !== "ic") {
        await this.agent.fetchRootKey();
      }

      // Try to create actor with generated declarations
      if (typeof createActor !== 'undefined') {
        this.actor = createActor(canisterIds.rotatechain_backend, {
          agent: this.agent,
        });
      }
    } catch (error) {
      console.error('Failed to update actor:', error);
    }
  }

  getActor(): any {
    return this.actor;
  }

  // Backend method calls
  async callBackend<T>(method: string, args: any[] = []): Promise<T | null> {
    try {
      if (!this.actor) {
        throw new Error('Actor not initialized');
      }
      return await this.actor[method](...args);
    } catch (error) {
      console.error(`Backend call failed for ${method}:`, error);
      return null;
    }
  }
}

export const icpService = ICPService.getInstance();