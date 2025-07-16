import { useContext, useEffect } from "react";
/*
import { WalletContext } from "../context/WalletContext";
import { Actor, HttpAgent } from "@dfinity/agent";

export const useWalletBalance = () => {
  const { wallet } = useContext(WalletContext);
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet) return;
      
      try {
        const agent = new HttpAgent({ identity: wallet.identity });
        if (import.meta.env.DFX_NETWORK !== "ic") {
          await agent.fetchRootKey();
        }
        
        // Connect to ledger canister
        const ledgerActor = Actor.createActor(ledgerIdl, {
          agent,
          canisterId: import.meta.env.LEDGER_CANISTER_ID,
        });
        
        const balance = await ledgerActor.icrc1_balance_of({
          owner: wallet.principal,
          subaccount: [],
        });
        
        return Number(balance) / 1e8;
      } catch (error) {
        console.error("Balance fetch error:", error);
      }
    };

    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [wallet]);
};*/