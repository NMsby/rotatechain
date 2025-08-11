import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFootballBall, FaVolleyballBall } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useNotification } from './notificationContext';

const RotateChain = () => {
  const [activeTab, setActiveTab] = useState('savings');
  const [currentRound, setCurrentRound] = useState(3);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<any>(null);
  const notification = useNotification()
  
  // Mock group data
  const groupMembers = [
    { id: 1, name: "Alice", contribution: 2000, received: true },
    { id: 2, name: "Bob", contribution: 2000, received: true },
    { id: 3, name: "Carol", contribution: 2000, received: true },
    { id: 4, name: "David", contribution: 2000, received: false },
    { id: 5, name: "Emma", contribution: 2000, received: false },
    { id: 6, name: "Frank", contribution: 2000, received: false },
  ];
  
  // Liquidity pools
  const liquidityPools = [
    { name: "Stable Rotation Pool", apy: 8.5, value: 124420, currency: "USDC" },
    { name: "Crypto Growth Pool", apy: 14.2, value: 86740, currency: "ETH" },
  ];
  
  // Features
  const features = [
    {
      icon: "🔄",
      title: "Rotational Savings",
      description: "Join groups where members take turns receiving pooled funds each round"
    },
    {
      icon: "💰",
      title: "Liquidity Pool Staking",
      description: "Funds earn interest through DeFi liquidity pools during rotation"
    },
    {
      icon: "📈",
      title: "Trade Mode Option",
      description: "During your round, keep funds in liquidity pools to earn more interest"
    },
    {
      icon: "🪙",
      title: "Liquid Tokens",
      description: "Earn tokens equivalent to your contribution for risk-free trading"
    },
    {
      icon: "🔒",
      title: "Secure & Transparent",
      description: "Built on blockchain for trustless, verifiable operations"
    },
    {
      icon: "🌐",
      title: "Global Access",
      description: "Participate in rotational savings from anywhere in the world"
    }
  ];
  
  // FAQs
  const faqs = [
    {
      question: "How does rotational savings work?",
      answer: "A group of people pool their funds regularly. Each round, one member receives the entire pooled amount plus earned interest. The rotation continues until all members have received their turn."
    },
    {
      question: "What happens during my round?",
      answer: "When it's your turn, you can withdraw the funds or switch to Trade Mode where funds stay in liquidity pools earning more interest. You also receive liquid tokens equivalent to your contribution."
    },
    {
      question: "What are liquid tokens?",
      answer: "These are tokens representing your contribution value that you can trade risk-free. They maintain their value regardless of market fluctuations, allowing you to trade without risking your crypto assets."
    },
    {
      question: "How are funds secured?",
      answer: "All funds are secured through smart contracts on the blockchain. The rotational process is automated and verifiable by all group members."
    },
    {
      question: "Can I create my own group?",
      answer: "Yes! You can create a group with friends or join existing groups. Set contribution amounts, rotation frequency, and pool preferences."
    },
    {
      question: "What if I need to exit early?",
      answer: "You can exit at any time. If you haven't received your turn, you'll get your contributions back plus earned interest minus a small fee."
    }
  ];
  
  // Animate the rotational wheel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRound(prev => (prev % 6) + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []); 

  let subscribehandler = function(e:any){
    e.preventDefault()
    notification.success("thank you for subscribing")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xl"><FaVolleyballBall className='text-inherit text-2xl'/></span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
            RotateChain
          </h1>
        </motion.div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {['Features', 'How It Works', 'Pools', 'FAQ'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(' ','-')}`}
              className="text-blue-200 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {item}
            </motion.a>
          ))}
        </div>
        
        {/*<motion.button
          className="hidden md:block py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-semibold shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Launch App
        </motion.button>*/}
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden bg-blue-800 bg-opacity-90 p-4 absolute top-20 left-0 right-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {['Features', 'How It Works', 'Pools', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().split(' ').join('-')}`}
              className="block py-3 text-center text-lg border-b border-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          {/*<button className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold">
            Launch App
          </button>*/}
        </motion.div>
      )}
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 mb-12 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              animate={{ 
                textShadow: ["0 0 10px rgba(59, 130, 246, 0.3)", "0 0 20px rgba(6, 182, 212, 0.8)", "0 0 10px rgba(59, 130, 246, 0.3)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              Revolutionize Your <span className="text-cyan-300">Savings</span> & <span className="text-cyan-300">liquidity</span>
            </motion.h1>
            
            <p className="text-xl text-blue-200 mb-8 max-w-2xl">
              Join rotational savings groups, earn interest through liquidity pools, and trade with zero risk using liquid tokens.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="py-3 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {}}
              >
                <Link to="/login"  className='w-full h-full text-inherit no-underline'>
                  Start Rotating
                </Link>
              </motion.button>
              
              <motion.button
                className="py-3 px-8 bg-transparent border-2 border-cyan-500 rounded-full text-cyan-300 font-bold"
                whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
              >
                <a href='#how-it-works'>
                  How It Works
                </a>
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              {/* Rotational Wheel */}
              <motion.div 
                className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-cyan-500 relative overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ 
                      transform: `rotate(${i * 60}deg)`,
                      clipPath: "polygon(50% 50%, 100% 0, 100% 100%)"
                    }}
                  >
                    <div className={`w-full h-full ${i === currentRound - 1 ? 'bg-cyan-600' : 'bg-blue-700'} transform origin-top-left`}>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 text-sm font-semibold">
                        Round {i+1}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center border-4 border-cyan-500">
                  <div className="text-center">
                    <div className="text-xs text-cyan-300">current</div>
                    <div className="font-bold text-cyan-300">Round {currentRound}</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-4 -left-4 w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-lg"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-2xl">💰</span>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              >
                <span className="text-2xl">📈</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-blue-800 bg-opacity-30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionary Features</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Combining rotational savings with DeFi lending for maximum financial growth
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-blue-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-blue-700 hover:border-cyan-500 transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How RotateChain Works</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              A simple 4-step process to grow your savings and liquidity risk-free
            </p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex flex-col gap-8">
              {[1, 2, 3, 4].map((step, index) => (
                <motion.div
                  key={step}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {index === 0 && "Join/Create a Savings Group"}
                      {index === 1 && "Contribute Funds Regularly"}
                      {index === 2 && "Earn Interest in Liquidity Pools"}
                      {index === 3 && "Receive & Decide in Your Round"}
                    </h3>
                    <p className="text-blue-200">
                      {index === 0 && "Form a group with friends or join an existing one. Set contribution amounts and rotation frequency."}
                      {index === 1 && "Add crypto or stablecoins to the group pool each rotation period. Funds are pooled together."}
                      {index === 2 && "The pooled funds are staked in DeFi liquidity pools, earning interest for all group members."}
                      {index === 3 && "When it's your turn, receive the pool + interest. Withdraw or keep funds in Trade Mode."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="w-full md:w-1/2 bg-blue-800 bg-opacity-50 p-6 rounded-xl border border-blue-700"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex border-b border-blue-700 mb-6">
                <button 
                  className={`py-3 px-6 font-semibold ${activeTab === 'savings' ? 'border-b-2 border-cyan-500' : ''}`}
                  onClick={() => setActiveTab('savings')}
                >
                  Savings mode
                </button>
                <button 
                  className={`py-3 px-6 font-semibold ${activeTab === 'trade' ? 'border-b-2 border-cyan-500' : ''}`}
                  onClick={() => setActiveTab('trade')}
                >
                  liquidity mode
                </button>
              </div>
              
              {activeTab === 'savings' ? (
                <div>
                  <h3 className="text-xl font-bold mb-4">During Your Round</h3>
                  <p className="text-blue-200 mb-4">
                    When it's your turn to receive the pooled funds, you have two options:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">✓</span>
                      <div>
                        <span className="font-bold">Withdraw:</span> Take the entire amount out of the system for personal use
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">✓</span>
                      <div>
                        <span className="font-bold">Trade Mode:</span> Keep funds in liquidity pools to earn more interest and receive liquid tokens
                      </div>
                    </li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold mb-4">Trade Mode Benefits</h3>
                  <p className="text-blue-200 mb-4">
                  When you choose Trade Mode during your round:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">✓</span>
                      <div>
                        <span className="font-bold">Continued Earnings:</span> Funds remain in liquidity pools earning interest
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">✓</span>
                      <div>
                        <span className="font-bold">Liquid Tokens:</span> Receive tokens equivalent to your contribution value
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500">✓</span>
                      <div>
                        <span className="font-bold">Risk-Free Trading:</span> Trade with tokens without risking your crypto assets
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Liquidity Pools Section */}
      <section id="pools" className="py-16 bg-blue-800 bg-opacity-30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Liquidity Pools</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Your savings grow while waiting for your rotation through our staking pools
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {liquidityPools.map((pool, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-blue-800 to-indigo-800 rounded-xl p-6 border border-blue-700"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold">{pool.name}</h3>
                  <div className="px-4 py-1 bg-cyan-900 bg-opacity-50 rounded-full text-cyan-300 font-bold">
                    {pool.apy}% APY
                  </div>
                </div>
                
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-blue-300">Total Value</div>
                    <div className="text-xl font-bold">${pool.value.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-blue-300">Currency</div>
                    <div className="text-xl font-bold">{pool.currency}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-300">Estimated Daily Earnings</span>
                    <span className="font-bold">${(pool.value * (pool.apy / 100) / 365).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-blue-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full" 
                      style={{ width: `${pool.apy > 10 ? 100 : pool.apy * 10}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold mb-2">Current Group Members</h4>
                  <div className="flex flex-wrap gap-2">
                    {groupMembers.map((member, idx) => (
                      <div 
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm ${currentRound === idx + 1 ? 'bg-cyan-500 text-white' : 'bg-blue-700'}`}
                      >
                        {member.name}
                        {currentRound === idx + 1 && " (Current)"}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-bold">
                  Join Pool
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Everything you need to know about RotateChain
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="bg-blue-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <h3 className="text-lg md:text-xl font-semibold">{faq.question}</h3>
                  <span className="text-cyan-500 text-xl">
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </div>
                
                {activeFaq === index && (
                  <motion.div 
                    className="bg-blue-800 bg-opacity-30 backdrop-blur-sm rounded-b-xl p-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-blue-200">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-cyan-700">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Revolutionize Your Savings?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-blue-100 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join thousands of users growing their wealth through rotational savings and trading
          </motion.p>
          
          <motion.button
            className="py-4 px-12 bg-white text-blue-900 font-bold text-xl rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/onboarding"  className='w-full h-full text-inherit no-underline'>
              Get Started Now
            </Link>
          </motion.button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-blue-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl"><FaVolleyballBall className='text-inherit text-2xl' /></span>
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
                  RotateChain
                </h3>
              </div>
              <p className="text-blue-200 mb-4">
                Rotational savings and trading platform built on decentralized finance principles.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'telegram', 'discord', 'github'].map((social) => (
                  <a 
                    key={social}
                    href="#"
                    className="text-blue-300 hover:text-cyan-400 text-xl"
                  >
                    <span className="sr-only">{social}</span>
                    <i className={`fab fa-${social}`}></i>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                {['Create Group', 'Join Group', 'Liquidity Pools', 'Trading Dashboard', 'Rotation History'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-blue-200 hover:text-cyan-400">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Tutorials', 'Blog', 'Community', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-blue-200 hover:text-cyan-400">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Subscribe</h4>
              <p className="text-blue-200 mb-4">
                Get updates on new features and platform enhancements
              </p>
              <form onSubmit={subscribehandler} className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 bg-blue-800 border border-blue-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
                />
                <button type='submit' className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-r-lg transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-blue-800 pt-6 text-center text-blue-400">
            <p>© 2025 RotateChain. All rights reserved. | <a href="#" className="hover:text-cyan-400">Terms</a> | <a href="#" className="hover:text-cyan-400">Privacy</a> | <a href="#" className="hover:text-cyan-400">Security</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RotateChain;