/*import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Principal } from '@dfinity/principal';
import { blockchainService } from '../services/blockchain';
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
  c*/