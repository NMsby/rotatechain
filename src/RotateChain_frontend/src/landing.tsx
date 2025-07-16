import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useEffect, useRef } from "react";
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three';
import "./globals.css"

// ======== Responsive Hook ========
const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ======== 3D Responsive Chart ========
function ResponsiveChart() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const isMobile = useMobile();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[
        isMobile ? 2 : 3, 
        isMobile ? 2 : 3, 
        1, 32, 1, true
      ]} />
      <meshPhongMaterial
        side={THREE.DoubleSide}
        color="#00FEFE"
        transparent
        opacity={0.8}
        wireframe
      />
    </mesh>
  );
}

// ======== Yield Optimizer Types ========
type StrategyType = 'conservative' | 'balanced' | 'aggressive';

interface Strategy {
  apy: string;
  risk: string;
  color: string;
}

interface PoolAllocation {
  name: string;
  allocation: number;
}

// ======== Mobile-Friendly Yield Optimizer ========
function YieldOptimizer() {
  const [strategy, setStrategy] = useState<StrategyType>('conservative');
  const [tvl, setTvl] = useState<number>(0);
  const isMobile = useMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setTvl(prev => prev + Math.random() * 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const strategies: Record<StrategyType, Strategy> = {
    conservative: { apy: '8-12%', risk: 'Low', color: 'from-[#00FEFE] to-[#0081FF]' },
    balanced: { apy: '12-18%', risk: 'Medium', color: 'from-[#FF00FF] to-[#FF0066]' },
    aggressive: { apy: '18-25%', risk: 'High', color: 'from-[#FF0066] to-[#FF0000]' }
  };

  const poolAllocations: PoolAllocation[] = [
    { name: 'Curve Finance', allocation: 35 },
    { name: 'Aave V3', allocation: 25 },
    { name: 'Uniswap V3', allocation: 20 },
    { name: 'Compound', allocation: 15 },
    { name: 'Yearn', allocation: 5 }
  ];

  return (
    <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Yield Optimizer</h3>
        <div className="text-sm bg-[#FFFFFF10] px-3 py-1 rounded-full">
          TVL: ${(tvl / 1000).toFixed(1)}M
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Strategy</span>
          <span>APY: {strategies[strategy].apy}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(strategies) as StrategyType[]).map((key) => (
            <button
              key={key}
              onClick={() => setStrategy(key)}
              className={`text-sm py-2 rounded-lg transition-all ${
                strategy === key
                  ? `bg-gradient-to-r ${strategies[key].color} text-black font-bold`
                  : 'bg-[#FFFFFF10] text-white/70'
              }`}
            >
              {isMobile ? key.charAt(0).toUpperCase() : key}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {poolAllocations.map((pool, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{pool.name}</span>
              <span>{pool.allocation}%</span>
            </div>
            <div className="w-full bg-[#FFFFFF10] rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pool.allocation}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  strategy === 'conservative' ? 'bg-[#00FEFE]' :
                  strategy === 'balanced' ? 'bg-[#FF00FF]' : 'bg-[#FF0066]'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== Limit Order Book Types ========
type OrderTab = 'buy' | 'sell';

interface Order {
  price: number;
  amount: number;
  total: number;
}

interface OrderBook {
  buy: Order[];
  sell: Order[];
}

// ======== Mobile-Adaptive Limit Order Book ========
function LimitOrderBook() {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy');
  const isMobile = useMobile();

  const orders: OrderBook = {
    buy: [
      { price: 1832.45, amount: 1.24, total: 2272.24 },
      { price: 1831.80, amount: 0.85, total: 1557.03 },
      { price: 1830.50, amount: 2.10, total: 3844.05 }
    ],
    sell: [
      { price: 1833.20, amount: 0.95, total: 1741.54 },
      { price: 1833.75, amount: 1.50, total: 2750.63 },
      { price: 1834.30, amount: 0.75, total: 1375.73 }
    ]
  };

  return (
    <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">ETH/USDC</h3>
        <div className="flex bg-[#FFFFFF10] rounded-lg p-1">
          {(['buy', 'sell'] as OrderTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-sm ${
                activeTab === tab
                  ? `bg-gradient-to-r ${
                      tab === 'buy' ? 'from-[#00FEFE] to-[#0081FF]' : 'from-[#FF00FF] to-[#FF0066]'
                    } text-black`
                  : 'text-white/70'
              }`}
            >
              {isMobile ? (tab === 'buy' ? 'Bid' : 'Ask') : tab === 'buy' ? 'Buy Orders' : 'Sell Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 text-sm text-white/70 mb-2">
        <span>Price</span>
        <span className="text-center">Amount</span>
        <span className="text-right">Total</span>
      </div>

      <div className="space-y-2">
        {orders[activeTab].map((order, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="grid grid-cols-3 text-sm py-1"
          >
            <span className={activeTab === 'buy' ? 'text-[#00FEFE]' : 'text-[#FF00FF]'}>
              {order.price.toFixed(2)}
            </span>
            <span className="text-center">{order.amount.toFixed(2)}</span>
            <span className="text-right">{order.total.toFixed(2)}</span>
          </motion.div>
        ))}
      </div>

      {!isMobile && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Price</label>
              <input 
                type="number" 
                className="w-full bg-[#FFFFFF10] border border-[#FFFFFF20] rounded-lg px-3 py-2 text-sm" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Amount</label>
              <input 
                type="number" 
                className="w-full bg-[#FFFFFF10] border border-[#FFFFFF20] rounded-lg px-3 py-2 text-sm" 
                placeholder="0.00"
              />
            </div>
          </div>
          <button className={`w-full mt-4 py-2 rounded-lg font-bold ${
            activeTab === 'buy' 
              ? 'bg-gradient-to-r from-[#00FEFE] to-[#0081FF]' 
              : 'bg-gradient-to-r from-[#FF00FF] to-[#FF0066]'
          }`}>
            Place {activeTab === 'buy' ? 'Buy' : 'Sell'} Order
          </button>
        </div>
      )}
    </div>
  );
}

// ======== Options Trading Types ========
type OptionType = 'call' | 'put';
type ExpiryType = '7d' | '14d' | '30d';

interface Option {
  strike: number;
  premium: number;
  iv: number;
}

// ======== Options Trading Component ========
function OptionsTrading() {
  const [expiry, setExpiry] = useState<ExpiryType>('7d');
  const [type, setType] = useState<OptionType>('call');
  const isMobile = useMobile();

  const options: Option[] = [
    { strike: 1800, premium: 85, iv: 45 },
    { strike: 1850, premium: 65, iv: 52 },
    { strike: 1900, premium: 50, iv: 58 }
  ];

  return (
    <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">ETH Options</h3>
        <div className="flex items-center space-x-2">
          <select 
            value={expiry}
            onChange={(e) => setExpiry(e.target.value as ExpiryType)}
            className="bg-[#FFFFFF10] border border-[#FFFFFF20] rounded-lg px-2 py-1 text-sm"
          >
            <option value="7d">7D</option>
            <option value="14d">14D</option>
            <option value="30d">30D</option>
          </select>
          <div className="flex bg-[#FFFFFF10] rounded-lg p-1">
            {(['call', 'put'] as OptionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2 py-1 rounded-md text-xs ${
                  type === t
                    ? `bg-gradient-to-r ${
                        t === 'call' ? 'from-[#00FEFE] to-[#0081FF]' : 'from-[#FF00FF] to-[#FF0066]'
                      } text-black`
                    : 'text-white/70'
                }`}
              >
                {isMobile ? t.charAt(0).toUpperCase() : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 text-sm text-white/70 mb-2">
        <span>Strike</span>
        <span className="text-center">Premium</span>
        <span className="text-center">IV</span>
        <span className="text-right">Action</span>
      </div>

      <div className="space-y-2">
        {options.map((option, i) => (
          <div key={i} className="grid grid-cols-4 items-center text-sm py-2 border-b border-[#FFFFFF10]">
            <span>{option.strike}</span>
            <span className="text-center">
              <span className={type === 'call' ? 'text-[#00FEFE]' : 'text-[#FF00FF]'}>
                {option.premium}
              </span>
            </span>
            <span className="text-center">{option.iv}%</span>
            <div className="text-right">
              <button className={`text-xs px-3 py-1 rounded-full ${
                type === 'call' 
                  ? 'bg-[#00FEFE20] text-[#00FEFE]' 
                  : 'bg-[#FF00FF20] text-[#FF00FF]'
              }`}>
                {isMobile ? 'Buy' : 'Purchase'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== Liquidity Pool Types ========
interface LiquidityPool {
  pair: string;
  apr: string;
  tvl: string;
}

// ======== Main Component Types ========
type TabType = 'dashboard' | 'trade' | 'earn' | 'portfolio' | 'more';
type MobileTabType = 'dashboard' | 'trade' | 'earn' | 'portfolio';

interface MobileTab {
  id: MobileTabType;
  icon: string;
  label: string;
}

// ======== Main Responsive Component ========
export default function DeFiDashboard() {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const liquidityPools: LiquidityPool[] = [
    { pair: 'ETH/USDC', apr: '24%', tvl: '$12.4M' },
    { pair: 'BTC/ETH', apr: '18%', tvl: '$8.7M' },
    { pair: 'SOL/USDT', apr: '32%', tvl: '$5.2M' }
  ];

  const mobileTabs: MobileTab[] = [
    { id: 'dashboard', icon: '📊', label: 'Home' },
    { id: 'trade', icon: '💱', label: 'Trade' },
    { id: 'earn', icon: '🤑', label: 'Earn' },
    { id: 'portfolio', icon: '💰', label: 'Portfolio' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-white">
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A1A] border-t border-[#FFFFFF20] z-50">
          <div className="grid grid-cols-4">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 flex flex-col items-center text-sm ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-white/50'
                }`}
              >
                <span className="text-xl mb-1">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 pb-32 ${isMobile ? 'pt-6' : 'pt-12'}`}>
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex justify-between items-center mb-12">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00FEFE] to-[#0081FF] bg-clip-text text-transparent">
              DeFiNova Pro
            </div>
            <div className="flex space-x-4">
              {(['dashboard', 'trade', 'earn', 'portfolio', 'more'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-[#00FEFE] to-[#0081FF] text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button className="bg-gradient-to-r from-[#FF00FF] to-[#FF0066] px-6 py-2 rounded-full">
              Connect
            </button>
          </div>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold bg-gradient-to-r from-[#00FEFE] to-[#0081FF] bg-clip-text text-transparent">
              DeFiNova
            </div>
            <button className="bg-gradient-to-r from-[#FF00FF] to-[#FF0066] px-4 py-1 rounded-full text-sm">
              Connect
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6">
          {/* First Row */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
            <YieldOptimizer />
            <LimitOrderBook />
            {!isMobile && <OptionsTrading />}
          </div>

          {/* Second Row */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Liquidity Mining</h3>
              <div className="space-y-4">
                {liquidityPools.map((pool, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="flex justify-between items-center p-4 bg-[#FFFFFF05] rounded-lg border border-[#FFFFFF10]"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FFFFFF10] flex items-center justify-center mr-3">
                        {i+1}
                      </div>
                      <div>
                        <div className="font-medium">{pool.pair}</div>
                        <div className="text-sm text-white/50">TVL: {pool.tvl}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#00FEFE] font-bold">{pool.apr}</div>
                      <div className="text-xs text-white/50">APR</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Portfolio</h3>
              <div className="h-64">
                
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} color="#00FEFE" />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF00FF" />
                  <ResponsiveChart />
                </Canvas>                
                
              </div>
              {isMobile && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-[#00FEFE10] p-2 rounded-lg">
                    <div className="font-bold">$12,450</div>
                    <div className="text-white/50">Value</div>
                  </div>
                  <div className="bg-[#FF00FF10] p-2 rounded-lg">
                    <div className="font-bold">+8.2%</div>
                    <div className="text-white/50">24h</div>
                  </div>
                  <div className="bg-[#FF006610] p-2 rounded-lg">
                    <div className="font-bold">3</div>
                    <div className="text-white/50">Assets</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile-only Options Trading */}
          {isMobile && (
            <div className="mt-6">
              <OptionsTrading />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ======== Responsive Hook ========
/*const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ======== 3D Responsive Chart ========
function ResponsiveChart() {
  const meshRef = useRef();
  const isMobile = useMobile();

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[
        isMobile ? 2 : 3, 
        isMobile ? 2 : 3, 
        1, 32, 1, true
      ]} />
      <meshPhongMaterial
        side={THREE.DoubleSide}
        color="#00FEFE"
        transparent
        opacity={0.8}
        wireframe
      />
    </mesh>
  );
}

// ======== Mobile-Friendly Yield Optimizer ========
function YieldOptimizer() {
  const [strategy, setStrategy] = useState('conservative');
  const [tvl, setTvl] = useState(0);
  const isMobile = useMobile();

  useEffect(() => {
    // Simulate TVL growth
    const interval = setInterval(() => {
      setTvl(prev => prev + Math.random() * 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const strategies = {
    conservative: { apy: '8-12%', risk: 'Low', color: 'from-[#00FEFE] to-[#0081FF]' },
    balanced: { apy: '12-18%', risk: 'Medium', color: 'from-[#FF00FF] to-[#FF0066]' },
    aggressive: { apy: '18-25%', risk: 'High', color: 'from-[#FF0066] to-[#FF0000]' }
  };

  return (
    <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Yield Optimizer</h3>
        <div className="text-sm bg-[#FFFFFF10] px-3 py-1 rounded-full">
          TVL: ${(tvl / 1000).toFixed(1)}M
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Strategy</span>
          <span>APY: {strategies[strategy].apy}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(strategies).map((key) => (
            <button
              key={key}
              onClick={() => setStrategy(key)}
              className={`text-sm py-2 rounded-lg transition-all ${
                strategy === key
                  ? `bg-gradient-to-r ${strategies[key].color} text-black font-bold`
                  : 'bg-[#FFFFFF10] text-white/70'
              }`}
            >
              {isMobile ? key.charAt(0).toUpperCase() : key}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {[
          { name: 'Curve Finance', allocation: 35 },
          { name: 'Aave V3', allocation: 25 },
          { name: 'Uniswap V3', allocation: 20 },
          { name: 'Compound', allocation: 15 },
          { name: 'Yearn', allocation: 5 }
        ].map((pool, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{pool.name}</span>
              <span>{pool.allocation}%</span>
            </div>
            <div className="w-full bg-[#FFFFFF10] rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pool.allocation}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  strategy === 'conservative' ? 'bg-[#00FEFE]' :
                  strategy === 'balanced' ? 'bg-[#FF00FF]' : 'bg-[#FF0066]'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== Mobile-Adaptive Limit Order Book ========
function LimitOrderBook() {
  const [activeTab, setActiveTab] = useState('buy');
  const isMobile = useMobile();

  const orders = {
    buy: [
      { price: 1832.45, amount: 1.24, total: 2272.24 },
      { price: 1831.80, amount: 0.85, total: 1557.03 },
      { price: 1830.50, amount: 2.10, total: 3844.05 }
    ],
    sell: [
      { price: 1833.20, amount: 0.95, total: 1741.54 },
      { price: 1833.75, amount: 1.50, total: 2750.63 },
      { price: 1834.30, amount: 0.75, total: 1375.73 }
    ]
  };

  return (
    <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">ETH/USDC</h3>
        <div className="flex bg-[#FFFFFF10] rounded-lg p-1">
          {['buy', 'sell'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-sm ${
                activeTab === tab
                  ? `bg-gradient-to-r ${
                      tab === 'buy' ? 'from-[#00FEFE] to-[#0081FF]' : 'from-[#FF00FF] to-[#FF0066]'
                    } text-black`
                  : 'text-white/70'
              }`}
            >
              {isMobile ? (tab === 'buy' ? 'Bid' : 'Ask') : tab === 'buy' ? 'Buy Orders' : 'Sell Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 text-sm text-white/70 mb-2">
        <span>Price</span>
        <span className="text-center">Amount</span>
        <span className="text-right">Total</span>
      </div>

      <div className="space-y-2">
        {orders[activeTab].map((order, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="grid grid-cols-3 text-sm py-1"
          >
            <span className={activeTab === 'buy' ? 'text-[#00FEFE]' : 'text-[#FF00FF]'}>
              {order.price.toFixed(2)}
            </span>
            <span className="text-center">{order.amount.toFixed(2)}</span>
            <span className="text-right">{order.total.toFixed(2)}</span>
          </motion.div>
        ))}
      </div>

      {!isMobile && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Price</label>
              <input 
                type="number" 
                className="w-full bg-[#FFFFFF10] border border-[#FFFFFF20] rounded-lg px-3 py-2 text-sm" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Amount</label>
              <input 
                type="number" 
                className="w-full bg-[#FFFFFF10] border border-[#FFFFFF20] rounded-lg px-3 py-2 text-sm" 
                placeholder="0.00"
              />
            </div>
          </div>
          <button className={`w-full mt-4 py-2 rounded-lg font-bold ${
            activeTab === 'buy' 
              ? 'bg-gradient-to-r from-[#00FEFE] to-[#0081FF]' 
              : 'bg-gradient-to-r from-[#FF00FF] to-[#FF0066]'
          }`}>
            Place {activeTab === 'buy' ? 'Buy' : 'Sell'} Order
          </button>
        </div>
      )}
    </div>
  );
}

// ======== Options Trading Component ========
function OptionsTrading() {
  const [expiry, setExpiry] = useState('7d');
  const [type, setType] = useState('call');
  const isMobile = useMobile();

  const options = [
    { strike: 1800, premium: 85, iv: 45 },
    { strike: 1850, premium: 65, iv: 52 },
    { strike: 1900, premium: 50, iv: 58 }
  ];

  return (
    <div className="bg-[#0A0A1A]/70 backdrop-blur-lg border border-[#FFFFFF20] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">ETH Options</h3>
        <div className="flex items-center space-x-2">
          <select 
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="bg-[#FFFFFF10] border border-[#FFFFFF20] rounded-lg px-2 py-1 text-sm"
          >
            <option value="7d">7D</option>
            <option value="14d">14D</option>
            <option value="30d">30D</option>
          </select>
          <div className="flex bg-[#FFFFFF10] rounded-lg p-1">
            {['call', 'put'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2 py-1 rounded-md text-xs ${
                  type === t
                    ? `bg-gradient-to-r ${
                        t === 'call' ? 'from-[#00FEFE] to-[#0081FF]' : 'from-[#FF00FF] to-[#FF0066]'
                      } text-black`
                    : 'text-white/70'
                }`}
              >
                {isMobile ? t.charAt(0).toUpperCase() : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 text-sm text-white/70 mb-2">
        <span>Strike</span>
        <span className="text-center">Premium</span>
        <span className="text-center">IV</span>
        <span className="text-right">Action</span>
      </div>

      <div className="space-y-2">
        {options.map((option, i) => (
          <div key={i} className="grid grid-cols-4 items-center text-sm py-2 border-b border-[#FFFFFF10]">
            <span>{option.strike}</span>
            <span className="text-center">
              <span className={type === 'call' ? 'text-[#00FEFE]' : 'text-[#FF00FF]'}>
                {option.premium}
              </span>
            </span>
            <span className="text-center">{option.iv}%</span>
            <div className="text-right">
              <button className={`text-xs px-3 py-1 rounded-full ${
                type === 'call' 
                  ? 'bg-[#00FEFE20] text-[#00FEFE]' 
                  : 'bg-[#FF00FF20] text-[#FF00FF]'
              }`}>
                {isMobile ? 'Buy' : 'Purchase'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
  */

// ======== Main Responsive Component ========
