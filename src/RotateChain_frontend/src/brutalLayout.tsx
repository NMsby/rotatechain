import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import "./globals.css"

interface BrutalLayoutProps {
  children: ReactNode;
}

const BrutalLayout = ({ children }: BrutalLayoutProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
      className="min-h-screen bg-white border-8 border-black p-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="fixed w-full h-full bg-[repeating-linear-gradient(45deg,_#000_0px,_#000_4px,_transparent_4px,_transparent_8px)] opacity-5"></div>
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
      
      <div className="fixed top-0 left-0 w-16 h-16 border-r-8 border-b-8 border-black"></div>
      <div className="fixed top-0 right-0 w-16 h-16 border-l-8 border-b-8 border-black"></div>
      <div className="fixed bottom-0 left-0 w-16 h-16 border-r-8 border-t-8 border-black"></div>
      <div className="fixed bottom-0 right-0 w-16 h-16 border-l-8 border-t-8 border-black"></div>
    </motion.div>
  );
};

export default BrutalLayout;