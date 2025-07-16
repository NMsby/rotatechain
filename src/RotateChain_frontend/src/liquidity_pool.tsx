import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import "./globals.css"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// Type definitions
type Pool = {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  volume: number;
  trend: 'up' | 'down';
  color: string;
  icon: string;
};

type StreamItem = {
  id: number;
  content: string;
  value: string;
  positive: boolean;
};

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    tension: number;
    pointRadius: number;
    fill: boolean;
  }[];
};

const LiquidityPoolDashboard: React.FC = () => {
  // Pool data state
  const [pools, setPools] = useState<Pool[]>([
    { 
      id: 'metapool', 
      name: 'MetaPool', 
      apy: 12.65, 
      tvl: 1240, 
      volume: 342, 
      trend: 'up', 
      color: '#8B5CF6',
      icon: '🌌'
    },
    { 
      id: 'quantum', 
      name: 'Quantum Pool', 
      apy: 9.32, 
      tvl: 842, 
      volume: 218, 
      trend: 'down', 
      color: '#3B82F6',
      icon: '🌀'
    },
    { 
      id: 'nebula', 
      name: 'Nebula Pool', 
      apy: 18.27, 
      tvl: 567, 
      volume: 487, 
      trend: 'up', 
      color: '#06B6D4',
      icon: '🌠'
    },
    { 
      id: 'plasma', 
      name: 'Plasma Pool', 
      apy: 15.43, 
      tvl: 312, 
      volume: 192, 
      trend: 'up', 
      color: '#EC4899',
      icon: '⚡'
    }
  ]);

  // Data stream state
  const [streamData, setStreamData] = useState<StreamItem[]>([
    { id: 1, content: 'MetaPool: +$2.4M deposit', value: '+12.65% APY', positive: true },
    { id: 2, content: 'Quantum Pool APY adjustment', value: '-0.32%', positive: false },
    { id: 3, content: 'New liquidity provider: 0x8a3...c7d2', value: '$1.2M', positive: true },
    { id: 4, content: 'Nebula Pool: Fee distribution', value: '$42,382', positive: true },
    { id: 5, content: 'Plasma Pool APY increased', value: '+1.2%', positive: true },
    { id: 6, content: 'MetaPool: Withdrawal -$450K', value: '-0.04% TVL', positive: false },
    { id: 7, content: 'New pool created: MATIC-USDC', value: '$120K TVL', positive: true },
    { id: 8, content: 'Quantum Pool: +$1.8M deposit', value: '+9.32% APY', positive: true },
  ]);

  // Chart data state
  const [chartData, setChartData] = useState<Record<string, ChartData>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const streamContainerRef = useRef<HTMLDivElement>(null);

  // Generate chart data
  useEffect(() => {
    const generateChartData = (poolId: string): ChartData => {
      const pool = pools.find(p => p.id === poolId);
      const labels = Array.from({ length: 20 }, (_, i) => `${i * 5} min`);
      
      // Generate data with some randomness
      const data: number[] = [];
      let lastValue = pool?.apy || 10;
      for (let i = 0; i < 20; i++) {
        lastValue = lastValue + (Math.random() - 0.5) * 2;
        data.push(lastValue);
      }
      
      return {
        labels,
        datasets: [
          {
            label: 'APY',
            data,
            borderColor: pool?.color || '#8B5CF6',
            backgroundColor: `${pool?.color || '#8B5CF6'}20`,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            fill: true,
          }
        ]
      };
    };

    const charts: Record<string, ChartData> = {};
    pools.forEach(pool => {
      charts[pool.id] = generateChartData(pool.id);
    });
    setChartData(charts);
  }, [pools]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update APY values
      setPools(prev => prev.map(pool => {
        const change = (Math.random() - 0.5) * 0.4;
        const newApy = Math.max(5, Math.min(25, pool.apy + change));
        return {
          ...pool,
          apy: parseFloat(newApy.toFixed(2)),
          trend: change > 0 ? 'up' : 'down'
        };
      }));

      // Add new stream data
      const events: StreamItem[] = [
        { id: Date.now(), content: 'MetaPool: Swap fee collected', value: `$${(Math.random() * 10).toFixed(2)}K`, positive: true },
        { id: Date.now() + 1, content: 'Quantum Pool: APY adjustment', value: `${(Math.random() > 0.5 ? '+' : '')}${(Math.random() * 0.5).toFixed(2)}%`, positive: Math.random() > 0.5 },
        { id: Date.now() + 2, content: 'Nebula Pool: New deposit', value: `$${(Math.random() * 2).toFixed(2)}M`, positive: true },
        { id: Date.now() + 3, content: 'Plasma Pool: Withdrawal', value: `-$${(Math.random() * 0.5).toFixed(2)}M`, positive: false },
      ];
      
      const newEvent = events[Math.floor(Math.random() * events.length)];
      setStreamData(prev => [
        { ...newEvent },
        ...prev.slice(0, 7)
      ]);

      // Update last updated time
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Liquidity Pool Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-400">Real-time analytics for DeFi liquidity pools</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search pools..." 
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-48"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 px-3 sm:px-4 py-2 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">Mainnet</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 p-5 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 mb-1">Total Value Locked</p>
                <h3 className="text-2xl font-bold">$4.82B</h3>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
              <span>+2.4% today</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 p-5 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 mb-1">Active Pools</p>
                <h3 className="text-2xl font-bold">128</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>+3 new today</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 p-5 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 mb-1">Avg. APY</p>
                <h3 className="text-2xl font-bold">8.24%</h3>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded-xl">
                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-red-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              <span>-0.3% today</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 p-5 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 mb-1">24h Volume</p>
                <h3 className="text-2xl font-bold">$642M</h3>
              </div>
              <div className="bg-pink-500/10 p-3 rounded-xl">
                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
              <span>+7.1% today</span>
            </div>
          </div>
        </div>

        {/* Pool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          {pools.map(pool => (
            <div 
              key={pool.id}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 rounded-2xl backdrop-blur-sm overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center text-2xl">
                      {pool.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{pool.name}</h3>
                      <p className="text-gray-400 text-sm">ETH-USDC Liquidity</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${pool.trend === 'up' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                </div>
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Current APY</p>
                    <p className="text-3xl font-bold mt-1 animate-pulse">
                      {pool.apy.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">TVL</p>
                    <p className="text-xl font-bold">${pool.tvl}M</p>
                  </div>
                </div>
                
                <div className="h-28">
                  {chartData[pool.id] && (
                    <Line 
                      data={chartData[pool.id]} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { enabled: false }
                        },
                        scales: {
                          x: { display: false, grid: { display: false } },
                          y: { display: false, grid: { display: false } }
                        },
                        elements: { point: { radius: 0 } },
                        animation: { duration: 0 }
                      }} 
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Stream and Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="p-5 border-b border-gray-700/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                </svg>
                Real-time Pool Events
              </h3>
            </div>
            <div className="h-64 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-900/80 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
              <div 
                ref={streamContainerRef}
                className="p-4 space-y-3 animate-marquee"
              >
                {streamData.map(item => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 flex justify-between items-center transition-all duration-300 hover:bg-gray-800/50 hover:scale-[1.02]"
                  >
                    <span>{item.content}</span>
                    <span className={`${item.positive ? 'text-green-400' : 'text-red-400'} font-medium`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 rounded-2xl backdrop-blur-sm">
            <div className="p-5 border-b border-gray-700/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                APY Comparison
              </h3>
            </div>
            <div className="p-5">
              {pools.map(pool => (
                <div key={pool.id} className="mb-5 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: pool.color }}>{pool.name}</span>
                    <span className="text-sm font-bold">{pool.apy.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${(pool.apy / 20) * 100}%`, 
                        background: `linear-gradient(90deg, ${pool.color}00, ${pool.color})`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-gray-700/30 text-center text-gray-500">
          <p>Real-time DeFi Liquidity Pool Dashboard • Data updates every 5 seconds</p>
          <p className="mt-2 text-sm">Last updated: {lastUpdated}</p>
        </footer>
      </div>
    </div>
  );
};

export default LiquidityPoolDashboard;