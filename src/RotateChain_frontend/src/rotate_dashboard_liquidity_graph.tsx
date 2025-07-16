import React, { useState } from 'react';
import { useNotification } from './notificationContext';
import MetapoolLiquidityGraph from './liquidity_graph_alone';

const DashboardPage: React.FC = () => {
  const [count, setCount] = useState(0);
  const notification = useNotification();

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    notification.success(`Counter increased to ${newCount}`);
  };

  const handleReset = () => {
    setCount(0);
    notification.info('Counter reset to zero');
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Fixed Liquidity Graph Panel */}
      <div className="hidden lg:block w-1/3 min-w-[400px] p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-r border-gray-700 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <MetapoolLiquidityGraph />
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 p-4 lg:p-8 lg:ml-[-1px]">
        <div className="lg:hidden mb-8 bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-xl p-6">
          <MetapoolLiquidityGraph />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-400 mb-8">Real-time analytics and metrics</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-200 mb-4">Platform Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value Locked</span>
                  <span className="font-bold">$42.8M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Transactions</span>
                  <span className="font-bold">1,248</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Users</span>
                  <span className="font-bold">894</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-200 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-indigo-500 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Pool created</p>
                    <p className="text-sm text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-emerald-500 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Swap completed</p>
                    <p className="text-sm text-gray-400">15 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Interactive Counter</h2>
            <div className="bg-gray-900 p-8 rounded-xl max-w-md mx-auto">
              <div className="text-center mb-6">
                <p className="text-6xl font-bold text-indigo-400">{count}</p>
                <p className="text-gray-500 mt-2">Current Count</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleIncrement}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Increment
                </button>
                
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-200 mb-4">Pool Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300">Pool</th>
                    <th className="px-4 py-3 text-left text-gray-300">APY</th>
                    <th className="px-4 py-3 text-left text-gray-300">Liquidity</th>
                    <th className="px-4 py-3 text-left text-gray-300">24h Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    { name: 'ETH-USDC', apy: '12.5%', liquidity: '$8.2M', volume: '$1.4M' },
                    { name: 'ETH-DAI', apy: '9.8%', liquidity: '$5.6M', volume: '$890K' },
                    { name: 'USDC-DAI', apy: '3.2%', liquidity: '$12.1M', volume: '$3.7M' },
                    { name: 'WBTC-ETH', apy: '18.3%', liquidity: '$6.7M', volume: '$2.1M' },
                  ].map((pool, index) => (
                    <tr key={index} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3 font-medium">{pool.name}</td>
                      <td className="px-4 py-3 text-emerald-400">{pool.apy}</td>
                      <td className="px-4 py-3">{pool.liquidity}</td>
                      <td className="px-4 py-3">{pool.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;