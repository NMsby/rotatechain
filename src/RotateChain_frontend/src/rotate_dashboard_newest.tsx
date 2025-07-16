// Add at the top with other imports
/*import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ... existing code ...

// Add this inside the main Dashboard component
const [lendingRates, setLendingRates] = useState<any[]>([]);

// Fetch lending rates (mock data - in real app you'd use API)
useEffect(() => {
  // Simulated KuCoin lending rates data
  const mockRates = [
    { token: 'USDT', apy: 1.5, amount: 1200000 },
    { token: 'BTC', apy: 0.8, amount: 8500 },
    { token: 'ETH', apy: 1.2, amount: 42000 },
    { token: 'NEAR', apy: 2.5, amount: 180000 },
    { token: 'ICP', apy: 0.5, amount: 35000 },
    { token: 'SOL', apy: 1.8, amount: 75000 },
    { token: 'DOT', apy: 1.1, amount: 28000 },
  ];
  
  setLendingRates(mockRates);
}, []);

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{data.token}</p>
        <p className="text-blue-600">APY: <span className="font-bold">{data.apy}%</span></p>
        <p className="text-gray-600">Liquidity: <span className="font-bold">${(data.amount/1000).toFixed(1)}k</span></p>
        <p className="text-xs text-gray-500 mt-2">KuCoin Lending Pro</p>
      </div>
    );
  }
  return null;
};

// Token color mapping
const tokenColors: Record<string, string> = {
  USDT: '#26A17B',
  BTC: '#F7931A',
  ETH: '#627EEA',
  NEAR: '#00C1DE',
  ICP: '#29ABE2',
  SOL: '#00FFA3',
  DOT: '#E6007A'
};

// ... in the tabs section, add a new tab ...
<nav className="flex -mb-px">
  {(['overview', 'loans', 'members', 'settings', 'market'] as const).map(tab => (
    // ... existing tabs ...
  ))}
</nav>

// ... add the new market rates tab ...
{activeTab === 'market' && (
  <div>
    <h3 className="text-xl font-bold text-gray-800 mb-4">Crypto Lending Rates</h3>
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-indigo-700">
            Real-time lending rates from KuCoin. Rates update hourly based on market demand. Higher APY indicates higher borrowing demand for the asset.
          </p>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Current Lending APY</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={lendingRates}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="token" 
                angle={-45} 
                textAnchor="end"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                unit="%" 
                domain={[0, 3]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="apy" name="APY" radius={[4, 4, 0, 0]}>
                {lendingRates.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={tokenColors[entry.token] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Lending Rate Factors</h4>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Supply & Demand</h5>
                <p className="text-sm text-gray-600">
                  Rates increase when borrowing demand exceeds available supply. 
                  ICP's low rate indicates ample lending supply.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Market Volatility</h5>
                <p className="text-sm text-gray-600">
                  During high volatility, rates spike as traders borrow for positions. 
                  Stablecoins like USDT maintain consistent rates.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-amber-100 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Hourly Auctions</h5>
                <p className="text-sm text-gray-600">
                  KuCoin updates rates hourly. Lenders bid with minimum APY, matched with borrower demand to set market rates.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">ICP Lending Details</h4>
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-blue-600">0.5%</span>
                <span className="text-gray-500 ml-2">APY</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Current lending rate for ICP on KuCoin. Lower than average due to ample supply.
              </p>
              <div className="flex mt-3">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                  Low volatility
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  High liquidity
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
      <p className="text-sm text-gray-600 text-center">
        Data updates hourly • Rates based on KuCoin Lending Pro market • Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </p>
    </div>
  </div>
)}

*/