import { motion } from "framer-motion";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

interface PoolAnalyticsCardProps {
  apr: number;
  volume24h: number;
  fees24h: number;
  tvl: number;
}

const PoolAnalyticsCard = ({ apr, volume24h, fees24h, tvl }: PoolAnalyticsCardProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-cyan-500/20 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-cyan-300">Pool Analytics</h2>
        <div className="bg-cyan-900/30 px-3 py-1 rounded-full text-xs">
          LIVE
        </div>
      </div>

      {/* APR Focus with Special Animation */}
      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-cyan-900/30 to-emerald-900/20 rounded-xl border border-cyan-500/30"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-6 w-6 text-cyan-400" />
          <h3 className="text-sm font-medium text-gray-300">APR</h3>
        </div>
        <motion.p 
          className="text-4xl font-bold mt-2 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {apr.toFixed(2)}%
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <StatCard 
          label="24h Volume" 
          value={`$${(volume24h / 1e6).toFixed(2)}M`} 
          delay={0.3}
        />
        <StatCard 
          label="24h Fees" 
          value={`$${(fees24h / 1e3).toFixed(1)}K`} 
          delay={0.4}
        />
        <StatCard 
          label="TVL" 
          value={`$${(tvl / 1e6).toFixed(2)}M`} 
          delay={0.5}
        />
      </div>
    </motion.div>
  );
};

// Reusable animated stat component
const StatCard = ({ label, value, delay }: { label: string; value: string; delay: number }) => (
  <motion.div
    className="bg-gray-800/50 p-3 rounded-lg"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    <p className="text-xs text-gray-400">{label}</p>
    <p className="font-medium text-white">{value}</p>
  </motion.div>
);

export default PoolAnalyticsCard;