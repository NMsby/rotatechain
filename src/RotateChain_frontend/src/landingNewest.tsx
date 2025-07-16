// src/components/LandingPage.tsx
import { motion, useAnimation } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { FaBitcoin, FaLock, FaExchangeAlt, FaChartLine, FaWallet, FaPercentage, FaShieldAlt, FaQuestionCircle, FaTwitter, FaTelegram, FaGithub, FaMedium } from 'react-icons/fa';

const LandingPage = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [activeTab, setActiveTab] = useState('lend');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Bitcoin particles floating around
  const bitcoinParticles = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute text-blue-400 text-2xl"
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
        opacity: 0.5
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

  // FAQ toggle function
  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  // FAQ data
  const faqs = [
    {
      question: "How does Bitcoin lending work on ICP?",
      answer: "RotateChain uses Internet Computer's advanced blockchain technology to securely lock your Bitcoin in smart contracts. Lenders earn interest from borrowers who provide collateral in BTC or other cryptocurrencies."
    },
    {
      question: "What are the risks involved?",
      answer: "Our platform uses over-collateralization to minimize risk. All loans require 150% collateralization. In case of price volatility, positions are automatically liquidated to protect lenders."
    },
    {
      question: "What are the fees?",
      answer: "We charge a 0.25% transaction fee on loans and a 15% performance fee on interest earned. There are no hidden fees or withdrawal charges."
    },
    {
      question: "How do I connect my wallet?",
      answer: "RotateChain supports all major wallets including Plug, Stoic, and Infinity Wallet. Simply click 'Connect Wallet' and authorize the connection to get started."
    },
    {
      question: "Is RotateChain audited?",
      answer: "Yes, our smart contracts have been audited by leading blockchain security firms including CertiK and OpenZeppelin. Full audit reports are available in our documentation."
    }
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#000b2e] to-[#002855] overflow-hidden relative"
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
      
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-20">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
            <FaBitcoin className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">RotateChain</h1>
        </motion.div>
        
        <motion.div 
          className="hidden md:flex space-x-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {['Features', 'How It Works', 'Stats', 'FAQ'].map((item, index) => (
            <a 
              key={index} 
              href={`#${item.toLowerCase().replace(' ', '-')}`} 
              className="text-blue-100 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </motion.div>
        
        <motion.button
          className="py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-semibold shadow-lg"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 15px rgba(0, 199, 255, 0.5)"
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Connect Wallet
        </motion.button>
      </nav>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
            animate={{ 
              scale: [1, 1.03, 1],
              textShadow: [
                "0 0 10px rgba(59, 130, 246, 0.3)", 
                "0 0 20px rgba(6, 182, 212, 0.8)", 
                "0 0 10px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" as const
            }}
          >
            Revolutionize Your Bitcoin
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-12 mx-auto text-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Earn up to <span className="text-cyan-300 font-bold">12.8% APY</span> on your Bitcoin or borrow against it with 
            <span className="text-blue-300 font-bold"> industry-low rates</span> on the 
            <span className="text-cyan-300 font-bold"> Internet Computer</span> blockchain.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <motion.button
              className="py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-bold text-xl shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(0, 199, 255, 0.8)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 10px rgba(0, 199, 255, 0.5)",
                  "0 0 20px rgba(0, 199, 255, 0.8)",
                  "0 0 10px rgba(0, 199, 255, 0.5)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Start Earning
            </motion.button>
            
            <motion.button
              className="py-4 px-8 bg-transparent border-2 border-cyan-500 rounded-full text-cyan-300 font-bold text-xl"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(6, 182, 212, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
          
          <motion.div 
            className="bg-blue-900 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem icon={<FaChartLine />} value="$128M+" label="Total Value Locked" />
              <StatItem icon={<FaPercentage />} value="12.8%" label="Avg. Lending APY" />
              <StatItem icon={<FaWallet />} value="24,500+" label="Active Users" />
              <StatItem icon={<FaShieldAlt />} value="0" label="Security Breaches" />
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">DeFi Features Designed for Bitcoiners</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">Maximize your Bitcoin potential with our innovative DeFi solutions on the Internet Computer blockchain</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
          >
            <FeatureCard 
              icon={<FaBitcoin className="text-4xl text-blue-400" />}
              title="Bitcoin Lending"
              description="Earn competitive yields on your idle Bitcoin without giving up custody"
            />
            <FeatureCard 
              icon={<FaExchangeAlt className="text-4xl text-cyan-400" />}
              title="Cross-Chain Swaps"
              description="Instantly swap between Bitcoin, ICP, and other major cryptocurrencies"
            />
            <FeatureCard 
              icon={<FaLock className="text-4xl text-green-400" />}
              title="Secure Collateral"
              description="Borrow against your Bitcoin with industry-leading security protocols"
            />
            <FeatureCard 
              icon={<FaPercentage className="text-4xl text-purple-400" />}
              title="Auto-Compounding"
              description="Interest automatically compounds for maximum earnings"
            />
            <FeatureCard 
              icon={<FaShieldAlt className="text-4xl text-yellow-400" />}
              title="Insurance Fund"
              description="Protect your assets with our $5M protocol-owned insurance fund"
            />
            <FeatureCard 
              icon={<FaWallet className="text-4xl text-red-400" />}
              title="Non-Custodial"
              description="Full control of your assets - we never hold your private keys"
            />
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-blue-900/30 to-blue-950/50 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How RotateChain Works</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">Simple steps to start earning or borrowing with your Bitcoin</p>
          </motion.div>
          
          <div className="flex justify-center mb-12">
            <div className="bg-blue-900/50 rounded-full p-1 flex">
              {['lend', 'borrow'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                    activeTab === tab 
                      ? 'bg-cyan-500 text-white' 
                      : 'text-blue-200 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'lend' ? 'Lending Process' : 'Borrowing Process'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {activeTab === 'lend' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <ProcessStep 
                  number="1"
                  title="Connect Wallet"
                  description="Securely connect your Bitcoin-compatible wallet"
                />
                <ProcessStep 
                  number="2"
                  title="Deposit BTC"
                  description="Transfer Bitcoin to your RotateChain account"
                />
                <ProcessStep 
                  number="3"
                  title="Choose Pool"
                  description="Select a lending pool with your preferred terms"
                />
                <ProcessStep 
                  number="4"
                  title="Earn Interest"
                  description="Start earning daily compounded interest"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <ProcessStep 
                  number="1"
                  title="Provide Collateral"
                  description="Deposit Bitcoin or other supported assets"
                />
                <ProcessStep 
                  number="2"
                  title="Set Loan Terms"
                  description="Choose loan amount, duration, and interest rate"
                />
                <ProcessStep 
                  number="3"
                  title="Borrow Assets"
                  description="Withdraw stablecoins or other cryptocurrencies"
                />
                <ProcessStep 
                  number="4"
                  title="Repay & Withdraw"
                  description="Repay loan to unlock your collateral"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">Everything you need to know about RotateChain</p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="bg-blue-900/50 backdrop-blur-md rounded-xl p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                  <FaQuestionCircle className={`text-cyan-400 transition-transform ${expandedQuestion === index ? 'rotate-180' : ''}`} />
                </div>
                {expandedQuestion === index && (
                  <motion.div 
                    className="bg-blue-800/30 backdrop-blur-md rounded-b-xl p-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-blue-100">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 rounded-3xl p-12 text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to Revolutionize Your Bitcoin?
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join thousands of Bitcoin holders earning passive income on RotateChain
            </motion.p>
            <motion.button
              className="py-4 px-12 bg-white text-blue-900 font-bold text-xl rounded-full shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255, 255, 255, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Get Started Now
            </motion.button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-blue-950/80 backdrop-blur-md border-t border-blue-800 py-12 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
                  <FaBitcoin className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">RotateChain</h3>
              </div>
              <p className="text-blue-200 mb-4">The premier Bitcoin lending platform on the Internet Computer blockchain</p>
              <div className="flex space-x-4">
                {[FaTwitter, FaTelegram, FaGithub, FaMedium].map((Icon, index) => (
                  <a 
                    key={index} 
                    href="#" 
                    className="text-blue-300 hover:text-cyan-400 transition-colors"
                  >
                    <Icon className="text-xl" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                {['Lend Bitcoin', 'Borrow Assets', 'Liquidity Pools', 'Governance', 'Staking'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-blue-200 hover:text-cyan-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Tutorials', 'Blog', 'Community', 'Audit Reports'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-blue-200 hover:text-cyan-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Subscribe</h4>
              <p className="text-blue-200 mb-4">Get the latest updates on new features and promotions</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 bg-blue-900/50 border border-blue-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
                />
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-r-lg transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-300 text-sm">© 2023 RotateChain. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Terms', 'Privacy', 'Cookies', 'Disclaimer'].map((item, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="text-blue-300 hover:text-cyan-400 text-sm transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      
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
        <div className="text-5xl text-blue-400">₿</div>
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
      stroke="rgba(59, 130, 246, 0.7)"
      strokeWidth="2"
      animate={{
        strokeWidth: [2, 4, 2],
        stroke: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(6, 182, 212, 0.9)",
          "rgba(59, 130, 246, 0.5)"
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
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    className="bg-blue-900/30 backdrop-blur-md rounded-xl p-8 border border-blue-700"
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ 
      y: -10,
      borderColor: "rgba(6, 182, 212, 0.7)",
      boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)"
    }}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-blue-100">{description}</p>
  </motion.div>
);

// Stat item component
const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-cyan-400 text-3xl mb-2 flex justify-center">{icon}</div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-blue-200">{label}</div>
  </motion.div>
);

// Process step component
const ProcessStep = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-blue-200">{description}</p>
  </motion.div>
);

export default LandingPage;