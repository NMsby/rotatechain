import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthClient } from '@dfinity/auth-client';

const LoginSection = ({authClient}:{authClient:AuthClient | null }) => {
  const [activeTab, setActiveTab] = useState<'internet-identity' | 'plug-wallet'>('internet-identity');
  const [isHovered, setIsHovered] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const [tabIndicator, setTabIndicator] = useState({ width: 0, left: 0 });

  // Update tab indicator position
  useEffect(() => {
    if (tabRef.current) {
      const activeElement = tabRef.current.querySelector('.active-tab');
      if (activeElement) {
        setTabIndicator({
          width: activeElement.clientWidth,
          left: (activeElement as HTMLElement).offsetLeft
        });
      }
    }
  }, [activeTab]);

  const handleLogin = (type: 'internet-identity' | 'plug-wallet') => {
    console.log(`Logging in with ${type}`);
    // Your actual login logic here
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-cyan-500/20">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Welcome Back, Superuser
        </h1>
        <p className="text-gray-400 mt-2">Choose your swaggy login method</p>
      </div>

      {/* Tab selector */}
      <div 
        ref={tabRef}
        className="relative flex bg-gray-800 rounded-xl p-1 mb-8 border border-gray-700"
      >
        <button
          className={`flex-1 py-3 px-4 rounded-xl text-center z-10 transition-colors ${
            activeTab === 'internet-identity' 
              ? 'text-white active-tab' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('internet-identity')}
        >
          🌐 Internet Identity
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-xl text-center z-10 transition-colors ${
            activeTab === 'plug-wallet' 
              ? 'text-white active-tab' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('plug-wallet')}
        >
          🧩 Plug Wallet
        </button>
        
        {/* Animated tab indicator */}
        <motion.div
          className="absolute top-1 h-[calc(100%-0.5rem)] bg-cyan-900/50 rounded-xl border border-cyan-500/30"
          animate={{
            width: tabIndicator.width,
            left: tabIndicator.left
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      </div>

      {/* Tab content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'internet-identity' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'internet-identity' ? -20 : 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {activeTab === 'internet-identity' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <h3 className="text-xl font-semibold text-cyan-400">Decentralized Identity</h3>
                  <p className="text-gray-400 mt-2">
                    Secure, blockchain-based identity authentication
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
                    <span className="text-2xl">🧩</span>
                  </div>
                  <h3 className="text-xl font-semibold text-purple-400">Crypto Wallet</h3>
                  <p className="text-gray-400 mt-2">
                    Connect your Plug wallet for seamless access
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Login button */}
        <motion.button
          className={`w-full py-4 px-6 rounded-xl font-bold mt-8 relative overflow-hidden ${
            activeTab === 'internet-identity'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={() => handleLogin(activeTab)}
        >
          <span className="relative z-10">
            {activeTab === 'internet-identity'
              ? 'Login with Internet Identity'
              : 'Login with Plug Wallet'}
          </span>
          <motion.div
            className="absolute inset-0 bg-white opacity-10"
            initial={false}
            animate={{ 
              x: isHovered ? '0%' : '-100%',
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </motion.button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          {activeTab === 'internet-identity'
            ? "Your identity, your control. Zero-knowledge proofs included. 😎"
            : "Crypto-savvy? We like your style. 🔥"}
        </p>
      </div>
    </div>
  );
};

export default LoginSection;