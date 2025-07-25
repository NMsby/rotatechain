import React, { useState, useEffect } from 'react';
import PlugConnect from './plug_wallet_icp';
import PaymentForm from './Icp_payment_form';
import { getICPBalance, getPaymentCanister } from './services/icp_canister';

function ICPApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [principal, setPrincipal] = useState('');
  const [accountId, setAccountId] = useState('');
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleConnect = (principal: string, accountId: string) => {
    setPrincipal(principal);
    setAccountId(accountId);
    setIsConnected(true);
    fetchBalance();
    fetchPayments();
  };

  const fetchBalance = async () => {
    if (!isConnected) return;
    try {
      const balance = await getICPBalance(network);
      setBalance(balance);
      
      // Store balance in backend
      const paymentCanister = await getPaymentCanister();
      await paymentCanister.storeBalance(BigInt(balance * 100000000));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const fetchPayments = async () => {
    if (!isConnected) return;
    try {
      const paymentCanister = await getPaymentCanister();
      const payments = await paymentCanister.getPayments();
      setPayments(payments);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  const handlePaymentSent = () => {
    fetchBalance();
    fetchPayments();
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
  };

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
      fetchPayments();
    }
  }, [isConnected, network]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 8a2 2 0 114 0 2 2 0 01-4 0zm2 4a4 4 0 00-4 4h8a4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">ICP Payment App</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <div className="mr-2 text-sm font-medium text-gray-700">Network:</div>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setNetwork('testnet')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    network === 'testnet'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Testnet
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('mainnet')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    network === 'mainnet'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Mainnet
                </button>
              </div>
            </div>
            <PlugConnect 
              onConnect={handleConnect} 
              network={network} 
            />
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Connect your wallet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Connect your Plug wallet to manage ICP payments on the Internet Computer blockchain.
                </p>
                <div className="mt-6">
                  <PlugConnect 
                    onConnect={handleConnect} 
                    network={network} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">ICP Balance</h2>
                  <div className="flex items-end">
                    <div className="text-3xl font-bold text-indigo-600">{balance.toFixed(4)}</div>
                    <div className="ml-2 text-xl font-medium text-gray-600">ICP</div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Network</span>
                      <span className="font-medium">{network === 'testnet' ? 'ICP Testnet' : 'ICP Mainnet'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Account Type</span>
                      <span className="font-medium">Plug Wallet</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Transaction Fee</span>
                      <span className="font-medium">0.0001 ICP</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
                    <div className="space-y-3">
                      {payments.slice(0, 3).map((payment, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            payment.status.completed ? 'bg-green-100 text-green-600' : 
                            payment.status.failed ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.amount / 100000000} ICP
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.status.completed ? 'Completed' : payment.status.failed ? 'Failed' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {payments.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No recent transactions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <PaymentForm 
                  principal={principal}
                  accountId={accountId}
                  balance={balance}
                  network={network}
                  onPaymentSent={handlePaymentSent}
                  onBalanceUpdate={handleBalanceUpdate}
                />
                
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recipient
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Network
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {(Number(payment.amount) / 100000000).toFixed(8)} ICP
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.receiver.slice(0, 8)}...{payment.receiver.slice(-4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.network.testnet !== null ? 'Testnet' : 'Mainnet'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status.completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status.failed 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status.completed ? 'Completed' : payment.status.failed ? 'Failed' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        
                        {payments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-400">
              ICP Payment App - Built on the Internet Computer
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="https://internetcomputer.org/" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Internet Computer</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z"/>
                </svg>
              </a>
              <a href="https://plugwallet.ooo/" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Plug Wallet</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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

export default ICPApp;