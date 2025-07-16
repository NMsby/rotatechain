/*import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

interface TransactionOptions {
  method: string;
  args: any[];
  canisterId: string;
  identity: Identity;
}

class TransactionService {
  async signAndSendTransaction(options: TransactionOptions) {
    const { method, args, canisterId, identity } = options;
    
    const agent = new HttpAgent({ 
      identity,
      host: process.env.DFX_NETWORK === 'ic' 
        ? 'https://ic0.app' 
        : 'http://localhost:4943'
    });
    
    // Create actor for the target canister
    const actor = Actor.createActor(
      ({ IDL }) => IDL.Service({ [method]: IDL.Func(args.map(() => IDL.Nat64), [IDL.Text], []) }),
      { agent, canisterId }
    );
    
    try {
      // @ts-ignore - Dynamic method call
      const txId = await actor[method](...args);
      return txId;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
  
  async signMessage(identity: Identity, message: string) {
    const authClient = await AuthClient.create();
    const sessionKey = authClient.getIdentity();
    
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    const signature = await identity.sign(messageBytes);
    return {
      signature,
      publicKey: identity.getPublicKey().toDer(),
      sessionKey: sessionKey.getPrincipal().toText()
    };
  }
}

export const transactionService = new TransactionService();*/