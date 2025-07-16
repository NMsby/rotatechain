// src/pages/DashboardPage.tsx
import React, { useState ,useEffect} from 'react';
import { useNotification } from './notificationContext';
//import LiquidityGraph from '../components/LiquidityGraph';
//import PoolStats from '../components/PoolStats';
//import RecentTransactions from '../components/RecentTransactions';
//import PoolComposition from '../components/PoolComposition';
//import QuickActions from '../components/QuickActions';
import { FaExchangeAlt,FaArrowUp, FaArrowDown,FaPlus, FaMinus, FaLock  } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';


const DashboardPage: React.FC = () => {
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
      {/* Fixed Analytics Sidebar */}
      <div className="lg:w-1/3 min-w-[350px] p-4 lg:p-6 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Real-time Liquidity</h2>
          <div className="text-gray-400 text-sm">ETH-USDC Metapool</div>
        </div>
        
        <LiquidityGraph />
        
        <div className="mt-6">
          <PoolStats />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Liquidity Pool Dashboard</h1>
            <p className="text-gray-400">Monitor and manage your liquidity positions</p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Analytics
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-200">Quick Actions</h2>
              <div className="text-sm text-gray-400">Manage your liquidity</div>
            </div>
            
            <QuickActions />
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-200 mb-6">Pool Composition</h2>
            <PoolComposition />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-200">Recent Transactions</h2>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm">
              View All
            </button>
          </div>
          
          <RecentTransactions />
        </div>
        
        {activeTab === 'analytics' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-200 mb-6">Advanced Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-bold text-gray-300 mb-2">Volume (24h)</h3>
                <p className="text-2xl font-bold text-emerald-400">$1.42M</p>
                <div className="h-40 mt-4 flex items-end">
                  {[40, 60, 75, 55, 80, 65, 90].map((val, i) => (
                    <div 
                      key={i} 
                      className="flex-1 mx-0.5 bg-emerald-500 rounded-t"
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-bold text-gray-300 mb-2">Fees Collected (7d)</h3>
                <p className="text-2xl font-bold text-amber-400">$28,450</p>
                <div className="h-40 mt-4 flex items-end">
                  {[30, 50, 65, 45, 70, 60, 85].map((val, i) => (
                    <div 
                      key={i} 
                      className="flex-1 mx-0.5 bg-amber-500 rounded-t"
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;


// src/components/LiquidityGraph.tsx
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LiquidityGraph: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  
  // Generate mock data based on time range
  const generateData = () => {
    const now = new Date();
    const data = [];
    let labels = [];
    
    if (timeRange === '1h') {
      for (let i = 12; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60000);
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        data.push(1.5 + Math.random() * 0.3);
      }
    } else if (timeRange === '24h') {
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60000);
        labels.push(time.toLocaleTimeString([], { hour: '2-digit' }));
        data.push(1.4 + Math.random() * 0.4);
      }
    } else {
      for (let i = 7; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60000);
        labels.push(time.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        data.push(1.3 + Math.random() * 0.5);
      }
    }
    
    return { labels, data };
  };
  
  const { labels, data } = generateData();
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Liquidity (Million USD)',
        data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(209, 213, 219)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(55, 65, 81, 0.5)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(55, 65, 81, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  return (
    <div className="h-64">
      <div className="flex justify-end mb-2">
        <div className="inline-flex rounded-lg text-sm bg-gray-700 p-1">
          <button 
            onClick={() => setTimeRange('1h')}
            className={`px-3 py-1 rounded-md ${timeRange === '1h' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            1H
          </button>
          <button 
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 rounded-md ${timeRange === '24h' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            24H
          </button>
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-md ${timeRange === '7d' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}
          >
            7D
          </button>
        </div>
      </div>
      
      <Line data={chartData} options={options} />
    </div>
  );
};

// src/components/QuickActions.tsx
const QuickActions: React.FC = () => {
  const [activeAction, setActiveAction] = useState<'add' | 'remove' | 'swap' | 'stake'>('add');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveAction('add')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${activeAction === 'add' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <FaPlus className="text-xl mb-2" />
          <span>Add Liquidity</span>
        </button>
        
        <button 
          onClick={() => setActiveAction('remove')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${activeAction === 'remove' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <FaMinus className="text-xl mb-2" />
          <span>Remove</span>
        </button>
        
        <button 
          onClick={() => setActiveAction('swap')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${activeAction === 'swap' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <FaExchangeAlt className="text-xl mb-2" />
          <span>Swap</span>
        </button>
        
        <button 
          onClick={() => setActiveAction('stake')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${activeAction === 'stake' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <FaLock className="text-xl mb-2" />
          <span>Stake</span>
        </button>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-xl">
        {activeAction === 'add' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-300">Add Liquidity</h3>
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">ETH</span>
                  <span className="text-gray-400">Balance: 1.24</span>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl w-full text-white focus:outline-none"
                  />
                  <button className="bg-gray-700 px-3 py-1 rounded text-sm">MAX</button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-gray-700 p-1 rounded-full">
                  <FaPlus className="text-gray-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">USDC</span>
                  <span className="text-gray-400">Balance: 4,250</span>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl w-full text-white focus:outline-none"
                  />
                  <button className="bg-gray-700 px-3 py-1 rounded text-sm">MAX</button>
                </div>
              </div>
              
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-medium transition">
                Add Liquidity
              </button>
            </div>
          </div>
        )}
        
        {activeAction === 'remove' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-300">Remove Liquidity</h3>
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Your LP Tokens</span>
                  <span className="text-gray-400">Balance: 124.75</span>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl w-full text-white focus:outline-none"
                  />
                  <button className="bg-gray-700 px-3 py-1 rounded text-sm">MAX</button>
                </div>
              </div>
              
              <div className="flex justify-between text-gray-400 text-sm">
                <span>You will receive:</span>
                <span>~$1,240</span>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>ETH</span>
                  <span>0.124</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>USDC</span>
                  <span>425</span>
                </div>
              </div>
              
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-medium transition">
                Remove Liquidity
              </button>
            </div>
          </div>
        )}
        
        {activeAction === 'swap' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-300">Swap Tokens</h3>
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">From</span>
                  <span className="text-gray-400">Balance: 1.24</span>
                </div>
                <div className="flex items-center">
                  <select className="bg-gray-700 rounded-l-lg px-3 py-2 focus:outline-none">
                    <option>ETH</option>
                    <option>USDC</option>
                    <option>DAI</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl w-full text-white focus:outline-none px-3"
                  />
                  <button className="bg-gray-700 px-3 py-1 rounded text-sm">MAX</button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-gray-700 p-1 rounded-full rotate-90">
                  <FaExchangeAlt className="text-gray-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">To</span>
                  <span className="text-gray-400">Balance: 4,250</span>
                </div>
                <div className="flex items-center">
                  <select className="bg-gray-700 rounded-l-lg px-3 py-2 focus:outline-none">
                    <option>USDC</option>
                    <option>ETH</option>
                    <option>DAI</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl w-full text-white focus:outline-none px-3"
                  />
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price</span>
                  <span>1 ETH = 3,425.50 USDC</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Minimum received</span>
                  <span>3,412.25 USDC</span>
                </div>
              </div>
              
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-medium transition">
                Swap Tokens
              </button>
            </div>
          </div>
        )}
        
        {activeAction === 'stake' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-300">Stake LP Tokens</h3>
            <div className="space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">LP Tokens to Stake</span>
                  <span className="text-gray-400">Balance: 124.75</span>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    placeholder="0.0" 
                    className="bg-transparent text-xl w-full text-white focus:outline-none"
                  />
                  <button className="bg-gray-700 px-3 py-1 rounded text-sm">MAX</button>
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current APR</span>
                  <span className="text-emerald-400 font-bold">24.5%</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-400">Your Rewards</span>
                  <span>12.4 META</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-medium transition">
                  Stake
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium transition">
                  Claim Rewards
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// src/components/PoolStats.tsx

const PoolStats: React.FC = () => {
  const stats = [
    { title: 'Total Value Locked', value: '$12.4M', change: 2.4, positive: true },
    { title: '24h Volume', value: '$1.42M', change: 5.2, positive: true },
    { title: '24h Fees', value: '$8,450', change: -1.2, positive: false },
    { title: 'LP Token Price', value: '$10.42', change: 0.8, positive: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
          <div className="text-xl font-bold text-gray-100 mb-1">{stat.value}</div>
          <div className={`flex items-center text-xs ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stat.positive ? <FaArrowUp /> : <FaArrowDown />}
            <span className="ml-1">{Math.abs(stat.change)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// src/components/PoolComposition.tsx

const PoolComposition: React.FC = () => {
  const tokens = [
    { name: 'ETH', percentage: 60, value: '$7.44M', color: 'bg-indigo-500' },
    { name: 'USDC', percentage: 35, value: '$4.34M', color: 'bg-emerald-500' },
    { name: 'Other', percentage: 5, value: '$620K', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
        {tokens.map((token, index) => (
          <div 
            key={index}
            className={`h-full ${token.color}`}
            style={{ width: `${token.percentage}%`, display: 'inline-block' }}
          />
        ))}
      </div>
      
      <div className="space-y-2">
        {tokens.map((token, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-3 h-3 ${token.color} rounded-full mr-2`}></div>
              <span className="text-sm">{token.name}</span>
            </div>
            <div className="text-sm text-gray-300">
              {token.percentage}% • {token.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// src/components/RecentTransactions.tsx

const RecentTransactions: React.FC = () => {
  const transactions = [
    { type: 'swap', from: 'ETH', to: 'USDC', amount: '0.5', time: '2 min ago', status: 'completed' },
    { type: 'add', token: 'ETH', amount: '1.2', time: '15 min ago', status: 'completed' },
    { type: 'remove', token: 'ETH', amount: '0.3', time: '1 hour ago', status: 'completed' },
    { type: 'swap', from: 'USDC', to: 'ETH', amount: '1,200', time: '3 hours ago', status: 'completed' },
    { type: 'stake', token: 'LP', amount: '50', time: '5 hours ago', status: 'pending' },
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'swap': return <FaExchangeAlt className="text-indigo-400" />;
      case 'add': return <FaArrowDown className="text-emerald-400" />;
      case 'remove': return <FaArrowUp className="text-amber-400" />;
      case 'stake': return <FaLock className="text-purple-400" />;
      default: return <FaExchangeAlt />;
    }
  };

  const getActionText = (tx: any) => {
    switch(tx.type) {
      case 'swap': return `Swap ${tx.amount} ${tx.from} to ${tx.to}`;
      case 'add': return `Add ${tx.amount} ${tx.token} liquidity`;
      case 'remove': return `Remove ${tx.amount} ${tx.token} liquidity`;
      case 'stake': return `Stake ${tx.amount} ${tx.token} tokens`;
      default: return 'Transaction';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'text-emerald-400' : 'text-amber-400';
  };

  return (
    <div className="space-y-4">
      {transactions.map((tx, index) => (
        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-750 rounded-lg transition">
          <div className="flex items-center">
            <div className="p-2 bg-gray-700 rounded-lg mr-3">
              {getIcon(tx.type)}
            </div>
            <div>
              <div className="font-medium">{getActionText(tx)}</div>
              <div className="text-sm text-gray-400">{tx.time}</div>
            </div>
          </div>
          <div className={`text-sm ${getStatusColor(tx.status)}`}>
            {tx.status}
          </div>
        </div>
      ))}
    </div>
  );
};

