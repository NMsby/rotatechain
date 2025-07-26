import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaExchangeAlt } from 'react-icons/fa';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [visible, setVisible] = useState(true);
  const [chainActive, setChainActive] = useState(false);

  useEffect(() => {
    // Start chain animation after initial delay
    const chainTimer = setTimeout(() => setChainActive(true), 800);
    
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 2000);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(chainTimer);
    };
  }, [onFinish]);

  // Blockchain link animation variants
  const linkVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    active: { 
      backgroundColor: '#6366f1',
      boxShadow: '0 0 15px rgba(99, 102, 241, 0.7)'
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed text-xl inset-0 bg-gradient-to-br from-gray-900 to-indigo-950 flex flex-col items-center justify-center z-50 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Animated blockchain links */}
          <div className="absolute flex space-x-8 mb-48">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-16 bg-gray-700 rounded-full"
                variants={linkVariants}
                initial="hidden"
                animate={chainActive ? ['visible', 'active'] : 'visible'}
                transition={{ 
                  delay: i * 0.2,
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 0.5
                }}
              />
            ))}
          </div>
          
          {/* Rotating coin */}
          <motion.div
            className="relative mb-8"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { 
                duration: 4, 
                repeat: Infinity, 
                ease: "linear" 
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            <div className="relative w-32 h-32">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/30"
                animate={{ 
                  rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <FaCoins className="text-blue-600 text-5xl" />
              </motion.div>
              
              <motion.div
                className="absolute -inset-4 border-4 border-indigo-500 rounded-full opacity-70"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.3, 0.7]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </motion.div>

          {/* App name with sassy animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-indigo-400">
                my
              </span>
              <motion.span 
                className="text-white"
                animate={{ 
                  color: ['#fff', '#6366f1', '#fff'],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                chain-groups
              </motion.span>
            </h1>
          </motion.div>

          {/* Tagline with staggered letters */}
          <motion.div 
            className="mt-6 text-lg text-blue-300 flex"
            initial="hidden"
            animate="visible"
          >
            {"Revolutionizing Savings & Trading".split('').map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: i * 0.05 + 1 } 
                  }
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          {/* Animated arrows */}
          <motion.div
            className="mt-12 flex space-x-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  x: [0, 20, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              >
                <FaExchangeAlt className="text-blue-400 text-3xl rotate-90" />
              </motion.div>
            ))}
          </motion.div>

          {/* Loading indicator */}
          <motion.div 
            className="absolute bottom-16 w-64 h-1 bg-gray-700 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Subtle floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 10 + 2,
                height: Math.random() * 10 + 2,
                backgroundColor: i % 3 === 0 
                  ? '#f59e0b' 
                  : i % 2 === 0 
                    ? '#6366f1' 
                    : '#8b5cf6',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                y: [0, -50],
                x: [0, (Math.random() - 0.5) * 100]
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        // Your main app content here
        <div>Your App Content</div>
      )}
    </div>
  );
};

export default App;
