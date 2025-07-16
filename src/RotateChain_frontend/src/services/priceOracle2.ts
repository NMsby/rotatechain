/*import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Mocked interface for the ICP Index Canister

const PriceOracleInterface = ({ IDL }) => {
  return IDL.Service({
    get_price: IDL.Func([IDL.Text], [IDL.Float64], ['query']),
    get_prices: IDL.Func([IDL.Vec(IDL.Text)], [IDL.Vec(IDL.Float64)], ['query']),
    subscribe: IDL.Func([IDL.Principal], [], []),
  });
};

class PriceOracleService {
  private agent: HttpAgent;
  private actor: any;
  
  constructor() {
    this.agent = new HttpAgent({ 
      host: process.env.DFX_NETWORK === 'ic' 
        ? 'https://ic0.app' 
        : 'http://localhost:4943'
    });
    
    this.actor = Actor.createActor(PriceOracleInterface, {
      agent: this.agent,
      canisterId: process.env.ICP_INDEX_CANISTER_ID!
    });
  }
  
  async getTokenPrice(tokenId: string): Promise<number> {
    try {
      return await this.actor.get_price(tokenId);
    } catch (error) {
      console.error('Error fetching token price:', error);
      // Fallback to mocked prices
      switch (tokenId) {
        case 'icp': return 13.25;
        case 'eth': return 3500;
        case 'btc': return 62000;
        default: return 1;
      }
    }
  }
  
  async getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
    try {
      const prices = await this.actor.get_prices(tokenIds);
      return tokenIds.reduce((acc, id, index) => {
        acc[id] = prices[index];
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {
        'icp': 13.25,
        'eth': 3500,
        'btc': 62000,
        'usdc': 1
      };
    }
  }
  
  async subscribe(principal: Principal) {
    try {
      await this.actor.subscribe(principal);
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  }
}

export const priceOracle = new PriceOracleService();*/