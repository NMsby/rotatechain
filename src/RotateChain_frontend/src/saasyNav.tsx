import { motion } from 'framer-motion';
import { useState } from 'react';
import "./globals.css"

interface NavItem {
  id: string;
  name: string;
  path: string;
  accent: string;
}

interface SassyNavProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: 'home', name: 'HOME', path: '#', accent: '#FF5555' },
  { id: 'pools', name: 'WORK', path: '#', accent: '#55FF55' },
  { id: 'about', name: 'ABOUT', path: '#', accent: '#5555FF' },
  { id: 'rage', name: 'RAGE', path: '#', accent: '#FFFF55' },
];

const SassyNav = ({ activeTab, setActiveTab }: SassyNavProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
      className="sticky top-0 z-50 bg-white border-b-8 border-black"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="font-black text-3xl cursor-pointer"
          >
            BRVTL
          </motion.div>
          
          <ul className="flex space-x-2 md:space-x-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isHovered = hoveredId === item.id;
              
              return (
                <motion.li
                  key={item.id}
                  onHoverStart={() => setHoveredId(item.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="relative px-1 py-2"
                >
                  <motion.button
                    onClick={() => setActiveTab(item.id)}
                    className={`block text-lg font-bold uppercase tracking-wider cursor-pointer ${
                      isActive || isHovered ? 'text-black' : 'text-gray-500'
                    }`}
                    whileHover={{ color: "#000" }}
                  >
                    {item.name}
                  </motion.button>
                  
                  {(isActive || isHovered) && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 h-1"
                      style={{ backgroundColor: item.accent }}
                    />
                  )}
                </motion.li>
              );
            })}
          </ul>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "#000",
              color: "#fff"
            }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-6 py-2 font-bold uppercase border-4 border-black bg-white text-black tracking-wider"
          >
            CONTACT
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default SassyNav;