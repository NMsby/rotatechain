/*import { createActor } from "../../../declarations/bitcoin_backend";
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/bitcoin_backend/bitcoin_wallet.did";

export const getBitcoinWalletCanister = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  const canisterId = process.env.BITCOIN_WALLET_CANISTER_ID!;
  
  return createActor(canisterId, {
    agentOptions: { identity },
  });
};

export const connectPlug = async (): Promise<{ principal: string; agent: any }> => {
  if (!window.ic?.plug) {
    window.open("https://plugwallet.ooo/", "_blank");
    throw new Error("Plug wallet not installed");
  }

  // Check if already connected
  const connected = await window.ic.plug.isConnected();
  if (!connected) {
    // Request connection
    await window.ic.plug.requestConnect({
      whitelist: [process.env.BITCOIN_WALLET_CANISTER_ID!],
    });
  }

  // Create an actor for the Bitcoin wallet canister
  const actor = await window.ic.plug.createActor({
    canisterId: process.env.BITCOIN_WALLET_CANISTER_ID!,
    interfaceFactory: ({ IDL }) => {
      return IDL.Service({
        generate_address: IDL.Func([IDL.Variant({ mainnet: IDL.Null, testnet: IDL.Null })], [IDL.Text], []),
        get_balance: IDL.Func([IDL.Variant({ mainnet: IDL.Null, testnet: IDL.Null })], [IDL.Nat64], []),
        get_utxos: IDL.Func([IDL.Variant({ mainnet: IDL.Null, testnet: IDL.Null })], [IDL.Vec(IDL.Record({
          outpoint: IDL.Record({ txid: IDL.Vec(IDL.Nat8), vout: IDL.Nat32 }),
          value: IDL.Nat64,
          height: IDL.Nat32
        }))], []),
      });
    },
  });

  // Get principal
  const principal = await window.ic.plug.agent.getPrincipal();
  
  return { principal: principal.toString(), agent: actor };
};*/