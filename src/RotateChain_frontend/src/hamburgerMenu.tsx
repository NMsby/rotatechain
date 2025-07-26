import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SingleChain } from './rotate_dashboard_graph_payment';

const SassyBurgerMenu = ({onLogout,chainGroups}:{onLogout:() => void,chainGroups:SingleChain[]}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu items with icons
  const menuItems = [
    { name: 'Dashboard', icon: '🚀' },
    { name: 'Portfolio', icon: '📊' },
    { name: 'Savings', icon: '💰' },
    { name: 'Trading', icon: '📈' },
    { name: 'Settings', icon: '⚙️' },
    { name: 'Profile', icon: '👤' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <motion.button
        className="relative z-50 w-16 h-16 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg shadow-purple-500/30 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        aria-label="Menu"
      >
        {/* Animated top line */}
        <motion.span
          className="absolute w-8 h-1 bg-white rounded-full"
          animate={{
            y: isOpen ? 0 : -8,
            rotate: isOpen ? 45 : 0,
            width: isOpen ? '2rem' : '2rem',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        
        {/* Middle line that disappears */}
        <motion.span
          className="absolute w-8 h-1 bg-white rounded-full"
          animate={{ 
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0 : 1
          }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Animated bottom line */}
        <motion.span
          className="absolute w-8 h-1 bg-white rounded-full"
          animate={{
            y: isOpen ? 0 : 8,
            rotate: isOpen ? -45 : 0,
            width: isOpen ? '2rem' : '2rem',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        
        {/* Floating circles */}
        <AnimatePresence>
          {!isOpen && (
            <>
              <motion.span
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                initial={{ scale: 0, x: -15, y: -15 }}
                animate={{ 
                  scale: [0, 1, 0.5, 1],
                  x: [-15, -25, -15],
                  y: [-15, -25, -15]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.2
                }}
              />
              <motion.span
                className="absolute w-2 h-2 rounded-full bg-cyan-400"
                initial={{ scale: 0, x: 15, y: -15 }}
                animate={{ 
                  scale: [0, 1, 0.5, 1],
                  x: [15, 25, 15],
                  y: [-15, -25, -15]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.4
                }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-0 right-0 mt-20 w-64 bg-gradient-to-b from-purple-900 to-black backdrop-blur-xl rounded-xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 overflow-hidden z-40"
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Menu header */}
            <div className="p-5 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl">👑</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">RotateChain</h3>
                  <p className="text-sm text-purple-300">Savings & Trading</p>
                </div>
              </div>
            </div>
            
            {/* Menu items */}
            <ul className="p-2">
              {chainGroups.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: 'rgba(128, 90, 213, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-lg cursor-pointer flex items-center gap-3 text-purple-100 hover:text-white transition-colors"
                >
                  <span className="font-medium">{item.name}</span>
                  {index === 0 && (
                    <span className="ml-auto px-2 py-1 bg-pink-500 text-xs rounded-full">New</span>
                  )}
                </motion.li>
              ))}
            </ul>
            
            {/* Menu footer */}
            <motion.div
              className="p-4 border-t border-purple-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: menuItems.length * 0.1 + 0.2 }}
            >
              <button onClick={(e:any) => onLogout} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-bold text-white shadow-lg">
                Log Out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SassyBurgerMenu;