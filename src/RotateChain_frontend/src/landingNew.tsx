// src/components/LandingPage.tsx
import { motion, useAnimation } from 'framer-motion';
import { useRef, useEffect } from 'react';

// Define types
interface FeatureCardProps {
  feature: {
    icon: string;
    title: string;
    description: string;
  };
  index: number;
}

const LandingPage = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Bitcoin particles floating around
  const bitcoinParticles = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-yellow-400 text-2xl"
      animate={{
        x: [0, 100, 0, -100, 0],
        y: [0, 80, 120, 80, 0],
        rotate: 360,
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0.7
      }}
    >
      ₿
    </motion.div>
  ));

  // Animate on load
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    });
  }, [controls]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#000428] to-[#004e92] overflow-hidden relative"
      ref={constraintsRef}
    >
      {/* Floating Bitcoin particles */}
      {bitcoinParticles}
      
      {/* Animated chain links */}
      <motion.div 
        className="absolute top-1/4 left-1/4"
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ChainLink />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-1/3 right-1/4"
        animate={{ 
          rotate: -360,
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ChainLink />
      </motion.div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          className="text-center"
        >
          {/* Animated logo/text */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200"
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 10px rgba(255,255,255,0.3)", 
                "0 0 20px rgba(255,215,0,0.8)", 
                "0 0 10px rgba(255,255,255,0.3)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" as const
            }}
          >
            ROTATECHAIN
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-yellow-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Lend. Borrow. Earn. <span className="text-yellow-300 font-bold">Bitcoin</span> meets 
            <span className="text-purple-300 font-bold"> DeFi</span> on the 
            <span className="text-cyan-300 font-bold"> Internet Computer</span>.
          </motion.p>
          
          {/* Animated CTA button */}
          <motion.button
            className="py-4 px-12 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full text-black font-bold text-xl shadow-lg"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 25px rgba(255, 215, 0, 0.8)"
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 10px rgba(255, 215, 0, 0.5)",
                "0 0 20px rgba(255, 215, 0, 0.8)",
                "0 0 10px rgba(255, 215, 0, 0.5)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            START ROTATING
          </motion.button>
        </motion.div>
        
        {/* Features section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
      
      {/* Floating Bitcoin at bottom */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="text-5xl">₿</div>
      </motion.div>
    </div>
  );
};

// Chain link component
const ChainLink = () => (
  <svg width="80" height="80" viewBox="0 0 100 100">
    <motion.path
      d="M20,50 Q35,30 50,20 Q65,30 80,50 Q65,70 50,80 Q35,70 20,50 Z"
      fill="none"
      stroke="rgba(255, 215, 0, 0.7)"
      strokeWidth="2"
      animate={{
        strokeWidth: [2, 4, 2],
        stroke: [
          "rgba(255, 215, 0, 0.5)",
          "rgba(255, 215, 0, 0.9)",
          "rgba(255, 215, 0, 0.5)"
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </svg>
);

// Feature card component
const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => (
  <motion.div
    className="bg-black bg-opacity-30 backdrop-blur-lg rounded-xl p-6 border border-yellow-500 border-opacity-30"
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2 * index }}
    whileHover={{ 
      y: -10,
      borderColor: "rgba(255, 215, 0, 0.7)",
      boxShadow: "0 10px 25px rgba(255, 215, 0, 0.3)"
    }}
  >
    <div className="text-yellow-400 text-4xl mb-4">{feature.icon}</div>
    <h3 className="text-2xl font-bold text-yellow-200 mb-2">{feature.title}</h3>
    <p className="text-yellow-100">{feature.description}</p>
  </motion.div>
);

// Features data
const features = [
  {
    icon: "⚡",
    title: "Lightning Loans",
    description: "Borrow BTC at rates that'll make traditional banks cry"
  },
  {
    icon: "🔄",
    title: "Auto-Rotating Pools",
    description: "Yield that rotates faster than a DJ at a crypto rave"
  },
  {
    icon: "🔒",
    title: "ICP-Powered Security",
    description: "Security tighter than Satoshi's anonymity"
  }
];

export default LandingPage;