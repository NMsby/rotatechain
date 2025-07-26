import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ICPShoppingPopup = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Choose Your Crypto Playground",
      content: "Head over to Binance, Coinbase, or Kraken - the cool kids' hangouts for ICP tokens. Sign up if you're new or flex your existing account.",
      emoji: "💻"
    },
    {
      title: "Feed the Money Monster",
      content: "Deposit cash (USD, EUR,KES etc.) or crypto into your account. Pro tip: Use a bank transfer to avoid those pesky card fees!",
      emoji: "💰"
    },
    {
      title: "Hunt the ICP Beast",
      content: "Find the ICP trading pair (ICP/USD or ICP/USDT). Use the search bar - it's not hiding, I promise!",
      emoji: "🔍"
    },
    {
      title: "Make Your Move, Hotshot",
      content: "Place a market order for instant gratification or a limit order if you're feeling patient. Enter your ICP amount and CONFIRM!",
      emoji: "🚀"
    },
    {
      title: "Escape the Exchange Dungeon",
      content: "Withdraw your ICP to a REAL wallet (Plug or Internet Identity). Exchanges are for trading, not hoarding!",
      emoji: "🔐"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", damping: 15 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl shadow-xl overflow-hidden w-full max-w-md"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-white mb-2">Get Your ICP Tokens, Darling 💅</h2>
              <button 
                onClick={onClose}
                className="text-blue-100 hover:text-white text-2xl transition-all"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            <p className="text-blue-100 mb-4 italic">
              Because leaving crypto on exchanges is so 2021...
            </p>
            
            <div className="bg-blue-400 bg-opacity-30 backdrop-blur-sm rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className="text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {steps[currentStep].emoji}
                </motion.div>
                <h3 className="text-xl font-bold text-white">
                  {steps[currentStep].title}
                </h3>
              </div>
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-blue-50"
              >
                {steps[currentStep].content}
              </motion.p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                {steps.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 w-2 rounded-full ${i === currentStep ? 'bg-white' : 'bg-blue-300'}`}
                    aria-label={`Go to step ${i+1}`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-300 transition-colors"
                  >
                    Back
                  </motion.button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-4 py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-400 text-blue-900 font-bold rounded-lg hover:bg-emerald-300 transition-colors"
                  >
                    Got it! Let's buy
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-black bg-opacity-20 p-3 text-center text-blue-200 text-sm">
            Pro Tip: Always double-check wallet addresses! Crypto is fun until it's gone 😉
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ICPShoppingPopup;

//to use this component add it in this way:-    
/*import { useState } from 'react';
import ICPShoppingPopup from './ICPShoppingPopup';

const App = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <button
        onClick={() => setShowPopup(true)}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
      >
        Show Me How to Buy ICP!
      </button>

      {showPopup && <ICPShoppingPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};*/