/*import React, { useState } from 'react';
import PlugConnect from './plug_connect';
import BitcoinWallet from './bitcoin_wallet';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);

  const handleConnect = (principal: string) => {
    setPrincipal(principal);
    setIsConnected(true);
  };

  const handleAddressGenerated = (address: string) => {
    setBtcAddress(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 8a2 2 0 114 0 2 2 0 01-4 0zm2 4a4 4 0 00-4 4h8a4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Bitcoin on IC</span>
            </div>
          </div>
          <div className="flex items-center">
            <PlugConnect onConnect={handleConnect} />
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Bitcoin Integration on the Internet Computer
            </h1>
            <p className="max-w-2xl mx-auto mt-5 text-xl text-gray-500">
              Securely manage Bitcoin addresses and balances directly from canisters
            </p>
          </div>

          {isConnected ? (
            <div className="flex justify-center">
              <BitcoinWallet onAddressGenerated={handleAddressGenerated} />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Connect your wallet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Connect your Plug wallet to interact with the Bitcoin canister and manage your Bitcoin addresses.
                </p>
                <div className="mt-6 flex justify-center">
                  <PlugConnect onConnect={handleConnect} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-t border-gray-200 pt-8 flex justify-between items-center">
            <p className="text-base text-gray-400">
              Bitcoin Integration Demo on the Internet Computer
            </p>
            <div className="flex space-x-6">
              <a href="https://internetcomputer.org/bitcoin-integration" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Documentation</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
              <a href="https://github.com/dfinity/examples" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;*/