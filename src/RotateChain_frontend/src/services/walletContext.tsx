/*import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Principal } from '@dfinity/principal';
import { blockchainService } from './blockchain';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balances: Record<string, number>;
  refreshBalances: () => void;
  loading: boolean;
  transfer: (tokenId: string, to: Principal, amount: number) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  balances: {},
  refreshBalances: () => {},
  loading: true,
  transfer: async () => ''
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { principal, identity, isAuthenticated } = useAuth();
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchBalances = async () => {
    if (!isAuthenticated || !principal) {
      setBalances({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const tokens = ['icp', 'eth', 'btc', 'usdc'];
      const newBalances: Record<string, number> = {};
      
      for (const tokenId of tokens) {
        newBalances[tokenId] = await blockchainService.getTokenBalance(
          tokenId, 
          principal.toString()
        );
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const transfer = async (tokenId: string, to: Principal, amount: number): Promise<string> => {
    if (!identity) throw new Error('Wallet not connected');
    
    return blockchainService.transferToken(
      tokenId,
      identity,
      to,
      amount
    );
  };

  useEffect(() => {
    fetchBalances();
    
    // Set up balance polling
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, principal]);

  return (
    <WalletContext.Provider value={{ 
      balances, 
      refreshBalances: fetchBalances, 
      loading,
      transfer
    }}>
      {children}
    </WalletContext.Provider>
  );
};*/