/*import React, { useState } from 'react';
import { connectPlug } from './services/bitcoin_canister';

interface BitcoinWalletProps {
  onAddressGenerated: (address: string) => void;
}

const BitcoinWallet: React.FC<BitcoinWalletProps> = ({ onAddressGenerated }) => {
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState<'address' | 'balance' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const handleGenerateAddress = async () => {
    try {
      setError(null);
      setLoading('address');
      
      const { agent } = await connectPlug();
      const address = await agent.generate_address({ [network]: null });
      
      setBtcAddress(address);
      onAddressGenerated(address);
    } catch (err) {
      setError(`Failed to generate address: ${(err as Error).message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleGetBalance = async () => {
    try {
      if (!btcAddress) {
        setError('Generate an address first');
        return;
      }
      
      setError(null);
      setLoading('balance');
      
      const { agent } = await connectPlug();
      const balance = await agent.get_balance({ [network]: null });
      
      // Convert satoshis to BTC
      const btcBalance = Number(balance) / 100_000_000;
      setBalance(btcBalance.toFixed(8));
    } catch (err) {
      setError(`Failed to get balance: ${(err as Error).message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Bitcoin Wallet</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setNetwork('testnet')}
            className={`px-4 py-2 rounded-lg ${
              network === 'testnet' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Testnet
          </button>
          <button
            onClick={() => setNetwork('mainnet')}
            className={`px-4 py-2 rounded-lg ${
              network === 'mainnet' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Mainnet
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGenerateAddress}
            disabled={loading === 'address'}
            className={`py-3 px-6 rounded-xl flex items-center justify-center ${
              loading === 'address' 
                ? 'bg-blue-400' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            } text-white font-medium transition-all duration-200 shadow-lg`}
          >
            {loading === 'address' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Generate Bitcoin Address
              </>
            )}
          </button>

          <button
            onClick={handleGetBalance}
            disabled={loading === 'balance' || !btcAddress}
            className={`py-3 px-6 rounded-xl flex items-center justify-center ${
              loading === 'balance' 
                ? 'bg-green-400' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            } text-white font-medium transition-all duration-200 shadow-lg disabled:opacity-70`}
          >
            {loading === 'balance' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Check Balance
              </>
            )}
          </button>
        </div>

        {btcAddress && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Bitcoin Address ({network}):</h3>
            <div className="flex items-center">
              <div className="font-mono text-sm break-all flex-grow">{btcAddress}</div>
              <button 
                onClick={() => navigator.clipboard.writeText(btcAddress)}
                className="ml-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {balance !== null && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Bitcoin Balance</h3>
                <div className="mt-1 flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{balance}</span>
                  <span className="ml-2 text-xl font-medium text-gray-600">BTC</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 8a2 2 0 114 0 2 2 0 01-4 0zm2 4a4 4 0 00-4 4h8a4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>{error}</div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-3">About Bitcoin on IC</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>The Bitcoin canister allows Internet Computer canisters to directly interact with the Bitcoin network.</p>
          <p>This demo uses the Plug wallet for authentication and generates a unique Bitcoin address for each user.</p>
          <p>All Bitcoin operations are performed directly on-chain through the Bitcoin canister.</p>
        </div>
      </div>
    </div>
  );
};

export default BitcoinWallet;*/