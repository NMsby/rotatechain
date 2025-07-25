import { createActor } from "../../../declarations/icp_backend";
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE }  from "../../../declarations/icp_backend/icp_backend.did"
//import { _SERVICE } from "../../../../declarations/icp_backend/payment_processor.did";

export const getPaymentCanister = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  //here I should be using our id probably i've commented theirs
  //const canisterId = process.env.PAYMENT_CANISTER_ID!;
  //even this frontendCid is incorrect, however let it remain since I'll change my code to be using a ledger.
  const frontendCid = window.location.origin.split('//')[1].split('.')[0];

  const canisterId = frontendCid;
  
  return createActor(canisterId, {
    agentOptions: { identity },
  });
};

export const connectPlug = async (network: 'mainnet' | 'testnet'): Promise<{ principal: string; accountId: string }> => {
  if (!window.ic?.plug) {
    window.open("https://plugwallet.ooo/", "_blank");
    throw new Error("Plug wallet not installed");
  }
  const frontendCid = window.location.origin.split('//')[1].split('.')[0];

  await window.ic.plug.requestConnect({
    whitelist: [frontendCid],
    host: network === 'testnet' 
      ? 'https://ic0.app' 
      : 'https://mainnet.ic0.app'
  });

  const principal = await window.ic.plug.agent.getPrincipal();
  const accountId = await window.ic.plug.agent.getAccountId();
  
  return { 
    principal: principal.toString(), 
    accountId: toHexString(accountId) 
  };
};

export const getICPBalance = async (network: 'mainnet' | 'testnet'): Promise<number> => {
  if (!window.ic?.plug) throw new Error("Plug wallet not connected");
  
  const balance = await window.ic.plug.requestBalance();
  const icpBalance = balance.find((b:any) => { return b.symbol === "ICP"});
  
  if (!icpBalance) return 0;
  return Number(icpBalance.amount);
};

export const sendICP = async (
  to: string,
  amount: number,
  network: 'mainnet' | 'testnet'
): Promise<bigint> => {
  if (!window.ic?.plug) throw new Error("Plug wallet not connected");
  
  const result = await window.ic.plug.requestTransfer({
    to,
    amount: amount * 100000000, // Convert to e8s
    opts: {
      fee: 10000, // 0.0001 ICP
      memo: "", 
      created_at_time: undefined
    }
  });
  
  return result.height;
};

// Helper function to convert account ID to hex
const toHexString = (bytes: Uint8Array) => {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};